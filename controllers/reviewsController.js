const pool = require("../db"); 

const getReviewsByHotel = async (req, res) => {
  const { hotelId } = req.params;
  try {
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
              u.id AS user_id, u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.hotel_id = ?
       ORDER BY r.created_at DESC`,
      [hotelId]
    );
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const createReview = async (req, res) => {
  const { hotel_id, rating, comment } = req.body;
  const user_id = req.user.id;

  try {
    const [result] = await pool.query(
      `INSERT INTO reviews (hotel_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
      [hotel_id, user_id, rating, comment]
    );
    res.status(201).json({ message: "Review created", reviewId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const user_id = req.user.id;

  try {
    const [review] = await pool.query(`SELECT * FROM reviews WHERE id = ?`, [id]);
    if (!review.length) return res.status(404).json({ error: "Review not found" });
    if (review[0].user_id !== user_id)
      return res.status(403).json({ error: "Not authorized" });

    await pool.query(
      `UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?`,
      [rating, comment, id]
    );

    res.json({ message: "Review updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteReview = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const user_role = req.user.role;

  try {
    const [review] = await pool.query(`SELECT * FROM reviews WHERE id = ?`, [id]);
    if (!review.length) return res.status(404).json({ error: "Review not found" });
    if (review[0].user_id !== user_id && user_role !== "admin")
      return res.status(403).json({ error: "Not authorized" });

    await pool.query(`DELETE FROM reviews WHERE id = ?`, [id]);
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getReviewsByHotel,
  createReview,
  updateReview,
  deleteReview
};
