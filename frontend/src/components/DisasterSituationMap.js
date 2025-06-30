import React from "react";
import PropTypes from "prop-types";

const DisasterSituationMap = ({ situations }) => (
  <div
    style={{
      border: "1px solid #ccc",
      height: 400,
      width: "100%",
      margin: "16px 0",
    }}
  >
    {situations.length === 0 && <p>表示する災害状況がありません</p>}
    {situations.map((s) => (
      <div key={s.id}>
        <b>【{s.disaster_type}】</b> 危険度:{s.danger_level} 発生:
        {s.occurred_at}
      </div>
    ))}
  </div>
);

DisasterSituationMap.propTypes = {
  situations: PropTypes.array.isRequired,
};

export default DisasterSituationMap;
