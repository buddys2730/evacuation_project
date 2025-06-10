#!/bin/bash

echo "🛠️ MapComponent.js を更新中..."
cat << 'EOF' > "/Users/masashitakao/Desktop/evacuation_project/frontend/src/components/MapComponent.js"
import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Polygon } from '@react-google-maps/api';
import fetchHazardPolygonsFromViewport from '../services/fetchHazardPolygons';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 34.54348905249752,
  lng: 133.2900641214111
};

function MapComponent() {
  const [mapInstance, setMapInstance] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleOnLoad = map => {
    setMapInstance(map);
  };

  const fetchPolygons = async () => {
    if (!mapInstance) return;
    const bounds = mapInstance.getBounds();
    if (!bounds) return;
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    setLoading(true);
    const data = await fetchHazardPolygonsFromViewport({
      min_lat: sw.lat(),
      max_lat: ne.lat(),
      min_lng: sw.lng(),
      max_lng: ne.lng(),
      category: '洪水_01_計画規模'
    });
    setPolygons(data);
    setLoading(false);
  };

  useEffect(() => {
    if (mapInstance) {
      const idleListener = mapInstance.addListener('idle', fetchPolygons);
      return () => idleListener.remove();
    }
  }, [mapInstance]);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={handleOnLoad}
      >
        {polygons.map((polygon, index) => (
          <Polygon key={index} paths={polygon.paths} options={{ fillColor: '#FF0000', fillOpacity: 0.4 }} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}

export default MapComponent;

EOF

echo "🛠️ fetchHazardPolygons.js を作成中..."
cat << 'EOF' > "/Users/masashitakao/Desktop/evacuation_project/frontend/src/components/../services/fetchHazardPolygons.js"
const fetchHazardPolygonsFromViewport = async ({ min_lat, max_lat, min_lng, max_lng, category }) => {
  try {
    const query = new URLSearchParams({ min_lat, max_lat, min_lng, max_lng, category });
    const res = await fetch(`/api/hazard_zones/viewport?${query.toString()}`);
    const data = await res.json();
    return data.map(item => ({
      paths: item.geometry.coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] }))
    }));
  } catch (err) {
    console.error("ポリゴン取得失敗:", err);
    return [];
  }
};

export default fetchHazardPolygonsFromViewport;

EOF

echo "✅ 完了！VSCode で src/components/MapComponent.js を確認できます。"
