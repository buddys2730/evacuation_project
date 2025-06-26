import React from "react";
import PropTypes from "prop-types";

/**
 * 避難所の詳細情報を表示するUI
 */
const ShelterDetail = ({ shelter, onClose }) => {
  if (!shelter) return null;

  return (
    <div className="shelter-detail-modal">
      <h2>{shelter.name}</h2>
      <p>住所: {shelter.address}</p>
      <p>標高: {shelter.elevation ?? "-"} m</p>
      <p>分類: {shelter.target_category ?? "-"}</p>
      <p>市区町村: {shelter.city ?? "-"}</p>
      {/* 追加項目はデータに応じて増やせます */}
      {onClose && (
        <button onClick={onClose} className="shelter-detail-close">
          閉じる
        </button>
      )}
    </div>
  );
};

ShelterDetail.propTypes = {
  shelter: PropTypes.object.isRequired,
  onClose: PropTypes.func,
};

export default ShelterDetail;
