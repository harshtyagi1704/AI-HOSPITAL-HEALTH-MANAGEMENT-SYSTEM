function RoleBadge({ role }) {
  const roleConfig = {
    admin: {
      background: "#fdecea",
      color: "#d32f2f",
      label: "👑 Admin",
    },
    doctor: {
      background: "#e8f5e9",
      color: "#2e7d32",
      label: "👨‍⚕️ Doctor",
    },
    reception: {
      background: "#fff3e0",
      color: "#ef6c00",
      label: "🏥 Reception",
    },
    patient: {
      background: "#e3f2fd",
      color: "#1976d2",
      label: "🧑 Patient",
    },
  };

  const config = roleConfig[role] || {
    background: "#eeeeee",
    color: "#424242",
    label: role || "Unknown",
  };

  return (
    <span
      style={{
        background: config.background,
        color: config.color,
        padding: "6px 14px",
        borderRadius: "50px",
        fontWeight: "600",
        fontSize: "14px",
        display: "inline-block",
        minWidth: "110px",
        textAlign: "center",
      }}
    >
      {config.label}
    </span>
  );
}

export default RoleBadge;