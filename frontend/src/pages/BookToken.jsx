import { toast } from "react-toastify";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";

function BookToken() {

  const location = useLocation();

  const [department, setDepartment] = useState(
    location.state?.department || ""
  );
  const [priority, setPriority] = useState("normal");

  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // AI Prediction
  const [prediction, setPrediction] = useState(null);

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginBottom: "16px",
  };

  // Fetch AI Prediction
  const fetchPrediction = async (tokenId) => {
    try {

      const response = await api.get(`/tokens/prediction/${tokenId}`);

      setPrediction(response.data);

    } catch (error) {

      console.error(error);

    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setSubmitting(true);

    try {

      const response = await api.post("/tokens/book", {
        department,
        priority,
      });

      toast.success("Token Booked Successfully");

      setToken(response.data.token);

      // Fetch AI Prediction
      fetchPrediction(response.data.token._id);

      setDepartment("");
      setPriority("normal");

    } catch (error) {

      toast.error(
        error.response?.data?.message || "Booking Failed"
      );

    } finally {

      setSubmitting(false);

    }

  };

  return (
    <Layout>

      <h2 style={{ marginTop: "-15px",color: "#1b638d" }}>BOOK TOKEN</h2>

      <p style={{ color: "#666", marginBottom: "20px" }}>
        Choose a department and priority to get your queue token instantly.
      </p>

      <div className="card" style={{ cursor: "default", maxWidth: "480px" }}>

        <form onSubmit={handleSubmit}>

          <label>Department</label>

          <select
            style={inputStyle}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          >
            <option value="">Select Department</option>
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

          <label>Priority</label>

          <select
            style={inputStyle}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="normal">Normal</option>
            <option value="child">Child (0-12 yrs)</option>
            <option value="senior">Senior Citizen (60+ yrs)</option>
            <option value="emergency">Emergency</option>
          </select>

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: "#1976d2",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            {submitting ? "Booking..." : "🎫 Book Token"}
          </button>

        </form>

      </div>

      {message && <h3 style={{ marginTop: "20px" }}>{message}</h3>}

      {token && (

        <div
          className="card"
          style={{
            cursor: "default",
            maxWidth: "480px",
            marginTop: "20px",
            borderLeft: "5px solid #1976d2",
            textAlign: "left",
          }}
        >

          <h2 style={{ marginTop: 0, color: "#1976d2" }}>🎫 Your Token</h2>

          <p style={{ margin: "6px 0" }}>
            <strong>Token Number:</strong> #{token.tokenNumber}
          </p>

          <p style={{ margin: "6px 0" }}>
            <strong>Department:</strong> {token.department}
          </p>

          <p style={{ margin: "6px 0" }}>
            <strong>Status:</strong> {token.status}
          </p>

          <p style={{ margin: "6px 0" }}>
            <strong>Priority:</strong> {token.priority}
          </p>

        </div>

      )}

      {prediction && (

        <div
          className="card"
          style={{
            cursor: "default",
            maxWidth: "480px",
            marginTop: "20px",
            borderLeft: "5px solid #2e7d32",
            textAlign: "left",
          }}
        >

          <h2 style={{ marginTop: 0, color: "#2e7d32" }}>🤖 AI Waiting Time Prediction</h2>

          <p style={{ margin: "6px 0" }}>
            <strong>People Ahead:</strong>
            {" "}
            {prediction.patientsAhead}
          </p>

          <p style={{ margin: "6px 0" }}>
            <strong>Estimated Waiting Time:</strong>
            {" "}
            {prediction.estimatedMinutes} minutes
          </p>

        </div>

      )}

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "flex-end" }}>
        <LogoutButton />
      </div>

    </Layout>
  );
}

export default BookToken;