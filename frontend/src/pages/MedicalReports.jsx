import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaFilePdf, FaFileImage, FaTrash } from "react-icons/fa";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import api from "../services/api";

const API_ORIGIN = "https://hospital-backend-9e41.onrender.com";

function MedicalReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("lab");

  const fetchReports = async () => {
    try {
      const res = await api.get("/reports/my");
      setReports(res.data.reports);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please choose a PDF or image file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    formData.append("reportType", reportType);

    setUploading(true);

    try {
      await api.post("/reports/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Report uploaded successfully");
      setFile(null);
      setTitle("");
      setReportType("lab");
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reports/${id}`);
      toast.success("Report deleted");
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginTop: "6px",
    marginBottom: "16px",
  };

  return (
    <Layout>
      <h2 style={{marginTop: "-15px", color: "#1e7691" }}>MEDICAL REPORTS</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Upload and manage your lab reports, scans, and prescriptions.
      </p>

      <div className="card" style={{ maxWidth: "560px", marginBottom: "30px" }}>
        <h3 style={{ marginTop: 0 }}>Upload a Report</h3>

        <form onSubmit={handleUpload}>
          <label>Title</label>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Blood Test - July 2026"
          />

          <label>Report Type</label>
          <select
            style={inputStyle}
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="lab">Lab Report</option>
            <option value="prescription">Prescription</option>
            <option value="scan">Scan / Imaging</option>
            <option value="other">Other</option>
          </select>

          <label>File (PDF or Image) *</label>
          <input
            style={inputStyle}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />

          <button
            type="submit"
            disabled={uploading}
            style={{
              background: "#1976d2",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {uploading ? "Uploading..." : "Upload Report"}
          </button>
        </form>
      </div>

      <h3>Your Reports</h3>

      {loading && <p>Loading...</p>}

      {!loading && reports.length === 0 && (
        <p style={{ color: "#888" }}>No reports uploaded yet.</p>
      )}

      {!loading && reports.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: "16px",
          }}
        >
          {reports.map((r) => (
            <div key={r._id} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                {r.fileType === "pdf" ? (
                  <FaFilePdf size={28} color="#e53935" />
                ) : (
                  <FaFileImage size={28} color="#1976d2" />
                )}
                <strong>{r.title}</strong>
              </div>

              <p style={{ margin: "4px 0", color: "#666", textTransform: "capitalize" }}>
                {r.reportType}
              </p>

              <p style={{ margin: "4px 0", color: "#999", fontSize: "13px" }}>
                {new Date(r.createdAt).toLocaleDateString()}
              </p>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <a
                  href={`${API_ORIGIN}${r.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "6px 14px",
                    background: "#1976d2",
                    color: "white",
                    borderRadius: "6px",
                    textDecoration: "none",
                  }}
                >
                  View
                </a>

                <button
                  onClick={() => handleDelete(r._id)}
                  style={{
                    border: "1px solid #e53935",
                    background: "white",
                    color: "#e53935",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FaTrash size={12} /> Delete
                </button>
              </div>
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

export default MedicalReports;
