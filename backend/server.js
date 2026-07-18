require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

// Routes
const authRoutes = require("./routes/authRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const receptionRoutes = require("./routes/receptionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const reportRoutes = require("./routes/reportRoutes");
const billingRoutes = require("./routes/billingRoutes");
const profileRoutes = require("./routes/profileRoutes");
const auditRoutes = require("./routes/auditRoutes");
const { razorpayWebhook } = require("./controllers/billingController");

// Jobs
const startAppointmentReminderJob = require("./jobs/appointmentReminder");

const app = express();
app.set("etag", false);
const server = http.createServer(app);

// ================= CORS CONFIGURATION =================

const allowedOrigins = [
  "http://localhost:5173",

  // Current production frontend
  "https://ai-hospital-health-management-system-c0wdznwcu.vercel.app",

  // Previous Vercel deployment
  "https://ai-hospital-health-manageme-git-0df19f-harshtyagi1704s-projects.vercel.app",
];

const isAllowedOrigin = (origin) => {
  // Allow server-to-server tools, Postman, curl, cron jobs, etc.
  if (!origin) {
    return true;
  }

  // Allow explicitly listed domains
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow Vercel preview deployments for this project/account
  try {
    const url = new URL(origin);

    if (
      url.protocol === "https:" &&
      url.hostname.endsWith(".vercel.app")
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.error("❌ CORS blocked origin:", origin);

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

// Express CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options(/.*/, cors(corsOptions));

// ================= SOCKET.IO =================

const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.error("❌ Socket.IO CORS blocked origin:", origin);

      return callback(new Error(`Socket.IO CORS blocked origin: ${origin}`));
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Make Socket.IO available inside controllers
app.set("io", io);

io.on("connection", (socket) => {
  console.log("✅ Client Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client Disconnected");
  });
});

// ================= MIDDLEWARE =================

// Razorpay webhook needs the RAW request body to verify the signature, so
// this must be registered BEFORE the global express.json() parser below.
app.post(
  "/api/billing/webhook/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

app.use(express.json());

// Serve uploaded files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ================= ROUTES =================

app.use("/api/auth", authRoutes);

app.use("/api/tokens", tokenRoutes);

app.use("/api/reception", receptionRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/users", userRoutes);

app.use("/api/consultations", consultationRoutes);

app.use("/api/ai", aiRoutes);

app.use("/api/appointments", appointmentRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/billing", billingRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/audit-logs", auditRoutes);

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  res.status(200).send("Hospital Management API Running...");
});

// ================= MONGODB =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    startAppointmentReminderJob();
  })
  .catch((error) => {
    console.error(
      "❌ MongoDB Connection Error:",
      error.message
    );
  });

// ================= ERROR HANDLER =================

app.use((error, req, res, next) => {
  if (error.message?.startsWith("CORS blocked origin")) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }

  console.error("❌ Unhandled server error:", error);

  return res.status(500).json({
    success: false,
    message: "Server Error",
  });
});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});