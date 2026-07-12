// src/modules/vehicle/vehicle.service.js

import * as vehicleRepository from "./vehicle.repository.js";


// Create Vehicle
export const createVehicle = async (vehicleData) => {
  // Check duplicate registration number
  const existingVehicle = await vehicleRepository.findByRegistrationNo(
    vehicleData.registration_no
  );

  if (existingVehicle) {
    throw new Error("Vehicle with this registration number already exists.");
  }

  // Default Status
  vehicleData.status = "Available";

  const vehicle = await vehicleRepository.createVehicle(vehicleData);

  return vehicle;
};


// Get All Vehicles
export const getAllVehicles = async (filters) => {
  return await vehicleRepository.getAllVehicles(filters);
};


// Get Vehicle By ID
export const getVehicleById = async (id) => {
  const vehicle = await vehicleRepository.getVehicleById(id);

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  return vehicle;
};


// Update Vehicle
export const updateVehicle = async (id, vehicleData) => {

  // Check vehicle exists
  const vehicle = await vehicleRepository.getVehicleById(id);

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  // If registration number is changing
  if (
    vehicleData.registration_no &&
    vehicleData.registration_no !== vehicle.registration_no
  ) {
    const existingVehicle =
      await vehicleRepository.findByRegistrationNo(
        vehicleData.registration_no
      );

    if (existingVehicle) {
      throw new Error(
        "Vehicle with this registration number already exists."
      );
    }
  }

  const updatedVehicle =
    await vehicleRepository.updateVehicle(id, vehicleData);

  return updatedVehicle;
};


// Delete Vehicle
export const deleteVehicle = async (id) => {

  const vehicle = await vehicleRepository.getVehicleById(id);

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  // Business Rule
  if (vehicle.status === "On Trip") {
    throw new Error(
      "Vehicle is currently on a trip and cannot be deleted."
    );
  }

  // Business Rule
  if (vehicle.status === "In Shop") {
    throw new Error(
      "Vehicle is under maintenance and cannot be deleted."
    );
  }

  await vehicleRepository.deleteVehicle(id);

  return;
};