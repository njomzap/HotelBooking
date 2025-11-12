const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require("../db");


const router = express.Router();

router.post("/register", async(req, res) => {
    const {username, password } = req.body;

    try{
        const [existingUser] = await pool.query('select * from users where username = ?', [username]);
        if(existingUser.length > 0){
            return res.status(400).json({message: "Ky username ekziston"});
        }

        const hashedPassword = await bcrypt.hash(password,10);
        await pool.query('insert into users (username, password) values (?, ?)', [username, hashedPassword]);

        res.status(201).json({message: "Perdoruesi u regjistrua me sukses"});

    } catch(err){
        console.log(err);
        res.status(500).json({error: "Server error"});
    }
});


router.post("/login", async(req, res) => {
    const {username, password} = req.body;

    try{
        const [rows] = await pool.query('select * from users where username = ?', [username]);

        if(rows.length === 0){
            return res.status(400).json({message: "Ky perdorues nuk ekziston"});
        }

        const validPassword = await bcrypt.compare(password, rows[0].password);
        if(!validPassword){
            return res.status(401).json({message:"Fjalekalim jo valid"});
        }

        const token = jwt.sign({id: rows[0].id, username: rows[0].username},'your_jwt_secret',{expiresIn: '1h'});

        res.json({message: "Kycje e suksesshme", token});

    }
    catch(err){
        console.error(err);
        res.status(500).json({error: "Server error"});
    }
});

module.exports = router;