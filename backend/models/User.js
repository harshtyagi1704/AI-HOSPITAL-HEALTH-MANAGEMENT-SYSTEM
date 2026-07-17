const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "reception", "admin"],
      default: "patient",
    },

    // department: {
    //   type: String,
    //   default: "",
    // },
    departments: {
  type: [String],
  default: [],
},

    age: {
      type: Number,
      default: null,
    },

    // ================= PHASE 42: PRODUCTION FEATURES =================
    avatar: {
      type: String, // /uploads/avatars/xxx.jpg
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifyToken: {
      type: String,
      default: null,
    },

    emailVerifyExpires: {
      type: Date,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    // Doctor availability (only relevant when role === "doctor")
    availability: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" },
        isAvailable: { type: Boolean, default: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);