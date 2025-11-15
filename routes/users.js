const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require("../db");

const router = express.Router();

router.post("/register", async(req, res) => {
    const { username, password, email, name, birthday, role } = req.body; 

    try {
        const [existingUser] = await pool.query(
            'SELECT * FROM users WHERE username = ?', 
            [username]
        );
        if(existingUser.length > 0){
            return res.status(400).json({ message: "Ky username ekziston" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (username, password, email, name, birthday, role) VALUES (?, ?, ?, ?, ?, ?)', 
            [username, hashedPassword, email, name, birthday, role]
        );

        res.status(201).json({ message: "Perdoruesi u regjistrua me sukses" });

    } catch(err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/login", async(req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ?', 
            [username]
        );

        if(rows.length === 0){
            return res.status(400).json({ message: "Ky perdorues nuk ekziston" });
        }

        const validPassword = await bcrypt.compare(password, rows[0].password);
        if(!validPassword){
            return res.status(401).json({ message: "Fjalekalim jo valid" });
        }

        const token = jwt.sign(
            { id: rows[0].id, username: rows[0].username, role: rows[0].role },
            'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.json({ message: "Kycje e suksesshme", token, role: rows[0].role });

    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
