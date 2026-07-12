import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import api from "../services/api";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function DoctorAvailability() {
  const [availability, setAvailability] = useState(
    DAYS.map((day) => ({
      day,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: false,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get("/appointments/availability");
        const saved = res.data.availability;

        if (saved && saved.length > 0) {
          setAvailability(
            DAYS.map((day) => {
              const found = saved.find((s) => s.day === day);
              return (
                found || {
                  day,
                  startTime: "09:00",
                  endTime: "17:00",
                  isAvailable: false,
                }
              );
            })
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const updateDay = (day, field, value) => {
    setAvailability((prev) =>
      prev.map((d) => (d.day === day ? { ...d, [field]: value } : d))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/appointments/availability", { availability });
      toast.success("Availability updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  };

  return (
    <Layout>
      <h2 style={{ color: "#0f7291",marginTop: "-15px" }}>SET TIME SLOT</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Toggle the days you're available and set your working hours.
      </p>

      {loading ? (
        <h2>Loading...</h2>
      ) : (
        <div className="card" style={{ maxWidth: "700px" }}>
          {availability.map((d) => (
            <div
              key={d.day}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "10px 0",
                borderBottom: "1px solid #f0f0f0",
                flexWrap: "wrap",
              }}
            >
              <label style={{ width: "120px", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={d.isAvailable}
                  onChange={(e) =>
                    updateDay(d.day, "isAvailable", e.target.checked)
                  }
                />
                {d.day}
              </label>

              <input
                type="time"
                style={inputStyle}
                value={d.startTime}
                disabled={!d.isAvailable}
                onChange={(e) => updateDay(d.day, "startTime", e.target.value)}
              />

              <span>to</span>

              <input
                type="time"
                style={inputStyle}
                value={d.endTime}
                disabled={!d.isAvailable}
                onChange={(e) => updateDay(d.day, "endTime", e.target.value)}
              />
            </div>
          ))}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              marginTop: "20px",
              background: "#1976d2",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Availability"}
          </button>
        </div>
      )}

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "flex-end" }}>
        <LogoutButton />
      </div>
    </Layout>
  );
}

export default DoctorAvailability;
