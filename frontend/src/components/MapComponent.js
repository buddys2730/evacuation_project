import React, { useEffect, useRef, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { GoogleMap, LoadScript, Circle } from "@react-google-maps/api";
import UserMarker from "./map/UserMarker.js";
import SearchResultMarkers from "./map/SearchResultMarkers.js";
import RouteRenderer from "./RouteRenderer.js";
import HazardPolygonRenderer from "./map/HazardPolygonRenderer.js";
import { fetchHazardPolygons } from "../services/fetchHazardPolygons.js";

// ルートAPIリクエスト
async function fetchRoute(start, end, disasterType, center, radiusKm, prefecture) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/api/route`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start,
          end,
          disaster_type: disasterType,
          center,
          radius_km: radiusKm,
          prefecture,
        }),
      }
    );
    return await response.json();
  } catch (err) {
    alert("ルートAPI通信エラー");
    return null;
  }
}

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
}) => {
  const mapRef = useRef(null);
  const [hazardPolygons, setHazardPolygons] = useState([]);
  const [routeData, setRouteData] = useState(null);

  // マップ中心座標
  const center = useMemo(() => {
    if (searchParams && searchParams.center) return searchParams.center;
    if (userLocation) return userLocation;
    return { lat: 35.681236, lng: 139.767125 };
  }, [searchParams, userLocation]);

  // ポイントクリック時にルート検索
  const handleMarkerClick = async (point) => {
    if (!userLocation) {
      alert("現在地が取得できません。");
      return;
    }
    onSelectPoint(point);
    const disasterType =
      selectedCategories && selectedCategories.length > 0
        ? selectedCategories[0].split("_")[0]
        : "洪水";
    const category =
      selectedCategories && selectedCategories.length > 0
        ? selectedCategories[0]
        : "洪水_01_計画規模";
    const prefecture = searchParams?.prefecture || searchParams?.pref || "";
    const start = [userLocation.lng, userLocation.lat];
    const end = [point.lng || point.longitude, point.lat || point.latitude];

    const routeResult = await fetchRoute(
      start,
      end,
      disasterType,
      [center.lng, center.lat],
      radiusKm,
      prefecture
    );

    if (routeResult && Array.isArray(routeResult.route)) {
      setRouteData(routeResult);
      setRoute && setRoute(routeResult);
    } else {
      setRouteData(null);
      setRoute && setRoute(null);
    }
  };

  // ハザード・災害状況ポリゴン取得
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
          // /api/hazard-polygons で静的＋動的（災害状況）両方のポリゴンが返る
          const polygons = await fetchHazardPolygons(
            category,
            lat,
            lng,
            radiusKm,
            prefecture,
            hazardDisplayMode
          );
          // featureCollection形式も素配列も両対応
          let arr =
            polygons?.features ||
            (Array.isArray(polygons) ? polygons : []);
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
          onMarkerClick={handleMarkerClick}
        />

        {/* ルートを描画 */}
        {routeData && (
          <RouteRenderer
            route={
              Array.isArray(routeData.route)
                ? routeData.route.map(([lng, lat]) => ({ lat, lng }))
                : []
            }
            sections={routeData.sections || []}
            dangerZones={routeData.danger_zones || []}
            roadClosures={routeData.road_closures || []}
            status={routeData.status}
            recommendation={routeData.recommendation}
          />
        )}

        {/* ハザード・災害状況ポリゴン描画 */}
        <HazardPolygonRenderer polygons={hazardPolygons} />
      </GoogleMap>
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
  hazardDisplayMode: PropTypes.string.isRequired,
  searchParams: PropTypes.object,
  selectedCategories: PropTypes.array.isRequired,
  userLocation: PropTypes.object,
};

export default MapComponent;
