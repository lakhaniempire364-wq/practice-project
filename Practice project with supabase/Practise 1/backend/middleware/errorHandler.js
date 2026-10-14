// Error-handling middleware: Express recognizes it by the 4 arguments
// (err, req, res, next).
// It must be registered LAST, after all routes.

function errorHandler(err, req, res, next) {
  console.error("Server Error:", err.message);

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: "Email already registered" });
  }

  res.status(500).json({ message: "Something went wrong on the server" });
}

module.exports = errorHandler;
