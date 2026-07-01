const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ===============================
// DATABASE
// ===============================
const db = new sqlite3.Database("./user.db", (err) => {
  if (err) {
    console.error("Database Error:", err.message);
  } else {
    console.log("✅ SQLite Connected");
  }
});

// ===============================
// CREATE TABLE
// ===============================
db.run(
  `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    email TEXT NOT NULL,
    dob TEXT NOT NULL,
    mobile TEXT NOT NULL,
    gender TEXT NOT NULL
)
`,
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("✅ Users table ready");
    }
  }
);

// ===============================
// TEST ROUTES
// ===============================
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.get("/test", (req, res) => {
  res.send("Test route works!");
});

// ===============================
// SAVE USER
// ===============================
app.post("/users", (req, res) => {
  console.log("Received Data:", req.body);

  const { fullname, email, dob, mobile, gender } = req.body;

  db.run(
    `INSERT INTO users(fullname,email,dob,mobile,gender)
         VALUES(?,?,?,?,?)`,
    [fullname, email, dob, mobile, gender],
    function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "User Saved Successfully",
        id: this.lastID,
      });
    }
  );
});

// ===============================
// GET ALL USERS
// ===============================
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    res.json(rows);
  });
});

// ===============================
// UPDATE USER (EDIT)
// ===============================
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { fullname, email, dob, mobile, gender } = req.body;

  if (!fullname || !email || !dob || !mobile || !gender) {
    return res.status(400).json({
      success: false,
      error: "All fields are required.",
    });
  }

  db.run(
    `UPDATE users
     SET fullname = ?, email = ?, dob = ?, mobile = ?, gender = ?
     WHERE id = ?`,
    [fullname, email, dob, mobile, gender, id],
    function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: "User not found.",
        });
      }

      res.json({
        success: true,
        message: "User updated successfully",
      });
    }
  );
});

// ===============================
// DELETE USER
// ===============================
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  });
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
