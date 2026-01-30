-- Add hotel_id column to promo_codes table
ALTER TABLE promo_codes 
ADD COLUMN hotel_id INT NULL,
ADD FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_promo_codes_hotel_id ON promo_codes(hotel_id);
