import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <Layout>

      <h2 style={{ marginTop: "0px", color: "#105f6d" }}>ADMIN DASHBOARD </h2>

      <p>
        Welcome Administrator.
      </p>

      <div
        style={{
          marginTop: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "25px"
        }}
      >

        {/* Manage Users */}
        <Link
          to="/admin/users"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="card" style={{ cursor: "pointer" }}>
            <h2>Users</h2>
            <p>Manage All Hospital Users</p>
          </div>
        </Link>

{/* Doctors */}
<Link
  to="/admin/users"
  state={{ role: "doctor" }}
  style={{ textDecoration: "none", color: "inherit" }}
>
  <div className="card" style={{ cursor: "pointer" }}>
    <h2>Doctors</h2>
    <p>Edit and Manage Doctors Staff</p>
  </div>
</Link>

{/* Reception */}
<Link
  to="/admin/users"
  state={{ role: "reception" }}
  style={{ textDecoration: "none", color: "inherit" }}
>
  <div className="card" style={{ cursor: "pointer" }}>
    <h2>Reception</h2>
    <p>Manage Reception Staff</p>
  </div>
</Link>

{/* Patients */}
<Link
  to="/admin/users"
  state={{ role: "patient" }}
  style={{ textDecoration: "none", color: "inherit" }}
>
  <div className="card" style={{ cursor: "pointer" }}>
    <h2>Patients</h2>
    <p>View Registered Patients</p>
  </div>
</Link>

        {/* Analytics */}
        <Link
          to="/admin/analytics"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="card" style={{ cursor: "pointer" }}>
            <h2>Analytics</h2>
            <p>Daily/Monthly Trends, Departments & Doctor Performance</p>
          </div>
        </Link>

        {/* Phase 40 - Billing */}
        <Link
          to="/admin/billing"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="card" style={{ cursor: "pointer" }}>
            <h2>Billing & Revenue</h2>
            <p>Invoices, Payments & Revenue Tracking</p>
          </div>
        </Link>

        {/* Phase 42 - Audit Log */}
        <Link
          to="/admin/audit-log"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="card" style={{ cursor: "pointer" }}>
            <h2>Audit Log</h2>
            <p>Track important actions across the system</p>
          </div>
        </Link>

      </div>

      {/* Logout */}

      <div
        style={{
          marginTop: "50px",
          display: "flex",
          justifyContent: "flex-end"
        }}
      >
        <LogoutButton />
      </div>

    </Layout>
  );
}

export default AdminDashboard;