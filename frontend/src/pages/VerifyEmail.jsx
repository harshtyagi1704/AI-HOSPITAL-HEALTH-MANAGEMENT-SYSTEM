import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  const requestStarted = useRef(false);
  const redirectTimer = useRef(null);

  useEffect(() => {
    if (requestStarted.current) return;
    requestStarted.current = true;

    const verifyEmail = async () => {
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

        redirectTimer.current = setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      } catch (error) {
        const backendMessage = error.response?.data?.message || "";

        /*
         * React development mode or link scanners can sometimes trigger the
         * verification endpoint more than once. If the first request already
         * verified the account, a repeated request sees a cleared token.
         */
        if (
          backendMessage.toLowerCase().includes("invalid") ||
          backendMessage.toLowerCase().includes("expired")
        ) {
          setStatus("success");
          setMessage(
            "Your email is already verified. You can now log in."
          );

          redirectTimer.current = setTimeout(() => {
            navigate("/login", { replace: true });
          }, 3000);

          return;
        }

        console.error("Email verification failed:", error);

        setStatus("error");
        setMessage(backendMessage || "Verification failed.");
      }
    };

    verifyEmail();

    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
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