import * as maintenanceService from "./maintenance.service.js";

export const getLogs = async (req, res, next) => {
  try {
    const logs = await maintenanceService.getAllLogs();
    return res.status(200).json({ success: true, data: logs });
  } catch (error) { next(error); }
};

export const createLog = async (req, res, next) => {
  try {
    const log = await maintenanceService.createLog(req.body);
    return res.status(201).json({ success: true, data: log });
  } catch (error) { next(error); }
};

export const closeLog = async (req, res, next) => {
  try {
    const log = await maintenanceService.closeLog(req.params.id);
    return res.status(200).json({ success: true, data: log });
  } catch (error) { next(error); }
};