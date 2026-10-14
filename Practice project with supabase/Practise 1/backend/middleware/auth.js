const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "mongodb_jwt_secret_key_123";

// Route-specific middleware: reads the "Authorization: Bearer <token>" header,
// verifies the JWT token, and attaches req.user so route handlers know who is logged in.
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

module.exports = auth;
