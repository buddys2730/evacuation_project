import React from "react";
import PropTypes from "prop-types";

const DisasterSituationList = ({ situations }) => (
  <div style={{ margin: "8px 0" }}>
    <h3>災害状況リスト</h3>
    {situations.length === 0 && <p>該当なし</p>}
    <ul>
      {situations.map((s) => (
        <li key={s.id}>
          <b>{s.disaster_type}</b> | 危険度:{s.danger_level} | 発生:
          {s.occurred_at}
          <br />
          {s.comment}
        </li>
      ))}
    </ul>
  </div>
);

DisasterSituationList.propTypes = {
  situations: PropTypes.array.isRequired,
};

export default DisasterSituationList;
