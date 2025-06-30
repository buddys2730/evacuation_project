// frontend/src/components/DangerLevelSelect.js
import React from "react";
export default function DangerLevelSelect({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">危険度選択</option>
      <option value="高">高</option>
      <option value="中">中</option>
      <option value="低">低</option>
      <option value="不明">不明</option>
    </select>
  );
}
