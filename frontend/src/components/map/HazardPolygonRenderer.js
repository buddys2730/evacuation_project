import React from "react";
import PropTypes from "prop-types";
import { Polygon } from "@react-google-maps/api";

/**
 * GeoJSON "Polygon" or "MultiPolygon" 形式から GoogleMaps Polygonパスに変換
 */
function geoJsonToPaths(geojson) {
  if (!geojson) return [];
  if (geojson.type === "Polygon") {
    // [[ [lng, lat], ... ]] -> [ [ {lat, lng}, ... ] ]
    return geojson.coordinates.map(
      (ring) => ring.map(([lng, lat]) => ({ lat, lng }))
    );
  }
  if (geojson.type === "MultiPolygon") {
    // [ [ [ [lng, lat], ... ] ], ... ] -> flat
    return geojson.coordinates.flatMap(
      (polygon) => polygon.map(
        (ring) => ring.map(([lng, lat]) => ({ lat, lng }))
      )
    );
  }
  return [];
}

const HazardPolygonRenderer = ({ polygons }) => {
  // -- データの入れ方に完全対応 --
  let features = [];
  // FeatureCollection形式の場合
  if (polygons && polygons.type === "FeatureCollection" && Array.isArray(polygons.features)) {
    features = polygons.features;
  }
  // 配列形式（従来のまま）の場合
  else if (Array.isArray(polygons)) {
    features = polygons;
  }
  // 空またはその他不正形式
  else {
    return null;
  }

  // -- デバッグ出力 --
  console.log("★★描画するポリゴン数:", features.length);
  if (features.length > 0) {
    console.log("★★サンプルFeature:", features[0]);
  }

  return (
    <>
      {features.map((feature, idx) => {
        // feature.geometryまたはfeature自体（両対応）
        const geometry = feature.geometry || feature;
        const pathsArr = geoJsonToPaths(geometry);

        // 複数リング・hole対応
        return pathsArr.map((ring, i) => (
          <Polygon
            key={`${idx}-${i}`}
            paths={ring}
            options={{
              strokeColor: "#1976d2",
              strokeOpacity: 0.8,
              strokeWeight: 1,
              fillColor: "#2196f3",
              fillOpacity: 0.22,
              clickable: false,
              zIndex: 2,
            }}
          />
        ));
      })}
    </>
  );
};

HazardPolygonRenderer.propTypes = {
  polygons: PropTypes.oneOfType([
    PropTypes.array, // [{geometry, properties}, ...]
    PropTypes.object // {type:"FeatureCollection", features:[...]}
  ]).isRequired,
};

export default HazardPolygonRenderer;
