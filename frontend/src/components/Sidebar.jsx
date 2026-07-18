import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";

const API_ORIGIN = "https://hospital-backend-9e41.onrender.com";

function Sidebar({ open, onClose }) {

  const user = JSON.parse(sessionStorage.getItem("user"));

  return (

    <div
      className={`app-sidebar${open ? " open" : ""}`}
      style={{
        width: "260px",
        background: "#1a5f6be5",
        color: "#fafafa",
        minHeight: "100vh",
        padding: "12px",
        position: "fixed",
        left: 0,
        top: 0,
        overflowY: "auto"
      }}
    >

      <h2 style={{ color: "#dbe1e7" }}>HOSPITAL SERVICES</h2>

      <hr />

      <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0" }}>
        {user?.avatar ? (
          <img
            src={`${API_ORIGIN}${user.avatar}`}
            alt="avatar"
            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <FaUserCircle size={40} />
        )}

        <p style={{ margin: 0 }}>
        Welcome
          <br />
          <strong>{user?.name}</strong>
        </p>
      </div>

      {/* PATIENT */}

      {user?.role === "patient" && (
        <>
          <Link style={linkStyle} to="/patient" onClick={onClose}>Dashboard</Link>
          <Link style={linkStyle} to="/book-token" onClick={onClose}>Book Token</Link>
          <Link style={linkStyle} to="/queue" onClick={onClose}>Live Queue</Link>
          <Link style={linkStyle} to="/symptom-checker" onClick={onClose}>Symptom Checker</Link>
          <Link style={linkStyle} to="/patient/history" onClick={onClose}>Medical History</Link>
          <Link style={linkStyle} to="/appointments/book" onClick={onClose}>Book Appointment</Link>
          <Link style={linkStyle} to="/appointments/my" onClick={onClose}>My Appointments</Link>
          <Link style={linkStyle} to="/reports" onClick={onClose}>Medical Reports</Link>
          <Link style={linkStyle} to="/billing/invoices" onClick={onClose}>My Invoices</Link>
        </>
      )}

      {/* DOCTOR */}

      {user?.role === "doctor" && (
        <>
          <Link style={linkStyle} to="/doctor" onClick={onClose}>Dashboard</Link>
          <Link style={linkStyle} to="/doctor/appointments" onClick={onClose}>Appointments</Link>
          <Link style={linkStyle} to="/doctor/availability" onClick={onClose}>Time Slot</Link>
        </>
      )}

      {/* RECEPTIONIST */}

      {user?.role === "reception" && (
        <>
          <Link style={linkStyle} to="/reception" onClick={onClose}>Dashboard</Link>
        </>
      )}

      {/* ADMIN */}

      {user?.role === "admin" && (
        <>
          <Link style={linkStyle} to="/admin" onClick={onClose}>Dashboard</Link>
          <Link style={linkStyle} to="/admin/analytics" onClick={onClose}>Analytics</Link>
          <Link style={linkStyle} to="/admin/billing" onClick={onClose}>Billing & Revenue</Link>
          <Link style={linkStyle} to="/admin/audit-log" onClick={onClose}>Audit Log</Link>
        </>
      )}

      {/* ALL ROLES */}

      <hr />
      <Link style={linkStyle} to="/profile" onClick={onClose}>My Profile</Link>

      <ThemeToggle />

      <div style={{ marginTop: "20px" }}>
        <LogoutButton />
      </div>

    </div>

  );
}

const linkStyle = {
  display: "block",
  color: "white",
  textDecoration: "none",
  padding: "10px 0"
};

export default Sidebar;
