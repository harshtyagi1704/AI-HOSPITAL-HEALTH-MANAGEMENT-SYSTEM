import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import api from "../services/api";

const DEPARTMENTS = ["Cardiology", "Neurology", "Orthopedics", "Dermatology", "General Medicine","Pediatrics","Gynecology","ENT","Ophthalmology","Dentistry","Pulmonology","Nephrology","Urology","General Surgery","Psychiatry"];

const TIME_SLOTS = [
  "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00",
  "11:00 - 11:30", "11:30 - 12:00", "14:00 - 14:30", "14:30 - 15:00",
  "15:00 - 15:30", "15:30 - 16:00",
];

function BookAppointment() {
  const [department, setDepartment] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!department) {
        setDoctors([]);
        return;
      }
      try {
        const res = await api.get(`/appointments/doctors?department=${department}`);
        setDoctors(res.data.doctors);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDoctors();
  }, [department]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!doctorId || !date || !timeSlot) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/appointments", {
        doctorId,
        department,
        appointmentDate: date,
        timeSlot,
        reason,
      });

      toast.success("Appointment requested successfully");
      setDoctorId("");
      setDate("");
      setTimeSlot("");
      setReason("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginTop: "6px",
    marginBottom: "16px",
  };

  return (
    <Layout>
      <h2 style={{marginTop: "-15px", color: "#206a88" }}>Book an Appointment</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Choose a department, doctor, date, and time slot.
      </p>

      <div className="card" style={{ maxWidth: "560px" }}>
        <form onSubmit={handleSubmit}>
          <label>Department *</label>
          <select
            style={inputStyle}
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setDoctorId("");
            }}
            required
          >
            <option value="">Select Department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <label>Doctor *</label>
          <select
            style={inputStyle}
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            required
            disabled={!department}
          >
            <option value="">
              {department ? "Select Doctor" : "Select a department first"}
            </option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                Dr. {doc.name}
              </option>
            ))}
          </select>

          <label>Date *</label>
          <input
            type="date"
            style={inputStyle}
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label>Time Slot *</label>
          <select
            style={inputStyle}
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            required
          >
            <option value="">Select Time Slot</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>

          <label>Reason for Visit</label>
          <textarea
            style={{ ...inputStyle, minHeight: "70px" }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Briefly describe your concern (optional)"
          />

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: "#1976d2",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {submitting ? "Booking..." : "Book Appointment"}
          </button>
        </form>
      </div>

      <p style={{ marginTop: "20px" }}>
        <Link to="/appointments/my" style={{ color: "#1976d2" }}>
          View My Appointments →
        </Link>
      </p>

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "flex-end" }}>
        <LogoutButton />
      </div>
    </Layout>
  );
}

export default BookAppointment;
