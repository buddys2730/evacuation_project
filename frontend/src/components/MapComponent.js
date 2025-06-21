import React, { useEffect, useRef, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { GoogleMap, LoadScript, Circle } from "@react-google-maps/api";
import UserMarker from "./map/UserMarker.js";
import SearchResultMarkers from "./map/SearchResultMarkers.js";
import RouteRenderer from "./map/RouteRenderer.js";
import HazardPolygonRenderer from "./map/HazardPolygonRenderer.js";
import { fetchHazardPolygons } from "../services/fetchHazardPolygons.js";

const MapComponent = ({
  points,
  selectedId,
  onSelectPoint,
  route,
  radiusKm,
  setRadiusKm,
  setRoute,
  hazardDisplayMode,
  searchParams,
  selectedCategories,
  userLocation,
}) => {
  const mapRef = useRef(null);
  const [hazardPolygons, setHazardPolygons] = useState([]);

  // マップ中心座標
  const center = useMemo(() => {
    if (searchParams && searchParams.center) return searchParams.center;
    if (userLocation) return userLocation;
    return { lat: 35.681236, lng: 139.767125 };
  }, [searchParams, userLocation]);

  // DBからhazardPolygonsをAPI経由で自動取得
  useEffect(() => {
    console.log(
      "useEffect発火:",
      hazardDisplayMode,
      center,
      selectedCategories,
      radiusKm,
    );
    console.log("searchParamsの中身:", searchParams);
    console.log(
      "fetchHazardPolygons呼び出し値 lat:",
      center.lat,
      "lng:",
      center.lng,
    );
    console.log(
      "useEffect発火:",
      hazardDisplayMode,
      center,
      selectedCategories,
      radiusKm,
    );
    let isMounted = true;
    const loadHazardPolygons = async () => {
      if (
        hazardDisplayMode === "hazard" &&
        center &&
        selectedCategories.length > 0
      ) {
        console.log("ハザードポリゴン取得APIリクエスト実行");
        try {
          // ここを修正！（prefecture名を正しく渡す）
          const fetched = await fetchHazardPolygons(
            selectedCategories,
            center.lat,
            center.lng,
            radiusKm,
            searchParams?.prefecture || searchParams?.pref, // どちらか値がある方を使う
          );

          if (isMounted) setHazardPolygons(fetched);
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
  }, [hazardDisplayMode, center.lat, center.lng, selectedCategories, radiusKm]);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
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
          points={points}
          selectedId={selectedId}
          onSelect={onSelectPoint}
        />
        <RouteRenderer route={route} />
        {route && (
          <button
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              zIndex: 10,
              padding: "8px 12px",
              backgroundColor: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
            }}
            onClick={async () => {
              const routePoints =
                route.routes?.[0]?.overview_path?.map((pt) => ({
                  lat: pt.lat(),
                  lng: pt.lng(),
                })) || [];

              try {
                const response = await fetch(
                  `${process.env.REACT_APP_API_BASE_URL}/api/route-safety`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ route: routePoints }),
                  },
                );
                const data = await response.json();
                if (data.status === "success") {
                  if (data.result.status === "danger") {
                    alert("⚠️ 危険な地点が含まれています！");
                  } else {
                    alert("✅ このルートは安全です。");
                  }
                } else {
                  alert("⚠️ 判定エラー: " + data.message);
                }
              } catch (err) {
                alert("❌ 通信に失敗しました");
              }
            }}
          >
            このルートの安全性をチェック
          </button>
        )}
        {hazardDisplayMode === "hazard" && (
          <>
            {console.log("MapComponentで受け取った polygons =", hazardPolygons)}
            <HazardPolygonRenderer polygons={hazardPolygons} />
          </>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

MapComponent.propTypes = {
  points: PropTypes.array.isRequired,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelectPoint: PropTypes.func.isRequired,
  route: PropTypes.object,
  radiusKm: PropTypes.number.isRequired,
  setRadiusKm: PropTypes.func.isRequired,
  setRoute: PropTypes.func.isRequired,
  hazardDisplayMode: PropTypes.string.isRequired,
  searchParams: PropTypes.object,
  selectedCategories: PropTypes.array.isRequired,
  userLocation: PropTypes.object,
};

export default MapComponent;
