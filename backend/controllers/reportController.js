const MedicalReport = require("../models/MedicalReport");

// ================= UPLOAD REPORT =================
const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please attach a PDF or image file",
      });
    }

    const { title, reportType, patientId } = req.body;

    // Patients upload for themselves; receptionist/doctor could upload for a patient
    const patient =
      req.user.role === "patient" ? req.user.id : patientId;

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "Patient is required",
      });
    }

    const fileType = req.file.mimetype === "application/pdf" ? "pdf" : "image";

    const report = await MedicalReport.create({
      patient,
      uploadedBy: req.user.id,
      title: title || req.file.originalname,
      reportType: reportType || "lab",
      fileName: req.file.originalname,
      filePath: `/uploads/reports/${req.file.filename}`,
      fileType,
    });

    res.status(201).json({
      success: true,
      message: "Report uploaded successfully",
      report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= MY REPORTS (PATIENT) =================
const getMyReports = async (req, res) => {
  try {
    const reports = await MedicalReport.find({
      patient: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= PATIENT REPORTS (DOCTOR VIEW) =================
const getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;

    const reports = await MedicalReport.find({
      patient: patientId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= DELETE REPORT =================
const deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (
      req.user.role === "patient" &&
      report.patient.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: "Report deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  uploadReport,
  getMyReports,
  getPatientReports,
  deleteReport,
};
