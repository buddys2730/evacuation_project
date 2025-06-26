import React, { useState } from "react";
export default function DisasterSituationForm({ onSubmit }) {
  const [disasterType, setDisasterType] = useState("");
  const [dangerLevel, setDangerLevel] = useState("");
  const [depthM, setDepthM] = useState(""); // ←水深
  // ...他のステート

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({
          disaster_type: disasterType,
          danger_level: dangerLevel,
          depth_m: disasterType === "浸水" ? parseFloat(depthM) : null,
          // ...他の項目
        });
      }}
    >
      <select value={disasterType} onChange={e => setDisasterType(e.target.value)}>
        <option value="">災害種別を選択</option>
        <option value="浸水">浸水</option>
        <option value="土砂">土砂</option>
        <option value="通行止め">通行止め</option>
        {/* ... */}
      </select>
      <select value={dangerLevel} onChange={e => setDangerLevel(e.target.value)}>
        <option value="">危険度を選択</option>
        <option value="低">低</option>
        <option value="中">中</option>
        <option value="高">高</option>
      </select>
      {/* 浸水のみ水深欄 */}
      {disasterType === "浸水" && (
        <input
          type="number"
          step="0.01"
          min="0"
          value={depthM}
          onChange={e => setDepthM(e.target.value)}
          placeholder="水深（m）"
        />
      )}
      {/* 他のフォーム */}
      <button type="submit">登録</button>
    </form>
  );
}
