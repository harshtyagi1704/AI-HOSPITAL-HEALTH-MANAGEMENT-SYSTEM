const bcrypt = require("bcrypt");
const User = require("../models/User");
const Token = require("../models/Token");
const logAudit = require("../utils/auditLogger");

// ================= REGISTER PATIENT (WALK-IN) =================
const registerPatient = async (req, res) => {
    try {

        const { name, email, password, phone, age } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and phone are required"
            });
        }

        // Check if patient already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "A patient with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new patient
        const patient = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            age: age || null,
            role: "patient"
        });

        const patientData = patient.toObject();
        delete patientData.password;

        await logAudit(
            req,
            "PATIENT_REGISTERED",
            `Reception registered walk-in patient: ${patient.email}`
        );

        res.status(201).json({
            success: true,
            message: "Patient registered successfully",
            patient: patientData
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ================= SEARCH PATIENTS =================
const searchPatients = async (req, res) => {
    try {

        const keyword = req.query.search || "";

        const filter = { role: "patient" };

        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { email: { $regex: keyword, $options: "i" } },
                { phone: { $regex: keyword, $options: "i" } }
            ];
        }

        const patients = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: patients.length,
            patients
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ================= EDIT PATIENT =================
const editPatient = async (req, res) => {
    try {

        const { id } = req.params;
        const { name, email, phone, age } = req.body;

        const patient = await User.findById(id);

        if (!patient || patient.role !== "patient") {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Check duplicate email (excluding this patient)
        if (email) {
            const existingUser = await User.findOne({
                email: email.toLowerCase(),
                _id: { $ne: id }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Another user already uses this email"
                });
            }
        }

        if (name) patient.name = name;
        if (email) patient.email = email;
        if (phone) patient.phone = phone;
        if (age !== undefined && age !== "") patient.age = age;

        await patient.save();

        const patientData = patient.toObject();
        delete patientData.password;

        await logAudit(
            req,
            "PATIENT_UPDATED",
            `Reception updated patient: ${patient.email}`
        );

        res.status(200).json({
            success: true,
            message: "Patient updated successfully",
            patient: patientData
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};
// ================= BOOK TOKEN FOR PATIENT =================
const bookTokenForPatient = async (req, res) => {
    try {

        const { patientId, department, priority } = req.body;

        if (!patientId || !department) {
            return res.status(400).json({
                success: false,
                message: "Patient and Department are required"
            });
        }

        // Check if patient exists
        const patient = await User.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Get next token number
        const lastToken = await Token.findOne().sort({ tokenNumber: -1 });

        let nextToken = 1;

        if (lastToken) {
            nextToken = lastToken.tokenNumber + 1;
        }

        // Create token
        const token = await Token.create({
            tokenNumber: nextToken,
            patient: patientId,
            department,
            priority: priority || "normal"
        });

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
// ================= TODAY'S BOOKINGS =================
const getTodayBookings = async (req, res) => {
    try {

        const bookings = await Token.find()
            .populate("patient", "name email phone")
            .sort({ tokenNumber: 1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};
module.exports = {
    registerPatient,
    searchPatients,
    editPatient,
    bookTokenForPatient,
    getTodayBookings
};