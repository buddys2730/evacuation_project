import React from "react";
import { MarkerF, InfoWindowF } from "@react-google-maps/api";
import PropTypes from "prop-types";

const crowdLabel = (level) => {
  if (!level) return "未登録";
  if (level === "high") return "高";
  if (level === "medium") return "中";
  if (level === "low") return "低";
  return level;
};

const SearchResultMarkers = ({
  points,
  selectedId,
  onSelect,
  onMarkerClick,
}) => {
  // 型安全なlat/lng変換
  const safePoints = Array.isArray(points)
    ? points
        .map((point) => ({
          ...point,
          lat:
            typeof point.lat === "number"
              ? point.lat
              : point.lat
                ? parseFloat(point.lat)
                : typeof point.latitude === "number"
                  ? point.latitude
                  : point.latitude
                    ? parseFloat(point.latitude)
                    : undefined,
          lng:
            typeof point.lng === "number"
              ? point.lng
              : point.lng
                ? parseFloat(point.lng)
                : typeof point.longitude === "number"
                  ? point.longitude
                  : point.longitude
                    ? parseFloat(point.longitude)
                    : undefined,
        }))
        .filter(
          (p) =>
            typeof p.lat === "number" &&
            typeof p.lng === "number" &&
            !isNaN(p.lat) &&
            !isNaN(p.lng),
        )
    : [];

  // debug
  safePoints.forEach((point) => {
    console.log("[DEBUG] Marker:", point.id, point.lat, point.lng);
  });

  return (
    <>
      {safePoints.map((point) => (
        <MarkerF
          key={point.id}
          position={{
            lat: point.lat,
            lng: point.lng,
          }}
          onClick={() => {
            onSelect(point);
            if (onMarkerClick) onMarkerClick(point);
          }}
          // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
          // icon属性は一切指定しない
        >
          {String(selectedId) === String(point.id) && (
            <InfoWindowF onCloseClick={() => onSelect(null)}>
              <div>
                <strong>{point.name}</strong>
                <div>{point.address}</div>
                <div>
                  距離:{" "}
                  {point.distance_km !== undefined && point.distance_km !== null
                    ? point.distance_km.toFixed(1)
                    : "?"}{" "}
                  km
                </div>
                <div>
                  標高:{" "}
                  {point.elevation !== undefined && point.elevation !== null
                    ? point.elevation.toFixed(1)
                    : "?"}{" "}
                </div>
                <div>
                  混雑度: <b>{crowdLabel(point.crowdedness)}</b>
                </div>
                <div>
                  物資状況:
                  {Array.isArray(point.supplies) &&
                  point.supplies.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {point.supplies.map((item) => (
                        <li key={item.id || item.item_name}>
                          {item.item_name}: {item.quantity}個
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span> 登録なし</span>
                  )}
                </div>
              </div>
            </InfoWindowF>
          )}
        </MarkerF>
      ))}
    </>
  );
};

SearchResultMarkers.propTypes = {
  points: PropTypes.array.isRequired,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func.isRequired,
  onMarkerClick: PropTypes.func,
};

export default SearchResultMarkers;
