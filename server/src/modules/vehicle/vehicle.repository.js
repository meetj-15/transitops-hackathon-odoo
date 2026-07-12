// src/modules/vehicle/vehicle.repository.js

import pool from "../../config/db.js";

// Find Vehicle by Registration Number
export const findByRegistrationNo = async (registrationNo) => {
  const result = await pool.query(
    `SELECT * FROM vehicles
     WHERE registration_no = $1`,
    [registrationNo]
  );

  return result.rows[0];
};

// Create Vehicle
export const createVehicle = async (vehicleData) => {
  const {
    registration_no,
    vehicle_name,
    model,
    vehicle_type,
    max_load_capacity,
    odometer,
    acquisition_cost,
    status,
    region,
  } = vehicleData;

  const result = await pool.query(
    `INSERT INTO vehicles
    (
      registration_no,
      vehicle_name,
      model,
      vehicle_type,
      max_load_capacity,
      odometer,
      acquisition_cost,
      status,
      region
    )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`,
    [
      registration_no,
      vehicle_name,
      model,
      vehicle_type,
      max_load_capacity,
      odometer,
      acquisition_cost,
      status,
      region,
    ]
  );

  return result.rows[0];
};

// Get All Vehicles
export const getAllVehicles = async (filters) => {
  let query = `SELECT * FROM vehicles WHERE 1=1`;
  const values = [];
  let index = 1;

  if (filters.status) {
    query += ` AND status = $${index++}`;
    values.push(filters.status);
  }

  if (filters.vehicle_type) {
    query += ` AND vehicle_type = $${index++}`;
    values.push(filters.vehicle_type);
  }

  if (filters.region) {
    query += ` AND region = $${index++}`;
    values.push(filters.region);
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, values);

  return result.rows;
};

// Get Vehicle By ID
export const getVehicleById = async (id) => {
  const result = await pool.query(
    `SELECT *
     FROM vehicles
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

// Update Vehicle
export const updateVehicle = async (id, vehicleData) => {
  const {
    registration_no,
    vehicle_name,
    model,
    vehicle_type,
    max_load_capacity,
    odometer,
    acquisition_cost,
    region,
  } = vehicleData;

  const result = await pool.query(
    `UPDATE vehicles
     SET
      registration_no = $1,
      vehicle_name = $2,
      model = $3,
      vehicle_type = $4,
      max_load_capacity = $5,
      odometer = $6,
      acquisition_cost = $7,
      region = $8,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $9
     RETURNING *`,
    [
      registration_no,
      vehicle_name,
      model,
      vehicle_type,
      max_load_capacity,
      odometer,
      acquisition_cost,
      region,
      id,
    ]
  );

  return result.rows[0];
};

// Delete Vehicle
export const deleteVehicle = async (id) => {
  await pool.query(
    `DELETE FROM vehicles
     WHERE id = $1`,
    [id]
  );
};