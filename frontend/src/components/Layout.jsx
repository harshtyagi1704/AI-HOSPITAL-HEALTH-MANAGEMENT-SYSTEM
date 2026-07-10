import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex" }}>

      {/* Phase 42: mobile hamburger toggle for responsive sidebar */}
      <button
        className="sidebar-hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          width: "44px",
          height: "44px",           
          borderRadius: "50%",
          border: "none",
          background: "#19b6d2",
          color: "white",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,.2)",
        }}
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="app-layout-content"
        onClick={() => sidebarOpen && setSidebarOpen(false)}
        style={{
  marginLeft: "260px",
  flex: 1,
  width: "calc(100% - 260px)",
  padding: "30px",
  background: "var(--page-bg)",
  minHeight: "100vh",
  boxSizing: "border-box",
}}
      >
        {children}
      </div>
    </div>
  );
}

export default Layout;
