// src/modules/vehicle/vehicle.controller.js

import * as vehicleService from "./vehicle.service.js";

// Create Vehicle
export const createVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Create Vehicle Error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllVehicles(req.query);

    return res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error("Get Vehicles Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Vehicle By ID
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Get Vehicle Error:", error.message);

    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Vehicle
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.updateVehicle(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Update Vehicle Error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Vehicle
export const deleteVehicle = async (req, res) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Delete Vehicle Error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};