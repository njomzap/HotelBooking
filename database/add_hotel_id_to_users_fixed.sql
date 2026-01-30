-- Step 1: Add hotel_id column first
ALTER TABLE users 
ADD COLUMN hotel_id INT NULL;

-- Step 2: Add foreign key constraint
ALTER TABLE users 
ADD CONSTRAINT fk_users_hotel_id 
FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;

-- Step 3: Add index for better performance
CREATE INDEX idx_users_hotel_id ON users(hotel_id);

-- Optional: Set default hotel for existing users (uncomment if needed)
-- UPDATE users SET hotel_id = 1 WHERE hotel_id IS NULL;
