import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import Layout from "../components/Layout";
import api from "../services/api";
import UserModal from "../components/UserModal";
import DashboardCard from "../components/DashboardCard";
import RoleBadge from "../components/RoleBadge";
import DepartmentBadge from "../components/DepartmentBadge";
import Pagination from "../components/Pagination";
import { SkeletonTableRows } from "../components/Skeleton";

function ManageUsers() {
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(location.state?.role || "All");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalPages: 1,
    total: 0,
  });

  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // FETCH USERS
  // =====================================================
  const fetchUsers = async () => {
    setLoading(true);

    try {
      const res = await api.get("/users", {
        params: {
          page,
          limit: 10,
          role,
          search,
        },
      });

      const fetchedUsers = res.data.users || [];

      setUsers(fetchedUsers);

      setPagination(
        res.data.pagination || {
          totalPages: 1,
          total: fetchedUsers.length,
        }
      );
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page or role changes
  useEffect(() => {
    fetchUsers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, role]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 400);

    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // =====================================================
  // USER STATISTICS
  // =====================================================
  const stats = useMemo(() => {
    return {
      total: pagination.total ?? users.length,

      doctors:
        role === "doctor"
          ? pagination.total ?? users.length
          : users.filter((user) => user.role === "doctor").length,

      patients:
        role === "patient"
          ? pagination.total ?? users.length
          : users.filter((user) => user.role === "patient").length,

      receptionists:
        role === "reception"
          ? pagination.total ?? users.length
          : users.filter((user) => user.role === "reception").length,

      admins:
        role === "admin"
          ? pagination.total ?? users.length
          : users.filter((user) => user.role === "admin").length,
    };
  }, [users, pagination, role]);

  // =====================================================
  // FETCH ALL USERS FOR EXPORT
  // =====================================================
  const fetchAllForExport = async () => {
    const res = await api.get("/users", {
      params: {
        role,
        search,
      },
    });

    return res.data.users || [];
  };

  // =====================================================
  // EXPORT EXCEL
  // =====================================================
  const handleExportExcel = async () => {
    setExporting(true);

    try {
      const allUsers = await fetchAllForExport();

      const rows = allUsers.map((user) => ({
        Name: user.name,
        Email: user.email,
        Phone: user.phone,
        Role: user.role,
        Department: user.department || "-",
      }));

      const sheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, sheet, "Users");

      XLSX.writeFile(
        workbook,
        `users-export-${Date.now()}.xlsx`
      );

      toast.success("Excel file downloaded");
    } catch (err) {
      console.error("Excel export failed:", err);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  // =====================================================
  // EXPORT PDF
  // =====================================================
  const handleExportPDF = async () => {
    setExporting(true);

    try {
      const allUsers = await fetchAllForExport();

      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("AI Hospital - User List", 14, 15);

      autoTable(doc, {
        startY: 22,

        head: [
          ["Name", "Email", "Phone", "Role", "Department"],
        ],

        body: allUsers.map((user) => [
          user.name,
          user.email,
          user.phone,
          user.role,
          user.department || "-",
        ]),

        styles: {
          fontSize: 9,
        },

        headStyles: {
          fillColor: [25, 118, 210],
        },
      });

      doc.save(`users-export-${Date.now()}.pdf`);

      toast.success("PDF downloaded");
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  // =====================================================
  // DELETE USER
  // =====================================================
  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);

      toast.success("User deleted");

      fetchUsers();
    } catch (err) {
      console.error("Delete user failed:", err);

      toast.error(
        err.response?.data?.message || "Delete failed"
      );
    }
  };

  return (
    <Layout>
      {/* ================= HEADER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 17,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2
          style={{
            color: "#1c5a6d",
            margin: 0,
          }}
        >
          USER MANAGEMENT
        </h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            style={{
              padding: "10px 16px",
              background: "#032eec",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: exporting ? "not-allowed" : "pointer",
              opacity: exporting ? 0.7 : 1,
            }}
          >
            ⬇ Export Excel
          </button>

          {/* <button
            onClick={handleExportPDF}
            disabled={exporting}
            style={{
              padding: "10px 16px",
              background: "#082bee",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: exporting ? "not-allowed" : "pointer",
              opacity: exporting ? 0.7 : 1,
            }}
          >
            ⬇ Export PDF
          </button> */}

          <button
            onClick={() => {
              setEditingUser(null);
              setOpenModal(true);
            }}
            style={{
              padding: "10px 18px",
              background: "#850f0f",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            + Add User
          </button>
        </div>
      </div>

      {/* ================= STATISTICS CARDS ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 30,
         
        }}
      >
        <DashboardCard
          title="Total Users"
          value={stats.total}
          color="#a39515"
          icon=""
        />

        <DashboardCard
          title="Doctors Account"
          value={stats.doctors}
          color="#43a047"
          icon=""
        />

        <DashboardCard
          title="Patient Account"
          value={stats.patients}
          color="#a39515"
          icon=""
        />

        <DashboardCard
          title="Reception Account"
          value={stats.receptionists}
          color="#43a047"
          icon=""
        />
      </div>

      {/* ================= SEARCH AND FILTER ================= */}
      <div
        style={{
          display: "flex",
          gap: 15,
          marginBottom: 25,
          flexWrap: "wrap",
        }}
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email..."
          style={{
            padding: 10,
            width: 320,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        <select
          value={role}
          onChange={(event) => {
            setRole(event.target.value);
            setPage(1);
          }}
          style={{
            padding: 10,
            borderRadius: 8,
          }}
        >
          <option value="All">All</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="reception">Reception</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* ================= USERS TABLE ================= */}
      <div
        style={{
          overflowX: "auto",
          background: "var(--card-bg)",
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,.08)",
        }}
      >
        <table
          width="100%"
          cellPadding="14"
          style={{
            borderCollapse: "collapse",
          }}
        >
          <thead
            style={{
              background: "#1976d2",
              color: "#fff",
            }}
          >
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <SkeletonTableRows rows={6} columns={6} />
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: 30,
                  }}
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user._id}
                  style={{
                    borderBottom: "2px solid #000000",
                  }}
                >
                  <td style={{ textAlign: "center" }}>
                    {user.name}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {user.email}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {user.phone}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <RoleBadge role={user.role} />
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <DepartmentBadge
                      department={user.department}
                    />
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setOpenModal(true);
                        }}
                        style={{
                          padding: "10px 10px",
                          background: "#2e649b",
                          color: "#f3eaea",
                          border: "none",
                          borderRadius: "1px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteUser(user._id)
                        }
                        style={{
                          padding: "5px 10px",
                          background: "#d32f2f",
                          color: "#fff",
                          border: "none",
                          borderRadius: "1px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        onChange={setPage}
      />

      {/* ================= USER MODAL ================= */}
      <UserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        editingUser={editingUser}
        saving={saving}
        setSaving={setSaving}
        refreshUsers={fetchUsers}
      />
    </Layout>
  );
}

export default ManageUsers;