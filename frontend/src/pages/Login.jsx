import { toast } from "react-toastify";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/auth/login", formData);

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      if (!socket.connected) {
        socket.connect();
      }

      toast.success("Login Successful!");

      const role = response.data.user.role;

      if (role === "patient") navigate("/patient");
      else if (role === "doctor") navigate("/doctor");
      else if (role === "reception") navigate("/reception");
      else if (role === "admin") navigate("/admin");
      else navigate("/");

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      style={{
        maxheight: "100vh",
overflow: "hidden",
        background:
          "linear-gradient(135deg,#020617,#0f172a,#134e4a)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >

      <div
        style={{
          width: "100%",
          height: "95vh",
          maxWidth: "450px",
          padding: "45px",
          borderRadius: "22px",

          background:
            "rgba(255,255,255,0.12)",

          backdropFilter: "blur(18px)",

          border:
            "1px solid rgba(255,255,255,0.25)",

          boxShadow:
            "0 25px 50px rgba(0,0,0,0.35)",
        }}
      >


        <div style={{textAlign:"center"}}>

          <div
            style={{
              width:"80px",
              height:"80px",
              margin:"auto",
              borderRadius:"50%",
              background:
              "linear-gradient(135deg,#0ea5e9,#14b8a6)",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              fontSize:"38px",
              color:"white",
              boxShadow:
              "0 10px 30px rgba(14,165,233,.5)"
            }}
          >
            🏥
          </div>


          <h1
              style={{
              color:"#cbd5e1",
              marginBottom:"15px",
              fontSize:"15px",
               letterSpacing:"1px",
               marginTop:"15px",
            }}
          >
            AI BASED HOSPITAL MANAGEMENT SYSTEM
           
          </h1>


          <p  style={{
              marginTop:"0px",
              marginBottom:"10px",
              color:"#ffffff",
              fontSize:"20px",
              letterSpacing:"01px"
            }}
          >
          LOGIN | SIGN-UP

          </p>

        </div>



        <form onSubmit={handleSubmit}>


          <label
          style={{
            color:"#e2e8f0",
            fontSize:"14px"
          }}>
            Email Address
          </label>


          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width:"100%",
              padding:"15px",
              marginTop:"8px",
              marginBottom:"22px",
              borderRadius:"12px",
              border:"1px solid #64748b",
              outline:"none",
              fontSize:"15px",
              background:"rgba(37, 65, 70, 0.14)",
              boxSizing:"border-box"
            }}
          />



          <label
          style={{
            color:"#e2e8f0",
            fontSize:"14px"
          }}>
            Password
          </label>


          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width:"100%",
              padding:"15px",
              marginTop:"8px",
              marginBottom:"28px",
              borderRadius:"12px",
              border:"1px solid #64748b",
              outline:"none",
              fontSize:"15px",
              background:"rgba(37, 65, 70, 0.14)",
              boxSizing:"border-box"
            }}
          />



          <button
            type="submit"
            disabled={loading}
            style={{
              width:"100%",
              padding:"15px",
              borderRadius:"12px",
              border:"none",
              cursor:"pointer",

              background:
              "#8b2c1fc2",

              color:"white",
              fontSize:"17px",
              fontWeight:"400",

              
              transition:"0.3s"
            }}

            onMouseEnter={(e)=>{
              e.target.style.transform="translateY(-3px)";
            }}

            onMouseLeave={(e)=>{
              e.target.style.transform="translateY(0)";
            }}
          >

          {loading ? "Logging In..." : "Login"}

          </button>


        </form>



        <div
          style={{
            marginTop:"70px",
            display:"flex",
            justifyContent:"space-between",
          }}
        >

          <Link
            to="/forgot-password"
            style={{
              color:"#4ec7e6",
              textDecoration:"none",
              fontWeight:"600"
            }}
          >
            Forgot Password?
          </Link>


          <Link
            to="/register"
            style={{
              color:"#4ec7e6",
              textDecoration:"none",
              fontWeight:"600"
            }}
          >
            Create Account
          </Link>


        </div>


      </div>

    </div>
  );
}

export default Login;