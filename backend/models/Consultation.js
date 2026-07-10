const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
      default: null,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    department: {
      type: String,
      default: "",
    },

    diagnosis: {
      type: String,
      required: true,
    },

    prescription: {
      type: String,
      default: "",
    },

    doctorNotes: {
      type: String,
      default: "",
    },

    bloodPressure: {
      type: String,
      default: "",
    },

    temperature: {
      type: String,
      default: "",
    },

    consultationFee: {
      type: Number,
      default: 500, // demo default fee, in local currency units
    },

    visitDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Consultation", consultationSchema);
