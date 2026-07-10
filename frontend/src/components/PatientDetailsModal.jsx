import { useEffect, useState } from "react";
import api from "../services/api";
import Modal from "./Modal";

function PatientDetailsModal({ patientId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/consultations/patient/${patientId}`);
        setData(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [patientId]);

  return (
    <Modal title="🧑 Patient Details" onClose={onClose}>
      {loading && <p>Loading patient details...</p>}

      {!loading && data && (
        <>
          <div style={{ marginBottom: "18px" }}>
            <h3 style={{ margin: "0 0 6px" }}>{data.patient?.name}</h3>
            <p style={{ margin: "2px 0", color: "#555" }}>
              📧 {data.patient?.email}
            </p>
            <p style={{ margin: "2px 0", color: "#555" }}>
              📞 {data.patient?.phone}
            </p>
            {data.patient?.age && (
              <p style={{ margin: "2px 0", color: "#555" }}>
                🎂 Age: {data.patient.age}
              </p>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                background: "#f5f7fb",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <strong>Total Visits</strong>
              <h2 style={{ margin: "4px 0 0", color: "#1976d2" }}>
                {data.totalVisits}
              </h2>
            </div>

            <div
              style={{
                background: "#f5f7fb",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <strong>Current Token</strong>
              <h2 style={{ margin: "4px 0 0", color: "#1976d2" }}>
                {data.activeToken ? `#${data.activeToken.tokenNumber}` : "—"}
              </h2>
            </div>
          </div>

          <h3 style={{ marginBottom: "8px" }}>🕐 Last Visit</h3>

          {!data.lastConsultation && (
            <p style={{ color: "#888" }}>No previous consultations found.</p>
          )}

          {data.lastConsultation && (
            <div
              style={{
                border: "1px solid #eee",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <p style={{ margin: "4px 0" }}>
                <strong>Date:</strong>{" "}
                {new Date(data.lastConsultation.visitDate).toLocaleDateString()}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Doctor:</strong> {data.lastConsultation.doctor?.name}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Diagnosis:</strong> {data.lastConsultation.diagnosis}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Prescription:</strong>{" "}
                {data.lastConsultation.prescription || "—"}
              </p>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

export default PatientDetailsModal;
