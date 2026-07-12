import pool from "../../config/db.js";

export const findAll = async () => {
  const result = await pool.query(`
    SELECT m.*, v.registration_no, v.vehicle_name 
    FROM maintenance_logs m
    LEFT JOIN vehicles v ON m.vehicle_id = v.id
    ORDER BY m.created_at DESC
  `);
  return result.rows;
};