import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "./ResultCardList.css";

/**
 * 検索結果をカードUIで一覧表示。混雑度・物資も表示
 */
const ResultCardList = ({
  points,
  selectedId,
  onSelect,
  suppliesMap,
  crowdMap,
}) => {
  const navigate = useNavigate();

  if (!points || points.length === 0)
    return <div className="result-card-list-empty">検索結果がありません</div>;

  // AR表示ボタン押下時の遷移
  const handleARClick = (point) => {
    // 標高（point.elevation）、物資、混雑度を安全に取得
    const supplies =
      suppliesMap && suppliesMap[point.id] && suppliesMap[point.id].length > 0
        ? suppliesMap[point.id]
            .map((item) => `${item.item_name}:${item.quantity}個`)
            .join(", ")
        : "";
    const crowd = crowdMap && crowdMap[point.id] ? crowdMap[point.id] : "";

    navigate("/ar", {
      state: {
        latitude: point.latitude,
        longitude: point.longitude,
        name: point.name,
        turns: point.turns ?? "",
        elev:
          point.elevation !== undefined && point.elevation !== null
            ? point.elevation.toString()
            : "",
        supplies,
        crowd,
        apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      },
    });
  };

  return (
    <div className="result-card-list">
      {points.map((point) => (
        <div
          key={point.id}
          className={`result-card${String(selectedId) === String(point.id) ? " selected" : ""}`}
          onClick={() => onSelect(point)}
          style={{
            border:
              String(selectedId) === String(point.id)
                ? "2px solid #1976d2"
                : "1px solid #ddd",
            marginBottom: 8,
            borderRadius: 8,
            padding: "10px 16px",
            background: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
            cursor: "pointer",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>
            {point.name}
          </div>
          <div style={{ color: "#333" }}>{point.address}</div>
          <div>
            距離:{" "}
            {point.distance_km !== undefined && point.distance_km !== null
              ? point.distance_km.toFixed(1)
              : "?"}{" "}
            km ／ 標高:{" "}
            {point.elevation !== undefined && point.elevation !== null
              ? point.elevation.toFixed(1)
              : "?"}{" "}
            m
          </div>
          <div>
            混雑度:{" "}
            <b>
              {crowdMap && crowdMap[point.id] ? crowdMap[point.id] : "未登録"}
            </b>
          </div>
          <div>
            物資状況:
            {suppliesMap &&
            suppliesMap[point.id] &&
            suppliesMap[point.id].length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {suppliesMap[point.id].map((item) => (
                  <li key={item.id}>
                    {item.item_name}: {item.quantity}個
                  </li>
                ))}
              </ul>
            ) : (
              <span> 登録なし</span>
            )}
          </div>
          {/* === ▼ AR表示ボタンを追加（ここ！） === */}
          <button
            style={{
              marginTop: 10,
              background: "#6d35d2",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 22px",
              fontWeight: "bold",
              fontSize: "1em",
              cursor: "pointer",
              boxShadow: "0 1px 4px #b99ff5aa",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleARClick(point);
            }}
          >
            AR表示
          </button>
        </div>
      ))}
    </div>
  );
};

ResultCardList.propTypes = {
  points: PropTypes.array.isRequired,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func.isRequired,
  suppliesMap: PropTypes.object,
  crowdMap: PropTypes.object,
};

export default ResultCardList;
