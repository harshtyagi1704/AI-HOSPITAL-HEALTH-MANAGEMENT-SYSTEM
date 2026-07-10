const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const { sendAppointmentReminderEmail } = require("../utils/email");

// ================= PHASE 41: APPOINTMENT REMINDERS =================
// Runs every 5 minutes. Finds confirmed/pending appointments scheduled for
// TODAY that haven't had a reminder sent yet, and emails the patient.
// (Kept simple/date-based rather than exact time-window math since
// appointmentDate/timeSlot are stored as strings for easy display.)

const startAppointmentReminderJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];

      const dueAppointments = await Appointment.find({
        appointmentDate: todayStr,
        status: { $in: ["pending", "confirmed"] },
        reminderSent: false,
      })
        .populate("patient", "name email")
        .populate("doctor", "name");

      for (const appt of dueAppointments) {
        if (!appt.patient?.email) continue;

        await sendAppointmentReminderEmail(
          appt.patient,
          appt,
          appt.doctor?.name || "Doctor"
        );

        appt.reminderSent = true;
        await appt.save();
      }

      if (dueAppointments.length > 0) {
        console.log(
          `⏰ Sent ${dueAppointments.length} appointment reminder(s) for ${todayStr}`
        );
      }
    } catch (error) {
      console.error("Appointment reminder job failed:", error.message);
    }
  });

  console.log("⏰ Appointment reminder job scheduled (every 5 minutes)");
};

module.exports = startAppointmentReminderJob;
