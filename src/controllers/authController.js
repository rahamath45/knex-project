const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
         if(!name || !email || !password || !phone || !role){
        return res.status(400).json({
            status:"error",
             message:"those field are required "
        })
    }
     const { name, email, password,phone,role } = req.body;
      const user = await db("users").where({ email }).first();

    if (user) return res.status(400).json({ message: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);

    await db("users").insert({
      name,
      email,
      phone,
      role,
      password: hashed
    });

    res.json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db("users").where({ email }).first();

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token });

  } catch (err) {
    console.log("login",err)
    res.status(500).json({ error: err.sqlMessage });
  }
};

exports.me = async (req, res) => {
  res.json({ message: "User authenticated", user: req.user });
};
