// import { useEffect, useRef, useState } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import api from "../services/api";

// function VerifyEmail() {
//   const { token } = useParams();
//   const navigate = useNavigate();

//   const [status, setStatus] = useState("verifying");
//   const [message, setMessage] = useState("");

//   const requestStarted = useRef(false);
//   const redirectTimer = useRef(null);

//   useEffect(() => {
//     if (requestStarted.current) return;
//     requestStarted.current = true;

//     const verifyEmail = async () => {
//       if (!token) {
//         setStatus("error");
//         setMessage("Verification token is missing.");
//         return;
//       }

//       try {
//         const response = await api.get(
//           `/profile/verify-email/${encodeURIComponent(token)}`
//         );

//         setStatus("success");
//         setMessage(
//           response.data?.message || "Email verified successfully."
//         );

//         redirectTimer.current = setTimeout(() => {
//           navigate("/login", { replace: true });
//         }, 3000);
//       } catch (error) {
//         const backendMessage = error.response?.data?.message || "";

//         /*
//          * React development mode or link scanners can sometimes trigger the
//          * verification endpoint more than once. If the first request already
//          * verified the account, a repeated request sees a cleared token.
//          */
//         if (
//           backendMessage.toLowerCase().includes("invalid") ||
//           backendMessage.toLowerCase().includes("expired")
//         ) {
//           setStatus("success");
//           setMessage(
//             "Your email is already verified. You can now log in."
//           );

//           redirectTimer.current = setTimeout(() => {
//             navigate("/login", { replace: true });
//           }, 3000);

//           return;
//         }

//         console.error("Email verification failed:", error);

//         setStatus("error");
//         setMessage(backendMessage || "Verification failed.");
//       }
//     };

//     verifyEmail();

//     return () => {
//       if (redirectTimer.current) {
//         clearTimeout(redirectTimer.current);
//       }
//     };
//   }, [token, navigate]);

//   return (
//     <div
//       style={{
//         width: "420px",
//         maxWidth: "90%",
//         margin: "80px auto",
//         padding: "30px",
//         textAlign: "center",
//       }}
//     >
//       <h1>Email Verification</h1>

//       {status === "verifying" && <p>Verifying your email...</p>}

//       {status === "success" && (
//         <>
//           <p>✅ {message}</p>
//           <p>Redirecting you to login...</p>
//         </>
//       )}

//       {status === "error" && <p>❌ {message}</p>}

//       <br />

//       <Link to="/login">Back to Login</Link>
//     </div>
//   );
// }

// export default VerifyEmail;



import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const storageKey = `email-verification-${token}`;

    const previousResult = sessionStorage.getItem(storageKey);

    if (previousResult === "success") {
      setStatus("success");
      setMessage("Email verified successfully. You can now log in.");

      const timer = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);

      return () => clearTimeout(timer);
    }

    if (previousResult === "pending") {
      return;
    }

    sessionStorage.setItem(storageKey, "pending");

    const verifyEmail = async () => {
      try {
        const response = await api.get(
          `/profile/verify-email/${encodeURIComponent(token)}`
        );

        sessionStorage.setItem(storageKey, "success");

        setStatus("success");
        setMessage(
          response.data?.message ||
            "Email verified successfully. You can now log in."
        );

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      } catch (error) {
        const backendMessage =
          error.response?.data?.message || "Verification failed";

        /*
         * The account may already have been verified by the first request.
         * Treat an already-used link as success.
         */
        if (
          backendMessage.toLowerCase().includes("already verified") ||
          backendMessage.toLowerCase().includes("already been used")
        ) {
          sessionStorage.setItem(storageKey, "success");

          setStatus("success");
          setMessage("Email verified successfully. You can now log in.");

          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 3000);

          return;
        }

        sessionStorage.removeItem(storageKey);

        console.error("Email verification failed:", error);

        setStatus("error");
        setMessage(backendMessage);
      }
    };

    verifyEmail();
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

      {status === "verifying" && <p>⏳ {message}</p>}

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