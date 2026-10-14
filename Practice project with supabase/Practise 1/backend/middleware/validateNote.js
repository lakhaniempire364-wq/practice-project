// Route-specific middleware, same idea as validateTodo.js: only attached to
// the POST/PUT /notes routes in server.js, and it runs BEFORE the route handler.
// A note needs a title; "content" is optional, so it isn't checked here.

function validateNote(req, res, next) {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Note title is required" });
  }

  next(); // valid - let the route handler run
}

module.exports = validateNote;
