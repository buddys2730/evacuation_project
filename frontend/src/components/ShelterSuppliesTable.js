import React, { useState } from "react";

// columns定義はそのまま
const columns = [
  { key: "shelter_name", label: "避難所名" },
  { key: "item_name", label: "物資名" },
  { key: "quantity", label: "必要数" },
  { key: "updated_at", label: "更新日時" },
];

export default function ShelterSuppliesTable({ data }) {
  const [sortKey, setSortKey] = useState("shelter_name");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = [...(data || [])].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table
        border="1"
        cellPadding="8"
        cellSpacing="0"
        style={{ width: "100%", minWidth: 600 }}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{
                  cursor: "pointer",
                  background: sortKey === col.key ? "#f0f0f0" : "#fff",
                }}
              >
                {col.label}
                {sortKey === col.key ? (sortOrder === "asc" ? " ▲" : " ▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center" }}>
                データがありません
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr key={row.id}>
                <td>{row.shelter_name}</td>
                <td>{row.item_name}</td>
                <td>{row.quantity}</td>
                <td>{row.updated_at}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
