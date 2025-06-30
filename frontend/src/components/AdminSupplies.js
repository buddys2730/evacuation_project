import React, { useEffect, useState } from "react";
const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

export default function AdminSupplies() {
  const [supplies, setSupplies] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/supplies`)
      .then((r) => r.json())
      .then((data) => setSupplies(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h2>必要物資管理ページ</h2>
      <table
        border={1}
        cellPadding={6}
        cellSpacing={0}
        style={{
          borderCollapse: "collapse",
          width: "100%",
          minWidth: 850,
          background: "#fafcff",
        }}
      >
        <thead style={{ background: "#e3ecfc" }}>
          <tr>
            <th>避難所名</th>
            <th>物資名</th>
            <th>数量</th>
            <th>更新日</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {supplies.map((s) => (
            <tr key={s.id}>
              <td>{s.shelter_name}</td>
              <td>{s.item_name}</td>
              <td>{s.quantity}</td>
              <td>{s.updated_at}</td>
              <td>
                {/* 操作UI例: 削除/編集/追加ボタン等 */}
                {/* 詳細は要望に応じて実装 */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
