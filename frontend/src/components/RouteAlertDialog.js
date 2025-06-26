// /Users/masashitakao/Desktop/evacuation_project/frontend/src/components/RouteAlertDialog.js

import React from "react";
import PropTypes from "prop-types";

const statusColor = {
  safe: "#009966",
  danger: "#FF9500",
  blocked: "#FF3B30",
};

export default function RouteAlertDialog({ open, onClose, recommendation, status }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.3)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: "2em",
          borderRadius: "1em",
          minWidth: "300px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          textAlign: "center",
          borderTop: `8px solid ${statusColor[status] || "#aaa"}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ color: statusColor[status] || "#333" }}>
          {status === "safe"
            ? "安全なルートです"
            : status === "danger"
            ? "要注意ルート"
            : status === "blocked"
            ? "通行止め"
            : "ルート情報"}
        </h3>
        <div style={{ fontSize: "1.1em", margin: "1em 0" }}>
          {recommendation}
        </div>
        <button
          style={{
            marginTop: "1.5em",
            padding: "0.6em 2em",
            border: "none",
            borderRadius: "6px",
            background: "#2196f3",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "1em",
          }}
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

RouteAlertDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  recommendation: PropTypes.string,
  status: PropTypes.string,
};
