const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logAudit = require("../utils/auditLogger");

// ================= REGISTER USER =================
const registerUser = async (req, res) => {
    try {

        const { name, email, password, phone, role } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            department: req.body.department || ""
        });

        // Phase 42: fire off an email-verification link. This is intentionally
        // NOT awaited — sending the email can be slow or hang (e.g. blocked
        // SMTP port on the host), and we don't want that to delay or break
        // the registration response, since the account is already created
        // at this point regardless of whether the email succeeds.
        const { sendVerification } = require("./profileController");
        sendVerification(user).catch((verifyError) => {
            console.error("Verification email failed:", verifyError.message);
        });

        await logAudit(req, "USER_REGISTERED", `New ${role} registered: ${email}`);

        res.status(201).json({
            success: true,
           message:
"Registration successful. Please verify your email before logging in.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }
if (!user.isVerified) {
    return res.status(403).json({
        success: false,
        message:
            "Please verify your email before logging in. Check your inbox."
    });
}
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        await logAudit(req, "LOGIN", `${user.role} logged in: ${user.email}`);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// ================= GET USERS =================
const getAllUsers = async (req, res) => {

    try {

        // Phase 42: pagination support (backward compatible - if no page
        // param is sent, returns everything like before)
        if (!req.query.page) {
            const users = await User.find().select("-password");

            return res.status(200).json({
                success: true,
                count: users.length,
                users
            });
        }

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);

        const filter = {};
        if (req.query.role && req.query.role !== "All") filter.role = req.query.role;
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } }
            ];
        }

        const total = await User.countDocuments(filter);

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: users.length,
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// ================= CREATE USER =================
const createUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            phone,
            role,
            department
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !phone ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        const exists = await User.findOne({
            email
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = await User.create({

            name,
            email,
            password: hashedPassword,
            phone,
            role,
            department,
            // Accounts created directly by an admin are trusted and have no
            // self-registration verification link to click — without this
            // flag they would be permanently locked out at login with
            // "Please verify your email before logging in".
            isVerified: true

        });

        await logAudit(req, "USER_CREATED", `Admin created ${role} account: ${email}`);

        res.status(201).json({

            success: true,
            message: "User created successfully",
            user

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};
// ================= UPDATE USER =================
const updateUser = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            name,
            email,
            phone,
            role,
            department
        } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check duplicate email
        const existingUser = await User.findOne({
            email,
            _id: { $ne: id }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        user.name = name;
        user.email = email;
        user.phone = phone;
        user.role = role;
        user.department = department;

        await user.save();

        await logAudit(req, "USER_UPDATED", `Admin updated user: ${user.email}`);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ================= DELETE USER =================

// ================= DELETE USER =================
const deleteUser = async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,
                message: "User not found"

            });

        }

        await user.deleteOne();

        await logAudit(req, "USER_DELETED", `Admin deleted user: ${user.email}`);

        res.json({

            success: true,
            message: "User deleted successfully"

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
};