import { toast } from "react-toastify";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/profile/forgot-password", { email });

      setSent(true);

      toast.success(
        "If that email exists, a reset link has been sent"
      );

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        background:
          "linear-gradient(135deg,#020617,#0f172a,#134e4a)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        boxSizing:"border-box",
        fontFamily:"Segoe UI, sans-serif"
      }}
    >


      <div
        style={{
          width:"100%",
          maxWidth:"430px",

          padding:"40px",

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
              alignItems:"center",
              justifyContent:"center",

              fontSize:"38px",
              color:"white",

              boxShadow:
              "0 10px 30px rgba(14,165,233,.5)"
            }}
          >
            🔐
          </div>



          <h1
            style={{
              color:"#fff",
              marginTop:"20px",
              fontSize:"30px",
              letterSpacing:"1px"
            }}
          >
            Forgot Password
          </h1>



          <p
            style={{
              color:"#cbd5e1",
              marginBottom:"30px"
            }}
          >
            Reset your password securely using your email
          </p>


        </div>



        {sent ? (

          <>

            <div
              style={{
                background:"rgba(34,197,94,0.15)",
                color:"#86efac",

                padding:"18px",

                borderRadius:"12px",

                textAlign:"center",

                fontWeight:"600",

                marginBottom:"25px",

                border:
                "1px solid rgba(134,239,172,.3)"
              }}
            >

              Check your inbox for the password reset link.
              <br/>
              Link expires in 30 minutes.

            </div>


            <Link
              to="/login"
              style={{
                display:"block",
                textAlign:"center",

                color:"#5eead4",

                textDecoration:"none",

                fontWeight:"700"
              }}
            >
              ← Back to Login
            </Link>


          </>


        ) : (


          <form onSubmit={handleSubmit}>


            <label
              style={{
                color:"#e2e8f0",
                fontSize:"14px"
              }}
            >
              Registered Email
            </label>



            <input

              type="email"

              placeholder="Enter your email"

              value={email}

              onChange={(e)=>setEmail(e.target.value)}

              required


              style={{

                width:"100%",

                padding:"15px",

                marginTop:"8px",

                marginBottom:"25px",

                borderRadius:"12px",

                border:"1px solid #64748b",

                outline:"none",

                fontSize:"15px",

                background:"rgba(255,255,255,.9)",

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


                 background: "#9c0b0b8e",


                color:"white",

                fontSize:"17px",

                fontWeight:"700",


               

              }}

            >

              {loading ? "Sending..." : "Send Reset Link"}

            </button>



            <div
              style={{
                textAlign:"center",
                marginTop:"25px"
              }}
            >

              <Link
                to="/login"

                style={{
                  color:"#38bdf8",
                  textDecoration:"none",
                  fontWeight:"600"
                }}
              >
                ← Back to Login
              </Link>


            </div>



          </form>


        )}


      </div>


    </div>
  );
}

export default ForgotPassword;