const mysql = require('mysql2/promise');

const connectionConfig = {
    host: "localhost",
    user: "root",
    password: "26082004"
};

async function setupDatabase(){
    try{
        console.log('Connecting to MySQL...');
    const connection = await mysql.createConnection(connectionConfig);
    console.log('Connected!');

    await connection.query('CREATE DATABASE IF NOT EXISTS booking_project');
    console.log('Database created or already exists');

    await connection.query('USE booking_project');
   
   await connection.query(`
    CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
   )
 `);
 await connection.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address VARCHAR(255),
        city VARCHAR(50)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT,
        room_number VARCHAR(20),
        price DECIMAL(10,2),
        FOREIGN KEY (hotel_id) REFERENCES hotels(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        room_id INT,
        check_in DATE,
        check_out DATE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (room_id) REFERENCES rooms(id)
      )
    `);

    console.log('Tables created successfully');

    await connection.end();
    console.log('Setup complete!');
  } catch (err) {
    console.error('Error setting up the database:', err);
  }
}

setupDatabase();
