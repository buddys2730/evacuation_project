import React from "react";
import PropTypes from "prop-types";
import "./ResultCardList.css";

const ResultCardList = ({ points, selectedId, onSelect }) => {
  if (!points || points.length === 0)
    return <div className="result-card-list-empty">検索結果がありません</div>;

  return (
    <div
      className="result-card-list"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        justifyContent: "flex-start",
      }}
    >
      {points.map((point) => (
        <div
          key={point.id}
          className={
            "result-card" +
            (String(selectedId) === String(point.id) ? " selected" : "")
          }
          style={{
            flex: "1 0 30%",
            maxWidth: "32%",
            minWidth: "220px",
            boxSizing: "border-box",
            background: "#fff",
            border: String(selectedId) === String(point.id)
              ? "2px solid #1976d2"
              : "1px solid #ddd",
            borderRadius: "10px",
            cursor: "pointer",
            padding: "12px",
            boxShadow:
              String(selectedId) === String(point.id)
                ? "0 4px 14px #1976d222"
                : "0 2px 4px #0001",
            transition: "border 0.2s, box-shadow 0.2s",
          }}
          onClick={() => onSelect(point)}
        >
          <div className="result-card-title">{point.name}</div>
          <div className="result-card-address">{point.address}</div>
          <div className="result-card-info" style={{ marginTop: "0.5em" }}>
            <span>
              距離: {point.distance_km !== undefined && point.distance_km !== null
                ? point.distance_km.toFixed(1)
                : "?"} km
            </span>
            <span style={{ marginLeft: "1em" }}>
              標高: {point.elevation !== undefined && point.elevation !== null
                ? point.elevation.toFixed(1)
                : "?"} m
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

ResultCardList.propTypes = {
  points: PropTypes.array.isRequired,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func.isRequired,
};

export default ResultCardList;
