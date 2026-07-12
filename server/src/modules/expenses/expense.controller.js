import pool from "../../config/db.js";

export const getExpenses = async (req, res, next) => {
  try {
    const { vehicle_id } = req.query;
    let query = "SELECT e.*, v.registration_no, v.vehicle_name FROM expenses e LEFT JOIN vehicles v ON e.vehicle_id = v.id";
    const params = [];
    if (vehicle_id) {
      query += " WHERE e.vehicle_id = $1";
      params.push(vehicle_id);
    }
    query += " ORDER BY e.expense_date DESC";
    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) { next(error); }
};

export const createExpense = async (req, res, next) => {
  try {
    const { vehicle_id, trip_id, category, amount, description, expense_date } = req.body;
    const result = await pool.query(
      `INSERT INTO expenses (vehicle_id, trip_id, category, amount, description, expense_date)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE)) RETURNING *`,
      [vehicle_id || null, trip_id || null, category, amount, description || null, expense_date || null]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};