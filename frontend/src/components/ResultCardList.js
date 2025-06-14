import PropTypes from "prop-types";
// /Users/masashitakao/Desktop/evacuation_project/frontend/src/components/ResultCardList.js

import React from "react";

const ResultCardList = ({
  results = [],
  selectedPoint,
  setSelectedPoint,
  setDirections,
  userLocation,
}) => {
  const handleCardClick = async (point) => {
    setSelectedPoint(point);

    if (!userLocation) {
      alert("現在地が取得できていません。");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: userLocation,
        destination: { lat: point.latitude, lng: point.longitude },
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error("ルート取得失敗:", status);
          alert("ルートを取得できませんでした。");
        }
      },
    );
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>検索結果一覧</h3>
      {results.length === 0 ? (
        <p>検索結果がありません。</p>
      ) : (
        <div>
          {results.map((point, idx) => (
            <div
              key={idx}
              onClick={() => handleCardClick(point)}
              style={{
                border:
                  selectedPoint?.id === point.id
                    ? "2px solid red"
                    : "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                cursor: "pointer",
                background: selectedPoint?.id === point.id ? "#ffecec" : "#fff",
              }}
            >
              <h4>{point.name}</h4>
              <p>{point.address}</p>
              {userLocation && point.distance && (
                <p>距離: {point.distance.toFixed(2)} km</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultCardList;

ResultCardList.propTypes = {
  // 自動挿入: 必要に応じて手動で編集してください
};
