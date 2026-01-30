-- Rename table in MySQL database
-- Syntax: RENAME TABLE old_name TO new_name;

-- Example: Rename lost_and_found to lost_found_items
RENAME TABLE lost_and_found TO lost_found_items;

-- Example: Rename hotels to properties  
RENAME TABLE hotels TO properties;

-- Example: Rename bookings to reservations
RENAME TABLE bookings TO reservations;

-- Example: Rename rooms to accommodations
RENAME TABLE rooms TO accommodations;

-- Example: Rename users to accounts
RENAME TABLE users TO accounts;

-- Example: Rename reviews to feedback
RENAME TABLE reviews TO feedback;

-- To rename multiple tables at once:
-- RENAME TABLE 
--   old_table1 TO new_table1,
--   old_table2 TO new_table2,
--   old_table3 TO new_table3;
