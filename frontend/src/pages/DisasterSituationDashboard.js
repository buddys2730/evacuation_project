import React, { useState, useEffect } from "react";
import PrefSelect from "../components/PrefSelect.js";
import CitySelect from "../components/CitySelect.js";
import DisasterTypeSelect from "../components/DisasterTypeSelect.js";
import DangerLevelSelect from "../components/DangerLevelSelect.js";
import DateRangeSlider from "../components/DateRangeSlider.js";
import DisasterMapGoogle from "../components/DisasterMapGoogle.js";
import DisasterCardList from "../components/DisasterCardList.js";
import ExportCsvButton from "../components/ExportCsvButton.js";
import { LoadingOverlay, ErrorAlert } from "../components/Overlay.js";
import dayjs from "dayjs";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function EditDisasterModal({ open, disaster, onSave, onClose }) {
  const [dangerLevel, setDangerLevel] = useState(disaster?.danger_level || "");
  const [comment, setComment] = useState(disaster?.comment || "");
  const [clearedAt, setClearedAt] = useState(
    disaster?.cleared_at ? disaster.cleared_at.slice(0, 10) : "",
  );

  useEffect(() => {
    setDangerLevel(disaster?.danger_level || "");
    setComment(disaster?.comment || "");
    setClearedAt(disaster?.cleared_at ? disaster.cleared_at.slice(0, 10) : "");
  }, [disaster]);

  if (!open || !disaster) return null;

  function handleSave() {
    onSave({
      ...disaster,
      danger_level: dangerLevel,
      comment,
      cleared_at: clearedAt || null,
    });
    onClose(); // 必ず閉じる
  }

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.25)",
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          minWidth: 340,
          maxWidth: 500,
        }}
      >
        <h3>災害情報 編集</h3>
        <div>
          種別：<b>{disaster.disaster_type}</b>
        </div>
        <div>住所：{disaster.address_label}</div>
        <div style={{ margin: "10px 0" }}>
          危険度:
          <select
            value={dangerLevel}
            onChange={(e) => setDangerLevel(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="">未設定</option>
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
        </div>
        <div style={{ margin: "10px 0" }}>
          コメント:
          <br />
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: "95%" }}
          />
        </div>
        <div style={{ margin: "10px 0" }}>
          復旧日（解除日）:
          <input
            type="date"
            value={clearedAt}
            onChange={(e) => setClearedAt(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </div>
        <div style={{ marginTop: 14, textAlign: "right" }}>
          <button onClick={handleSave} style={{ marginRight: 10 }}>
            保存
          </button>
          <button onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  );
}

