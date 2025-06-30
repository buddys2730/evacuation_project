import React, { useState } from "react";
import AdminDashboard from "../components/AdminDashboard.js";
import DisasterSituationDashboard from "./DisasterSituationDashboard.js";

export default function AdminRoot() {
  const [tab, setTab] = useState("shelter");
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => setTab("shelter")}
          style={{
            fontWeight: tab === "shelter" ? "bold" : undefined,
            borderBottom:
              tab === "shelter" ? "3px solid #005edc" : "1px solid #ccc",
            background: tab === "shelter" ? "#e8f0ff" : "#fff",
            padding: "10px 24px",
          }}
        >
          避難所管理
        </button>
        <button
          onClick={() => setTab("disaster")}
          style={{
            fontWeight: tab === "disaster" ? "bold" : undefined,
            borderBottom:
              tab === "disaster" ? "3px solid #d44" : "1px solid #ccc",
            background: tab === "disaster" ? "#fff0f0" : "#fff",
            padding: "10px 24px",
          }}
        >
          災害状況管理
        </button>
      </div>
      {/* ▼ タブ切替で必ず最新版DisasterSituationDashboardを表示 */}
      {tab === "shelter" && <AdminDashboard />}
      {tab === "disaster" && <DisasterSituationDashboard />}
    </div>
  );
}
