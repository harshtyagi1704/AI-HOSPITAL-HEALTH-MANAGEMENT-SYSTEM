import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import Modal from "./Modal";

const empty = { name: "", email: "", phone: "", password: "", age: "" };

function PatientModal({ open, onClose, editingPatient, refreshPatients }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingPatient) {
      setForm({
        name: editingPatient.name || "",
        email: editingPatient.email || "",
        phone: editingPatient.phone || "",
        password: "",
        age: editingPatient.age ?? "",
      });
    } else {
      setForm(empty);
    }
  }, [editingPatient, open]);

  if (!open) return null;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || (!editingPatient && !form.password)) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);

    try {
      if (editingPatient) {
        await api.put(`/reception/patients/${editingPatient._id}`, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          age: form.age,
        });
        toast.success("Patient updated successfully");
      } else {
        await api.post("/reception/register", form);
        toast.success("Walk-in patient registered successfully");
      }

      await refreshPatients();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editingPatient ? "✏️ Edit Patient" : "🆕 Register Walk-in Patient"}
      onClose={onClose}
      width="480px"
    >
      <form onSubmit={submit}>
        <label style={labelStyle}>Full Name *</label>
        <input
          name="name"
          value={form.name}
          onChange={change}
          placeholder="Patient full name"
          style={inputStyle}
        />

        <label style={labelStyle}>Email *</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={change}
          placeholder="patient@example.com"
          style={inputStyle}
        />

        <label style={labelStyle}>Phone *</label>
        <input
          name="phone"
          value={form.phone}
          onChange={change}
          placeholder="Phone number"
          style={inputStyle}
        />

        <label style={labelStyle}>Age</label>
        <input
          type="number"
          name="age"
          min="0"
          value={form.age}
          onChange={change}
          placeholder="Age (optional)"
          style={inputStyle}
        />

        {!editingPatient && (
          <>
            <label style={labelStyle}>Password *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={change}
              placeholder="Temporary password"
              style={inputStyle}
            />
          </>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "18px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 18px",
              background: "#eee",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 18px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {saving ? "Saving..." : editingPatient ? "Update Patient" : "Register Patient"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "13px",
  color: "#666",
  marginTop: "10px",
  marginBottom: "4px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

export default PatientModal;
