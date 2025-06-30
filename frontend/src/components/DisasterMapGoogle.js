import React, { useEffect, useRef } from "react";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export default function DisasterMapGoogle({
  center = { lat: 34.3963, lng: 132.4596 },
  polygons = [],
  selectedId,
  onPolygonClick,
  onPolygonChange,
}) {
  const mapRef = useRef();
  const mapInstance = useRef(null);
  const drawingManagerRef = useRef();
  const polygonsRef = useRef([]);

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
      if (!mapInstance.current) {
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
          mapTypeId: "roadmap",
        });

        drawingManagerRef.current =
          new window.google.maps.drawing.DrawingManager({
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

        window.google.maps.event.addListener(
          drawingManagerRef.current,
          "polygoncomplete",
          function (polygon) {
            const path = polygon
              .getPath()
              .getArray()
              .map(({ lat, lng }) => [lng(), lat()]);
            path.push(path[0]);
            const geojson = {
              type: "Polygon",
              coordinates: [path],
            };
            if (onPolygonChange) onPolygonChange(geojson);
            polygon.setEditable(false);
          },
        );
      }
    }

    return () => {
      if (drawingManagerRef.current) drawingManagerRef.current.setMap(null);
      polygonsRef.current.forEach((p) => p.setMap(null));
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.setCenter(center);
    }
  }, [center]);

  // ポリゴン描画＆クリック連携
  useEffect(() => {
    if (!mapInstance.current) return;
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = polygons.map((geojson) => {
      const paths = geojson.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
      const isSelected = geojson.id && geojson.id === selectedId;
      const isCleared = geojson.isCleared;
      // 色分け
      let strokeColor = "#FF3333";
      let fillColor = "#FF3333";
      let fillOpacity = 0.25;
      if (isCleared) {
        strokeColor = "#1976d2";
        fillColor = "#71a7ff";
        fillOpacity = 0.38;
      }
      if (isSelected) {
        strokeColor = "#d00";
        fillOpacity = 0.45;
      }
      const poly = new window.google.maps.Polygon({
        paths,
        strokeColor,
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor,
        fillOpacity,
        editable: false,
        map: mapInstance.current,
      });
      if (geojson.id && onPolygonClick) {
        window.google.maps.event.addListener(poly, "click", () =>
          onPolygonClick(geojson.id),
        );
      }
      return poly;
    });
  }, [polygons, selectedId, onPolygonClick]);

  return (
    <div>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: 420,
          borderRadius: 8,
          border: "1px solid #aaa",
        }}
      />
    </div>
  );
}
