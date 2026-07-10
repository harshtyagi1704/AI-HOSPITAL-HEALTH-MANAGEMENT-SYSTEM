import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import api from "../services/api";

function MedicalHistory() {
  const { patientId } = useParams(); // present only when a doctor views a patient's history
  const [history, setHistory] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (patientId) {
          const [historyRes, detailsRes] = await Promise.all([
            api.get(`/consultations/history/${patientId}`),
            api.get(`/consultations/patient/${patientId}`),
          ]);
          setHistory(historyRes.data.history);
          setPatientName(detailsRes.data.patient?.name || "");
        } else {
          const res = await api.get("/consultations/my-history");
          setHistory(res.data.history);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patientId]);

  return (
    <Layout>
      <h2 style={{ color: "#296994",marginTop: "-15px" }}> MEDICAL HISTORY</h2>

      <p style={{ color: "#666", marginBottom: "30px" }}>
        {patientId
          ? `Complete visit history for ${patientName || "this patient"}.`
          : "Your complete visit history, diagnoses and prescriptions."}
      </p>

      {loading && <h2>Loading history...</h2>}

      {!loading && history.length === 0 && (
        <h2 style={{ color: "#888" }}>No visits recorded yet.</h2>
      )}

      {!loading && history.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {history.map((visit, index) => (
            <div
              key={visit._id}
              className="card"
              style={{ borderLeft: "5px solid #1976d2" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ margin: 0 }}>
                  Visit {history.length - index}
                </h3>
                <span style={{ color: "#666" }}>
                  {new Date(visit.visitDate).toLocaleDateString()}
                </span>
              </div>

              <p style={{ margin: "6px 0" }}>
                <strong>Diagnosis:</strong> {visit.diagnosis}
              </p>

              <p style={{ margin: "6px 0" }}>
                <strong>Prescription:</strong> {visit.prescription || "—"}
              </p>

              {visit.doctorNotes && (
                <p style={{ margin: "6px 0" }}>
                  <strong>Doctor Notes:</strong> {visit.doctorNotes}
                </p>
              )}

              <div style={{ display: "flex", gap: "20px", marginTop: "8px", color: "#666" }}>
                {visit.bloodPressure && <span>🩺 BP: {visit.bloodPressure}</span>}
                {visit.temperature && <span>🌡️ Temp: {visit.temperature}</span>}
              </div>

              <p style={{ margin: "10px 0 0", color: "#1976d2" }}>
                <strong>Doctor:</strong> {visit.doctor?.name}{" "}
                {visit.doctor?.department && `(${visit.doctor.department})`}
              </p>
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

export default MedicalHistory;
