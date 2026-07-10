import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import api from "../services/api";

const COLORS = ["#1976d2", "#43a047", "#f57c00", "#e53935", "#6a1b9a", "#00838f"];

function AdminAnalytics() {
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctorPerf, setDoctorPerf] = useState([]);
  const [queueTrends, setQueueTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [d1, d2, d3, d4, d5] = await Promise.all([
          api.get("/admin/analytics/daily-patients"),
          api.get("/admin/analytics/monthly-patients"),
          api.get("/admin/analytics/department-stats"),
          api.get("/admin/analytics/doctor-performance"),
          api.get("/admin/analytics/queue-trends"),
        ]);

        setDaily(d1.data.data);
        setMonthly(d2.data.data);
        setDepartments(d3.data.data);
        setDoctorPerf(d4.data.data);
        setQueueTrends(d5.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const chartCard = {
    background: "white",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,.08)",
  };

  return (
    <Layout>
      <h2 style={{ marginTop: "0px", color: "#105f6d" }}>ADMIN ANALYTICS </h2>
      <p style={{ color: "#5f5c5c", marginBottom: "30px" }}>
        Hospital-wide performance and trends at a glance.
      </p>

      {loading && <h2>Loading analytics...</h2>}

      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(420px,1fr))",
            gap: "24px",
          }}
        >
          {/* Daily Patients */}
          <div style={chartCard}>
            <h3>Daily Patients (Last 14 Days)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="#1976d2"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Patients */}
          <div style={chartCard}>
            <h3>Monthly Patients (Last 12 Months)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="patients" fill="#43a047" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Statistics */}
          <div style={chartCard}>
            <h3>Department Statistics</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={departments}
                  dataKey="patients"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {departments.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Doctor Performance */}
          <div style={chartCard}>
            <h3>Doctor Performance</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={doctorPerf}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="totalConsultations"
                  name="Consultations"
                  fill="#1976d2"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="avgConsultationTime"
                  name="Avg Time (min)"
                  fill="#f57c00"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Queue Trends */}
          <div style={{ ...chartCard, gridColumn: "1 / -1" }}>
            <h3> Queue Trends (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={queueTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="waiting" stroke="#f57c00" />
                <Line type="monotone" dataKey="in-progress" stroke="#1976d2" />
                <Line type="monotone" dataKey="completed" stroke="#2e7d32" />
                <Line type="monotone" dataKey="cancelled" stroke="#9e9e9e" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "flex-end" }}>
        <LogoutButton />
      </div>
    </Layout>
  );
}

export default AdminAnalytics;
