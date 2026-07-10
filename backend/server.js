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
const userRoutes = require("./routes/userRoutes");   // NEW
const consultationRoutes = require("./routes/consultationRoutes"); // Phase 34: Doctor Module
const aiRoutes = require("./routes/aiRoutes");                     // Phase 36: AI Symptom Checker
const appointmentRoutes = require("./routes/appointmentRoutes");   // Phase 38: Appointments
const reportRoutes = require("./routes/reportRoutes");             // Phase 39: Medical Reports
const billingRoutes = require("./routes/billingRoutes");           // Phase 40: Billing/Invoices
const profileRoutes = require("./routes/profileRoutes");           // Phase 42: Profile/Password/Verification
const auditRoutes = require("./routes/auditRoutes");                // Phase 42: Audit Log

// Jobs
const startAppointmentReminderJob = require("./jobs/appointmentReminder"); // Phase 41

const app = express();

// Create HTTP Server
const server = http.createServer(app);

// Create Socket.IO Server
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://ai-hospital-health-manageme-git-0df19f-harshtyagi1704s-projects.vercel.app"
        ],
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Make io available inside controllers
app.set("io", io);

// Socket Connection
io.on("connection", (socket) => {

    console.log("✅ Client Connected:", socket.id);

    socket.on("disconnect", () => {

        console.log("❌ Client Disconnected");

    });

});

// Middleware
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://ai-hospital-health-manageme-git-0df19f-harshtyagi1704s-projects.vercel.app"
        ],
        credentials: true
    })
);
app.use(express.json());

// Serve uploaded files (medical reports, avatars)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ROUTES =================

app.use("/api/auth", authRoutes);

app.use("/api/tokens", tokenRoutes);

app.use("/api/reception", receptionRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/users", userRoutes);     // NEW

app.use("/api/consultations", consultationRoutes); // Phase 34

app.use("/api/ai", aiRoutes);                       // Phase 36

app.use("/api/appointments", appointmentRoutes);    // Phase 38

app.use("/api/reports", reportRoutes);              // Phase 39

app.use("/api/billing", billingRoutes);             // Phase 40

app.use("/api/profile", profileRoutes);             // Phase 42

app.use("/api/audit-logs", auditRoutes);            // Phase 42

// ================= MongoDB =================

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("✅ MongoDB Connected");

    // Phase 41: start background reminder job once DB is ready
    startAppointmentReminderJob();
})
.catch((err) => {
    console.log("❌ MongoDB Connection Error:", err.message);
});

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
    res.send("Hospital Management API Running...");
});

const PORT = process.env.PORT || 5000;

// ================= START SERVER =================

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
