const nodemailer = require("nodemailer");

async function sendEmail(to, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });

    console.log("Email sent successfully!");

  } catch (err) {
    console.log("Email error:", err);
  }
}

module.exports = { sendEmail };

