import PropTypes from "prop-types";
// /components/map/SearchResultMarkers.js
import React, { useState } from "react";
import { Marker, InfoWindow } from "@react-google-maps/api";

const SearchResultMarkers = ({ results, selectedPoint, setSelectedPoint }) => {
  const [activeInfoWindowIndex, setActiveInfoWindowIndex] = useState(null);

  if (!results || !Array.isArray(results)) return null;

  return (
    <>
      {results.map((point, index) => {
        if (!point.latitude || !point.longitude) return null;

        return (
          <Marker
            key={index}
            position={{ lat: point.latitude, lng: point.longitude }}
            onClick={() => {
              setSelectedPoint(point);
              setActiveInfoWindowIndex(index);
            }}
          >
            {activeInfoWindowIndex === index && (
              <InfoWindow
                onCloseClick={() => {
                  setActiveInfoWindowIndex(null);
                }}
              >
                <div>
                  <h3>{point.name}</h3>
                  <p>{point.address}</p>
                  <p>混雑度: {point.congestion ?? "不明"}</p>
                  <p>必要物資: {point.supplies ?? "不明"}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        );
      })}
    </>
  );
};

export default SearchResultMarkers;

SearchResultMarkers.propTypes = {
  // 自動挿入: 必要に応じて手動で編集してください
};
