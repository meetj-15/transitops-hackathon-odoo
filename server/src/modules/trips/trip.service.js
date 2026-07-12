import pool from "../../config/db.js";
import * as repo from "./trip.repository.js";

export const getAllTrips = async (status) => {
  return await repo.findAll(status);
};

export const createTrip = async (data) => {
  const vehicle = await repo.getVehicleById(data.vehicle_id);
  if (!vehicle) throw { status: 404, code: "NOT_FOUND", message: "Vehicle not found" };
  
  if (Number(data.cargo_weight) > Number(vehicle.max_load_capacity)) {
    throw { status: 400, code: "CARGO_EXCEEDS_CAPACITY", message: `Cargo weight exceeds vehicle max capacity of ${vehicle.max_load_capacity} kg` };
  }

  const driver = await repo.getDriverById(data.driver_id);
  if (!driver) throw { status: 404, code: "NOT_FOUND", message: "Driver not found" };

  return await repo.createTrip(data);
};

export const dispatchTrip = async (tripId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const tripRes = await client.query("SELECT * FROM trips WHERE id = $1 FOR UPDATE", [tripId]);
    const trip = tripRes.rows[0];
    if (!trip) throw { status: 404, code: "NOT_FOUND", message: "Trip not found" };
    if (trip.status !== "Draft") throw { status: 400, code: "INVALID_STATUS", message: "Only Draft trips can be dispatched" };

    const vRes = await client.query("SELECT status, odometer FROM vehicles WHERE id = $1 FOR UPDATE", [trip.vehicle_id]);
    if (vRes.rows[0].status !== "Available") throw { status: 400, code: "VEHICLE_UNAVAILABLE", message: `Vehicle is currently ${vRes.rows[0].status}` };

    const dRes = await client.query("SELECT status, license_expiry FROM drivers WHERE id = $1 FOR UPDATE", [trip.driver_id]);
    const driver = dRes.rows[0];
    if (driver.status !== "Available") throw { status: 400, code: "DRIVER_UNAVAILABLE", message: `Driver is currently ${driver.status}` };
    if (new Date(driver.license_expiry) <= new Date()) throw { status: 400, code: "LICENSE_EXPIRED", message: "Driver license has expired" };

    const updatedTrip = await client.query(
      "UPDATE trips SET status = 'Dispatched', dispatch_time = NOW(), start_odometer = $1 WHERE id = $2 RETURNING *",
      [vRes.rows[0].odometer, tripId]
    );
    await client.query("UPDATE vehicles SET status = 'On Trip' WHERE id = $1", [trip.vehicle_id]);
    await client.query("UPDATE drivers SET status = 'On Trip' WHERE id = $1", [trip.driver_id]);

    await client.query("COMMIT");
    return updatedTrip.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const completeTrip = async (tripId, { actual_distance, end_odometer }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const tripRes = await client.query("SELECT * FROM trips WHERE id = $1 FOR UPDATE", [tripId]);
    const trip = tripRes.rows[0];
    if (!trip) throw { status: 404, code: "NOT_FOUND", message: "Trip not found" };
    if (trip.status !== "Dispatched") throw { status: 400, code: "INVALID_STATUS", message: "Only Dispatched trips can be completed" };

    const updatedTrip = await client.query(
      "UPDATE trips SET status = 'Completed', actual_distance = $1, end_odometer = $2, completed_time = NOW() WHERE id = $3 RETURNING *",
      [actual_distance, end_odometer, tripId]
    );

    await client.query("UPDATE vehicles SET status = 'Available', odometer = $1 WHERE id = $2", [end_odometer, trip.vehicle_id]);
    await client.query("UPDATE drivers SET status = 'Available' WHERE id = $1", [trip.driver_id]);

    await client.query("COMMIT");
    return updatedTrip.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const cancelTrip = async (tripId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const tripRes = await client.query("SELECT * FROM trips WHERE id = $1 FOR UPDATE", [tripId]);
    const trip = tripRes.rows[0];
    if (!trip) throw { status: 404, code: "NOT_FOUND", message: "Trip not found" };

    if (trip.status === "Dispatched") {
      await client.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [trip.vehicle_id]);
      await client.query("UPDATE drivers SET status = 'Available' WHERE id = $1", [trip.driver_id]);
    }

    const updated = await client.query("UPDATE trips SET status = 'Cancelled' WHERE id = $1 RETURNING *", [tripId]);
    await client.query("COMMIT");
    return updated.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};