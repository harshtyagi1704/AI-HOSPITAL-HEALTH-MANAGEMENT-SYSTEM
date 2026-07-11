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
  const [role, setRole] = useState(location.state?.role || "All");;
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users", {
        params: { page, limit: 10, role, search },
      });
      setUsers(res.data.users);
      setPagination(res.data.pagination || { totalPages: 1, total: res.data.users.length });
    } catch (err) {
      console.log(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, role]);

  // Debounce search input so we don't spam the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const stats = useMemo(
    () => ({
      total: pagination.total ?? users.length,
      doctors: users.filter((u) => u.role === "doctor").length,
      patients: users.filter((u) => u.role === "patient").length,
      admins: users.filter((u) => u.role === "admin").length,
    }),
    [users, pagination]
  );

  // ================= PHASE 42: EXPORT USERS (PDF / EXCEL) =================
  const fetchAllForExport = async () => {
    const res = await api.get("/users", { params: { role, search } });
    return res.data.users;
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const allUsers = await fetchAllForExport();

      const rows = allUsers.map((u) => ({
        Name: u.name,
        Email: u.email,
        Phone: u.phone,
        Role: u.role,
        Department: u.department || "-",
      }));

      const sheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Users");
      XLSX.writeFile(workbook, `users-export-${Date.now()}.xlsx`);

      toast.success("Excel file downloaded");
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const allUsers = await fetchAllForExport();

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("AI Hospital - User List", 14, 15);

      autoTable(doc, {
        startY: 22,
        head: [["Name", "Email", "Phone", "Role", "Department"]],
        body: allUsers.map((u) => [
          u.name,
          u.email,
          u.phone,
          u.role,
          u.department || "-",
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [25, 118, 210] },
      });

      doc.save(`users-export-${Date.now()}.pdf`);
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:17,flexWrap:"wrap",gap:12}}>
        <h2 style={{marginTop:"-15px",color:"#1c5a6d",margin:0}}>USER MANAGEMENT</h2>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            style={{padding:"10px 16px",background:"#032eec",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}
          >
            ⬇ Export Excel
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exporting}
            style={{padding:"10px 16px",background:"#082bee",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}
          >
            ⬇ Export PDF
          </button>

          <button onClick={()=>{setEditingUser(null);setOpenModal(true);}}
            style={{padding:"10px 18px",background:"#850f0f",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}>
            + Add User
          </button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:20,marginBottom:30}}>
        <DashboardCard title="Total Users" value={stats.total} color="#a39515" icon=""/>
        <DashboardCard title="Doctors (this page)" value={stats.doctors} color="#43a047" icon=""/>
        <DashboardCard title="Patients (this page)" value={stats.patients} color="#a39515" icon=""/>
        <DashboardCard title="Admins (this page)" value={stats.admins} color="#43a047" icon=""/>
        
      </div>

      <div style={{display:"flex",gap:15,marginBottom:25,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{padding:10,width:320,borderRadius:8,border:"1px solid #ccc"}}/>
        <select value={role} onChange={e=>{setRole(e.target.value); setPage(1);}}
          style={{padding:10,borderRadius:8}}>
          <option value="All">All</option>
          <option value="patient">patient</option>
          <option value="doctor">doctor</option>
          <option value="reception">reception</option>
          <option value="admin">admin</option>
        </select>
      </div>

      <div style={{overflowX:"auto",background:"var(--card-bg)",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,.08)"}}>
        <table width="100%" cellPadding="14" style={{borderCollapse:"collapse"}}>
          <thead style={{background:"#1976d2",color:"#fff"}}>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Department</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonTableRows rows={6} columns={5} />
            ) : users.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign:"center",padding:30}}>👥 No users found.</td></tr>
            ) : (
              users.map(u=>(
                <tr key={u._id} style={{borderBottom:"2px solid #000000"}}>
                  <td style={{ textAlign: "center" }}>{u.name}</td>
                  <td style={{ textAlign: "center" }}>{u.email}</td>
                  <td style={{ textAlign: "center" }}>{u.phone}</td>
                  <td style={{ textAlign: "center" }}><RoleBadge role={u.role}/></td>
                  <td style={{ textAlign: "center" }}><DepartmentBadge department={u.department}/></td>
                  <td style={{display:"flex",gap:"8px"}}>
                    <button onClick={()=>{setEditingUser(u);setOpenModal(true);}} style={{padding:"10px 10px",background:"#2e649b",color:"#f3eaea",border:"none",borderRadius:"1px",cursor:"pointer"}}>Edit</button>
                    <button onClick={async()=>{if(!window.confirm("Delete this user?")) return; try{await api.delete(`/users/${u._id}`); toast.success("User deleted"); fetchUsers();}catch(err){toast.error(err.response?.data?.message||"Delete failed");}}} style={{padding:"5px 10px",background:"#d32f2f",color:"#fff",border:"none",borderRadius:"1px",cursor:"pointer"}}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        onChange={setPage}
      />

      <UserModal
        open={openModal}
        onClose={()=>setOpenModal(false)}
        editingUser={editingUser}
        saving={saving}
        refreshUsers={fetchUsers}
      />
    </Layout>
  );
}
export default ManageUsers;
