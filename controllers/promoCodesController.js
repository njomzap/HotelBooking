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
  hotel_id: row.hotel_id,
  hotel_name: row.hotel_name || null,
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
  hotel_id,
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

  if (hotel_id !== null && hotel_id !== undefined && hotel_id !== "") {
    const parsedHotelId = Number(hotel_id);
    if (Number.isNaN(parsedHotelId) || parsedHotelId <= 0) {
      throw new Error("hotel_id must be a positive number or null");
    }
  }
};

const ensureHotelExists = async (hotelId) => {
  if (hotelId === null || hotelId === undefined) {
    return null;
  }

  const numericId = Number(hotelId);
  if (Number.isNaN(numericId)) {
    throw new Error("Invalid hotel_id");
  }

  const [rows] = await db.query("SELECT id FROM hotels WHERE id = ?", [numericId]);
  if (!rows.length) {
    throw new Error("Selected hotel does not exist");
  }

  return numericId;
};

const resolveTargetHotelId = async ({ hotel_id, room_id }) => {
  if (room_id) {
    const [rooms] = await db.query("SELECT hotel_id FROM rooms WHERE id = ?", [room_id]);
    if (!rooms.length) {
      throw new Error("Room not found");
    }
    return rooms[0].hotel_id;
  }

  if (hotel_id) {
    const validatedHotelId = await ensureHotelExists(hotel_id);
    return validatedHotelId;
  }

  return null;
};

const resolveEmployeeHotelId = async (req) => {
  if (!req?.user || req.user.role !== "employee") {
    return null;
  }

  if (req.user.hotelId) {
    return Number(req.user.hotelId);
  }

  const [rows] = await db.query("SELECT hotel_id FROM users WHERE id = ?", [req.user.id]);
  return rows.length ? rows[0].hotel_id : null;
};

exports.getActivePromoCodes = async (req, res) => {
  try {
    const formattedDate = toDateString(new Date());
    const includeHotelScoped = req.query.includeHotelScoped !== "false";
    const [rows] = await db.query(
      `SELECT pc.*, h.name AS hotel_name
       FROM promo_codes pc
       LEFT JOIN hotels h ON pc.hotel_id = h.id
       WHERE active = 1
         AND start_date <= ?
         AND end_date >= ?
       ORDER BY start_date ASC`,
      [formattedDate, formattedDate]
    );

    const filteredRows = includeHotelScoped
      ? rows
      : rows.filter(row => row.hotel_id === null);

    res.json(filteredRows.map(normalizeRow));
  } catch (err) {
    console.error("GET ACTIVE PROMO CODES ERROR:", err);
    res.status(500).json({ message: "Failed to load promo codes" });
  }
};

