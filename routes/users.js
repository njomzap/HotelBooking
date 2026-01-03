const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require("../db");

const router = express.Router();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token mungon" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token jo valid" });
        }
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Vetëm admini ka qasje" });
    }
    next();
};

router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, name, email, birthday, role FROM users"
    );
    res.json(rows);
  } catch (err) {
    console.error("SQL ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/register", async (req, res) => {
    const { username, password, email, name, birthday } = req.body;

    try {
        const [existingUser] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Ky username ekziston" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (username, password, email, name, birthday) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, email, name, birthday]
        );

        res.status(201).json({ message: "Perdoruesi u regjistrua me sukses" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: "Ky perdorues nuk ekziston" });
        }

        const validPassword = await bcrypt.compare(password, rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: "Fjalekalim jo valid" });
        }

        const token = jwt.sign(
            {
                id: rows[0].id,
                username: rows[0].username,
                role: rows[0].role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: "Kycje e suksesshme",
            token,
            role: rows[0].role
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/me", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.query(
      "SELECT id, username, name, email, birthday, role FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/me", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { name, email, birthday } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE users SET name = ?, email = ?, birthday = ? WHERE id = ?",
      [name, email, birthday, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/change-password", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both passwords are required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(currentPassword, rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/role/:id", authenticateToken, isAdmin, async (req, res) => {
    const { role } = req.body;
    const { id } = req.params;

    if (!["user", "employee"].includes(role)) {
        return res.status(400).json({ message: "Role jo valide" });
    }

    try {
        const [result] = await pool.query(
            "UPDATE users SET role = ? WHERE id = ?",
            [role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Perdoruesi nuk u gjet" });
        }

        res.json({ message: "Roli u përditësua me sukses" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;


