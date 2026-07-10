import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import api from "../services/api";

const statusColor = {
  pending: "#f57c00",
  confirmed: "#1976d2",
  completed: "#2e7d32",
  cancelled: "#9e9e9e",
};

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/my");
      setAppointments(res.data.appointments);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel");
    }
  };

  return (
    <Layout>
      <h2 style={{ marginTop: "-15px",color: "#236e8b" }}>MY APPOINTMENT</h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Track your upcoming and past appointments.
      </p>

      {loading && <h2>Loading...</h2>}

      {!loading && appointments.length === 0 && (
        <h2 style={{ color: "#888" }}>No appointments booked yet.</h2>
      )}

      {!loading && appointments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {appointments.map((a) => (
            <div key={a._id} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 6px" }}>
                    Dr. {a.doctor?.name} — {a.department}
                  </h3>
                  <p style={{ margin: "2px 0" }}>
                    📆 {a.appointmentDate} &nbsp; 🕐 {a.timeSlot}
                  </p>
                  {a.reason && <p style={{ margin: "2px 0" }}>📝 {a.reason}</p>}
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      color: "white",
                      background: statusColor[a.status] || "#666",
                      display: "inline-block",
                      marginBottom: "8px",
                    }}
                  >
                    {a.status}
                  </span>

                  {(a.status === "pending" || a.status === "confirmed") && (
                    <div>
                      <button
                        onClick={() => handleCancel(a._id)}
                        style={{
                          border: "1px solid #e53935",
                          background: "white",
                          color: "#e53935",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "flex-end" }}>
        <LogoutButton />
      </div>
    </Layout>
  );
}

export default MyAppointments;
