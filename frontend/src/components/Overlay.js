export function LoadingOverlay({ open }) {
  if (!open) return null;
  return <div style={{
    position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
    background: "rgba(0,0,0,0.13)", display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999
  }}>
    <div style={{ background: "#fff", padding: 32, borderRadius: 10, fontSize: 20 }}>読込中...</div>
  </div>;
}
export function ErrorAlert({ open, message, onClose }) {
  if (!open) return null;
  return <div style={{
    position: "fixed", top: 20, right: 20, zIndex: 9999,
    background: "#fdd", color: "#900", padding: "14px 24px", borderRadius: 8, border: "1px solid #d44"
  }}>
    {message} <button onClick={onClose}>閉じる</button>
  </div>;
}
