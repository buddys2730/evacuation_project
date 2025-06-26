import React, { useEffect, useState, useRef } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import dayjs from "dayjs";
import PropTypes from "prop-types";

// ユーティリティ
const dateToNum = (date, minDate) =>
  dayjs(date).diff(dayjs(minDate), "day");
const numToDate = (num, minDate) =>
  dayjs(minDate).add(num, "day").format("YYYY-MM-DD");

const DateRangeSlider = ({
  minDate,
  maxDate,
  onRangeChange,
  onTimelineStep,
  playing,
  onPlayToggle,
}) => {
  const [range, setRange] = useState([
    0,
    dayjs(maxDate).diff(dayjs(minDate), "day"),
  ]);
  const timerRef = useRef(null);
  const totalDays = dayjs(maxDate).diff(dayjs(minDate), "day");

  // スライダー値→日付範囲に変換して通知
  useEffect(() => {
    const [startNum, endNum] = range;
    onRangeChange([numToDate(startNum, minDate), numToDate(endNum, minDate)]);
    // eslint-disable-next-line
  }, [range]);

  // 再生アニメーション（スライダーの下端だけ動かすイメージ）
  const handlePlay = () => {
    if (playing) {
      clearInterval(timerRef.current);
      onPlayToggle(false);
      return;
    }
    let current = range[0];
    const end = range[1];
    onPlayToggle(true);

    timerRef.current = setInterval(() => {
      if (current > end) {
        clearInterval(timerRef.current);
        onPlayToggle(false);
        return;
      }
      // スライダーの下端（range[0]）を現在値に動かす（例：範囲を[current, end]で動かす）
      setRange([current, end]);
      onTimelineStep(numToDate(current, minDate));
      current++;
    }, 800);
  };

  return (
    <div style={{ margin: "18px 0", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span>{numToDate(range[0], minDate)}</span>
        <Slider
          range
          min={0}
          max={totalDays}
          value={range}
          onChange={setRange}
          allowCross={false}
        />
        <span>{numToDate(range[1], minDate)}</span>
        <button onClick={handlePlay}>{playing ? "■ 停止" : "▶ 再生"}</button>
      </div>
    </div>
  );
};

DateRangeSlider.propTypes = {
  minDate: PropTypes.string.isRequired,
  maxDate: PropTypes.string.isRequired,
  onRangeChange: PropTypes.func.isRequired,
  onTimelineStep: PropTypes.func.isRequired,
  playing: PropTypes.bool.isRequired,
  onPlayToggle: PropTypes.func.isRequired,
};

export default DateRangeSlider;
