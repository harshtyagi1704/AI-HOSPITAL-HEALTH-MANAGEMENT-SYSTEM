const Token = require("../models/Token");
const User = require("../models/User");
const { sendTokenGeneratedEmail, sendDoctorCalledEmail } = require("../utils/email");
const logAudit = require("../utils/auditLogger");

// ================= AI QUEUE OPTIMIZATION HELPER =================
// Lower weight = higher priority in the queue
const PRIORITY_WEIGHT = {
    emergency: 0,
    senior: 1,
    child: 2,
    normal: 3
};

const sortQueue = (tokens) => {
    return [...tokens].sort((a, b) => {
        const weightA = PRIORITY_WEIGHT[a.priority] ?? 3;
        const weightB = PRIORITY_WEIGHT[b.priority] ?? 3;

        if (weightA !== weightB) return weightA - weightB;

        // Same priority tier -> earlier token number goes first (FIFO)
        return a.tokenNumber - b.tokenNumber;
    });
};

// ================= BOOK TOKEN =================
const bookToken = async (req, res) => {
    try {
        const { department, priority } = req.body;

        if (!department) {
            return res.status(400).json({
                success: false,
                message: "Department is required"
            });
        }

        const lastToken = await Token.findOne().sort({ tokenNumber: -1 });

        let nextTokenNumber = 1;
        if (lastToken) nextTokenNumber = lastToken.tokenNumber + 1;

        // Auto-detect senior citizen / child priority from patient age
        let finalPriority = priority || "normal";

        const patient = await User.findById(req.user.id);

        if (finalPriority === "normal" && patient?.age) {
            if (patient.age >= 60) finalPriority = "senior";
            else if (patient.age <= 12) finalPriority = "child";
        }

        const token = await Token.create({
            tokenNumber: nextTokenNumber,
            patient: req.user.id,
            department,
            priority: finalPriority
        });

        const io = req.app.get("io");
        io.emit("queueUpdated");

        // Phase 41: notify patient their token has been generated
        if (patient) sendTokenGeneratedEmail(patient, token);

        await logAudit(req, "TOKEN_BOOKED", `Token #${token.tokenNumber} booked for ${department}`);

        res.status(201).json({
            success: true,
            message: "Token booked successfully",
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// ================= LIVE QUEUE (SMART SORTING / AI QUEUE OPTIMIZATION) =================
const getLiveQueue = async (req, res) => {
    try {

        const queue = await Token.find({
            status: { $in: ["waiting", "in-progress"] }
        })
        .populate("patient", "name phone")
        .populate("doctor", "name");

        const sorted = sortQueue(queue);

        res.status(200).json({
            success: true,
            count: sorted.length,
            queue: sorted
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// ================= DOCTOR QUEUE =================
const getDoctorQueue = async (req, res) => {
    try {

        const queue = await Token.find({
            status: { $in: ["waiting", "in-progress"] }
        })
        .populate("patient", "name email phone");

        const sorted = sortQueue(queue);

        res.status(200).json({
            success: true,
            count: sorted.length,
            queue: sorted
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// ================= CALL PATIENT =================
const callPatient = async (req, res) => {
    try {

        const token = await Token.findById(req.params.id);

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Token not found"
            });
        }

        token.status = "in-progress";
        token.calledAt = new Date();
        token.doctor = req.user.id;
        await token.save();

        const io = req.app.get("io");
        io.emit("queueUpdated");

        // 🔔 Notify the specific patient that the doctor has called them
        io.emit("doctorCalled", {
            patientId: token.patient.toString(),
            tokenNumber: token.tokenNumber,
            department: token.department
        });

        // Phase 41: email notification as well
        const calledPatient = await User.findById(token.patient);
        if (calledPatient) sendDoctorCalledEmail(calledPatient, token);

        await logAudit(req, "PATIENT_CALLED", `Token #${token.tokenNumber} called`);

        res.status(200).json({
            success: true,
            message: "Patient Called",
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// ================= AI WAITING TIME PREDICTION =================
const getWaitingPrediction = async (req, res) => {
    try {

        const token = await Token.findById(req.params.id);

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Token not found"
            });
        }

        const activeQueue = await Token.find({
            status: { $in: ["waiting", "in-progress"] },
            department: token.department
        });

        const sorted = sortQueue(activeQueue);
        const position = sorted.findIndex(
            (t) => t._id.toString() === token._id.toString()
        );

        const patientsAhead = position === -1 ? 0 : position;

        // Average consultation time learned from today's completed tokens
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const completedToday = await Token.find({
            status: "completed",
            calledAt: { $ne: null },
            completedAt: { $ne: null, $gte: startOfDay }
        });

        let avgConsultationTime = 7; // fallback baseline (minutes)

        if (completedToday.length > 0) {
            const totalMinutes = completedToday.reduce((sum, t) => {
                const diffMs = new Date(t.completedAt) - new Date(t.calledAt);
                return sum + Math.max(diffMs / 60000, 1);
            }, 0);

            avgConsultationTime = totalMinutes / completedToday.length;
        }

        const estimatedMinutes = Math.round(patientsAhead * avgConsultationTime);

        res.status(200).json({
            success: true,
            tokenNumber: token.tokenNumber,
            queuePosition: patientsAhead + 1,
            patientsAhead,
            avgConsultationTime: Math.round(avgConsultationTime),
            estimatedMinutes
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const getDashboardStats = async (req, res) => {
    try {

        const totalTokens = await Token.countDocuments();

        const liveQueue = await Token.countDocuments({
            status: { $in: ["waiting", "in-progress"] }
        });

        const emergency = await Token.countDocuments({
            priority: "emergency",
            status: { $in: ["waiting", "in-progress"] }
        });

        res.status(200).json({
            success: true,
            stats: {
                totalTokens,
                liveQueue,
                emergency,
                aiStatus: "Active"
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ================= MY CURRENT TOKEN (PATIENT DASHBOARD) =================
const getMyToken = async (req, res) => {
    try {

        const activeToken = await Token.findOne({
            patient: req.user.id,
            status: { $in: ["waiting", "in-progress"] }
        })
        .populate("doctor", "name department")
        .sort({ createdAt: -1 });

        if (!activeToken) {
            return res.status(200).json({
                success: true,
                hasActiveToken: false
            });
        }

        const departmentQueue = await Token.find({
            status: { $in: ["waiting", "in-progress"] },
            department: activeToken.department
        });

        const sorted = sortQueue(departmentQueue);
        const position = sorted.findIndex(
            (t) => t._id.toString() === activeToken._id.toString()
        );

        res.status(200).json({
            success: true,
            hasActiveToken: true,
            token: activeToken,
            queuePosition: position + 1,
            totalInQueue: sorted.length,
            currentDoctor: activeToken.doctor || null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const completePatient = async (req, res) => {
  try {

    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found"
      });
    }

    token.status = "completed";
    token.completedAt = new Date();
    await token.save();

    const io = req.app.get("io");
    io.emit("queueUpdated");

    res.status(200).json({
      success: true,
      message: "Patient completed",
      token
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
const cancelToken = async (req, res) => {
    try {

        const token = await Token.findById(req.params.id);

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Token not found"
            });
        }

        token.status = "cancelled";
        await token.save();

        const io = req.app.get("io");
        io.emit("queueUpdated");

        await logAudit(req, "TOKEN_CANCELLED", `Token #${token.tokenNumber} cancelled`);

        res.status(200).json({
            success: true,
            message: "Token cancelled",
            token
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
// ================= EXPORTS =================
module.exports = {
    bookToken,
    getLiveQueue,
    getDoctorQueue,
    callPatient,
    getWaitingPrediction,
    getDashboardStats,
    getMyToken,
    completePatient,
    cancelToken
};
