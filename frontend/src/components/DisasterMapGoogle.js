import React, { useEffect, useRef } from "react";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export default function DisasterMapGoogle({
  center = { lat: 34.3963, lng: 132.4596 }, // 福山市デフォルト
  polygons = [],
  onPolygonChange
}) {
  const mapRef = useRef();
  const mapInstance = useRef(null); // ← 追加
  const drawingManagerRef = useRef();
  const polygonsRef = useRef([]);

  // Google Mapsライブラリ読込&初期化
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=drawing,geometry`;
      script.async = true;
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      // 既に地図が存在する場合は再初期化しない
      if (!mapInstance.current) {
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
          mapTypeId: "roadmap"
        });

        // DrawingManager導入
        drawingManagerRef.current = new window.google.maps.drawing.DrawingManager({
          drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: window.google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ["polygon"],
          },
          polygonOptions: {
            fillColor: "#ff3333",
            fillOpacity: 0.25,
            strokeWeight: 2,
            editable: true,
            draggable: false,
          },
        });
        drawingManagerRef.current.setMap(mapInstance.current);

        // Polygon追加イベント
        window.google.maps.event.addListener(
          drawingManagerRef.current,
          "polygoncomplete",
          function (polygon) {
            // PolygonをGeoJSONへ変換
            const path = polygon.getPath().getArray().map(({ lat, lng }) => [lng(), lat()]);
            path.push(path[0]); // 閉じる
            const geojson = {
              type: "Polygon",
              coordinates: [path],
            };
            if (onPolygonChange) onPolygonChange(geojson);
            polygon.setEditable(false);
          }
        );
      }
    }

    // クリーンアップ
    return () => {
      if (drawingManagerRef.current) drawingManagerRef.current.setMap(null);
      polygonsRef.current.forEach(p => p.setMap(null));
    };
    // eslint-disable-next-line
  }, []);

  // centerが変更された場合、地図を移動
  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.setCenter(center);
    }
  }, [center]);

  // polygonsが変更された場合、ポリゴン描画
  useEffect(() => {
    if (!mapInstance.current) return;
    polygonsRef.current.forEach(p => p.setMap(null)); // 既存削除
    polygonsRef.current = polygons.map(geojson => {
      const paths = geojson.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
      const poly = new window.google.maps.Polygon({
        paths,
        strokeColor: "#FF3333",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF3333",
        fillOpacity: 0.25,
        editable: false,
        map: mapInstance.current,
      });
      return poly;
    });
  }, [polygons]);

  return (
    <div>
      <div ref={mapRef} style={{ width: "100%", height: 420, borderRadius: 8, border: "1px solid #aaa" }} />
    </div>
  );
}
