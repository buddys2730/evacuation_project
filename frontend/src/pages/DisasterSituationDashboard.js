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

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function DisasterSituationDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const [pref, setPref] = useState("");
  const [city, setCity] = useState("");
  const [disasterType, setDisasterType] = useState("");
  const [dangerLevel, setDangerLevel] = useState("");
  const [depthM, setDepthM] = useState("");   // 水深入力
  const [occurredAt, setOccurredAt] = useState(today);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [center, setCenter] = useState({ lat: 34.3963, lng: 132.4596 }); // 初期中心(福山市)
  const [disasters, setDisasters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawnPolygon, setDrawnPolygon] = useState(null);

  useEffect(() => {
    if (pref && city) {
      fetch(`${API_BASE}/api/city-center?pref=${encodeURIComponent(pref)}&city=${encodeURIComponent(city)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.lat && data.lng) {
            setCenter({ lat: data.lat, lng: data.lng });
          }
        });
    }
  }, [pref, city]);

  useEffect(() => { setCity(""); }, [pref]);

  // 災害状況取得
  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/api/disaster_situations`)
      .then(res => res.json())
      .then(data => setDisasters(Array.isArray(data) ? data : []))
      .catch(() => setError("データ取得に失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  // ポリゴン描画
  function handlePolygonChange(geojson) {
    setDrawnPolygon(geojson);
  }

  // 災害状況登録
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
        image_url: imageUrl
      })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        setDrawnPolygon(null);
        setError("");
        window.location.reload();
      })
      .catch(() => setError("登録に失敗しました"))
      .finally(() => setLoading(false));
  }

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h2>災害状況管理（タイムスライダー/履歴・CSV出力対応）</h2>
      
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <PrefSelect value={pref} onChange={v => setPref(v)} />
        <CitySelect pref={pref} value={city} onChange={v => setCity(v)} />
        <DisasterTypeSelect value={disasterType} onChange={setDisasterType} />
        <DangerLevelSelect value={dangerLevel} onChange={setDangerLevel} />
        <input
          type="number"
          step="0.01"
          placeholder="水深(m)"
          value={depthM}
          onChange={e => setDepthM(e.target.value)}
          style={{ width: 80 }}
        />
        <input
          type="date"
          value={occurredAt}
          onChange={e => setOccurredAt(e.target.value)}
        />
        <input
          type="text"
          placeholder="コメント"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <input
          type="text"
          placeholder="画像URL"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
        />
        <button onClick={handleRegister} disabled={loading}>登録</button>
        <ExportCsvButton filter={{ pref, city, disasterType, dangerLevel, from: occurredAt, to: occurredAt }} />
      </div>
      <LoadingOverlay open={loading} />
      <ErrorAlert open={!!error} message={error} onClose={() => setError("")} />
      <DisasterMapGoogle
        center={center}
        polygons={disasters.filter(d => d.geometry).map(d => d.geometry)}
        onPolygonChange={handlePolygonChange}
      />
      <DisasterCardList
        disasters={disasters}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  );
}
