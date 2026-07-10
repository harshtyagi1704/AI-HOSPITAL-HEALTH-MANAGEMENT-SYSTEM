const nodemailer = require("nodemailer");
let transporter = null;

const isConfigured = () =>
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const getTransporter = () => {
  if (!isConfigured()) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Fail fast instead of hanging for nodemailer's ~2 minute defaults
      // if the SMTP host is slow/unreachable (e.g. outbound SMTP blocked
      // by the hosting provider). Without this, a stuck connection here
      // can stall the whole request that triggered the email.
      connectionTimeout: 10000, // 10s to establish the TCP connection
      greetingTimeout: 10000,   // 10s to receive the SMTP greeting
      socketTimeout: 15000,     // 15s of socket inactivity before giving up
    });
      transporter.verify((error)=>{

    if(error){
      console.log("❌ SMTP ERROR:");
      console.log(error);
    }
    else{
      console.log("✅ SMTP SERVER READY");
    }

  });
  }

  return transporter;
};

/**
 * Send an email. Never throws — logs and resolves false on failure so a
 * notification failure never breaks the primary request (booking a token,
 * saving a consultation, etc).
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) return false;

  const t = getTransporter();

  if (!t) {
    console.log(
      `📧 [EMAIL - SMTP NOT CONFIGURED] To: ${to} | Subject: ${subject}`
    );
    return false;
  }

  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || `"AI Hospital" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
    });
    return true;
  } catch (error) {
    console.error("📧 Email send failed:", error.message);
    return false;
  }
};

// ================= NOTIFICATION TEMPLATES =================

const sendTokenGeneratedEmail = (user, token) =>
  sendEmail({
    to: user.email,
    subject: `Token #${token.tokenNumber} Generated - ${token.department}`,
    html: `
      <h2>Your Hospital Token has been generated</h2>
      <p>Hi ${user.name},</p>
      <p>Your token <b>#${token.tokenNumber}</b> for <b>${token.department}</b> has been booked successfully.</p>
      <p>Priority: <b>${token.priority}</b></p>
      <p>Please check the app for your live queue position and estimated waiting time.</p>
    `,
  });

const sendDoctorCalledEmail = (user, token) =>
  sendEmail({
    to: user.email,
    subject: `🔔 Doctor has called you - Token #${token.tokenNumber}`,
    html: `
      <h2>The doctor is ready to see you</h2>
      <p>Hi ${user.name},</p>
      <p>Please proceed to the <b>${token.department}</b> department. Your token <b>#${token.tokenNumber}</b> has been called.</p>
    `,
  });

const sendAppointmentReminderEmail = (user, appointment, doctorName) =>
  sendEmail({
    to: user.email,
    subject: `Reminder: Appointment with Dr. ${doctorName} today`,
    html: `
      <h2>Appointment Reminder</h2>
      <p>Hi ${user.name},</p>
      <p>This is a reminder for your upcoming appointment:</p>
      <ul>
        <li><b>Doctor:</b> Dr. ${doctorName}</li>
        <li><b>Department:</b> ${appointment.department}</li>
        <li><b>Date:</b> ${appointment.appointmentDate}</li>
        <li><b>Time:</b> ${appointment.timeSlot}</li>
      </ul>
      <p>Please arrive 10 minutes early.</p>
    `,
  });

const sendVerificationEmail = (user, verifyUrl) =>
  sendEmail({
    to: user.email,
    subject: "Verify your email - AI Hospital",
    html: `
      <h2>Welcome to AI Hospital, ${user.name}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });

const sendPasswordResetEmail = (user, resetUrl) =>
  sendEmail({
    to: user.email,
    subject: "Reset your password - AI Hospital",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

module.exports = {
  sendEmail,
  isConfigured,
  sendTokenGeneratedEmail,
  sendDoctorCalledEmail,
  sendAppointmentReminderEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
getTransporter().verify((error, success) => {

  if (error) {
    console.log("❌ SMTP CONNECTION FAILED");
    console.log(error);
  } else {
    console.log("✅ SMTP CONNECTION SUCCESS");
  }

});