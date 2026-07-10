import { toast } from "react-toastify";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "patient",
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

      const response = await api.post(
        "/auth/register",
        formData
      );

         toast.success(
    "Registration successful! Please check your email and verify your account."
);

navigate("/login");

    } catch (error) {

      toast.error(
        error.response?.data?.message || 
        "Registration Failed"
      );

    } finally {
      setLoading(false);
    }
  };


  return (

    <div
      style={{
        height:"100vh",
        overflow:"hidden",

        background:
        "linear-gradient(135deg,#020617,#0f172a,#134e4a)",

        display:"flex",
        justifyContent:"center",
        alignItems:"center",

        padding:"10px",

        boxSizing:"border-box",

        fontFamily:"Segoe UI, sans-serif"
      }}
    >


      <div
        style={{

          width:"100%",
          maxWidth:"450px",

          padding:"25px",

          borderRadius:"22px",

          background:
          "rgba(255,255,255,0.12)",

          backdropFilter:"blur(18px)",

          border:
          "1px solid rgba(255,255,255,0.25)",

          boxShadow:
          "0 25px 50px rgba(0,0,0,0.35)"

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
              "linear-gradient(135deg,#0284c7,#14b8a6)",

              display:"flex",

              justifyContent:"center",

              alignItems:"center",

              fontSize:"38px",

              color:"#fff",

              boxShadow:
              "0 10px 30px rgba(14,165,233,.5)"
            }}
          >
            🏥
          </div>



          <h1
            style={{
              color:"#fff",

              marginBottom:"10px",
              marginTop:"10px",

              fontSize:"30px",

              letterSpacing:"1px"
            }}
          >
            Create Account
          </h1>


          <p
            style={{
              color:"#cbd5e1",

              marginBottom:"0px"
            }}
          >
          </p>


        </div>



        <form onSubmit={handleSubmit}>


          <label style={{color:"#e2e8f0"}}>
            Full Name
          </label>


          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required

             style={{
              width:"100%",
              padding:"15px",
              marginTop:"5px",
              marginBottom:"5px",
              borderRadius:"12px",
              border:"1px solid #64748b",
              outline:"none",
              fontSize:"15px",
              background:"rgba(37, 65, 70, 0.14)",
              boxSizing:"border-box"
            }}
          />



          <label style={{color:"#e2e8f0"}}>
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
              marginTop:"5px",
              marginBottom:"5px",
              borderRadius:"12px",
              border:"1px solid #64748b",
              outline:"none",
              fontSize:"15px",
              background:"rgba(37, 65, 70, 0.14)",
              boxSizing:"border-box"
            }}
          />



          <label style={{color:"#e2e8f0"}}>
            Password
          </label>


          <input
            type="password"
            name="password"
            placeholder="Create password"
            value={formData.password}
            onChange={handleChange}
            required

             style={{
              width:"100%",
              padding:"15px",
              marginTop:"5px",
              marginBottom:"5px",
              borderRadius:"12px",
              border:"1px solid #64748b",
              outline:"none",
              fontSize:"15px",
              background:"rgba(37, 65, 70, 0.14)",
              boxSizing:"border-box"
            }}
          />



          <label style={{color:"#e2e8f0"}}>
            Phone Number
          </label>


          <input
            type="text"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleChange}
            required

            style={{
              width:"100%",
              padding:"15px",
              marginTop:"5px",
              marginBottom:"25px",
              borderRadius:"12px",
              border:"1px solid #64748b",
              outline:"none",
              fontSize:"15px",
              background:"rgba(37, 65, 70, 0.14)",
              boxSizing:"border-box"
            }}
          />



          <button

            disabled={loading}

            style={{

              width:"100%",

              padding:"15px",

              marginTop:"1px",
marginBottom:"1px",
              borderRadius:"12px",

              border:"none",

              cursor:"pointer",

              background: "#9c0b0b8e",
            


              color:"#fff",

              fontSize:"17px",

              fontWeight:"700",

             

            }}

          >

            {
              loading 
              ? "Creating Account..." 
              : "Register"
            }

          </button>


        </form>



        <div
          style={{
            textAlign:"center",
            marginTop:"2px"
          }}
        >

          <Link

            to="/login"

            style={{
              color:"#ffffff",

              textDecoration:"none",

              fontWeight:"200"
            }}

          >
            Already have an account? Login
          </Link>


        </div>



      </div>


    </div>

  );
}



const inputStyle = {

  width:"100%",

  padding:"14px",

  marginTop:"8px",

  marginBottom:"18px",

  borderRadius:"12px",

  border:"1px solid #64748b",

  outline:"none",

  fontSize:"15px",

  background:"rgba(255,255,255,.9)",

  boxSizing:"border-box"

};


export default Register;