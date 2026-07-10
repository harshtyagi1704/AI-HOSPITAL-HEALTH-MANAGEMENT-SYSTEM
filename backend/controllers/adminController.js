const User = require("../models/User");
const Token = require("../models/Token");
const Consultation = require("../models/Consultation");

const getDashboardStats = async (req, res) => {
    try {

        const totalPatients = await User.countDocuments({
            role: "patient"
        });

        const totalDoctors = await User.countDocuments({
            role: "doctor"
        });

        const totalReceptionists = await User.countDocuments({
            role: "reception"
        });

        const waitingPatients = await Token.countDocuments({
            status: "waiting"
        });

        const inProgress = await Token.countDocuments({
            status: "in-progress"
        });

        const completed = await Token.countDocuments({
            status: "completed"
        });

        res.status(200).json({
            success: true,
            stats: {
                totalPatients,
                totalDoctors,
                totalReceptionists,
                waitingPatients,
                inProgress,
                completed
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ================= DAILY PATIENTS (LAST 14 DAYS) =================
const getDailyPatients = async (req, res) => {
    try {
        const since = new Date();
        since.setDate(since.getDate() - 13);
        since.setHours(0, 0, 0, 0);

        const results = await Token.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: results.map((r) => ({ date: r._id, patients: r.count }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ================= MONTHLY PATIENTS (LAST 12 MONTHS) =================
const getMonthlyPatients = async (req, res) => {
    try {
        const since = new Date();
        since.setMonth(since.getMonth() - 11);
        since.setDate(1);
        since.setHours(0, 0, 0, 0);

        const results = await Token.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: results.map((r) => ({ month: r._id, patients: r.count }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ================= DEPARTMENT STATISTICS =================
const getDepartmentStats = async (req, res) => {
    try {
        const results = await Token.aggregate([
            {
                $group: {
                    _id: "$department",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: results.map((r) => ({
                department: r._id || "Unknown",
                patients: r.count
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ================= DOCTOR PERFORMANCE =================
const getDoctorPerformance = async (req, res) => {
    try {
        const consultations = await Consultation.find().populate(
            "doctor",
            "name department"
        );

        const map = {};

        consultations.forEach((c) => {
            if (!c.doctor) return;
            const key = c.doctor._id.toString();

            if (!map[key]) {
                map[key] = {
                    doctorId: key,
                    name: c.doctor.name,
                    department: c.doctor.department,
                    totalConsultations: 0
                };
            }

            map[key].totalConsultations += 1;
        });

        // Average consultation time per doctor (from completed tokens)
        const completedTokens = await Token.find({
            status: "completed",
            calledAt: { $ne: null },
            completedAt: { $ne: null },
            doctor: { $ne: null }
        });

        const timeMap = {};

        completedTokens.forEach((t) => {
            const key = t.doctor.toString();
            const diffMinutes =
                (new Date(t.completedAt) - new Date(t.calledAt)) / 60000;

            if (!timeMap[key]) timeMap[key] = { total: 0, count: 0 };

            timeMap[key].total += Math.max(diffMinutes, 0);
            timeMap[key].count += 1;
        });

        const performance = Object.values(map).map((doc) => ({
            ...doc,
            avgConsultationTime: timeMap[doc.doctorId]
                ? Math.round(
                      timeMap[doc.doctorId].total / timeMap[doc.doctorId].count
                  )
                : 0
        }));

        performance.sort((a, b) => b.totalConsultations - a.totalConsultations);

        res.status(200).json({
            success: true,
            data: performance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ================= QUEUE TRENDS (LAST 7 DAYS, BY STATUS) =================
const getQueueTrends = async (req, res) => {
    try {
        const since = new Date();
        since.setDate(since.getDate() - 6);
        since.setHours(0, 0, 0, 0);

        const results = await Token.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        },
                        status: "$status"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        const grouped = {};

        results.forEach((r) => {
            const date = r._id.date;
            if (!grouped[date]) {
                grouped[date] = {
                    date,
                    waiting: 0,
                    "in-progress": 0,
                    completed: 0,
                    cancelled: 0
                };
            }
            grouped[date][r._id.status] = r.count;
        });

        res.status(200).json({
            success: true,
            data: Object.values(grouped)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    getDashboardStats,
    getDailyPatients,
    getMonthlyPatients,
    getDepartmentStats,
    getDoctorPerformance,
    getQueueTrends
};