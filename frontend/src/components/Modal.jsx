function Modal({ title, onClose, children, width = "520px" }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "12px",
          width,
          maxWidth: "95%",
          maxHeight: "88vh",
          overflowY: "auto",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 22px",
            borderBottom: "1px solid #eee",
            position: "sticky",
            top: 0,
            background: "white",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <h2 style={{ margin: 0, color: "#1976d2" }}>{title}</h2>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#f1f1f1",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "22px" }}>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
