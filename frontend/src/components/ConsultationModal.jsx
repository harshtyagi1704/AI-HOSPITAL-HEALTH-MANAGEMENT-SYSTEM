import { useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import Modal from "./Modal";

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  marginTop: "6px",
  marginBottom: "14px",
  fontFamily: "inherit",
};

function ConsultationModal({ tokenItem, onClose, onSaved }) {
  const [form, setForm] = useState({
    diagnosis: "",
    prescription: "",
    doctorNotes: "",
    bloodPressure: "",
    temperature: "",
    consultationFee: 500,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.diagnosis.trim()) {
      toast.error("Diagnosis is required");
      return;
    }

    setSaving(true);

    try {
      await api.post("/consultations", {
        tokenId: tokenItem._id,
        patientId: tokenItem.patient?._id,
        department: tokenItem.department,
        ...form,
      });

      toast.success("Consultation saved & invoice generated ✅");
      onSaved?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save consultation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`📝 Consultation — ${tokenItem.patient?.name || "Patient"}`}
      onClose={onClose}
      width="560px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
          <div>
            <label>Blood Pressure</label>
            <input
              style={inputStyle}
              name="bloodPressure"
              placeholder="e.g. 120/80 mmHg"
              value={form.bloodPressure}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Temperature</label>
            <input
              style={inputStyle}
              name="temperature"
              placeholder="e.g. 98.6 °F"
              value={form.temperature}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Consultation Fee (₹)</label>
            <input
              style={inputStyle}
              type="number"
              min="0"
              name="consultationFee"
              value={form.consultationFee}
              onChange={handleChange}
            />
          </div>
        </div>

        <label>Diagnosis *</label>
        <textarea
          style={{ ...inputStyle, minHeight: "70px" }}
          name="diagnosis"
          placeholder="Enter diagnosis"
          value={form.diagnosis}
          onChange={handleChange}
          required
        />

        <label>Prescription</label>
        <textarea
          style={{ ...inputStyle, minHeight: "70px" }}
          name="prescription"
          placeholder="Medicines, dosage, instructions"
          value={form.prescription}
          onChange={handleChange}
        />

        <label>Doctor Notes</label>
        <textarea
          style={{ ...inputStyle, minHeight: "70px" }}
          name="doctorNotes"
          placeholder="Additional notes"
          value={form.doctorNotes}
          onChange={handleChange}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#1976d2",
              color: "white",
              cursor: "pointer",
            }}
          >
            {saving ? "Saving..." : "Save & Complete"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ConsultationModal;
