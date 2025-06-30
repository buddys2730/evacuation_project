import React, { useEffect, useState } from "react";
const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

console.log("【Debug】API_BASE = ", API_BASE);

// 詳細編集モーダル
function ShelterDetailModal({
  open, onClose, shelter, supplies, crowdLevel,
  onUpdateCrowd, onAddSupply, onUpdateSupply, onDeleteSupply
}) {
  const [editingCrowd, setEditingCrowd] = useState(crowdLevel || "");
  const [newItemName, setNewItemName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");

  useEffect(() => { setEditingCrowd(crowdLevel || ""); }, [crowdLevel]);

  if (!open || !shelter) return null;

  return (
    <div style={{
      position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 10, minWidth: 450, maxWidth: 700 }}>
        <h3>{shelter.name}（{shelter.address}）</h3>
        <div>
          <b>標高：</b>
          {shelter.elevation !== undefined && shelter.elevation !== null
            ? Number(shelter.elevation).toFixed(1)
            : "未登録"}
        </div>
        <hr />
        {/* 混雑度管理 */}
        <form style={{ margin: "12px 0" }} onSubmit={e => { e.preventDefault(); onUpdateCrowd(editingCrowd); }}>
          <b>混雑度：</b>
          <select value={editingCrowd} onChange={e => setEditingCrowd(e.target.value)}>
            <option value="">未登録</option>
            <option value="空き">空き</option>
            <option value="混雑">混雑</option>
            <option value="満員">満員</option>
            <option value="不明">不明</option>
          </select>
          <button type="submit" style={{ marginLeft: 10 }}>登録・更新</button>
        </form>
        {/* 物資管理 */}
        <div style={{ margin: "14px 0" }}>
          <b>必要物資：</b>
          <ul>
            {(supplies || []).length === 0 && <li>未登録</li>}
            {(supplies || []).map(s =>
              <li key={s.id}>
                <input
                  type="text"
                  style={{ width: 120 }}
                  value={s.item_name}
                  readOnly
                />{" "}
                <input
                  type="number"
                  min={0}
                  value={s.quantity}
                  onChange={e => onUpdateSupply(s.id, s.item_name, e.target.value)}
                  style={{ width: 60 }}
                /> 個
                <button style={{ marginLeft: 8 }} onClick={() => onDeleteSupply(s.id)}>削除</button>
              </li>
            )}
          </ul>
          {/* 物資追加（未入力時も表示） */}
          <form style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}
            onSubmit={e => { e.preventDefault(); onAddSupply(newItemName, newQuantity); setNewItemName(""); setNewQuantity(""); }}>
            <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="物資名" required style={{ width: 110 }} />
            <input value={newQuantity} type="number" min={1} onChange={e => setNewQuantity(e.target.value)} placeholder="個数" required style={{ width: 50 }} />
            <button type="submit">追加</button>
          </form>
        </div>
        <button style={{ marginTop: 12 }} onClick={onClose}>閉じる</button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [prefs, setPrefs] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedPref, setSelectedPref] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [shelterType, setShelterType] = useState("指定避難所");
  const [searchResults, setSearchResults] = useState([]);
  const [suppliesMap, setSuppliesMap] = useState({});
  const [crowdMap, setCrowdMap] = useState({});
  const [perPage, setPerPage] = useState(30);
  const [page, setPage] = useState(1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailShelter, setDetailShelter] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  // ソート
  const [sortKey, setSortKey] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // 都道府県リスト取得
  useEffect(() => {
    fetch(`${API_BASE}/api/prefectures`)
      .then(r => r.json())
      .then(data => setPrefs(Array.isArray(data) ? data : []))
      .catch(() => setPrefs([]));
  }, []);

  // 市町村リスト取得
  useEffect(() => {
    if (selectedPref) {
      fetch(`${API_BASE}/api/cities?pref=${encodeURIComponent(selectedPref)}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCities(data.map(c => typeof c === "string" ? { name: c, code: c } : c));
          } else if (data && Array.isArray(data.cities)) {
            setCities(data.cities.map(c => typeof c === "string" ? { name: c, code: c } : c));
          } else {
            setCities([]);
          }
        })
        .catch(() => setCities([]));
    } else {
      setCities([]);
    }
    setSelectedCity("");
  }, [selectedPref]);

  // 検索実行
  const handleSearch = () => {
    if (!selectedPref || !selectedCity) {
      alert("都道府県・市町村を選択してください");
      return;
    }
    fetch(
      `${API_BASE}/api/admin/shelters?pref=${encodeURIComponent(selectedPref)}&city=${encodeURIComponent(selectedCity)}&type=${encodeURIComponent(shelterType)}`
    )
      .then(r => r.json())
      .then(data => {
        setSearchResults(Array.isArray(data) ? data : []);
        setPage(1);
      })
      .catch(() => setSearchResults([]));
  };

  // 必要物資・混雑度まとめ取得（ページ表示分のみ/日付指定対応/リアルタイム反映）
  useEffect(() => {
    const startIdx = (page - 1) * perPage;
    const endIdx = Math.min(startIdx + perPage, searchResults.length);
    const pageItems = searchResults.slice(startIdx, endIdx);

    Promise.all(pageItems.map(s =>
      fetch(`${API_BASE}/api/admin/supplies?shelter_id=${s.id}&date=${selectedDate}`)
        .then(r => r.json())
        .then(data => ({ id: s.id, supplies: Array.isArray(data) ? data : [] }))
        .catch(() => ({ id: s.id, supplies: [] }))
    )).then(results => {
      const map = {};
      results.forEach(r => { map[r.id] = r.supplies; });
      setSuppliesMap(map);
    });

    Promise.all(pageItems.map(s =>
      fetch(`${API_BASE}/api/admin/crowd?shelter_id=${s.id}&date=${selectedDate}`)
        .then(r => r.json())
        .then(data => ({ id: s.id, crowd: data.crowd_level || "未登録" }))
        .catch(() => ({ id: s.id, crowd: "未登録" }))
    )).then(results => {
      const map = {};
      results.forEach(r => { map[r.id] = r.crowd; });
      setCrowdMap(map);
    });
  }, [searchResults, page, perPage, selectedDate]);

  // 詳細編集系
  const handleOpenModal = s => {
    setDetailShelter(s);
    setDetailModalOpen(true);
  };
  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setDetailShelter(null);
  };
  // 混雑度更新（即反映）
  const handleUpdateCrowd = (crowd) => {
    fetch(`${API_BASE}/api/admin/crowd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shelter_id: detailShelter.id, crowd_level: crowd })
    }).then(() => {
      setCrowdMap(m => ({ ...m, [detailShelter.id]: crowd }));
      alert("混雑度を登録・更新しました");
      // 再取得で即時反映
      setTimeout(() => handleSearch(), 300); // 反映遅延防止
    });
  };
  // 物資個数変更
  const handleUpdateSupply = (supplyId, itemName, quantity) => {
    fetch(`${API_BASE}/api/admin/supplies`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supply_id: supplyId, item_name: itemName, quantity: Number(quantity) })
    }).then(() => {
      setSuppliesMap(m => ({
        ...m,
        [detailShelter.id]: (m[detailShelter.id] || []).map(s =>
          s.id === supplyId ? { ...s, quantity: Number(quantity) } : s
        )
      }));
      setTimeout(() => handleSearch(), 300);
    });
  };
  // 物資削除
  const handleDeleteSupply = (supplyId) => {
    fetch(`${API_BASE}/api/admin/supplies`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supply_id: supplyId })
    }).then(() => {
      setSuppliesMap(m => ({
        ...m,
        [detailShelter.id]: (m[detailShelter.id] || []).filter(s => s.id !== supplyId)
      }));
      setTimeout(() => handleSearch(), 300);
    });
  };
  // 物資追加
  const handleAddSupply = (itemName, quantity) => {
    fetch(`${API_BASE}/api/admin/supplies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shelter_id: detailShelter.id, item_name: itemName, quantity: Number(quantity) })
    })
      .then(r => r.json())
      .then(newSupply => {
        setSuppliesMap(m => ({
          ...m,
          [detailShelter.id]: [...(m[detailShelter.id] || []), newSupply]
        }));
        setTimeout(() => handleSearch(), 300);
      });
  };

  // ページング計算
  const total = searchResults.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startIdx = (page - 1) * perPage;
  const endIdx = Math.min(startIdx + perPage, total);

  // ソート処理
  const sortedResults = [...searchResults].sort((a, b) => {
    if (!sortKey) return 0;
    let va = a[sortKey], vb = b[sortKey];
    // null/undefinedを最下位へ
    if (va === undefined || va === null) return 1;
    if (vb === undefined || vb === null) return -1;
    // 数値 or 文字列でソート
    if (!isNaN(Number(va)) && !isNaN(Number(vb))) {
      return sortAsc ? Number(va) - Number(vb) : Number(vb) - Number(va);
    }
    // 文字列
    return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h2>管理ダッシュボード</h2>
      {/* 日付スライダー */}
      <div style={{ margin: "16px 0" }}>
        <label>表示日付：</label>
        <input
          type="date"
          value={selectedDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => setSelectedDate(e.target.value)}
          style={{ marginLeft: 8 }}
        />
        <span style={{ marginLeft: 14, color: "#666" }}>
          （過去を選択するとその時点の混雑度・物資を表示）
        </span>
      </div>
      <div>
        <label>都道府県:{" "}
          <select value={selectedPref} onChange={e => setSelectedPref(e.target.value)}>
            <option value="">選択</option>
            {prefs.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label style={{ marginLeft: 12 }}>市町村:{" "}
          <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} disabled={!selectedPref}>
            <option value="">選択</option>
            {cities.map(c => (
              <option key={c.code || c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: 12 }}>種別:{" "}
          <select value={shelterType} onChange={e => setShelterType(e.target.value)}>
            <option value="指定避難所">指定避難所</option>
            <option value="緊急避難所">緊急避難所</option>
          </select>
        </label>
        <button style={{ marginLeft: 12 }} onClick={handleSearch}>検索</button>
      </div>

      {/* ページ送り・件数指定 */}
      <div style={{ margin: "16px 0", display: "flex", alignItems: "center" }}>
        <span>表示件数: </span>
        <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} style={{ margin: "0 8px" }}>
          <option value={30}>30</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span style={{ marginLeft: "16px" }}>
          {total === 0 ? "該当データなし" : `${startIdx + 1}〜${endIdx}件 / 全${total}件`}
        </span>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ marginLeft: 16 }}>前へ</button>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ marginLeft: 8 }}>次へ</button>
        <span style={{ marginLeft: 16 }}>{page} / {totalPages}ページ</span>
      </div>

      {/* 検索結果：テーブル表示（ソート対応） */}
      <div style={{ overflowX: "auto" }}>
        <table border={1} cellPadding={6} cellSpacing={0} style={{ borderCollapse: "collapse", width: "100%", minWidth: 950, background: "#fafcff" }}>
          <thead style={{ background: "#e3ecfc" }}>
            <tr>
              <th style={{ cursor: "pointer" }} onClick={() => { setSortKey("name"); setSortAsc(k => sortKey === "name" ? !k : true); }}>
                名称{sortKey === "name" && (sortAsc ? "▲" : "▼")}
              </th>
              <th style={{ cursor: "pointer" }} onClick={() => { setSortKey("address"); setSortAsc(k => sortKey === "address" ? !k : true); }}>
                住所{sortKey === "address" && (sortAsc ? "▲" : "▼")}
              </th>
              <th style={{ cursor: "pointer" }} onClick={() => { setSortKey("elevation"); setSortAsc(k => sortKey === "elevation" ? !k : true); }}>
                標高{sortKey === "elevation" && (sortAsc ? "▲" : "▼")}
              </th>
              <th>必要物資</th>
              <th>混雑度</th>
              <th>編集</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.slice(startIdx, endIdx).map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.address}</td>
                <td>
                  {s.elevation !== undefined && s.elevation !== null
                    ? Number(s.elevation).toFixed(1)
                    : "未登録"}
                </td>
                <td>
                  {suppliesMap[s.id] && suppliesMap[s.id].length > 0
                    ? suppliesMap[s.id].map(item => `${item.item_name}（${item.quantity}個）`).join("，")
                    : "未登録"}
                </td>
                <td>{crowdMap[s.id] || "未登録"}</td>
                <td>
                  <button onClick={() => handleOpenModal(s)}>編集</button>
                </td>
              </tr>
            ))}
            {searchResults.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>検索結果がありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ShelterDetailModal
        open={detailModalOpen}
        onClose={handleCloseModal}
        shelter={detailShelter}
        supplies={suppliesMap[detailShelter?.id] || []}
        crowdLevel={crowdMap[detailShelter?.id] || ""}
        onUpdateCrowd={handleUpdateCrowd}
        onAddSupply={handleAddSupply}
        onUpdateSupply={handleUpdateSupply}
        onDeleteSupply={handleDeleteSupply}
      />
    </div>
  );
}
