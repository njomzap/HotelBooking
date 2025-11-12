const mysql= require('mysql2/promise');
require('dotenv').config();
const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
    console.error("Error loading .env file:", result.error);
} else {
    console.log("Loaded .env file:", result.parsed);
}

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME || 'booking_project',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit:0


});

module.exports = pool;