import React, { useEffect, useState } from "react";
import DateRangeSlider from "../components/DateRangeSlider.js";
import DisasterSituationList from "../components/DisasterSituationList.js";
import MapComponent from "../components/MapComponent.js";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

// Utility: 今が解除日を過ぎているか判定
function isActive(situation) {
  if (!situation) return false;
  if (!situation.cleared_at) return true;
  // cleared_at: "2025-06-28T12:00:00" など
  return new Date(situation.cleared_at) > new Date();
}

const DisasterSituations = () => {
  const [minDate] = useState("2025-06-01");
  const [maxDate] = useState("2025-06-30");
  const [range, setRange] = useState([minDate, maxDate]);
  const [situations, setSituations] = useState([]);
  const [playing, setPlaying] = useState(false);

  // 範囲検索（解除済みは除外）
  useEffect(() => {
    if (!playing) {
      fetch(
        `${API_BASE}/api/disaster_situations?start_date=${range[0]}&end_date=${range[1]}`
      )
        .then((res) => res.json())
        .then((data) => {
          // 解除済みは除外
          setSituations(data.filter(isActive));
        });
    }
  }, [range, playing]);

  // タイムラプス再生（解除済みは除外）
  const handleTimelineStep = (date) => {
    fetch(`${API_BASE}/api/disaster_situations?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setSituations(data.filter(isActive));
      });
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>災害状況タイムライン（スライダー＋GoogleMap連動）</h2>
      <DateRangeSlider
        minDate={minDate}
        maxDate={maxDate}
        onRangeChange={setRange}
        onTimelineStep={handleTimelineStep}
        playing={playing}
        onPlayToggle={setPlaying}
      />
      {/* Google Map × ポリゴン描画 */}
      <div style={{ margin: "12px 0" }}>
        <MapComponent
          points={situations}
          selectedId={null}
          onSelectPoint={() => {}}
          radiusKm={3}
          setRadiusKm={() => {}}
          setRoute={() => {}}
          hazardDisplayMode={"disaster"}
          searchParams={null}
          selectedCategories={[]}
          userLocation={null}
        />
      </div>
      {/* 災害リストも連動 */}
      <DisasterSituationList situations={situations} />
    </div>
  );
};

export default DisasterSituations;
