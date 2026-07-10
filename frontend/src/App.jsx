import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import socket from "./services/socket";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ReceptionDashboard from "./pages/ReceptionDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LiveQueue from "./pages/LiveQueue";
import BookToken from "./pages/BookToken";
import ManageUsers from "./pages/ManageUsers";

// Phase 34 - Doctor Module
import MedicalHistory from "./pages/MedicalHistory";

// Phase 36 - AI
import SymptomChecker from "./pages/SymptomChecker";

// Phase 37 - Admin Analytics
import AdminAnalytics from "./pages/AdminAnalytics";

// Phase 38 - Appointments
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import DoctorAvailability from "./pages/DoctorAvailability";
import DoctorAppointments from "./pages/DoctorAppointments";

// Phase 39 - Medical Reports
import MedicalReports from "./pages/MedicalReports";

// Phase 40 - Billing / Invoices / Receipts
import MyInvoices from "./pages/MyInvoices";
import Receipt from "./pages/Receipt";
import AdminBilling from "./pages/AdminBilling";

// Phase 42 - Production Features
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AuditLog from "./pages/AuditLog";

function App() {

  useEffect(() => {

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };

  }, []);

  return (
    <BrowserRouter>

      <Routes>

        {/* Public Routes */}

        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Phase 42 - Public auth flows */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* Any authenticated role */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Phase 40 - Invoice receipt (patient views own, staff can view any) */}
        <Route
          path="/billing/invoice/:id"
          element={
            <ProtectedRoute>
              <Receipt />
            </ProtectedRoute>
          }
        />

        {/* Patient */}

        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-token"
          element={
            <ProtectedRoute allowedRole="patient">
              <BookToken />
            </ProtectedRoute>
          }
        />

        <Route
          path="/queue"
          element={
            <ProtectedRoute allowedRole="patient">
              <LiveQueue />
            </ProtectedRoute>
          }
        />

        {/* Phase 36 - AI Symptom Checker */}
        <Route
          path="/symptom-checker"
          element={
            <ProtectedRoute allowedRole="patient">
              <SymptomChecker />
            </ProtectedRoute>
          }
        />

        {/* Phase 35 - Patient Medical History (own) */}
        <Route
          path="/patient/history"
          element={
            <ProtectedRoute allowedRole="patient">
              <MedicalHistory />
            </ProtectedRoute>
          }
        />

        {/* Phase 38 - Appointments (Patient) */}
        <Route
          path="/appointments/book"
          element={
            <ProtectedRoute allowedRole="patient">
              <BookAppointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments/my"
          element={
            <ProtectedRoute allowedRole="patient">
              <MyAppointments />
            </ProtectedRoute>
          }
        />

        {/* Phase 39 - Medical Reports (Patient) */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRole="patient">
              <MedicalReports />
            </ProtectedRoute>
          }
        />

        {/* Phase 40 - Invoices (Patient) */}
        <Route
          path="/billing/invoices"
          element={
            <ProtectedRoute allowedRole="patient">
              <MyInvoices />
            </ProtectedRoute>
          }
        />

        {/* Doctor */}

        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Phase 34.5 - Medical History (Doctor viewing a patient) */}
        <Route
          path="/doctor/history/:patientId"
          element={
            <ProtectedRoute allowedRole="doctor">
              <MedicalHistory />
            </ProtectedRoute>
          }
        />

        {/* Phase 38 - Appointments (Doctor) */}
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/availability"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorAvailability />
            </ProtectedRoute>
          }
        />

        {/* Reception */}

        <Route
          path="/reception"
          element={
            <ProtectedRoute allowedRole="reception">
              <ReceptionDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Phase 37 - Admin Analytics */}
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Phase 40 - Billing & Revenue (Admin) */}
        <Route
          path="/admin/billing"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminBilling />
            </ProtectedRoute>
          }
        />

        {/* Phase 42 - Audit Log (Admin) */}
        <Route
          path="/admin/audit-log"
          element={
            <ProtectedRoute allowedRole="admin">
              <AuditLog />
            </ProtectedRoute>
          }
        />

        <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageUsers />
              </ProtectedRoute>
            }
        />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
