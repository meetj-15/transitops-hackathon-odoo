import * as repo from "./driver.repository.js";

export const getAllDrivers = async (status) => {
  return await repo.findAll(status);
};

export const getAvailableDrivers = async () => {
  return await repo.findAvailable();
};

export const createDriver = async (data) => {
  if (new Date(data.license_expiry) <= new Date()) {
    throw { status: 400, code: "LICENSE_EXPIRED", message: "Cannot register a driver with an expired license" };
  }
  try {
    return await repo.createDriver(data);
  } catch (err) {
    if (err.code === "23505") {
      throw { status: 400, code: "DUPLICATE_LICENSE", message: "License number is already registered" };
    }
    throw err;
  }
};