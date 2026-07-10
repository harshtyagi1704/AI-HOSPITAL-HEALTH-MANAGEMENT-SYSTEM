function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const maxButtons = 5;

  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  let end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const btnStyle = (active) => ({
    padding: "8px 14px",
    borderRadius: "6px",
    border: active ? "none" : "1px solid #ddd",
    background: active ? "#1976d2" : "white",
    color: active ? "white" : "#333",
    cursor: "pointer",
    minWidth: "40px",
  });

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "20px",
        flexWrap: "wrap",
      }}
    >
      <button
        style={btnStyle(false)}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ‹ Prev
      </button>

      {start > 1 && <span>...</span>}

      {pages.map((p) => (
        <button key={p} style={btnStyle(p === page)} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}

      {end < totalPages && <span>...</span>}

      <button
        style={btnStyle(false)}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next ›
      </button>
    </div>
  );
}

export default Pagination;
