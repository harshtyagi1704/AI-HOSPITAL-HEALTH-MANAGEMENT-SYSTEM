const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    userName: {
      type: String,
      default: "System",
    },

    userRole: {
      type: String,
      default: "",
    },

    action: {
      type: String,
      required: true, // e.g. "LOGIN", "USER_CREATED", "TOKEN_CANCELLED"
    },

    details: {
      type: String,
      default: "",
    },

    ip: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
