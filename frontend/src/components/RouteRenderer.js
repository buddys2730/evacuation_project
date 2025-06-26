import React from "react";
import { Polyline } from "@react-google-maps/api";

/**
 * 区間ごと色分けで描画（sections形式を推奨）
 * sections: [{ danger: true/false, coords: [[lng, lat], ...] }]
 * 旧dangerZones/roadClosuresも併用可能
 */
export default function RouteRenderer({
  route,
  sections = [],
  dangerZones = [],
  roadClosures = [],
  status,
  recommendation,
}) {
  // sectionsで区間ごと色分け
  const sectionLines = (sections || []).map((sec, i) => (
    <Polyline
      key={"sec-" + i}
      path={sec.coords.map(([lng, lat]) => ({ lat, lng }))}
      options={{
        strokeColor: sec.danger ? "#FF3B30" : "#00B050", // 赤:危険, 緑:安全
        strokeWeight: 8,
        strokeOpacity: 0.9,
        zIndex: sec.danger ? 2 : 1,
      }}
    />
  ));

  // 旧dangerZonesも念のため重ね描画（点線で強調）
  const dangerLines = (dangerZones || []).map((dz, i) => (
    <Polyline
      key={"danger-" + i}
      path={dz.section.map(([lng, lat]) => ({ lat, lng }))}
      options={{
        strokeColor: "#FF3B30",
        strokeWeight: 10,
        strokeOpacity: 0.6,
        zIndex: 4,
        icons: [
          {
            icon: {
              path: "M 0,-1 0,1",
              strokeOpacity: 1,
              scale: 4,
            },
            offset: "0",
            repeat: "20px",
          },
        ],
      }}
    />
  ));

  // 通行止め区間（グレー・極太）
  const blockedLines = (roadClosures || []).map((cl, i) => (
    <Polyline
      key={"blocked-" + i}
      path={cl.section.map(([lng, lat]) => ({ lat, lng }))}
      options={{
        strokeColor: "#888888",
        strokeWeight: 12,
        strokeOpacity: 1,
        zIndex: 5,
      }}
    />
  ));

  return (
    <>
      {/* セクション分割・色分け表示 */}
      {sectionLines}
      {/* 通行止め・危険区間を太線等で重ね強調 */}
      {dangerLines}
      {blockedLines}
      {/* 推奨文表示（必要なら追加UI対応） */}
      {/* <div className="recommendation">{recommendation}</div> */}
    </>
  );
}
