const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const RefreshTokenService = require("../services/refreshTokenService");

exports.register = async (req, res) => {
  try {
    console.log("Register body:", req.body); 

    const { username, password, email, name, birthday, role } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ message: "Username, password, and name are required" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, password, email, name, birthday, role) VALUES (?, ?, ?, ?, ?, ?)",
      [username, hashed, email || null, name, birthday || null, role || "user"]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("REGISTER ERROR:", err); 
    res.status(500).json({ message: "Failed to register user" });
  }
};




// LOGIN
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required" });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (rows.length === 0)
      return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) return res.status(401).json({ message: "Incorrect password" });

    const user = rows[0];
    
    // Generate access token (short-lived: 15 minutes)
    const accessToken = RefreshTokenService.generateAccessToken(user);
    
    // Generate refresh token (long-lived: 7 days)
    const refreshToken = RefreshTokenService.generateRefreshToken();
    
    // Save refresh token to database
    const tokenSaved = await RefreshTokenService.saveRefreshToken(user.id, refreshToken);
    
    if (!tokenSaved) {
      return res.status(500).json({ message: "Failed to save refresh token" });
    }

    // Set refresh token in httpOnly cookie (more secure than localStorage)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // Prevents CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    // Log token creation (for debugging)
    console.log('🔑 TOKENS CREATED:');
    console.log('Access Token:', accessToken.substring(0, 20) + '...');
    console.log('Refresh Token:', refreshToken.substring(0, 20) + '...');
    console.log('User:', username, 'Role:', user.role);
    console.log('---');

    res.json({ 
      accessToken, 
      role: user.role, 
      id: user.id,
      username: user.username,
      hotelId: user.hotel_id || null,
      message: "Login successful"
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query("SELECT id, username, role, hotel_id FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET ME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUsername = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username is required" });

    const [existing] = await pool.query("SELECT id FROM users WHERE username = ? AND id != ?", [username, userId]);
    if (existing.length > 0) return res.status(400).json({ message: "Username already taken" });

    await pool.query("UPDATE users SET username = ? WHERE id = ?", [username, userId]);
    res.json({ message: "Username updated successfully" });
  } catch (err) {
    console.error("UPDATE USERNAME ERROR:", err);
    res.status(500).json({ message: "Failed to update username" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Both passwords are required" });

    const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) return res.status(400).json({ message: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashed, userId]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.role, u.hotel_id, h.name AS hotel_name
       FROM users u
       LEFT JOIN hotels h ON u.hotel_id = h.id`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, hotel_id } = req.body;

    if (!role) return res.status(400).json({ message: "Role is required" });

    let hotelAssignment = null;

    if (role === "employee") {
      if (!hotel_id) {
        return res.status(400).json({ message: "Employees must be assigned to a hotel" });
      }

      const [hotelRows] = await pool.query("SELECT id FROM hotels WHERE id = ?", [hotel_id]);
      if (hotelRows.length === 0) {
        return res.status(400).json({ message: "Selected hotel does not exist" });
      }
      hotelAssignment = hotel_id;
    }

    await pool.query("UPDATE users SET role = ?, hotel_id = ? WHERE id = ?", [role, hotelAssignment, id]);

    res.json({ message: "Role updated successfully" });
  } catch (err) {
    console.error("UPDATE ROLE ERROR:", err);
    res.status(500).json({ message: "Failed to update role" });
  }
};
