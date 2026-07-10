import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import Pagination from "../components/Pagination";
import { SkeletonTableRows } from "../components/Skeleton";
import api from "../services/api";

function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/audit-logs", {
        params: { page, limit: 20, action: action || undefined, search: search || undefined },
      });
      setLogs(res.data.logs);
      setActions(res.data.distinctActions);
      setPagination(res.data.pagination);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, action]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchLogs();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const actionColor = (a) => {
    if (a.includes("DELETE") || a.includes("CANCELLED")) return "#c62828";
    if (a.includes("CREATED") || a.includes("REGISTERED") || a.includes("BOOKED")) return "#2e7d32";
    if (a.includes("LOGIN")) return "#1976d2";
    return "#666";
  };

  return (
    <Layout>
    <h2 style={{ marginTop: "0px", color: "#105f6d" }}>AUDIT LOG</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Track important actions across the system for accountability.
      </p>

      <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user or details..."
          style={{ padding: 10, width: 300, borderRadius: 8, border: "1px solid #ccc" }}
        />

        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          style={{ padding: 10, borderRadius: 8 }}
        >
          <option value="">All Actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div style={{ overflowX: "", background: "var(--card-bg)", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}>
        <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse" }}>
          <thead style={{ background: "#1976d2", color: "white" }}>
            <tr>
              <th style={{ textAlign: "center", padding: "5px" }}>Time</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonTableRows rows={8} columns={5} />
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: 30 }}>
                  No audit entries found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td >
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ textAlign: "center" }}>{log.user?.name || log.userName || "N/A"}</td>
                  <td style={{ textAlign: "center" }}>{log.userRole || "-"}</td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "16px",
                        color: "white",
                        background: actionColor(log.action),
                        fontSize: "12px",
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={pagination.totalPages} onChange={setPage} />

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "flex-end" }}>
        <LogoutButton />
      </div>
    </Layout>
  );
}

export default AuditLog;
