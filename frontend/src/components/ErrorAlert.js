export function ErrorAlert({ open, message, onClose }) {
  if (!open) return null;
  return <div style={{
    position: "fixed", top: 20, right: 20, zIndex: 9999,
    background: "#fdd", color: "#900", padding: "14px 24px", borderRadius: 8, border: "1px solid #d44"
  }}>
    {message} <button onClick={onClose}>閉じる</button>
  </div>;
}