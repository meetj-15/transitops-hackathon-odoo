import pool from "../../config/db.js";

export const getFuelLogs = async (req, res, next) => {
  try {
    const { vehicle_id } = req.query;
    let query = "SELECT f.*, v.registration_no, v.vehicle_name FROM fuel_logs f JOIN vehicles v ON f.vehicle_id = v.id";
    const params = [];
    if (vehicle_id) {
      query += " WHERE f.vehicle_id = $1";
      params.push(vehicle_id);
    }
    query += " ORDER BY f.fuel_date DESC";
    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) { next(error); }
};

export const createFuelLog = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { vehicle_id, trip_id, liters, cost, fuel_date } = req.body;
    const result = await client.query(
      `INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, fuel_date)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE)) RETURNING *`,
      [vehicle_id, trip_id || null, liters, cost, fuel_date || null]
    );
    // Also record in expenses table
    await client.query(
      `INSERT INTO expenses (vehicle_id, trip_id, category, amount, description, expense_date)
       VALUES ($1, $2, 'Fuel', $3, $4, COALESCE($5, CURRENT_DATE))`,
      [vehicle_id, trip_id || null, cost, `Fuel fill-up (${liters}L)`, fuel_date || null]
    );
    await client.query("COMMIT");
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};