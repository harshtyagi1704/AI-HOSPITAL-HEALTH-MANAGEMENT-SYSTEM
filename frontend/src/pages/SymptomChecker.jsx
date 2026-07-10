import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import api from "../services/api";

const COMMON_SYMPTOMS = [
  "Fever",
  "Headache",
  "Vomiting",
  "Cough",
  "Cold",
  "Sore Throat",
  "Chest Pain",
  "Breathlessness",
  "Joint Pain",
  "Back Pain",
  "Rash",
  "Itching",
  "Abdominal Pain",
  "Diarrhea",
  "Dizziness",
];

function SymptomChecker() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (symptom) => {
    setSelected((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const addCustomSymptom = () => {
    const value = customSymptom.trim();
    if (value && !selected.includes(value)) {
      setSelected([...selected, value]);
      setCustomSymptom("");
    }
  };

  const handleCheck = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one symptom");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post("/ai/symptom-checker", {
        symptoms: selected,
      });
      setResult(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h2 style={{ marginTop: "-15px",color: "#276894" }}>SYMPTOM CHECKER</h2>

      <p style={{ color: "#666", marginBottom: "10px", maxWidth: "700px" }}>
        Select the symptoms you're experiencing. Our AI will suggest possible
        conditions, precautions, and the recommended department — this is not
        a substitute for a real diagnosis from a doctor.
      </p>

      <div className="card" style={{ marginBottom: "25px" }}>
        <h3 style={{ marginTop: "0PX" }}>Select Symptoms</h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          {COMMON_SYMPTOMS.map((symptom) => (
            <button
              key={symptom}
              onClick={() => toggleSymptom(symptom)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: selected.includes(symptom)
                  ? "2px solid #1976d2"
                  : "1px solid #ccc",
                background: selected.includes(symptom) ? "#e3f2fd" : "white",
                color: selected.includes(symptom) ? "#1976d2" : "#333",
                cursor: "pointer",
              }}
            >
              {symptom}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <input
            value={customSymptom}
            onChange={(e) => setCustomSymptom(e.target.value)}
            placeholder="Add another symptom..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
            onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
          />
          <button
            onClick={addCustomSymptom}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #1976d2",
              background: "white",
              color: "#1976d2",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>

        {selected.length > 0 && (
          <p style={{ color: "#555", marginBottom: "16px" }}>
            <strong>Selected:</strong> {selected.join(", ")}
          </p>
        )}

        <button
          onClick={handleCheck}
          disabled={loading}
          style={{
            background: "#6a1b9a",
            color: "white",
            border: "none",
            padding: "12px 26px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {loading ? "Analyzing..." : "🔍 Check Symptoms"}
        </button>
      </div>

      {result && (
        <div className="card" style={{ borderLeft: "5px solid #6a1b9a" }}>
          <h2 style={{ marginTop: 0 }}>🧠 AI Suggestions</h2>

          {(result.suggestions || []).map((s, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "18px",
                paddingBottom: "18px",
                borderBottom:
                  idx !== result.suggestions.length - 1 ? "1px solid #eee" : "none",
              }}
            >
              <h3 style={{ margin: "0 0 6px", color: "#1976d2" }}>
                {s.disease}
              </h3>

              <p style={{ margin: "4px 0" }}>
                <strong>Recommended Department:</strong> {s.department}
              </p>

              <p style={{ margin: "6px 0 4px" }}>
                <strong>Precautions:</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {s.precautions.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ))}

          <button
            onClick={() =>
              navigate("/book-token", {
                state: { department: result.recommendedDepartment },
              })
            }
            style={{
              background: "#1976d2",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            🎫 Book Token in {result.recommendedDepartment || "Suggested Department"}
          </button>
        </div>
      )}

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "flex-end" }}>
        <LogoutButton />
      </div>
    </Layout>
  );
}

export default SymptomChecker;
