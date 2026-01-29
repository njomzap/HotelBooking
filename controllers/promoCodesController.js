const db = require("../db");

const normalizeRow = (row) => ({
  id: row.id,
  code: row.code,
  discount_type: row.discount_type,
  discount_value: Number(row.discount_value),
  start_date: row.start_date,
  end_date: row.end_date,
  usage_limit: row.usage_limit,
  usage_count: row.usage_count,
  active: Boolean(row.active),
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const validatePayload = ({
  code,
  discount_type,
  discount_value,
  start_date,
  end_date,
  usage_limit,
}) => {
  if (!code || typeof code !== "string") {
    throw new Error("Code is required");
  }

  if (!["percentage", "fixed"].includes(discount_type)) {
    throw new Error("discount_type must be 'percentage' or 'fixed'");
  }

  const valueNumber = Number(discount_value);
  if (Number.isNaN(valueNumber) || valueNumber <= 0) {
    throw new Error("discount_value must be a positive number");
  }

  if (discount_type === "percentage" && valueNumber > 100) {
    throw new Error("Percentage discount cannot exceed 100");
  }

  if (!start_date || !end_date) {
    throw new Error("start_date and end_date are required");
  }

  const start = new Date(start_date);
  const end = new Date(end_date);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Invalid date format");
  }

  if (start > end) {
    throw new Error("start_date must be before end_date");
  }

  if (usage_limit !== null && usage_limit !== undefined) {
    const limitNumber = Number(usage_limit);
    if (!Number.isInteger(limitNumber) || limitNumber <= 0) {
      throw new Error("usage_limit must be a positive integer or null");
    }
  }
};

exports.getAllPromoCodes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM promo_codes ORDER BY created_at DESC");
    res.json(rows.map(normalizeRow));
  } catch (err) {
    console.error("GET PROMO CODES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch promo codes" });
  }
};

exports.getPromoCodeById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM promo_codes WHERE id = ?", [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    res.json(normalizeRow(rows[0]));
  } catch (err) {
    console.error("GET PROMO CODE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch promo code" });
  }
};

exports.createPromoCode = async (req, res) => {
  try {
    validatePayload(req.body);

    const {
      code,
      discount_type,
      discount_value,
      start_date,
      end_date,
      usage_limit = null,
      active = true,
    } = req.body;

    await db.query(
      `INSERT INTO promo_codes
       (code, discount_type, discount_value, start_date, end_date, usage_limit, usage_count, active)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)` ,
      [code.trim(), discount_type, discount_value, start_date, end_date, usage_limit, active ? 1 : 0]
    );

    res.status(201).json({ message: "Promo code created" });
  } catch (err) {
    console.error("CREATE PROMO CODE ERROR:", err);
    res.status(400).json({ message: err.message || "Failed to create promo code" });
  }
};

exports.updatePromoCode = async (req, res) => {
  try {
    validatePayload(req.body);

    const {
      code,
      discount_type,
      discount_value,
      start_date,
      end_date,
      usage_limit = null,
      active = true,
    } = req.body;

    const [result] = await db.query(
      `UPDATE promo_codes
       SET code = ?, discount_type = ?, discount_value = ?, start_date = ?, end_date = ?,
           usage_limit = ?, active = ?
       WHERE id = ?`,
      [code.trim(), discount_type, discount_value, start_date, end_date, usage_limit, active ? 1 : 0, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    res.json({ message: "Promo code updated" });
  } catch (err) {
    console.error("UPDATE PROMO CODE ERROR:", err);
    res.status(400).json({ message: err.message || "Failed to update promo code" });
  }
};

exports.deletePromoCode = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM promo_codes WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    res.json({ message: "Promo code deleted" });
  } catch (err) {
    console.error("DELETE PROMO CODE ERROR:", err);
    res.status(500).json({ message: "Failed to delete promo code" });
  }
};

const computeDiscount = (promo, subtotal) => {
  if (!subtotal || subtotal <= 0) return 0;
  if (promo.discount_type === "percentage") {
    return Number(((promo.discount_value / 100) * subtotal).toFixed(2));
  }
  return Math.min(subtotal, Number(promo.discount_value));
};

exports.applyPromoCode = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Promo code is required" });
    }

    const [rows] = await db.query("SELECT * FROM promo_codes WHERE code = ?", [code.trim()]);
    if (!rows.length) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    const promo = normalizeRow(rows[0]);
    const today = new Date();
    if (today < new Date(promo.start_date) || today > new Date(promo.end_date)) {
      return res.status(400).json({ message: "Promo code is not active" });
    }

    if (!promo.active) {
      return res.status(400).json({ message: "Promo code is disabled" });
    }

    if (
      promo.usage_limit !== null &&
      promo.usage_count >= promo.usage_limit
    ) {
      return res.status(400).json({ message: "Promo code usage limit reached" });
    }

    const discount_amount = computeDiscount(promo, Number(subtotal || 0));

    res.json({
      promo,
      discount_amount,
    });
  } catch (err) {
    console.error("APPLY PROMO CODE ERROR:", err);
    res.status(500).json({ message: "Failed to apply promo code" });
  }
};
