// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import api from "../services/api";

// function VerifyEmail() {
//   const { token } = useParams();
//   const [status, setStatus] = useState("verifying"); // verifying | success | error
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const verify = async () => {
//       try {
//         const res = await api.get(`/profile/verify-email/${token}`);
//         setStatus("success");
//         setMessage(res.data.message);
//         setTimeout(() => {
//     window.location.href = "/login";
// }, 3000);
//       } catch (error) {
//         setStatus("error");
//         setMessage(error.response?.data?.message || "Verification failed");
//       }
//     };

//     verify();
//   }, [token]);

//   return (
//     <div style={{ width: "420px", margin: "80px auto", textAlign: "center" }}>
//       <h1>Email Verification</h1>

//       {status === "verifying" && <p>Verifying your email...</p>}
//       {status === "success" && <p>✅ {message}</p>}
//       {status === "error" && <p>❌ {message}</p>}

//       <br />
//       <Link to="/login">Back to Login</Link>
//     </div>
//   );
// }

// export default VerifyEmail;

import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  // Prevent React from sending the verification request twice
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const response = await api.get(
          `/profile/verify-email/${encodeURIComponent(token)}`
        );

        setStatus("success");
        setMessage(
          response.data?.message || "Email verified successfully."
        );

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      } catch (error) {
        console.error("Email verification failed:", error);

        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification failed. The link may be invalid or expired."
        );
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div
      style={{
        width: "420px",
        maxWidth: "90%",
        margin: "80px auto",
        padding: "30px",
        textAlign: "center",
      }}
    >
      <h1>Email Verification</h1>

      {status === "verifying" && <p>Verifying your email...</p>}

      {status === "success" && (
        <>
          <p>✅ {message}</p>
          <p>Redirecting you to login...</p>
        </>
      )}

      {status === "error" && <p>❌ {message}</p>}

      <br />

      <Link to="/login">Back to Login</Link>
    </div>
  );
}

export default VerifyEmail;
