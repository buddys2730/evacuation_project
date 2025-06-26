export default function DisasterCardList({ disasters, selectedId, onSelect }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "8px 0" }}>
      {disasters.map(d => (
        <div
          key={d.id}
          onClick={() => onSelect(d.id)}
          style={{
            border: d.id === selectedId ? "2px solid #d00" : "1px solid #ccc",
            background: d.id === selectedId ? "#ffeaea" : "#fff",
            padding: 12,
            borderRadius: 7,
            minWidth: 240,
            cursor: "pointer"
          }}
        >
          <div><b>{d.disaster_type}</b>：{d.address_label}</div>
          <div>危険度：{d.danger_level || "未設定"}</div>
          <div>発生日：{d.occurred_at ? d.occurred_at.slice(0,10) : ""}</div>
          {d.cleared_at && <div>解除日：{d.cleared_at.slice(0,10)}</div>}
          <div>{d.comment}</div>
        </div>
      ))}
      {disasters.length === 0 && <div style={{ color: "#888" }}>該当データなし</div>}
    </div>
  );
}
