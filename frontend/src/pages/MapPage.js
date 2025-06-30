import React, { useState } from "react";
import DateRangeSlider from "../components/DateRangeSlider";
import MapComponent from "../components/MapComponent";

const minDate = "2025-06-01";
const maxDate = "2025-06-27";

export default function MapPage() {
  const [disasterData, setDisasterData] = useState([]);
  const [playing, setPlaying] = useState(false);

  const handleRangeChange = ([from, to]) => {
    fetch(`/api/disaster_situations?start_date=${from}&end_date=${to}`)
      .then(res => res.json())
      .then(setDisasterData);
  };

  const handleTimelineStep = (date) => {
    // 1日ずつのアニメーションなどに使う
    // 例: fetch(`/api/disaster_situations?date=${date}`).then(res => res.json()).then(setDisasterData);
  };

  return (
    <div>
      <h2>災害状況のタイムスライダー検索</h2>
      <DateRangeSlider
        minDate={minDate}
        maxDate={maxDate}
        onRangeChange={handleRangeChange}
        onTimelineStep={handleTimelineStep}
        playing={playing}
        onPlayToggle={setPlaying}
      />
      <MapComponent disasterPolygons={disasterData} />
    </div>
  );
}
