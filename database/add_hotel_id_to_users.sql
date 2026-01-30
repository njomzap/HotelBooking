-- Add hotel_id column to users table
ALTER TABLE users 
ADD COLUMN hotel_id INT NULL,
ADD FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_users_hotel_id ON users(hotel_id);

-- Optional: If you want to set a default hotel for existing users
-- UPDATE users SET hotel_id = 1 WHERE hotel_id IS NULL;
