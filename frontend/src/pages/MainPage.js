// /Users/masashitakao/Desktop/evacuation_project/frontend/src/pages/MainPage.js

import React, { useState } from 'react';
import SearchForm from '../components/SearchForm';
import CategoryFilter from '../components/CategoryFilter';
import MapComponent from '../components/MapComponent';
import ResultCardList from '../components/ResultCardList';

const MainPage = () => {
  const [results, setResults] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [directions, setDirections] = useState(null);
  const [radiusKm, setRadiusKm] = useState(3);
  const [hazardDisplayMode, setHazardDisplayMode] = useState('off');
  const [selectedCategories, setSelectedCategories] = useState(['洪水_01_計画規模']);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>避難所検索・災害地図ビュー</h2>

      {/* 🔧 propsを正しく統一 */}
      <SearchForm
        setResults={setResults}
        setUserLocation={setUserLocation} // ✅ ここが必須
        userLocation={userLocation}
        setDirections={setDirections}
        radiusKm={radiusKm}
      />

      <div style={{ marginTop: '15px', marginBottom: '15px' }}>
        <label>
          <input
            type="radio"
            name="hazardMode"
            value="off"
            checked={hazardDisplayMode === 'off'}
            onChange={(e) => setHazardDisplayMode(e.target.value)}
          />{' '}
          表示しない
        </label>
        <label style={{ marginLeft: '20px' }}>
          <input
            type="radio"
            name="hazardMode"
            value="hazard"
            checked={hazardDisplayMode === 'hazard'}
            onChange={(e) => setHazardDisplayMode(e.target.value)}
          />{' '}
          ハザードマップ（カテゴリ別）
        </label>
        <label style={{ marginLeft: '20px' }}>
          <input
            type="radio"
            name="hazardMode"
            value="disaster"
            checked={hazardDisplayMode === 'disaster'}
            onChange={(e) => setHazardDisplayMode(e.target.value)}
          />{' '}
          現在の災害状況（リアルタイム）
        </label>
      </div>

      {hazardDisplayMode === 'hazard' && (
        <CategoryFilter selectedCategories={selectedCategories} toggleCategory={toggleCategory} />
      )}

      <MapComponent
        results={results}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
        selectedPoint={selectedPoint}
        setSelectedPoint={setSelectedPoint}
        directions={directions}
        hazardDisplayMode={hazardDisplayMode}
        selectedCategories={selectedCategories}
        radiusKm={radiusKm}
      />

      {/* 🔧 props 名と型を完全一致 */}
      <ResultCardList
        results={results}
        selectedPoint={selectedPoint}
        setSelectedPoint={setSelectedPoint}
        setDirections={setDirections}
        userLocation={userLocation}
      />
    </div>
  );
};

export default MainPage;
