// Reusable loading-skeleton primitives (Phase 42).
// Usage: <Skeleton height={20} width="60%" /> or <SkeletonCard />

export function Skeleton({ height = 16, width = "100%", style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ height, width, marginBottom: "8px", ...style }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ cursor: "default" }}>
      <Skeleton height={14} width="40%" />
      <Skeleton height={28} width="60%" />
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, columns = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: columns }).map((__, c) => (
            <td key={c} style={{ padding: "12px" }}>
              <Skeleton height={14} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default Skeleton;
