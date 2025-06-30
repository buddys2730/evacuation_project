import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import SearchForm from "./components/SearchForm.js";
import MapComponent from "./components/MapComponent.js";
import ResultCardList from "./components/ResultCardList.js";
import RouteAlertDialog from "./components/RouteAlertDialog.js";
import AdminRoot from "./pages/AdminRoot.js";
import DisasterSituations from "./pages/DisasterSituations.js";
import ARView from "./components/ARView.js";

function UserApp() {
  const [results, setResults] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [route, setRoute] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(3);
  const [hazardDisplayMode, setHazardDisplayMode] = useState("off");
  const [selectedCategories, setSelectedCategories] = useState([
    "洪水_01_計画規模",
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [routeMessage, setRouteMessage] = useState({
    recommendation: "",
    status: "",
  });
  const [showSafeRouteBtn, setShowSafeRouteBtn] = useState(false);
  const [alternateShelters, setAlternateShelters] = useState([]);
  const [suppliesMap, setSuppliesMap] = useState({});
  const [crowdMap, setCrowdMap] = useState({});
  const navigate = useNavigate();

  const minRadius = 1;
  const maxRadius = 10;

  // AR案内画面への遷移
  const handleAR = () => {
    if (!route) return;
    navigate("/ar", { state: route });
  };

  // 避難所選択時
  const handleSelectPoint = (point) => {
    if (!point) {
      setSelectedId(null);
      setRoute(null);
      setAlternateShelters([]);
      return;
    }
    if (String(selectedId) === String(point.id)) {
      setSelectedId(null);
      setRoute(null);
      setAlternateShelters([]);
      return;
    }
    setSelectedId(String(point.id));
    setRoute(null);
    setAlternateShelters([]);
  };

  // 検索結果取得時
  const handleResults = (data) => {
    setResults(data);
    setSelectedId(null);
    setRoute(null);
    setAlternateShelters([]);
  };

  // 検索パラメータ受け取り時
  const handleParams = (params) => {
    if (params.pref && !params.prefecture) params.prefecture = params.pref;
    setSearchParams(params);
    if (params.radius) setRadiusKm(params.radius);
  };

  // ルート検索結果をモーダル表示＋危険ルート判定
  const handleSetRoute = (routeResult) => {
    setRoute(routeResult);
    if (routeResult && routeResult.recommendation) {
      setRouteMessage({
        recommendation: routeResult.recommendation,
        status: routeResult.status,
      });
      setDialogOpen(true);
    }
    if (routeResult && routeResult.status === "danger") {
      setShowSafeRouteBtn(true);
    } else {
      setShowSafeRouteBtn(false);
    }
    if (
      routeResult &&
      routeResult.status === "blocked" &&
      Array.isArray(routeResult.alternate_shelters)
    ) {
      setAlternateShelters(routeResult.alternate_shelters);
    } else {
      setAlternateShelters([]);
    }
  };

  // 迂回ルート（安全なルート）検索
  const handleFindSafeRoute = async () => {
    if (!searchParams || !selectedId) return;
    const origin = {
      lat: searchParams.latitude,
      lng: searchParams.longitude,
    };
    const destinationPoint = results.find(
      (p) => String(p.id) === String(selectedId),
    );
    if (!destinationPoint) return;
    const destination = {
      lat: destinationPoint.latitude,
      lng: destinationPoint.longitude,
    };
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/route`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            start: [origin.lng, origin.lat],
            end: [destination.lng, destination.lat],
            disaster_type: selectedCategories[0]?.split("_")[0] || "洪水",
            category: selectedCategories[0] || "洪水_01_計画規模",
            center: [origin.lng, origin.lat],
            radius_km: radiusKm,
            prefecture: searchParams?.prefecture || "",
            avoid_danger: true,
            user_location: [origin.lng, origin.lat],
          }),
        },
      );
      const data = await response.json();
      setRoute(data);
      setShowSafeRouteBtn(false);
      if (data && data.recommendation) {
        setRouteMessage({
          recommendation: data.recommendation,
          status: data.status,
        });
        setDialogOpen(true);
      }
      if (
        data &&
        data.status === "blocked" &&
        Array.isArray(data.alternate_shelters)
      ) {
        setAlternateShelters(data.alternate_shelters);
      } else {
        setAlternateShelters([]);
      }
    } catch (error) {
      alert("安全なルートの探索に失敗しました");
    }
  };

  // 代替避難所のルート探索
  const handleSelectAlternateShelter = async (shelter) => {
    if (!searchParams || !shelter) return;
    setSelectedId(shelter.id);
    const origin = {
      lat: searchParams.latitude,
      lng: searchParams.longitude,
    };
    const destination = {
      lat: shelter.latitude,
      lng: shelter.longitude,
    };
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/route`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            start: [origin.lng, origin.lat],
            end: [destination.lng, destination.lat],
            disaster_type: selectedCategories[0]?.split("_")[0] || "洪水",
            category: selectedCategories[0] || "洪水_01_計画規模",
            center: [origin.lng, origin.lat],
            radius_km: radiusKm,
            prefecture: searchParams?.prefecture || "",
            user_location: [origin.lng, origin.lat],
          }),
        },
      );
      const data = await response.json();
      setRoute(data);
      if (
        data &&
        data.status === "blocked" &&
        Array.isArray(data.alternate_shelters)
      ) {
        setAlternateShelters(data.alternate_shelters);
      } else {
        setAlternateShelters([]);
      }
      setShowSafeRouteBtn(false);
      if (data && data.recommendation) {
        setRouteMessage({
          recommendation: data.recommendation,
          status: data.status,
        });
        setDialogOpen(true);
      }
    } catch (error) {
      alert("ルート探索に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>避難所検索システム</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          検索半径: <b>{radiusKm} km</b>
          <input
            type="range"
            min={minRadius}
            max={maxRadius}
            step={1}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            style={{ width: "200px", marginLeft: "1em" }}
          />
        </label>
      </div>

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
        setUserLocation={setUserLocation}
      />

      {/* 通行止め時：到達可能避難所のリスト */}
      {route && route.status === "blocked" && (
        <div style={{ color: "red", fontWeight: "bold", margin: "12px 0" }}>
          <b>選択した避難所へのルートは通行止めです。</b>
          <br />
          近隣の到達可能な避難所を再検索しました。下から再選択してください。
          {alternateShelters && alternateShelters.length === 0 && (
            <div style={{ color: "black", fontWeight: "normal" }}>
              現在到達可能な避難所はありません。安全な場所で待機してください。
            </div>
          )}
          <ul>
            {alternateShelters &&
              alternateShelters.map((s) => (
                <li key={s.id} style={{ margin: "8px 0" }}>
                  {s.name} ({s.latitude},{s.longitude})
                  <button
                    style={{ marginLeft: "1em" }}
                    onClick={() => handleSelectAlternateShelter(s)}
                  >
                    この避難所でルート探索
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      <MapComponent
        points={results}
        selectedId={selectedId}
        onSelectPoint={handleSelectPoint}
        route={route}
        radiusKm={radiusKm}
        setRadiusKm={setRadiusKm}
        setRoute={handleSetRoute}
        hazardDisplayMode={hazardDisplayMode}
        searchParams={searchParams}
        selectedCategories={selectedCategories}
        userLocation={userLocation}
        suppliesMap={suppliesMap}
        setSuppliesMap={setSuppliesMap}
        crowdMap={crowdMap}
        setCrowdMap={setCrowdMap}
        showSafeRouteBtn={showSafeRouteBtn}
        onFindSafeRoute={handleFindSafeRoute}
        onAR={handleAR}
      />

      {results.length > 0 && (
        <ResultCardList
          points={results}
          selectedId={selectedId}
          onSelect={handleSelectPoint}
          suppliesMap={suppliesMap}
          crowdMap={crowdMap}
        />
      )}

      {/* ルート警告ダイアログ */}
      <RouteAlertDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        recommendation={routeMessage.recommendation}
        status={routeMessage.status}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UserApp />} />
      <Route path="/admin" element={<AdminRoot />} />
      <Route path="/disaster-situations" element={<DisasterSituations />} />
      <Route path="/ar" element={<ARView />} />
    </Routes>
  );
}
