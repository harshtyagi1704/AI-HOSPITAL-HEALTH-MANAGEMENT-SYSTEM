const AuditLog = require("../models/AuditLog");

// ================= PHASE 42: AUDIT LOG =================
// Fire-and-forget logger — never blocks or breaks the calling request.
const logAudit = async (req, action, details = "") => {
  try {
    await AuditLog.create({
      user: req.user?.id || null,
      userName: req.body?.email || req.body?.name || "N/A",
      userRole: req.user?.role || "",
      action,
      details,
      ip: req.ip || req.headers["x-forwarded-for"] || "",
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};

module.exports = logAudit;
