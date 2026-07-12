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

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/calendar");
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

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    }
  };

  // Group by date for a simple calendar-style list view
  const grouped = appointments.reduce((acc, a) => {
    acc[a.appointmentDate] = acc[a.appointmentDate] || [];
    acc[a.appointmentDate].push(a);
    return acc;
  }, {});

  return (
    <Layout>
      <h2 style={{ color: "#0f7291",marginTop: "-15px" }}>APPOINTMENT CALENDER</h2>
      <p style={{ color: "#666", marginBottom: "15px" }}>
        Review and manage patient appointment requests.
      </p>

      {loading && <h2>Loading...</h2>}

      {!loading && appointments.length === 0 && (
        <h2 style={{ color: "#666" }}>No appointments scheduled.</h2>
      )}

      {!loading &&
        Object.keys(grouped)
          .sort()
          .map((date) => (
            <div key={date} style={{ marginBottom: "26px" }}>
              <h3 style={{ color: "#1976d2", borderBottom: "2px solid #e3f2fd", paddingBottom: "6px" }}>
                📆 {date}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                {grouped[date]
                  .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                  .map((a) => (
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
                            🕐 {a.timeSlot} — {a.patient?.name}
                          </h3>
                          <p style={{ margin: "2px 0" }}>📞 {a.patient?.phone}</p>
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

                          <div style={{ display: "flex", gap: "8px" }}>
                            {a.status === "pending" && (
                              <button
                                onClick={() => updateStatus(a._id, "confirmed")}
                                style={{
                                  border: "none",
                                  background: "#1976d2",
                                  color: "white",
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                              >
                                Confirm
                              </button>
                            )}

                            {(a.status === "pending" || a.status === "confirmed") && (
                              <button
                                onClick={() => updateStatus(a._id, "completed")}
                                style={{
                                  border: "none",
                                  background: "#2e7d32",
                                  color: "white",
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                              >
                                Complete
                              </button>
                            )}

                            {(a.status === "pending" || a.status === "confirmed") && (
                              <button
                                onClick={() => updateStatus(a._id, "cancelled")}
                                style={{
                                  border: "1px solid #e53935",
                                  background: "white",
                                  color: "#e53935",
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "flex-end" }}>
        <LogoutButton />
      </div>
    </Layout>
  );
}

export default DoctorAppointments;
