import pool from "../../config/db.js";

export const findAll = async (status) => {
  let query = "SELECT * FROM drivers";
  const params = [];
  if (status) {
    query += " WHERE status = $1";
    params.push(status);
  }
  query += " ORDER BY created_at DESC";
  const result = await pool.query(query, params);
  return result.rows;
};

export const findAvailable = async () => {
  const result = await pool.query(
    "SELECT * FROM drivers WHERE status = 'Available' AND license_expiry >= CURRENT_DATE ORDER BY id DESC"
  );
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query("SELECT * FROM drivers WHERE id = $1", [id]);
  return result.rows[0];
};

export const createDriver = async (data) => {
  const { user_id, license_no, license_category, license_expiry, phone, safety_score } = data;
  const result = await pool.query(
    `INSERT INTO drivers (user_id, license_no, license_category, license_expiry, phone, safety_score, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'Available') RETURNING *`,
    [user_id || null, license_no, license_category, license_expiry, phone || null, safety_score || 100]
  );
  return result.rows[0];
};