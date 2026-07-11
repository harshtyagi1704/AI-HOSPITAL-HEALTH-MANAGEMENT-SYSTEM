import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTicketAlt,
  FaHospital,
  FaRobot,
  FaHistory,
  FaCalendarPlus,
  FaFileUpload,
  FaFileInvoiceDollar,
} from "react-icons/fa";

import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import LogoutButton from "../components/LogoutButton";
import NotificationBell from "../components/NotificationBell";
import Skeleton from "../components/Skeleton";
import api from "../services/api";
import socket from "../services/socket";

function PatientDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState({
    totalTokens: 0,
    liveQueue: 0,
    emergency: 0,
    aiStatus: "Loading...",
  });

  // ================= 35: CURRENT TOKEN / QUEUE POSITION / WAIT / DOCTOR =================
  const [myToken, setMyToken] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get("/tokens/stats");
      setStats(res.data.stats);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMyToken = async () => {
    try {
      const res = await api.get("/tokens/my-token");
      setMyToken(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setTokenLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchMyToken();

    const refresh = () => {
      fetchStats();
      fetchMyToken();
    };

    socket.on("queueUpdated", refresh);
    socket.on("doctorCalled", refresh);

    return () => {
      socket.off("queueUpdated", refresh);
      socket.off("doctorCalled", refresh);
    };
  }, []);

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div >
          <h2
           style={{ color: "#156983",marginTop: "-10px", marginBottom: "15px", }}>
          PATIENT DASHBOARD
          </h2>

          <h2
          style={{ color: "#8b2412", marginBottom: "10px" }}>
          
          </h2>

          <p style={{ color: "#851f1f", marginBottom: "10px" }}>
          
          </p>
        </div >

        <NotificationBell  />
      </div>

      {/* ================= 35: PATIENT DASHBOARD - CURRENT TOKEN ================= */}

      <div
  className="card"
  style={{
    marginBottom: "30px",
    background: "#105f6d",   // 👈 change this hex to whatever color you want
  }}
>

        <h2 style={{ marginTop: 0, color: "#ffff"  }}>Queue Live Status</h2>

        {tokenLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px" }}>
            <Skeleton height={50} />
            <Skeleton height={50} />
            <Skeleton height={50} />
            <Skeleton height={50} />
          </div>
        )}

        {!tokenLoading && !myToken?.hasActiveToken && (
          <p style={{ color: "#b8aaaa" }}>
            You don't have an active token right now.{" "}
            <Link to="/book-token" style={{ color: "#e7b835" }}>
              Book one now
            </Link>
            .
          </p>
        )}

        {!tokenLoading && myToken?.hasActiveToken && (
          <div
            style={{
              display: "grid",
              
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "16px",
              
            }}
          >
            <div>
              <p style={{ margin: 0, color: "#ffffff" }}>Token Number</p>
              <h2 style={{ margin: "4px 0", color: "#ffffff" }}>
                #{myToken.token.tokenNumber}
              </h2>
            </div>

            <div>
              <p style={{ margin: 0, color: "#eef6ff" }}>Queue Position</p>
              <h2 style={{ margin: "4px 0", color: "#ffffff" }}>
                {myToken.queuePosition}
              </h2>
            </div>

            <div>
              <p style={{ margin: 0, color: "#ffffff" }}>Status</p>
              <h2 style={{ margin: "4px 0", color: "#ffffff" }}>
                {myToken.token.status}
              </h2>
            </div>

            <div>
              <p style={{ margin: 0, color: "#ffffff" }}>Current Doctor</p>
              <h2 style={{ margin: "4px 0", color: "#ffffff" }}>
                {myToken.currentDoctor?.name || "Not assigned yet"}
              </h2>
            </div>
          </div>
        )}
      </div>

      {/* ================= STATS ================= */}

      <div
        style={{
          display: "grid",
          
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {/* <StatCard title="Token Generated" value={stats.totalTokens} color="#0a2b35" /> */}
        <StatCard title="Live Queue" value={stats.liveQueue} color="#0a2b35" />
        <StatCard title="Emergency" value={stats.emergency} color="#0a2b35" />
      </div>

      {/* ================= QUICK ACTIONS ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "20px",
        }}
      >
        <Link to="/book-token" style={{ textDecoration: "none" }}>
          <div className="card">
            <FaTicketAlt size={40} color="#1976d2" />
            <h2>Book Token</h2>
            <p>Book your hospital token instantly.</p>
          </div>
        </Link>

        <Link to="/queue" style={{ textDecoration: "none" }}>
          <div className="card">
            <FaHospital size={40} color="#2e7d32" />
            <h2>Live Queue</h2>
            <p>Check current queue status and wait for your turn. </p>
          </div>
        </Link>

        <Link to="/symptom-checker" style={{ textDecoration: "none" }}>
          <div className="card">
            <FaRobot size={40} color="#6a1b9a" />
            <h2>AI Symptom Checker</h2>
            <p>Get instant AI-based guidance and Precautions.</p>
          </div>
        </Link>

        <Link to="/patient/history" style={{ textDecoration: "none" }}>
          <div className="card">
            <FaHistory size={40} color="#ef6c00" />
            <h2>Medical History</h2>
            <p>View your previous visits & prescriptions.</p>
          </div>
        </Link>

        <Link to="/appointments/book" style={{ textDecoration: "none" }}>
          <div className="card">
            <FaCalendarPlus size={40} color="#00838f" />
            <h2>Book Appointment</h2>
            <p>Schedule an appointment with a doctor.</p>
          </div>
        </Link>

        <Link to="/reports" style={{ textDecoration: "none" }}>
          <div className="card">
            <FaFileUpload size={40} color="#5d4037" />
            <h2>Medical Reports</h2>
            <p>Upload & view all your LAB reports here.</p>
          </div>
        </Link>

        <Link to="/billing/invoices" style={{ textDecoration: "none" }}>
          <div className="card">
            <FaFileInvoiceDollar size={40} color="#00695c" />
            <h2>My Invoices</h2>
            <p>View and pay your hospital bills.</p>
          </div>
        </Link>
      </div>

      {/* ================= LOGOUT ================= */}

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "flex-end" }}>
        <LogoutButton />
      </div>
    </Layout>
  );
}

export default PatientDashboard;
