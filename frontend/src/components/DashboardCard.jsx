function DashboardCard({
  title,
  value,
  color,
  icon,
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "14px",
        padding: "24px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        borderLeft: `6px solid ${color}`,
        transition: "0.3s",
        cursor: "pointer",
        minHeight: "130px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 12px 28px rgba(0,0,0,.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow =
          "0 8px 20px rgba(0,0,0,.08)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#666",
            fontWeight: 600,
          }}
        >
          {title}
        </h3>

        <span
          style={{
            fontSize: "30px",
          }}
        >
          {icon}
        </span>
      </div>

      <h1
        style={{
          margin: "18px 0 0",
          color,
          fontSize: "36px",
          fontWeight: "bold",
        }}
      >
        {value}
      </h1>
    </div>
  );
}

export default DashboardCard;