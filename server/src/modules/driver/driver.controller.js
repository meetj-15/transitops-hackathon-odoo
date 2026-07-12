import * as driverService from "./driver.service.js";

export const getDrivers = async (req, res, next) => {
  try {
    const drivers = await driverService.getAllDrivers(req.query.status);
    return res.status(200).json({ success: true, data: drivers });
  } catch (error) { next(error); }
};

export const getAvailableDrivers = async (req, res, next) => {
  try {
    const drivers = await driverService.getAvailableDrivers();
    return res.status(200).json({ success: true, data: drivers });
  } catch (error) { next(error); }
};

export const createDriver = async (req, res, next) => {
  try {
    const newDriver = await driverService.createDriver(req.body);
    return res.status(201).json({ success: true, data: newDriver });
  } catch (error) { next(error); }
};