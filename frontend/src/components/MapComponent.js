// /Users/masashitakao/Desktop/evacuation_project/frontend/src/components/MapComponent.js

import React, { useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  Circle,
  DirectionsRenderer,
  Polygon,
} from '@react-google-maps/api';
import { fetchHazardPolygons } from '../services/fetchHazardPolygons'; // ✅ services配下から読み込み

const MapComponent = ({
  results = [],
  userLocation,
  setUserLocation,
  selectedPoint,
  setSelectedPoint,
  directions,
  hazardDisplayMode,
  selectedCategories = [],
  radiusKm = 3,
}) => {
  const mapRef = useRef(null);
  const [hazardPolygons, setHazardPolygons] = useState([]);

  const defaultCenter = userLocation || { lat: 35.681236, lng: 139.767125 };

  useEffect(() => {
    if (hazardDisplayMode === 'hazard' && userLocation) {
      loadHazardPolygons();
    } else {
      setHazardPolygons([]);
    }
  }, [hazardDisplayMode, userLocation, selectedCategories]);

  const loadHazardPolygons = async () => {
    try {
      const fetched = await fetchHazardPolygons(
        selectedCategories,
        userLocation.lat,
        userLocation.lng,
        radiusKm
      );
      setHazardPolygons(fetched);
    } catch (err) {
      console.error('ポリゴン取得エラー:', err);
      setHazardPolygons([]);
    }
  };

  const renderPolygons = () =>
    hazardPolygons.map((poly, idx) => (
      <Polygon
        key={idx}
        paths={poly.coordinates.map((ring) =>
          ring.map(([lng, lat]) => ({ lat, lng }))
        )}
        options={{
          fillColor: '#ff0000',
          fillOpacity: 0.3,
          strokeColor: '#ff0000',
          strokeWeight: 1,
        }}
      />
    ));

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ height: '500px', width: '100%' }}
        center={defaultCenter}
        zoom={14}
        onLoad={(map) => {
          mapRef.current = map;
          if (!userLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) =>
              setUserLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              })
            );
          }
        }}
      >
        {/* 現在地 */}
        {userLocation && (
          <>
            <Marker position={userLocation} label="現在地" />
            <Circle
              center={userLocation}
              radius={radiusKm * 1000}
              options={{
                fillColor: '#2196f3',
                strokeColor: '#0d47a1',
                fillOpacity: 0.1,
              }}
            />
          </>
        )}

        {/* 検索結果マーカー */}
        {results.map((point, index) => (
          <Marker
            key={index}
            position={{ lat: point.latitude, lng: point.longitude }}
            onClick={() => setSelectedPoint(point)}
          />
        ))}

        {/* 吹き出し */}
        {selectedPoint && (
          <InfoWindow
            position={{
              lat: selectedPoint.latitude,
              lng: selectedPoint.longitude,
            }}
            onCloseClick={() => setSelectedPoint(null)}
          >
            <div>
              <h3>{selectedPoint.name}</h3>
              <p>{selectedPoint.address}</p>
            </div>
          </InfoWindow>
        )}

        {/* ルート案内 */}
        {directions && <DirectionsRenderer directions={directions} />}
        {/* ルートの安全性チェックボタン */}
{directions && (
  <button
    style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      zIndex: 10,
      padding: '8px 12px',
      backgroundColor: '#1976d2',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
    }}
    onClick={async () => {
      const routePoints = directions.routes[0].overview_path.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }));

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/route-safety`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ route: routePoints }),
          }
        );

        const data = await response.json();
        if (data.status === 'success') {
          if (data.result.status === 'danger') {
            alert('⚠️ 危険な地点が含まれています！');
            console.warn('危険ポイント:', data.result.dangerous_points);
          } else {
            alert('✅ このルートは安全です。');
          }
        } else {
          alert('⚠️ 判定エラー: ' + data.message);
        }
      } catch (err) {
        console.error('❌ APIエラー:', err);
        alert('❌ 通信に失敗しました');
      }
    }}
  >
    このルートの安全性をチェック
  </button>
)}

        {/* ハザードポリゴン */}
        {hazardDisplayMode === 'hazard' && renderPolygons()}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
