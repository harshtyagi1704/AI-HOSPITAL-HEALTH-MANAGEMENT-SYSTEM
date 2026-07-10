import { useEffect, useState } from "react";
import api from "../services/api";
import socket from "../socket";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import { SkeletonCard } from "../components/Skeleton";

function LiveQueue() {

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {

      const response = await api.get("/tokens/live");

      setQueue(response.data.queue);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    // Load queue initially
    fetchQueue();

    // Listen for queue updates
    socket.on("queueUpdated", () => {

      console.log("🔄 Queue Updated");

      fetchQueue();

    });

    // Cleanup
    return () => {

      socket.off("queueUpdated");

    };

  }, []);

  return (
    <Layout>

      <h2 style={{ marginTop: "-15px",color: "#1976d2" }}>LIVE QUEUE</h2>

      <p style={{ color: "#666", marginBottom: "20px" }}>
        Real-time view of everyone currently waiting or being seen.
      </p>

      {loading && (
        <div style={{ display: "grid", gap: "16px" }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && queue.length === 0 && (
        <h2 style={{ color: "#888" }}>No one is in the queue right now.</h2>
      )}

      {!loading && queue.length > 0 && (
        <div
          className="card"
          style={{ cursor: "default", overflowX: "auto", padding: 0 }}
        >
          <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse" }}>

            <thead style={{ background: "#1976d2", color: "white" }}>

              <tr>

                <th>Token</th>
                <th>Patient</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {queue.map((item, index) => (

                <tr
                  key={item._id}
                  style={{
                    borderBottom: "1px solid #eee",
                    background: item.priority === "emergency" ? "#ffebee" : "transparent",
                  }}
                >

                  {/* <td style={{ fontWeight: "bold" }}> {index + 1}</td> */}
                   <td>
    Position {index + 1}
    <br />
    <small>Token #{item.tokenNumber}</small>
</td>
                  <td>{item.patient?.name}</td>

                  <td>{item.department}</td>

                  <td>
                    {item.priority === "emergency" && "🔴 Emergency"}
                    {item.priority === "senior" && "🟠 Senior Citizen"}
                    {item.priority === "child" && "🟡 Child"}
                    {item.priority === "normal" && "🟢 Normal"}
                  </td>

                  <td>
                    <span
                      style={{
                        padding: "5px 14px",
                        borderRadius: "20px",
                        color: "white",
                        fontSize: "13px",
                        background:
                          item.status === "waiting"
                            ? "#f57c00"
                            : item.status === "in-progress"
                            ? "#1976d2"
                            : "#2e7d32",
                      }}
                    >
                      {item.status}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>
        </div>
      )}

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "flex-end" }}>
        <LogoutButton />
      </div>

    </Layout>
  );
}

export default LiveQueue;