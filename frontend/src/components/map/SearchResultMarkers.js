// /Users/masashitakao/Desktop/evacuation_project/frontend/src/components/map/SearchResultMarkers.js

import React from "react";
import { MarkerF, InfoWindowF } from "@react-google-maps/api";
import PropTypes from "prop-types";

/**
 * 検索結果をマップ上にマーカーで表示。クリックで選択・ルート表示も連動
 * 今後「物資・混雑度」も吹き出しに表示
 */
const SearchResultMarkers = ({
  points,
  selectedId,
  onSelect,
  onMarkerClick // ← MapComponentからルート検索用に受け取る（追加）
}) => {
  return (
    <>
      {points.map((point) => (
        <MarkerF
          key={point.id}
          position={{
            lat: point.latitude ?? point.lat,
            lng: point.longitude ?? point.lng,
          }}
          onClick={() => {
            onSelect(point);
            if (onMarkerClick) onMarkerClick(point); // 追加
          }}
          icon={
            String(selectedId) === String(point.id)
              ? { url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }
              : { url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" }
          }
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
                  m
                </div>
                {/* --- 今後追加される混雑度・物資情報 --- */}
                {point.crowdedness && (
                  <div>
                    混雑度:{" "}
                    <span>
                      {point.crowdedness === "high"
                        ? "高"
                        : point.crowdedness === "medium"
                        ? "中"
                        : point.crowdedness === "low"
                        ? "低"
                        : point.crowdedness}
                    </span>
                  </div>
                )}
                {point.supplies && (
                  <div>
                    <span>物資状況:</span>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {Object.entries(point.supplies).map(([item, value]) => (
                        <li key={item}>
                          {item}: {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
  onMarkerClick: PropTypes.func, // 追加
};

export default SearchResultMarkers;
