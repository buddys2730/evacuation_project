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
