const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { sendEmail } = require("../services/sendEmail");

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db("users").where({ email }).first();

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "User not found",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_AUTH_SECRET_KEY,
      { expiresIn: "15m" }
    );

    // Reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Send email
    await sendEmail(
      user.email,
      "Password Reset",
      `<p>You requested a password reset</p>
       <p>Click <a href="${resetLink}">here</a> to reset your password</p>`
    );

    res.json({
      status: "success",
      message: "Password reset link sent to email",
      token,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Password is required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_AUTH_SECRET_KEY);

    // Find user
    const user = await db("users").where({ id: decoded.id }).first();

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "User not found",
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Update MySQL user
    await db("users")
      .where({ id: decoded.id })
      .update({ password: hashed });

    res.json({
      status: "success",
      message: "Password reset successful",
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Invalid or expired token"
    });
  }
};
