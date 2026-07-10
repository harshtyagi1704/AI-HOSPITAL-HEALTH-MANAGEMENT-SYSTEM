const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "Medical Report",
    },

    reportType: {
      type: String,
      enum: ["lab", "prescription", "scan", "other"],
      default: "lab",
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileType: {
      type: String, // pdf | image
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MedicalReport", medicalReportSchema);
