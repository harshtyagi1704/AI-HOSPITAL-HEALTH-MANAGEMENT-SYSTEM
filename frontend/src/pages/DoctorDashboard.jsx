import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import PatientDetailsModal from "../components/PatientDetailsModal";
import ConsultationModal from "../components/ConsultationModal";
import { SkeletonCard } from "../components/Skeleton";

function DoctorDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState({
    todaysPatients: 0,
    completed: 0,
    averageTime: 0,
    pending: 0,
  });

  const [viewPatientId, setViewPatientId] = useState(null);
  const [consultationToken, setConsultationToken] = useState(null);

  // ================= FETCH QUEUE =================
  const fetchQueue = async () => {
    try {
      const res = await api.get("/tokens/doctor");
      setQueue(res.data.queue);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH DOCTOR ANALYTICS (34.6) =================
  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/consultations/analytics");
      setAnalytics(res.data.analytics);
    } catch (err) {
      console.log(err);
    }
  };

  const refreshAll = () => {
    fetchQueue();
    fetchAnalytics();
  };

  // ================= CALL PATIENT =================
  const callPatient = async (id) => {
    try {
      await api.put(`/tokens/${id}/call`);
      refreshAll();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    refreshAll();

    socket.on("queueUpdated", refreshAll);

    return () => {
      socket.off("queueUpdated", refreshAll);
    };
  }, []);

  const nextPatient = queue.find((patient) => patient.status === "waiting");

  return (
    <Layout>
      <h2 style={{ marginTop: "-15px", color: "#105f6d" }}>DOCTOR DASHBOARD</h2>

      <p style={{ color: "#666", marginBottom: "20px" }}>
        Manage today's patient queue and consultations.
      </p>

      {/* ================= 34.6 DOCTOR ANALYTICS ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div className="card">
          <h3>Today's Patients</h3>
          <h2>{analytics.todaysPatients}</h2>
        </div>

        <div className="card">
          <h3>Completed</h3>
          <h2 style={{ color: "#105f6d" }}>{analytics.completed}</h2>
        </div>

        <div className="card">
          <h3>Average Time</h3>
          <h2>{analytics.averageTime} min</h2>
        </div>

        <div className="card">
          <h3>Pending</h3>
          <h2 style={{ color: "#105f6d" }}>{analytics.pending}</h2>
        </div>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
        <Link to="/doctor/appointments">
          <button
            style={{
              background: "white",
              border: "1px solid #1976d2",
              color: "#1976d2",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            My Appointments
          </button>
        </Link>

        <Link to="/doctor/availability">
          <button
            style={{
              background: "white",
              border: "1px solid #1976d2",
              color: "#1976d2",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Set Availability
          </button>
        </Link>
      </div>

      {/* ================= LOADING ================= */}

      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "20px" }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* ================= EMPTY ================= */}

      {!loading && queue.length === 0 && <h2>No Patients In Queue</h2>}

      {!loading && queue.length > 0 && (
        <>
          {/* ================= CALL NEXT ================= */}

          <button
            disabled={!nextPatient}
            onClick={() => callPatient(nextPatient?._id)}
            style={{
              background: "#1976d2",
              color: "white",
              border: "none",
              padding: "12px 25px",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "30px",
            }}
          >
            ▶ Call Next Patient
          </button>

          {/* ================= TABLE ================= */}

      <div style={{ overflowX: "", background: "var(--card-bg)", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}>
        <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse" }}>
          <thead style={{ background: "#2e915b", color: "white" }}>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {queue.map((item) => (
                  <tr
                    key={item._id}
                    style={{
                      background:
                        item.priority === "emergency"
                          ? "#ffebee"
                          : item._id === nextPatient?._id
                          ? "#e3f2fd"
                          : "white",
                      fontWeight: item._id === nextPatient?._id ? "bold" : "normal",
                    }}
                  >
                    <td style={{ textAlign: "center" }}>{item.tokenNumber}</td>

                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => setViewPatientId(item.patient?._id)}
                        style={{
                          border: "none",
                          background: "none",
                          color: "#1976d2",
                          textDecoration: "underline",
                          cursor: "pointer",
                          padding: 0,
                          font: "inherit",
                        }}
                      >
                        {item.patient?.name}
                      </button>
                    </td>

                    <td style={{ textAlign: "center" }}>{item.department}</td>

                    <td style={{ textAlign: "center" }}>
                      {item.priority === "emergency" && "Emergency"}
                      {item.priority === "senior" && "Senior Citizen"}
                      {item.priority === "child" && "Child"}
                      {item.priority === "normal" && "Normal"}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          padding: "0px 12px",
                          borderRadius: "20px",
                          color: "white",
                          background:
                            item.status === "waiting"
                              ? "#f57c00"
                              : item.status === "in-progress"
                              ? "#1976d2"
                              : "#2e7d32",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => callPatient(item._id)}
                        disabled={item.status !== "waiting"}
                        style={{
                          background: "#0f345a",
                          color: "white",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: "20px",
                          marginRight: "8px",
                          marginBottom: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Call
                      </button>

                      <button
                        onClick={() => setConsultationToken(item)}
                        disabled={item.status !== "in-progress"}
                        style={{
                          background: "#912f17",
                          color: "white",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: "20px",
                          marginRight: "8px",
                          marginBottom: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Consult & Complete
                      </button>

                      <Link to={`/doctor/history/${item.patient?._id}`}>
                        <button
                          style={{
                            background: "white",
                            color: "#1976d2",
                            border: "1px solid #1976d2",
                            padding: "5px 12px",
                            borderRadius: "20px",
                            cursor: "pointer",
                          }}
                        >
                          History
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ================= POPUPS ================= */}

      {viewPatientId && (
        <PatientDetailsModal
          patientId={viewPatientId}
          onClose={() => setViewPatientId(null)}
        />
      )}

      {consultationToken && (
        <ConsultationModal
          tokenItem={consultationToken}
          onClose={() => setConsultationToken(null)}
          onSaved={refreshAll}
        />
      )}

      {/* ================= LOGOUT ================= */}

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "flex-end" }}>
        <LogoutButton />
      </div>
    </Layout>
  );
}

export default DoctorDashboard;
