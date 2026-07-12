import pool from "../../config/db.js";
import * as repo from "./maintenance.repository.js";

export const getAllLogs = async () => {
  return await repo.findAll();
};

export const createLog = async ({ vehicle_id, maintenance_type, description, cost, start_date }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const vRes = await client.query("SELECT status FROM vehicles WHERE id = $1 FOR UPDATE", [vehicle_id]);
    if (!vRes.rows[0]) throw { status: 404, code: "NOT_FOUND", message: "Vehicle not found" };
    if (vRes.rows[0].status === "On Trip") throw { status: 400, code: "VEHICLE_ON_TRIP", message: "Cannot service a vehicle currently On Trip" };

    const logRes = await client.query(
      `INSERT INTO maintenance_logs (vehicle_id, maintenance_type, description, cost, start_date, status)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), 'Active') RETURNING *`,
      [vehicle_id, maintenance_type, description || null, cost, start_date || null]
    );

    // Rule: Change vehicle to In Shop
    await client.query("UPDATE vehicles SET status = 'In Shop' WHERE id = $1", [vehicle_id]);

    // Rule: Automatically record expense
    await client.query(
      `INSERT INTO expenses (vehicle_id, category, amount, description, expense_date)
       VALUES ($1, 'Maintenance', $2, $3, COALESCE($4, CURRENT_DATE))`,
      [vehicle_id, cost, `Maintenance: ${maintenance_type}`, start_date || null]
    );

    await client.query("COMMIT");
    return logRes.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const closeLog = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const logRes = await client.query("SELECT * FROM maintenance_logs WHERE id = $1 FOR UPDATE", [id]);
    const log = logRes.rows[0];
    if (!log) throw { status: 404, code: "NOT_FOUND", message: "Maintenance log not found" };
    if (log.status === "Completed") throw { status: 400, code: "INVALID_STATUS", message: "Log is already completed" };

    const updated = await client.query(
      "UPDATE maintenance_logs SET status = 'Completed', end_date = CURRENT_DATE WHERE id = $1 RETURNING *",
      [id]
    );

    const vRes = await client.query("SELECT status FROM vehicles WHERE id = $1", [log.vehicle_id]);
    if (vRes.rows[0].status !== "Retired") {
      await client.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [log.vehicle_id]);
    }

    await client.query("COMMIT");
    return updated.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};