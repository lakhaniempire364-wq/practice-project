require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const connectDB = require("./db");
const User = require("./models/User");
const Todo = require("./models/Todo");
const Note = require("./models/Note");

const logger = require("./middleware/logger");
const auth = require("./middleware/auth");
const validateTodo = require("./middleware/validateTodo");
const validateNote = require("./middleware/validateNote");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "mongodb_jwt_secret_key_123";

// Attempt initial connection on boot
connectDB().catch((err) => {
  console.error("Initial DB connection attempt:", err.message);
});

app.use(cors());
app.use(express.json());
app.use(logger);

// Middleware to ensure DB is connected before processing requests (crucial for Vercel Serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failure:", err.message);
    res.status(500).json({
      message: "Database connection failed. Please ensure MONGODB_URI is properly configured in Vercel environment variables.",
      error: err.message,
    });
  }
});

// Root health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Todo Backend API is running with MongoDB" });
});

// ----- AUTHENTICATION ROUTES -----

// POST /auth/signup - register a new user
app.post("/auth/signup", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      access_token: token,
      user: { id: user._id.toString(), email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login - log in an existing user
app.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid login credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid login credentials" });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      access_token: token,
      user: { id: user._id.toString(), email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

// GET /auth/me - get current logged-in user profile
app.get("/auth/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// ----- TODOS ROUTES -----

// CREATE - add a new todo for the logged-in user
app.post("/todos", auth, validateTodo, async (req, res, next) => {
  try {
    const todo = await Todo.create({
      text: req.body.text,
      user_id: req.user.id,
    });
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

// READ - get all todos belonging to the logged-in user
app.get("/todos", auth, async (req, res, next) => {
  try {
    const todos = await Todo.find({ user_id: req.user.id }).sort({ createdAt: 1 });
    res.json(todos);
  } catch (err) {
    next(err);
  }
});

// UPDATE - edit a todo by id (only succeeds if it belongs to logged-in user)
app.put("/todos/:id", auth, validateTodo, async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { text: req.body.text },
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// DELETE - remove a todo by id (only succeeds if it belongs to logged-in user)
app.delete("/todos/:id", auth, async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json({ message: "Todo deleted" });
  } catch (err) {
    next(err);
  }
});

// ----- NOTES ROUTES -----

// CREATE - add a new note for the logged-in user
app.post("/notes", auth, validateNote, async (req, res, next) => {
  try {
    const note = await Note.create({
      title: req.body.title,
      content: req.body.content || "",
      user_id: req.user.id,
    });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// READ - get all notes belonging to the logged-in user
app.get("/notes", auth, async (req, res, next) => {
  try {
    const notes = await Note.find({ user_id: req.user.id }).sort({ createdAt: 1 });
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

// UPDATE - edit a note by id (only succeeds if it belongs to logged-in user)
app.put("/notes/:id", auth, validateNote, async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { title: req.body.title, content: req.body.content || "" },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
  } catch (err) {
    next(err);
  }
});

// DELETE - remove a note by id (only succeeds if it belongs to logged-in user)
app.delete("/notes/:id", auth, async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json({ message: "Note deleted" });
  } catch (err) {
    next(err);
  }
});

// DEMO route - deliberately throws, so you can see errorHandler in action
app.get("/crash", () => {
  throw new Error("This is a deliberate test error");
});

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
