import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import socket from "../services/socket";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import PatientModal from "../components/PatientModal";

function ReceptionDashboard() {
  const [tab, setTab] = useState("queue"); // "queue" | "patients"

  // ================= QUEUE STATE =================
  const [queue, setQueue] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [loading, setLoading] = useState(true);

  // ================= PATIENTS STATE =================
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [openPatientModal, setOpenPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // ================= FETCH QUEUE =================

  const fetchQueue = async () => {
    try {
      const res = await api.get("/tokens/live");
      setQueue(res.data.queue);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  // ================= CANCEL TOKEN =================

  const cancelToken = async (id) => {
    if (!window.confirm("Cancel this token?")) return;

    try {
      await api.put(`/tokens/${id}/cancel`);
      toast.success("Token cancelled");
      fetchQueue();
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to cancel token");
    }
  };

  useEffect(() => {
    fetchQueue();

    socket.on("queueUpdated", fetchQueue);

    return () => socket.off("queueUpdated", fetchQueue);
  }, []);

  // ================= SEARCH + FILTER (QUEUE) =================

  const filteredQueue = queue.filter((item) => {
    const matchSearch = item.patient?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchDepartment =
      department === "All" || item.department === department;

    return matchSearch && matchDepartment;
  });

  // ================= SEARCH PATIENTS =================

  const fetchPatients = async () => {
    setPatientsLoading(true);
    try {
      const res = await api.get("/reception/patients", {
        params: { search: patientSearch },
      });
      setPatients(res.data.patients);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load patients");
    } finally {
      setPatientsLoading(false);
    }
  };

  useEffect(() => {
    if (tab !== "patients") return;

    const t = setTimeout(() => {
      fetchPatients();
    }, 350);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientSearch, tab]);

  return (
    <Layout>
      <h2 style={{ marginTop: "-15px",color: "#1b7f91" }}>RECEPTION DASHBOARD</h2>

      <p style={{ color: "#197f91", marginBottom: "20px" }}>
        Manage hospital queue and patients efficiently.
      </p>

      {/* ================= TABS ================= */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "25px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <button
          onClick={() => setTab("queue")}
          style={tabStyle(tab === "queue")}
        >
        Live Queue
        </button>

        <button
          onClick={() => setTab("patients")}
          style={tabStyle(tab === "patients")}
        >
          Patients
        </button>
      </div>

      {/* ================= QUEUE TAB ================= */}

      {tab === "queue" && (
        <>
          {loading && <h2>Loading Reception Dashboard...</h2>}

          {!loading && queue.length === 0 && <h2>No Patients In Queue</h2>}

          {!loading && queue.length > 0 && (
            <>
              {/* ================= SEARCH ================= */}

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  flexWrap: "wrap",
                  marginBottom: "25px",
                }}
              >
                <input
                  type="text"
                  placeholder="Search Patient..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: "10px", width: "250px" }}
                />

                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{ padding: "10px" }}
                >
                  <option>All</option>
                             <option>General Medicine</option>
    <option>Cardiology</option>
    <option>Neurology</option>
    <option>Orthopedics</option>
    <option>Dermatology</option>
    <option>Pediatrics</option>
    <option>Gynecology</option>
    <option>ENT</option>
    <option>Ophthalmology</option>
    <option>Dentistry</option>
    <option>Pulmonology</option>
    <option>Nephrology</option>
    <option>Urology</option>
    <option>General Surgery</option>
    <option>Psychiatry</option>

                </select>
              </div>

              {/* ================= STATS ================= */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                  gap: "20px",
                  marginBottom: "30px",
                }}
              >
                <div className="card">
                  <h3>Total Queue</h3>
                  <h2>{queue.length}</h2>
                </div>

                <div className="card">
                  <h3>Waiting</h3>
                  <h2>{queue.filter((q) => q.status === "waiting").length}</h2>
                </div>

                <div className="card">
                  <h3>Emergency</h3>
                  <h2>
                    {queue.filter((q) => q.priority === "emergency").length}
                  </h2>
                </div>

                <div className="card">
                  <h3>In Progress</h3>
                  <h2>
                    {queue.filter((q) => q.status === "in-progress").length}
                  </h2>
                </div>
              </div>

              {/* ================= TABLE ================= */}

              <div style={{ overflowX: "auto" }}>
                <table
                  width="100%"
                  border="1"
                  cellPadding="10"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead style={{ background: "#1976d2", color: "white" }}>
                    <tr>
                      <th>Token</th>
                      <th>Patient</th>
                      <th>Department</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredQueue.map((item) => (
                      <tr
                        key={item._id}
                        style={{
                          background:
                            item.priority === "emergency"
                              ? "#ffebee"
                              : "white",
                        }}
                      >
                        <td style={{ textAlign: "center" }}>{item.tokenNumber}</td>

                        <td style={{ textAlign: "center" }}>{item.patient?.name}</td>

                        <td style={{ textAlign: "center" }}>{item.department}</td>

                        <td style={{ textAlign: "center" }}>
                          {item.priority === "emergency"
                            ? " Emergency"
                            : " Normal"}
                        </td>

                        <td style={{ textAlign: "center" }}>
                          <span
                            style={{
                              padding: "5px 12px",
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
                            onClick={() => cancelToken(item._id)}
                            disabled={
                              item.status === "completed" ||
                              item.status === "cancelled"
                            }
                            style={{
                              background:
                                item.status === "completed" ||
                                item.status === "cancelled"
                                  ? "#bbb"
                                  : "#d32f2f",
                              color: "white",
                              border: "none",
                              padding: "8px 15px",
                              borderRadius: "5px",
                              cursor:
                                item.status === "completed" ||
                                item.status === "cancelled"
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* ================= PATIENTS TAB ================= */}

      {tab === "patients" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "25px",
            }}
          >
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              style={{
                padding: "10px",
                width: "320px",
                maxWidth: "100%",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />

            <button
              onClick={() => {
                setEditingPatient(null);
                setOpenPatientModal(true);
              }}
              style={{
                padding: "10px 18px",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              + Register Walk-in Patient
            </button>
          </div>

          <div
            style={{
              overflowX: "auto",
              background: "var(--card-bg)",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,.08)",
            }}
          >
            <table
              width="100%"
              cellPadding="12"
              style={{ borderCollapse: "collapse" }}
            >
              <thead style={{ background: "#1976d2", color: "#fff" }}>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Age</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {patientsLoading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: 30 }}>
                      Loading patients...
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: 30 }}>
                      🔍 No patients found.
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ textAlign: "center" }}>{p.name}</td>
                      <td style={{ textAlign: "center" }}>{p.email}</td>
                      <td style={{ textAlign: "center" }}>{p.phone}</td>
                      <td style={{ textAlign: "center" }}>{p.age || "-"}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => {
                            setEditingPatient(p);
                            setOpenPatientModal(true);
                          }}
                          style={{
                            padding: "3px 12px",
                            background: "#580808",
                            color: "#fff",
                            border: "none",
                            borderRadius: "20px",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PatientModal
            open={openPatientModal}
            onClose={() => setOpenPatientModal(false)}
            editingPatient={editingPatient}
            refreshPatients={fetchPatients}
          />
        </>
      )}

      {/* ================= LOGOUT ================= */}

      <div
        style={{
          marginTop: "50px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <LogoutButton />
      </div>
    </Layout>
  );
}

const tabStyle = (active) => ({
  padding: "12px 20px",
  border: "none",
  background: "transparent",
  borderBottom: active ? "3px solid #1976d2" : "3px solid transparent",
  color: active ? "#1976d2" : "#666",
  fontWeight: active ? "600" : "400",
  cursor: "pointer",
  fontSize: "15px",
});

export default ReceptionDashboard;
