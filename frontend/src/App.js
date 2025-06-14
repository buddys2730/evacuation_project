// /Users/masashitakao/Desktop/evacuation_project/frontend/src/App.js

import React, { useState } from "react";
import SearchForm from "./components/SearchForm";
import MapComponent from "./components/MapComponent";
import ResultCardList from "./components/ResultCardList";

function App() {
  const [results, setResults] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [route, setRoute] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // ✅ 追加
  const [radiusKm, setRadiusKm] = useState(3);
  const [hazardDisplayMode, setHazardDisplayMode] = useState("off");
  const [selectedCategories, setSelectedCategories] = useState([
    "洪水_01_計画規模",
  ]);

  const handleResults = (data) => {
    setResults(data);
    setSelectedId(null);
    setRoute(null);
  };

  const handleParams = (params) => {
    setSearchParams(params);
    if (params.radius) {
      setRadiusKm(params.radius);
    }
  };

  const handleCardClick = (id) => {
    setSelectedId(id);
    setRoute(null);
  };

  const handleRouteClick = async (item) => {
    if (!searchParams) return;
    setSelectedId(item.id);

    const origin = {
      lat: searchParams.latitude,
      lng: searchParams.longitude,
    };
    const destination = {
      lat: item.latitude,
      lng: item.longitude,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/route_check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin, destination }),
        },
      );

      const data = await response.json();
      const isSafe = data.status === "safe";

      setRoute({
        latitude: origin.lat,
        longitude: origin.lng,
        destinationLat: destination.lat,
        destinationLng: destination.lng,
        isSafe,
      });
    } catch (error) {
      console.error("❌ 安全ルートAPI通信失敗:", error);
      setRoute({
        latitude: origin.lat,
        longitude: origin.lng,
        destinationLat: destination.lat,
        destinationLng: destination.lng,
        isSafe: false,
      });
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>避難所検索システム</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>表示切替: </label>
        <select
          value={hazardDisplayMode}
          onChange={(e) => setHazardDisplayMode(e.target.value)}
        >
          <option value="off">表示なし</option>
          <option value="hazard">ハザードマップ表示</option>
          <option value="disaster">現在の災害情報</option>
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>表示カテゴリ（複数選択可）:</label>
        <br />
        <select
          multiple
          value={selectedCategories}
          onChange={(e) =>
            setSelectedCategories(
              Array.from(e.target.selectedOptions, (option) => option.value),
            )
          }
          style={{ width: "100%", height: "100px" }}
        >
          <option value="洪水_01_計画規模">洪水_01_計画規模</option>
          <option value="洪水_02_想定最大規模">洪水_02_想定最大規模</option>
          <option value="洪水_03_浸水継続時間">洪水_03_浸水継続時間</option>
          <option value="土砂災害警戒区域">土砂災害警戒区域</option>
          <option value="高潮想定区域">高潮想定区域</option>
          <option value="津波浸水想定">津波浸水想定</option>
          <option value="急傾斜地崩壊危険区域">急傾斜地崩壊危険区域</option>
        </select>
      </div>

      <SearchForm
        onResults={handleResults}
        onSearchParams={handleParams}
        defaultRadius={radiusKm}
        setUserLocation={setUserLocation} // ✅ ここが必要
      />

      <MapComponent
        points={results}
        selectedId={selectedId}
        route={route}
        radiusKm={radiusKm}
        setRadiusKm={setRadiusKm}
        setRoute={setRoute}
        onRouteClick={handleRouteClick}
        hazardDisplayMode={hazardDisplayMode}
        searchParams={searchParams}
        selectedCategories={selectedCategories}
        userLocation={userLocation} // ✅ 必要であれば渡す
      />

      {results.length > 0 && (
        <ResultCardList
          results={results}
          onCardClick={handleCardClick}
          onRouteClick={handleRouteClick}
          selectedId={selectedId}
        />
      )}
    </div>
  );
}

export default App;
