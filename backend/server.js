const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ Allow frontend to send cookies
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const isProd = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd ? true : false, // ❌ must be false for localhost
      sameSite: isProd ? "none" : "lax", // lax works fine in dev
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// In prod (HTTPS), trust proxy
if (isProd) {
  app.set("trust proxy", 1);
}

// Database setup
const dbPath = path.join(__dirname, "users.db");
const port = process.env.PORT || 4000;

const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (error) => {
    if (error) {
      console.log("Error opening database:", error.message);
    } else {
      console.log("Connected to the users.db database.");
    }

    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )`,
      (err) => {
        if (err) console.log("Error creating users table:", err.message);
      }
    );

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  }
);

// ========== Routes ==========

// Register
app.post("/users", async (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, dbUser) => {
    if (err) return res.status(500).json({ error_msg: "Database error" });
    if (dbUser) return res.status(400).json({ error_msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO users (email, password) VALUES (?, ?)`,
      [email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(400).json({ error_msg: "Email already exists" });
          }
          return res.status(500).json({ error_msg: "Error creating user" });
        }
        res.status(201).json({ message: "User created successfully" });
      }
    );
  });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error_msg: "Email or password missing" });

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, dbUser) => {
    if (err) return res.status(500).json({ error_msg: "Database error" });
    if (!dbUser) return res.status(400).json({ error_msg: "Invalid Email" });

    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (!isPasswordMatched)
      return res.status(400).json({ error_msg: "Email and password didn't match" });

    // ✅ Store user in session
    req.session.user = { id: dbUser.id, email: dbUser.email };
    res.json({ message: "Login successful", user: req.session.user });
  });
});

// Dashboard (protected)
app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.json({ message: `Welcome ${req.session.user.email}` });
  } else {
    res.status(401).json({ error_msg: "Unauthorized, please log in" });
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error_msg: "Logout failed" });
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
    res.json({ message: "Logged out successfully" });
  });
});

// Root
app.get("/", (req, res) => {
  res.send("Welcome! Klickks Assignment Backend running.");
});

module.exports = app;
