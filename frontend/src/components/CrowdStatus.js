import React from "react";
import PropTypes from "prop-types";

const levels = ["空いている", "やや混雑", "混雑"];

/**
 * 混雑度表示・選択UI
 */
const CrowdStatus = ({ shelterId, crowdLevel, onUpdate }) => (
  <div className="crowd-status">
    <label>混雑度: </label>
    {onUpdate ? (
      <select value={crowdLevel || ""} onChange={e => onUpdate(e.target.value)}>
        <option value="">未設定</option>
        {levels.map(lv => (
          <option key={lv} value={lv}>{lv}</option>
        ))}
      </select>
    ) : (
      <span>{crowdLevel || "未設定"}</span>
    )}
  </div>
);

CrowdStatus.propTypes = {
  shelterId: PropTypes.string.isRequired,
  crowdLevel: PropTypes.string,
  onUpdate: PropTypes.func,
};

export default CrowdStatus;
