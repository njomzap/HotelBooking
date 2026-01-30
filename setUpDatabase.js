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
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        name VARCHAR(100) NOT NULL,
        birthday DATE NOT NULL,
        role ENUM('admin','employee','user') DEFAULT 'user',
        hotel_id INT NULL,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL
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

    await connection.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        hotel_id INT NULL,
        discount_type ENUM('percentage','fixed') NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        usage_limit INT NULL,
        usage_count INT DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_code_scope (code, hotel_id),
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS lost_and_found (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT,
        user_id INT,
        item_name VARCHAR(255) NOT NULL,
        description TEXT,
        date_found DATE,
        location VARCHAR(255),
        claimed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT,
        user_id INT,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
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
