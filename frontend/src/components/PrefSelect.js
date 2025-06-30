// frontend/src/components/PrefSelect.js
import React, { useEffect, useState } from "react";

export default function PrefSelect({ value, onChange }) {
  const [prefs, setPrefs] = useState([]);
  useEffect(() => {
    fetch(process.env.REACT_APP_API_BASE_URL + "/api/prefectures")
      .then((r) => r.json())
      .then((data) => setPrefs(Array.isArray(data) ? data : []))
      .catch(() => setPrefs([]));
  }, []);
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">都道府県選択</option>
      {prefs.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  );
}
