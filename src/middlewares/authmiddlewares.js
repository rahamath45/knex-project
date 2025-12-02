// middlewares/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../config/db');

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db('users').where('id', payload.id).first();
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

