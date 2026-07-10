const Appointment = require("../models/Appointment");
const User = require("../models/User");

// ================= LIST DOCTORS (BY DEPARTMENT) =================
const getDoctors = async (req, res) => {
  try {
    const { department } = req.query;

    const filter = { role: "doctor" };
    if (department) filter.department = department;

    const doctors = await User.find(filter).select(
      "name department availability"
    );

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= SET DOCTOR AVAILABILITY =================
const setAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        message: "Availability must be an array",
      });
    }

    const doctor = await User.findById(req.user.id);
    doctor.availability = availability;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Availability updated",
      availability: doctor.availability,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= GET MY (DOCTOR) AVAILABILITY =================
const getMyAvailability = async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id).select("availability");

    res.status(200).json({
      success: true,
      availability: doctor.availability || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= BOOK APPOINTMENT (PATIENT) =================
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, department, appointmentDate, timeSlot, reason } =
      req.body;

    if (!doctorId || !department || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "Doctor, department, date and time slot are required",
      });
    }

    // Prevent double-booking the same doctor/date/slot
    const clash = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (clash) {
      return res.status(400).json({
        success: false,
        message: "This slot is already booked. Please choose another slot.",
      });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      department,
      appointmentDate,
      timeSlot,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Appointment requested successfully",
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= MY APPOINTMENTS (PATIENT) =================
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name department")
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= DOCTOR'S APPOINTMENTS (CALENDAR) =================
const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate("patient", "name phone email")
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= UPDATE APPOINTMENT STATUS (DOCTOR) =================
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment ${status}`,
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= CANCEL APPOINTMENT (PATIENT) =================
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled",
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getDoctors,
  setAvailability,
  getMyAvailability,
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
};
