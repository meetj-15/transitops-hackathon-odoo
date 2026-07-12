import pool from "../../config/db.js";

export const findAll = async (status) => {
  let query = `
    SELECT t.*, v.registration_no, v.vehicle_name, d.license_no 
    FROM trips t
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    LEFT JOIN drivers d ON t.driver_id = d.id
  `;
  const params = [];
  if (status) {
    query += " WHERE t.status = $1";
    params.push(status);
  }
  query += " ORDER BY t.created_at DESC";
  const result = await pool.query(query, params);
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query("SELECT * FROM trips WHERE id = $1", [id]);
  return result.rows[0];
};

export const getVehicleById = async (id) => {
  const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [id]);
  return result.rows[0];
};

export const getDriverById = async (id) => {
  const result = await pool.query("SELECT * FROM drivers WHERE id = $1", [id]);
  return result.rows[0];
};

export const createTrip = async (data) => {
  const { vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, revenue } = data;
  const result = await pool.query(
    `INSERT INTO trips (vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, revenue, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'Draft') RETURNING *`,
    [vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, revenue]
  );
  return result.rows[0];
};