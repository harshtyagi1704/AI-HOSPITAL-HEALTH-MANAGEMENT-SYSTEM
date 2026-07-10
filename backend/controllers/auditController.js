const AuditLog = require("../models/AuditLog");

const getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);

    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.search) {
      filter.$or = [
        { userName: { $regex: req.query.search, $options: "i" } },
        { details: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const total = await AuditLog.countDocuments(filter);

    const logs = await AuditLog.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const distinctActions = await AuditLog.distinct("action");

    res.status(200).json({
      success: true,
      logs,
      distinctActions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getAuditLogs };
