// src/modules/vehicle/vehicle.validation.js

export const validateCreateVehicle = (req, res, next) => {
  const {
    registration_no,
    vehicle_name,
    vehicle_type,
    max_load_capacity,
    odometer,
    acquisition_cost,
    region,
  } = req.body;

  if (!registration_no || registration_no.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Registration number is required.",
    });
  }

  if (!vehicle_name || vehicle_name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Vehicle name is required.",
    });
  }

  if (!vehicle_type || vehicle_type.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Vehicle type is required.",
    });
  }

  if (
    max_load_capacity === undefined ||
    isNaN(max_load_capacity) ||
    Number(max_load_capacity) <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Maximum load capacity must be greater than 0.",
    });
  }

  if (
    odometer !== undefined &&
    (isNaN(odometer) || Number(odometer) < 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Odometer cannot be negative.",
    });
  }

  if (
    acquisition_cost !== undefined &&
    (isNaN(acquisition_cost) || Number(acquisition_cost) < 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Acquisition cost cannot be negative.",
    });
  }

  if (!region || region.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Region is required.",
    });
  }

  next();
};

export const validateUpdateVehicle = (req, res, next) => {
  const {
    registration_no,
    vehicle_name,
    vehicle_type,
    max_load_capacity,
    odometer,
    acquisition_cost,
    region,
  } = req.body;

  if (registration_no !== undefined && registration_no.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Registration number cannot be empty.",
    });
  }

  if (vehicle_name !== undefined && vehicle_name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Vehicle name cannot be empty.",
    });
  }

  if (vehicle_type !== undefined && vehicle_type.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Vehicle type cannot be empty.",
    });
  }

  if (
    max_load_capacity !== undefined &&
    (isNaN(max_load_capacity) || Number(max_load_capacity) <= 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Maximum load capacity must be greater than 0.",
    });
  }

  if (
    odometer !== undefined &&
    (isNaN(odometer) || Number(odometer) < 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Odometer cannot be negative.",
    });
  }

  if (
    acquisition_cost !== undefined &&
    (isNaN(acquisition_cost) || Number(acquisition_cost) < 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Acquisition cost cannot be negative.",
    });
  }

  if (region !== undefined && region.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Region cannot be empty.",
    });
  }

  next();
};