exports.getAllPromoCodes = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pc.*, h.name AS hotel_name
       FROM promo_codes pc
       LEFT JOIN hotels h ON pc.hotel_id = h.id`
    );

    let filteredRows = rows;
    if (req.user?.role === "employee") {
      const employeeHotelId = await resolveEmployeeHotelId(req);
      if (!employeeHotelId) {
        return res.status(403).json({ message: "Employee must be assigned to a hotel" });
      }
      filteredRows = rows.filter(row => row.hotel_id === employeeHotelId);
    }

    filteredRows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(filteredRows.map(normalizeRow));
  } catch (err) {
    console.error("GET PROMO CODES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch promo codes" });
  }
};

exports.getPromoCodeById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pc.*, h.name AS hotel_name
       FROM promo_codes pc
       LEFT JOIN hotels h ON pc.hotel_id = h.id
       WHERE pc.id = ?`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    const promo = rows[0];

    if (req.user?.role === "employee") {
      const employeeHotelId = await resolveEmployeeHotelId(req);
      if (!employeeHotelId || promo.hotel_id !== employeeHotelId) {
        return res.status(403).json({ message: "You can only access promo codes for your hotel" });
      }
    }

    res.json(normalizeRow(promo));
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
      hotel_id = null,
    } = req.body;

    let normalizedHotelId;
    if (req.user?.role === "employee") {
      const employeeHotelId = await resolveEmployeeHotelId(req);
      if (!employeeHotelId) {
        return res.status(403).json({ message: "Employee must be assigned to a hotel" });
      }
      normalizedHotelId = employeeHotelId;
    } else {
      normalizedHotelId = hotel_id === "" ? null : await ensureHotelExists(hotel_id);
    }

    await db.query(
      `INSERT INTO promo_codes
       (code, discount_type, discount_value, start_date, end_date, usage_limit, usage_count, active, hotel_id)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)` ,
      [
        code.trim(),
        discount_type,
        discount_value,
        start_date,
        end_date,
        usage_limit,
        active ? 1 : 0,
        normalizedHotelId,
      ]
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
      hotel_id = null,
    } = req.body;

    let normalizedHotelId;
    if (req.user?.role === "employee") {
      const employeeHotelId = await resolveEmployeeHotelId(req);
      if (!employeeHotelId) {
        return res.status(403).json({ message: "Employee must be assigned to a hotel" });
      }

      const [existingRows] = await db.query("SELECT hotel_id FROM promo_codes WHERE id = ?", [req.params.id]);
      if (!existingRows.length) {
        return res.status(404).json({ message: "Promo code not found" });
      }

      if (existingRows[0].hotel_id !== employeeHotelId) {
        return res.status(403).json({ message: "You can only update promo codes for your hotel" });
      }

      normalizedHotelId = employeeHotelId;
    } else {
      normalizedHotelId = hotel_id === "" ? null : await ensureHotelExists(hotel_id);
    }

    const [result] = await db.query(
      `UPDATE promo_codes
       SET code = ?, discount_type = ?, discount_value = ?, start_date = ?, end_date = ?,
           usage_limit = ?, active = ?, hotel_id = ?
       WHERE id = ?`,
      [
        code.trim(),
        discount_type,
        discount_value,
        start_date,
        end_date,
        usage_limit,
        active ? 1 : 0,
        normalizedHotelId,
        req.params.id,
      ]
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
    if (req.user?.role === "employee") {
      const employeeHotelId = await resolveEmployeeHotelId(req);
      if (!employeeHotelId) {
        return res.status(403).json({ message: "Employee must be assigned to a hotel" });
      }

      const [rows] = await db.query("SELECT hotel_id FROM promo_codes WHERE id = ?", [req.params.id]);
      if (!rows.length) {
        return res.status(404).json({ message: "Promo code not found" });
      }

      if (rows[0].hotel_id !== employeeHotelId) {
        return res.status(403).json({ message: "You can only delete promo codes for your hotel" });
      }
    }

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

const toDateString = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    return value.includes("T") ? value.split("T")[0] : value;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

exports.applyPromoCode = async (req, res) => {
  try {
    // Handle both parameter names for compatibility
    const code = req.body.code || req.body.promo_code;
    const { subtotal, room_id, hotel_id } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: "Promo code is required" });
    }

    const [rows] = await db.query("SELECT * FROM promo_codes WHERE code = ?", [code.trim()]);
    if (!rows.length) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    const promo = normalizeRow(rows[0]);

    const targetHotelId = await resolveTargetHotelId({ hotel_id, room_id });
    if (promo.hotel_id && (!targetHotelId || promo.hotel_id !== targetHotelId)) {
      return res.status(400).json({ message: "This promo code applies to a different hotel" });
    }

    const todayStr = toDateString(new Date());
    const promoStart = toDateString(promo.start_date);
    const promoEnd = toDateString(promo.end_date);

    if (!promoStart || !promoEnd) {
      return res.status(400).json({ message: "Promo code has invalid activation dates" });
    }

    if (todayStr < promoStart || todayStr > promoEnd) {
      return res.status(400).json({ message: "Promo code is not active" });
    }

    if (!promo.active) {
      return res.status(400).json({ message: "Promo code is disabled" });
    }

    if (promo.usage_limit !== null && promo.usage_count >= promo.usage_limit) {
      return res.status(400).json({ message: "Promo code usage limit reached" });
    }

    const discount_amount = computeDiscount(promo, Number(subtotal || 0));

    res.json({
      promo,
      discount_amount
    });
  } catch (err) {
    console.error("APPLY PROMO CODE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
