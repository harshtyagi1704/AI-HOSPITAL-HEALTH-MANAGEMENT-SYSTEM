import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaBell } from "react-icons/fa";
import socket from "../services/socket";

function NotificationBell() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const handleDoctorCalled = (payload) => {
      if (payload.patientId !== user.id) return;

      const message = `🔔 Doctor has called you! Token #${payload.tokenNumber} — ${payload.department}`;

      toast.info(message);

      setNotifications((prev) => [
        { id: Date.now(), message, time: new Date() },
        ...prev,
      ]);
    };

    const handleQueueUpdated = () => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: "🔄 Queue has been updated",
          time: new Date(),
        },
        ...prev,
      ]);
    };

    socket.on("doctorCalled", handleDoctorCalled);
    socket.on("queueUpdated", handleQueueUpdated);

    return () => {
      socket.off("doctorCalled", handleDoctorCalled);
      socket.off("queueUpdated", handleQueueUpdated);
    };
  }, [user]);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "50%",
          width: "42px",
          height: "42px",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <FaBell color="#1976d2" />
        {notifications.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "#e53935",
              color: "white",
              borderRadius: "50%",
              fontSize: "11px",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50px",
            width: "300px",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            padding: "10px",
            zIndex: 10,
            maxHeight: "320px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <strong>Notifications</strong>
            {notifications.length > 0 && (
              <button
                onClick={() => setNotifications([])}
                style={{
                  border: "none",
                  background: "none",
                  color: "#1976d2",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <p style={{ color: "#888", fontSize: "14px" }}>
              No notifications yet.
            </p>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                borderBottom: "1px solid #f0f0f0",
                padding: "8px 4px",
                fontSize: "14px",
              }}
            >
              <p style={{ margin: 0 }}>{n.message}</p>
              <span style={{ color: "#999", fontSize: "11px" }}>
                {n.time.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
