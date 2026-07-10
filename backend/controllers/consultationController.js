const Consultation = require("../models/Consultation");
const Token = require("../models/Token");
const User = require("../models/User");
const { createInvoiceInternal } = require("./billingController");
const logAudit = require("../utils/auditLogger");

// ================= GET PATIENT DETAILS (POPUP) =================
// Returns patient profile + current token info + last visit summary
const getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await User.findById(patientId).select("-password");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const activeToken = await Token.findOne({
      patient: patientId,
      status: { $in: ["waiting", "in-progress"] },
    }).sort({ createdAt: -1 });

    const lastConsultation = await Consultation.findOne({
      patient: patientId,
    })
      .populate("doctor", "name department")
      .sort({ visitDate: -1 });

    const totalVisits = await Consultation.countDocuments({
      patient: patientId,
    });

    res.status(200).json({
      success: true,
      patient,
      activeToken,
      lastConsultation,
      totalVisits,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= SAVE CONSULTATION =================
const saveConsultation = async (req, res) => {
  try {
    const {
      tokenId,
      patientId,
      department,
      diagnosis,
      prescription,
      doctorNotes,
      bloodPressure,
      temperature,
      consultationFee,
    } = req.body;

    if (!patientId || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: "Patient and Diagnosis are required",
      });
    }

    const fee = Number(consultationFee) > 0 ? Number(consultationFee) : 500;

    const consultation = await Consultation.create({
      token: tokenId || null,
      patient: patientId,
      doctor: req.user.id,
      department: department || "",
      diagnosis,
      prescription,
      doctorNotes,
      bloodPressure,
      temperature,
      consultationFee: fee,
    });

    // Mark token as completed if provided
    if (tokenId) {
      const token = await Token.findById(tokenId);
      if (token) {
        token.status = "completed";
        token.completedAt = new Date();
        if (!token.doctor) token.doctor = req.user.id;
        await token.save();

        const io = req.app.get("io");
        io.emit("queueUpdated");
      }
    }

    // ================= PHASE 40: AUTO-GENERATE INVOICE =================
    let invoice = null;
    try {
      invoice = await createInvoiceInternal({
        patient: patientId,
        doctor: req.user.id,
        consultation: consultation._id,
        appointment: null,
        items: [{ description: "Doctor Consultation Fee", amount: fee }],
      });
    } catch (billingError) {
      console.error("Invoice auto-creation failed:", billingError.message);
    }

    await logAudit(
      req,
      "CONSULTATION_SAVED",
      `Consultation saved for patient ${patientId}`
    );

    res.status(201).json({
      success: true,
      message: "Consultation saved successfully",
      consultation,
      invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= MEDICAL HISTORY (ALL VISITS FOR A PATIENT) =================
const getMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Patients can only view their own history
    if (req.user.role === "patient" && req.user.id !== patientId) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    const history = await Consultation.find({ patient: patientId })
      .populate("doctor", "name department")
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= MY OWN MEDICAL HISTORY (LOGGED-IN PATIENT) =================
const getMyMedicalHistory = async (req, res) => {
  try {
    const history = await Consultation.find({ patient: req.user.id })
      .populate("doctor", "name department")
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= DOCTOR ANALYTICS =================
const getDoctorAnalytics = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Today's patients = tokens called or completed by this doctor today
    // + tokens currently waiting/in-progress (department wide, unassigned queue)
    const todaysConsultations = await Consultation.find({
      doctor: doctorId,
      visitDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const completedToday = todaysConsultations.length;

    const pending = await Token.countDocuments({
      status: { $in: ["waiting", "in-progress"] },
    });

    const todaysTokens = await Token.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Average consultation time = avg(completedAt - calledAt) in minutes
    const completedTokensToday = await Token.find({
      status: "completed",
      calledAt: { $ne: null },
      completedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    let averageTime = 0;

    if (completedTokensToday.length > 0) {
      const totalMinutes = completedTokensToday.reduce((sum, t) => {
        const diffMs = new Date(t.completedAt) - new Date(t.calledAt);
        return sum + Math.max(diffMs / 60000, 0);
      }, 0);

      averageTime = Math.round(totalMinutes / completedTokensToday.length);
    }

    res.status(200).json({
      success: true,
      analytics: {
        todaysPatients: todaysTokens,
        completed: completedToday,
        averageTime, // in minutes
        pending,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getPatientDetails,
  saveConsultation,
  getMedicalHistory,
  getMyMedicalHistory,
  getDoctorAnalytics,
};
