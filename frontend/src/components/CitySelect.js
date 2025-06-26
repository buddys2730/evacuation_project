import React, { useEffect, useState } from "react";

export default function CitySelect({ pref, value, onChange }) {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (!pref) {
      setCities([]);
      onChange("");
      return;
    }
    fetch(process.env.REACT_APP_API_BASE_URL + `/api/cities?pref=${encodeURIComponent(pref)}`)
      .then(r => r.json())
      .then(data => {
        // 修正：オブジェクト形式にも対応
        let cityArr = [];
        if (Array.isArray(data)) {
          cityArr = data;
        } else if (data && Array.isArray(data.cities)) {
          cityArr = data.cities;
        }
        setCities(cityArr);
      })
      .catch(() => setCities([]));
  }, [pref, onChange]);

  return (
    <select value={value} onChange={e => onChange(e.target.value)} disabled={!pref}>
      <option value="">市町村選択</option>
      {cities.map(c => (
        <option key={c.code || c.name} value={c.name}>{c.name}</option>
      ))}
    </select>
  );
}
