import * as tripService from "./trip.service.js";

export const getTrips = async (req, res, next) => {
  try {
    const trips = await tripService.getAllTrips(req.query.status);
    return res.status(200).json({ success: true, data: trips });
  } catch (error) { next(error); }
};

export const createTrip = async (req, res, next) => {
  try {
    const trip = await tripService.createTrip(req.body);
    return res.status(201).json({ success: true, data: trip });
  } catch (error) { next(error); }
};

export const dispatchTrip = async (req, res, next) => {
  try {
    const trip = await tripService.dispatchTrip(req.params.id);
    return res.status(200).json({ success: true, data: trip });
  } catch (error) { next(error); }
};

export const completeTrip = async (req, res, next) => {
  try {
    const trip = await tripService.completeTrip(req.params.id, req.body);
    return res.status(200).json({ success: true, data: trip });
  } catch (error) { next(error); }
};

export const cancelTrip = async (req, res, next) => {
  try {
    const trip = await tripService.cancelTrip(req.params.id);
    return res.status(200).json({ success: true, data: trip });
  } catch (error) { next(error); }
};