// Route-specific middleware: only attached to POST/PUT (see server.js),
// not to every request like logger.js is.
// It checks the request BEFORE the route handler runs, and can stop
// the chain early by sending a response instead of calling next().

function validateTodo(req, res, next) {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Todo text is required" });
  }

  next(); // valid - let the route handler run
}

module.exports = validateTodo;
