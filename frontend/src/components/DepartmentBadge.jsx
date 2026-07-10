function DepartmentBadge({ department }) {
  if (!department) {
    return (
      <span
        style={{
          background: "#f5f5f5",
          color: "#757575",
          padding: "6px 14px",
          borderRadius: "50px",
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        —
      </span>
    );
  }

  const colors = {
    Cardiology: "#e53935",
    Neurology: "#5e35b1",
    Orthopedics: "#fb8c00",
    Pediatrics: "#43a047",
    Dermatology: "#00897b",
    General: "#1976d2",
    Emergency: "#d81b60",
    Reception: "#6d4c41",
  };

  const color = colors[department] || "#1976d2";

  return (
    <span
      style={{
        background: `${color}15`,
        color,
        padding: "6px 14px",
        borderRadius: "50px",
        fontWeight: "600",
        fontSize: "13px",
        display: "inline-block",
      }}
    >
      {department}
    </span>
  );
}

export default DepartmentBadge;