// frontend/src/components/DisasterTypeSelect.js
import React from "react";
export default function DisasterTypeSelect({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">災害種別選択</option>
      <option value="洪水">洪水</option>
      <option value="土砂災害">土砂災害</option>
      <option value="高潮">高潮</option>
      <option value="地震">地震</option>
      <option value="津波">津波</option>
      <option value="火事">火事</option>
      <option value="内水">内水</option>
      <option value="火山">火山</option>
    </select>
  );
}
