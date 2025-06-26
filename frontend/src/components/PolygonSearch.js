import React, { useEffect, useState } from "react";
import { fetchPrefs, fetchCities, fetchHazardPolygonsByCity } from "./utils/fetchHazardPolygons.js";

export default function PolygonSearch({ onPolygonsFetched }) {
  const [prefs, setPrefs] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedPref, setSelectedPref] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrefs().then(setPrefs);
  }, []);

  useEffect(() => {
    if (selectedPref) {
      fetchCities(selectedPref).then(setCities);
      setSelectedCity("");
    }
  }, [selectedPref]);

  const handleSearch = async () => {
    if (!selectedCity) return;
    setLoading(true);
    try {
      const data = await fetchHazardPolygonsByCity(selectedCity);
      if (onPolygonsFetched) onPolygonsFetched(data);
    } catch (e) {
      alert("取得失敗: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <label>
        都道府県：
        <select value={selectedPref} onChange={e => setSelectedPref(e.target.value)}>
          <option value="">都道府県を選択</option>
          {prefs.map(pref => <option key={pref} value={pref}>{pref}</option>)}
        </select>
      </label>
      <label>
        市町村：
        <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} disabled={!selectedPref}>
          <option value="">市町村を選択</option>
          {cities.map(city => <option key={city} value={city}>{city}</option>)}
        </select>
      </label>
      <button onClick={handleSearch} disabled={!selectedCity || loading}>
        {loading ? "検索中..." : "ポリゴン検索"}
      </button>
    </div>
  );
}
