import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function DisasterMap({
  disasters,
  selectedId,
  onSelect,
  center,
}) {
  const mapContainer = useRef();
  const mapRef = useRef();

  // 地図初期化
  useEffect(() => {
    if (!mapRef.current && mapContainer.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json",
        center: [133.362, 34.485],
        zoom: 12,
      });
      mapRef.current.addControl(
        new maplibregl.NavigationControl(),
        "top-right",
      );
    }
    // クリーンアップ不要ならreturn () => {} は省略可
  }, []);

  // レイヤー同期：map初期化完了後のみ
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!disasters || disasters.length === 0) return;

    // 地図ロード待ち
    if (!map.isStyleLoaded()) {
      const onLoad = () => {
        map.off("styledata", onLoad);
        updateDisasterLayer();
      };
      map.on("styledata", onLoad);
      return;
    }
    updateDisasterLayer();

    function updateDisasterLayer() {
      // 既存レイヤー削除
      if (map.getSource("disasters")) {
        if (map.getLayer("disaster-fills")) map.removeLayer("disaster-fills");
        map.removeSource("disasters");
      }
      // GeoJSON生成
      const geojson = {
        type: "FeatureCollection",
        features: disasters.map((d) => ({
          type: "Feature",
          properties: {
            id: d.id,
            selected: d.id === selectedId,
          },
          geometry: d.geometry,
        })),
      };
      map.addSource("disasters", { type: "geojson", data: geojson });
      map.addLayer({
        id: "disaster-fills",
        type: "fill",
        source: "disasters",
        paint: {
          "fill-color": [
            "case",
            ["==", ["get", "selected"], true],
            "#ff3333",
            "#f2aa4c",
          ],
          "fill-opacity": 0.35,
        },
      });
      map.on("click", "disaster-fills", (e) => {
        if (e.features.length > 0) {
          const fid = e.features[0].properties.id;
          onSelect && onSelect(fid);
        }
      });
    }
  }, [disasters, selectedId, onSelect]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: 420,
        margin: "12px 0",
        borderRadius: 8,
        border: "1px solid #aaf",
      }}
    />
  );
}
