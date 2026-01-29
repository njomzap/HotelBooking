const pool = require('../db');

const getLostAndFound = async (req, res) => {
  try {
    const { hotel_id } = req.query;
    let query = `
      SELECT lf.*, u.username, u.email, u.name 
      FROM lost_found lf 
      LEFT JOIN users u ON lf.user_id = u.id
    `;
    let params = [];
    
    if (hotel_id) {
      query += " WHERE lf.hotel_id = ?";
      params = [hotel_id];
    }
    
    query += " ORDER BY lf.created_at DESC";
    
    const [items] = await pool.query(query, params);
    res.json(items);
  } catch (err) {
    console.error("Error fetching lost and found items:", err);
    res.status(500).json({ message: err.message });
  }
};


const getItemById = async (req, res) => {
  try {
    const [item] = await pool.query("SELECT * FROM lost_found WHERE id = ?", [req.params.id]);
    if (item.length === 0) return res.status(404).json({ message: "Item not found" });
    res.json(item[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const createItem = async (req, res) => {
  try {
    const { item_name, description, date_found, location, hotel_id } = req.body;
    const userId = req.user.id; // User ID is required since auth middleware is applied
    
    console.log("Creating item with user_id:", userId, "and hotel_id:", hotel_id);
    
    if (!item_name || !date_found || !location || !hotel_id) {
      return res.status(400).json({ 
        message: "Missing required fields: item_name, date_found, location, hotel_id" 
      });
    }
    
    const [result] = await pool.query(
      "INSERT INTO lost_found (item_name, description, date_found, location, hotel_id, user_id) VALUES (?, ?, ?, ?, ?, ?)",
      [item_name, description, date_found, location, hotel_id, userId]
    );
    
    console.log("Insert result:", result);
    
    // Return the created item with user information
    const [newItem] = await pool.query(
      `SELECT lf.*, u.username, u.email, u.name 
       FROM lost_found lf 
       LEFT JOIN users u ON lf.user_id = u.id 
       WHERE lf.id = ?`, 
      [result.insertId]
    );
    
    console.log("New item with user info:", newItem[0]);
    res.status(201).json(newItem[0]);
  } catch (err) {
    console.error("Error creating lost and found item:", err);
    res.status(500).json({ message: err.message });
  }
};


const updateItem = async (req, res) => {
  try {
    const { claimed } = req.body; // Only update claimed status
    const { id } = req.params;
    
    console.log("Updating item:", id, "with claimed status:", claimed);
    
    // Check if item exists first
    const [existingItem] = await pool.query("SELECT id FROM lost_found WHERE id = ?", [id]);
    if (existingItem.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    // Update only the claimed status
    await pool.query(
      "UPDATE lost_found SET claimed = ? WHERE id = ?",
      [claimed, id]
    );
    
    console.log("Update successful for item:", id);
    
    // Return updated item
    const [updatedItem] = await pool.query(
      `SELECT lf.*, u.username, u.email, u.name 
       FROM lost_found lf 
       LEFT JOIN users u ON lf.user_id = u.id 
       WHERE lf.id = ?`, 
      [id]
    );
    
    res.json(updatedItem[0]);
  } catch (err) {
    console.error("Error updating lost and found item:", err);
    res.status(500).json({ message: err.message });
  }
};


const deleteItem = async (req, res) => {
  try {
    await pool.query("DELETE FROM lost_found WHERE id=?", [req.params.id]);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getLostAndFound, getItemById, createItem, updateItem, deleteItem };
