import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import Pagination from "../components/Pagination";
import DashboardCard from "../components/DashboardCard";
import { SkeletonTableRows } from "../components/Skeleton";
import api from "../services/api";

const statusColor = {
  pending: "#f57c00",
  paid: "#2e7d32",
  cancelled: "#9e9e9e",
};

function AdminBilling() {
  const [invoices, setInvoices] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/billing", {
        params: { page, limit: 10, status: status || undefined },
      });
      setInvoices(res.data.invoices);
      setRevenue(res.data.totalRevenue);
      setPagination(res.data.pagination);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  return (
    <Layout>
      <h2 style={{ marginTop: "0px", color: "#105f6d" }}>BILLING & REVENUE</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Track all invoices generated across the hospital.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          
          marginBottom: "30px",
        }}
      >
        <DashboardCard title="Total Revenue (Paid)" value={`₹${revenue}`} color="#2e7d32" />
        <DashboardCard title="Total Invoices" value={pagination.total || 0} color="#2e7d32" />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          style={{ padding: "10px", borderRadius: "8px" }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div style={{ overflowX: "", background: "var(--card-bg)", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}>
        <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse" }}>
          <thead style={{ background: "#105c32", color: "white" }}>
            <tr>
 <th style={{ textAlign: "center", padding: "5px" }}>Invoice #</th>
    <th style={{ textAlign: "center", padding: "5px" }}>Patient</th>
    <th style={{ textAlign: "center", padding: "5px" }}>Doctor</th>
    <th style={{ textAlign: "center", padding: "5px" }}>Total</th>
    <th style={{ textAlign: "center", padding: "5px" }}>Status</th>
    <th style={{ textAlign: "center", padding: "5px" }}>Date</th>
    <th style={{ textAlign: "center", padding: "5px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonTableRows rows={6} columns={7} />
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 30 }}>
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center" }}>{inv.invoiceNumber}</td>
                  <td style={{ textAlign: "center" }}>{inv.patient?.name}</td>
                  <td style={{ textAlign: "center" }}>{inv.doctor?.name || "—"}</td>
                  <td style={{ textAlign: "center" }}>₹{inv.total}</td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        padding: "0px 10px",
                        borderRadius: "20px",
                        color: "white",
                        background: statusColor[inv.status] || "#666",
                      }}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: "center" }}>
                    <Link to={`/billing/invoice/${inv._id}`} style={{ color: "#1976d2" }}>
                      View
                    </Link>
                  </td>
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

export default AdminBilling;