export default function DisasterSituationDashboard() {
  // スライダー範囲を「今日±14日」に
  const today = dayjs().format("YYYY-MM-DD");
  const minDate = dayjs(today).subtract(14, "day").format("YYYY-MM-DD");
  const maxDate = dayjs(today).add(14, "day").format("YYYY-MM-DD");

  const [pref, setPref] = useState("");
  const [city, setCity] = useState("");
  const [disasterType, setDisasterType] = useState("");
  const [dangerLevel, setDangerLevel] = useState("");
  const [depthM, setDepthM] = useState("");
  const [occurredAt, setOccurredAt] = useState(today);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [center, setCenter] = useState({ lat: 34.3963, lng: 132.4596 });
  const [disasters, setDisasters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawnPolygon, setDrawnPolygon] = useState(null);

  // スライダー用
  const [sliderRange, setSliderRange] = useState([minDate, maxDate]);

  // 編集モーダル
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    if (pref && city) {
      fetch(
        `${API_BASE}/api/city-center?pref=${encodeURIComponent(pref)}&city=${encodeURIComponent(city)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.lat && data.lng) {
            setCenter({ lat: data.lat, lng: data.lng });
          }
        });
    }
  }, [pref, city]);

  useEffect(() => {
    setCity("");
  }, [pref]);

  // スライダーの範囲で災害状況を取得
  useEffect(() => {
    setLoading(true);
    setError("");
    const [from, to] = sliderRange;
    fetch(
      `${API_BASE}/api/disaster_situations?start_date=${from}&end_date=${to}`,
    )
      .then((res) => res.json())
      .then((data) => setDisasters(Array.isArray(data) ? data : []))
      .catch(() => setError("データ取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [sliderRange]);

  function handlePolygonChange(geojson) {
    setDrawnPolygon(geojson);
  }

  function handleRegister() {
    if (!drawnPolygon || !disasterType) {
      setError("範囲と災害種別は必須です");
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/api/disaster_situations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        geometry: drawnPolygon,
        disaster_type: disasterType,
        danger_level: dangerLevel,
        depth_m: depthM ? parseFloat(depthM) : null,
        occurred_at: occurredAt,
        comment,
        image_url: imageUrl,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        setDrawnPolygon(null);
        setError("");
        // 再取得
        const [from, to] = sliderRange;
        return fetch(
          `${API_BASE}/api/disaster_situations?start_date=${from}&end_date=${to}`,
        )
          .then((res) => res.json())
          .then((data) => setDisasters(Array.isArray(data) ? data : []));
      })
      .catch(() => setError("登録に失敗しました"))
      .finally(() => setLoading(false));
  }

  // スライダーから日付範囲が変更されたとき
  const handleSliderRangeChange = ([from, to]) => {
    setSliderRange([from, to]);
  };

  // カードまたは地図から選択
  const handleSelect = (id) => setSelectedId(id);

  // 編集ボタン押下
  const handleEdit = (disaster) => {
    setEditTarget(disaster);
    setEditModalOpen(true);
  };

  // 編集保存
  const handleEditSave = (updated) => {
    setLoading(true);
    fetch(`${API_BASE}/api/disaster_situations/${updated.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        // クローズ
        setEditModalOpen(false);
        setEditTarget(null);
        // 再取得
        const [from, to] = sliderRange;
        return fetch(
          `${API_BASE}/api/disaster_situations?start_date=${from}&end_date=${to}`,
        )
          .then((res) => res.json())
          .then((data) => setDisasters(Array.isArray(data) ? data : []));
      })
      .catch(() => setError("更新に失敗しました"))
      .finally(() => setLoading(false));
  };

  // 地図側でポリゴンが選択された場合
  const handlePolygonSelect = (id) => setSelectedId(id);

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h2>災害状況管理（タイムスライダー/履歴・CSV出力対応）</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <PrefSelect value={pref} onChange={(v) => setPref(v)} />
        <CitySelect pref={pref} value={city} onChange={(v) => setCity(v)} />
        <DisasterTypeSelect value={disasterType} onChange={setDisasterType} />
        <DangerLevelSelect value={dangerLevel} onChange={setDangerLevel} />
        <input
          type="number"
          step="0.01"
          placeholder="水深(m)"
          value={depthM}
          onChange={(e) => setDepthM(e.target.value)}
          style={{ width: 80 }}
        />
        <input
          type="date"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
        />
        <input
          type="text"
          placeholder="コメント"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <input
          type="text"
          placeholder="画像URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button onClick={handleRegister} disabled={loading}>
          登録
        </button>
        <ExportCsvButton
          filter={{
            pref,
            city,
            disasterType,
            dangerLevel,
            from: sliderRange[0],
            to: sliderRange[1],
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <DateRangeSlider
          minDate={minDate}
          maxDate={maxDate}
          onRangeChange={handleSliderRangeChange}
          onTimelineStep={() => {}}
          playing={false}
          onPlayToggle={() => {}}
        />
      </div>

      <LoadingOverlay open={loading} />
      <ErrorAlert open={!!error} message={error} onClose={() => setError("")} />

      <DisasterMapGoogle
        center={center}
        polygons={disasters
          .filter((d) => d.geometry)
          .map((d) => ({
            ...d.geometry,
            id: d.id,
            selected: d.id === selectedId,
            isCleared: !!d.cleared_at, // 解除済み色分け用
          }))}
        selectedId={selectedId}
        onPolygonClick={handlePolygonSelect}
        onPolygonChange={handlePolygonChange}
      />

      <DisasterCardList
        disasters={disasters}
        selectedId={selectedId}
        onSelect={handleSelect}
        onEdit={handleEdit}
      />

      <EditDisasterModal
        open={editModalOpen}
        disaster={editTarget}
        onSave={handleEditSave}
        onClose={() => {
          setEditModalOpen(false);
          setEditTarget(null);
        }}
      />
    </div>
  );
}
