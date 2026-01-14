const pool = require('../db');

const getLostAndFound = async (req, res) => {
  try {
    const [items] = await pool.query("SELECT * FROM lost_found");
    res.json(items);
  } catch (err) {
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
    const { item_name, description, date_found, location } = req.body;
    const [result] = await pool.query(
      "INSERT INTO lost_found (item_name, description, date_found, location) VALUES (?, ?, ?, ?)",
      [item_name, description, date_found, location]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const updateItem = async (req, res) => {
  try {
    const { item_name, description, date_found, location, claimed } = req.body;
    await pool.query(
      "UPDATE lost_found SET item_name=?, description=?, date_found=?, location=?, claimed=? WHERE id=?",
      [item_name, description, date_found, location, claimed, req.params.id]
    );
    res.json({ message: "Item updated successfully" });
  } catch (err) {
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
