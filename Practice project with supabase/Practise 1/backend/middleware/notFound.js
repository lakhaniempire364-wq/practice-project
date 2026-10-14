// Catch-all middleware: placed AFTER every route in server.js.
// If a request didn't match any route above it, it falls through to here.

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
}

module.exports = notFound;
