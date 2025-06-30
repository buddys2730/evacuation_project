import React, { useEffect, useRef, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { GoogleMap, LoadScript, Circle } from "@react-google-maps/api";
import UserMarker from "./map/UserMarker.js";
import SearchResultMarkers from "./map/SearchResultMarkers.js";
import RouteRenderer from "./RouteRenderer.js";
import HazardPolygonRenderer from "./map/HazardPolygonRenderer.js";
import { fetchHazardPolygons } from "../services/fetchHazardPolygons.js";

const MapComponent = ({
  points,
  selectedId,
  onSelectPoint,
  radiusKm,
  setRadiusKm,
  setRoute,
  hazardDisplayMode,
  searchParams,
  selectedCategories,
  userLocation,
  route,
  suppliesMap,
  setSuppliesMap,
  crowdMap,
  setCrowdMap,
  showSafeRouteBtn,
  onFindSafeRoute,
  // onAR, // ←不要なのでコメントアウト（全機能維持、onARは未使用となるだけ）
}) => {
  const mapRef = useRef(null);
  const [hazardPolygons, setHazardPolygons] = useState([]);
  const [routeStatus, setRouteStatus] = useState("");
  const [isRouteSafe, setIsRouteSafe] = useState(false);
  const [routeChecked, setRouteChecked] = useState(false);

  const navigate = useNavigate();

  // ポイントをlat/lng必須で正規化
  const normalizedPoints = useMemo(() => {
    if (!Array.isArray(points)) return [];
    return points
      .map((p) => ({
        ...p,
        lat:
          typeof p.lat === "number"
            ? p.lat
            : typeof p.latitude === "number"
              ? p.latitude
              : p.lat
                ? parseFloat(p.lat)
                : p.latitude
                  ? parseFloat(p.latitude)
                  : undefined,
        lng:
          typeof p.lng === "number"
            ? p.lng
            : typeof p.longitude === "number"
              ? p.longitude
              : p.lng
                ? parseFloat(p.lng)
                : p.longitude
                  ? parseFloat(p.longitude)
                  : undefined,
      }))
      .filter(
        (p) =>
          typeof p.lat === "number" &&
          typeof p.lng === "number" &&
          !isNaN(p.lat) &&
          !isNaN(p.lng),
      );
  }, [points]);

  // 物資・混雑度データ取得
  useEffect(() => {
    if (!normalizedPoints || normalizedPoints.length === 0) {
      setSuppliesMap && setSuppliesMap({});
      setCrowdMap && setCrowdMap({});
      return;
    }
    Promise.all(
      normalizedPoints.map((s) =>
        fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/supplies?shelter_id=${s.id}`,
        )
          .then((r) => r.json())
          .then((data) => ({
            id: s.id,
            supplies: Array.isArray(data) ? data : [],
          }))
          .catch(() => ({ id: s.id, supplies: [] })),
      ),
    ).then((results) => {
      const map = {};
      results.forEach((r) => {
        map[r.id] = r.supplies;
      });
      setSuppliesMap && setSuppliesMap(map);
      normalizedPoints.forEach((p) => {
        p.supplies = map[p.id] || [];
      });
    });
    Promise.all(
      normalizedPoints.map((s) =>
        fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/crowd?shelter_id=${s.id}`,
        )
          .then((r) => r.json())
          .then((data) => ({ id: s.id, crowd: data.crowd_level || "未登録" }))
          .catch(() => ({ id: s.id, crowd: "未登録" })),
      ),
    ).then((results) => {
      const map = {};
      results.forEach((r) => {
        map[r.id] = r.crowd;
      });
      setCrowdMap && setCrowdMap(map);
      normalizedPoints.forEach((p) => {
        p.crowdedness = map[p.id] || "未登録";
      });
    });
  }, [normalizedPoints, setSuppliesMap, setCrowdMap]);

  // 【常に現在地を中央】
  const center = useMemo(() => {
    if (userLocation) return userLocation;
    return { lat: 35.681236, lng: 139.767125 }; // デフォルト
  }, [userLocation]);

  // ルートAPI呼び出し
  const handleMarkerClick = async (point) => {
    if (!userLocation) {
      alert("現在地が取得できません。");
      return;
    }
    onSelectPoint(point);

    let mode = "none";
    if (hazardDisplayMode === "hazard") mode = "hazard";
    else if (hazardDisplayMode === "disaster") mode = "disaster";

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/route_check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: { lat: userLocation.lat, lng: userLocation.lng },
            destination: {
              lat: point.lat ?? point.latitude,
              lng: point.lng ?? point.longitude,
            },
            mode: mode,
          }),
        },
      );
      const routeResult = await response.json();
      setRoute && setRoute(routeResult);
      setRouteChecked(true);

      // ▼ 判定ロジック
      if (mode === "none") {
        setRouteStatus("このルートは安全です");
        setIsRouteSafe(true);
      } else if (mode === "hazard") {
        if (routeResult.status === "safe") {
          setRouteStatus("このルートは安全です");
          setIsRouteSafe(true);
        } else if (routeResult.status === "all_danger") {
          setRouteStatus(
            "⚠️ このルートはハザードマップ上で危険と判定されましたが、案内は続行できます（自己責任で移動してください）",
          );
          setIsRouteSafe(true); // ←ARはOK
        } else if (routeResult.status === "no_routes_found") {
          setRouteStatus("ルートが見つかりません");
          setIsRouteSafe(false);
        } else {
          setRouteStatus("ルート判定結果が取得できませんでした");
          setIsRouteSafe(false);
        }
      } else if (mode === "disaster") {
        if (routeResult.status === "safe") {
          setRouteStatus("このルートは安全です");
          setIsRouteSafe(true);
        } else if (routeResult.status === "all_danger") {
          setRouteStatus(
            "このルートは現在の災害情報で危険と判定されました。別の避難所を選択してください。",
          );
          setIsRouteSafe(false); // ←AR禁止
        } else if (routeResult.status === "no_routes_found") {
          setRouteStatus("ルートが見つかりません");
          setIsRouteSafe(false);
        } else {
          setRouteStatus("ルート判定結果が取得できませんでした");
          setIsRouteSafe(false);
        }
      }
    } catch (err) {
      alert("ルートAPI通信エラー");
      setRoute && setRoute(null);
      setRouteStatus("ルート検索エラー");
      setIsRouteSafe(false);
      setRouteChecked(true);
    }
  };

  // AR遷移関数を追加（削除無し）
  const handleAR = () => {
    if (!selectedId) {
      alert("避難所を選択してください。");
      return;
    }
    // 検索結果の中から選択されたポイントを特定
    const point = normalizedPoints.find(
      (p) => String(p.id) === String(selectedId),
    );
    if (!point) {
      alert("選択避難所データが見つかりません。");
      return;
    }
    const turns = route?.routes?.[0]?.legs?.[0]?.steps?.length || 0;
    // supplies/crowdMapからも取得
    const supplies =
      suppliesMap && suppliesMap[point.id] && suppliesMap[point.id].length > 0
        ? suppliesMap[point.id]
            .map((item) => `${item.item_name}:${item.quantity}個`)
            .join(", ")
        : "";
    const crowd = crowdMap && crowdMap[point.id] ? crowdMap[point.id] : "";

    navigate("/ar", {
      state: {
        latitude: point.lat,
        longitude: point.lng,
        name: point.name,
        turns: turns,
        elev:
          point.elevation !== undefined && point.elevation !== null
            ? point.elevation.toString()
            : "",
        supplies,
        crowd,
        apiKey: process.env.REACT_APP_GOOGLE_ELEVATION_API_KEY ?? "",
      },
    });
  };

  // ポリゴン取得
  useEffect(() => {
    let isMounted = true;
    const loadHazardPolygons = async () => {
      if (
        (hazardDisplayMode === "hazard" || hazardDisplayMode === "disaster") &&
        center &&
        selectedCategories &&
        selectedCategories.length > 0 &&
        (searchParams?.prefecture || searchParams?.pref)
      ) {
        const category = Array.isArray(selectedCategories)
          ? selectedCategories[0]
          : selectedCategories;
        const prefecture = searchParams.prefecture || searchParams.pref;
        const lat = center.lat;
        const lng = center.lng;
        if (!category || !prefecture || !lat || !lng) {
          setHazardPolygons([]);
          return;
        }
        try {
          const polygons = await fetchHazardPolygons(
            category,
            lat,
            lng,
            radiusKm,
            prefecture,
            hazardDisplayMode,
          );
          let arr =
            polygons?.features || (Array.isArray(polygons) ? polygons : []);
          if (isMounted) {
            setHazardPolygons(arr);
          }
        } catch (err) {
          setHazardPolygons([]);
        }
      } else {
        setHazardPolygons([]);
      }
    };
    loadHazardPolygons();
    return () => {
      isMounted = false;
    };
  }, [
    hazardDisplayMode,
    center.lat,
    center.lng,
    selectedCategories,
    radiusKm,
    searchParams?.prefecture,
    searchParams?.pref,
  ]);

  // オーバーレイUI
  function MapOverlay() {
    return (
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 99,
          background: "#fff",
          border: routeStatus.includes("安全です")
            ? "2px solid #1976d2"
            : "2px solid #d32f2f",
          borderRadius: 10,
          padding: "9px 18px",
          fontWeight: "bold",
          color: routeStatus.includes("安全です") ? "#009688" : "#d32f2f",
          fontSize: 18,
          minWidth: 220,
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span>{routeStatus}</span>
        {isRouteSafe && (
          <button
            style={{
              marginLeft: 16,
              background: "#009688",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 17,
              fontWeight: "bold",
              padding: "6px 18px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
            onClick={handleAR}
          >
            ARで表示
          </button>
        )}
        {/* 危険・blocked時の「安全なルート探索」ボタン */}
        {!isRouteSafe && showSafeRouteBtn && (
          <button
            style={{
              marginLeft: 12,
              background: "#ffa000",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: "bold",
              padding: "6px 14px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
            onClick={onFindSafeRoute}
          >
            安全なルート再探索
          </button>
        )}
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <div style={{ position: "relative" }}>
        {routeStatus && <MapOverlay />}
        {route && route.danger_reasons && route.danger_reasons.length > 0 && (
          <div
            style={{
              color: "#d32f2f",
              background: "#fffbe6",
              padding: "8px 15px",
              borderRadius: 8,
              marginTop: 12,
              fontWeight: "bold",
              maxWidth: 480,
            }}
          >
            <div>⚠️ 危険判定理由：</div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {route.danger_reasons.map((reason, i) => (
                <li key={i} style={{ fontWeight: "normal" }}>
                  {reason.type === "hazard_zones"
                    ? `ハザードマップ「${reason.category}」のポリゴン該当（ID: ${reason.id}／緯度: ${reason.lat}, 経度: ${reason.lng}）`
                    : `災害状況「${reason.disaster_type}」該当（ID: ${reason.id}／緯度: ${reason.lat}, 経度: ${reason.lng}）`}
                </li>
              ))}
            </ul>
          </div>
        )}
        <GoogleMap
          mapContainerStyle={{ height: "500px", width: "100%" }}
          center={center}
          zoom={14}
          onLoad={(map) => {
            mapRef.current = map;
          }}
        >
          <UserMarker position={center} />
          <Circle
            center={center}
            radius={radiusKm * 1000}
            options={{
              fillColor: "#2196f3",
              strokeColor: "#0d47a1",
              fillOpacity: 0.1,
            }}
          />
          <SearchResultMarkers
            points={normalizedPoints}
            selectedId={selectedId}
            onSelect={onSelectPoint}
            onMarkerClick={handleMarkerClick}
          />
          {route && Array.isArray(route.routes) && route.routes.length > 0 && (
            <RouteRenderer
              route={route.routes[0].legs[0].steps.map((step) => ({
                lat: step.end_location.lat,
                lng: step.end_location.lng,
              }))}
              status={route.status}
              recommendation={route.recommendation}
              sections={route.sections}
              dangerZones={route.dangerZones}
              roadClosures={route.roadClosures}
            />
          )}
          <HazardPolygonRenderer polygons={hazardPolygons} />
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

MapComponent.propTypes = {
  points: PropTypes.array.isRequired,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelectPoint: PropTypes.func.isRequired,
  radiusKm: PropTypes.number.isRequired,
  setRadiusKm: PropTypes.func.isRequired,
  setRoute: PropTypes.func,
  route: PropTypes.object,
  hazardDisplayMode: PropTypes.string.isRequired,
  searchParams: PropTypes.object,
  selectedCategories: PropTypes.array.isRequired,
  userLocation: PropTypes.object,
  suppliesMap: PropTypes.object,
  setSuppliesMap: PropTypes.func,
  crowdMap: PropTypes.object,
  setCrowdMap: PropTypes.func,
  showSafeRouteBtn: PropTypes.bool,
  onFindSafeRoute: PropTypes.func,
  // onAR: PropTypes.func, // 未使用
};

export default MapComponent;
