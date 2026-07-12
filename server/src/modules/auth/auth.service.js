import bcrypt from "bcrypt";
import * as repo from "./auth.repository.js";
import { generateToken } from "../../utils/jwt.js";

export const register = async ({ name, email, password, role }) => {
  const existingUser = await repo.findByEmail(email);

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await repo.createUser({
    name,
    email,
    password: hashedPassword,
    role,
  });

  return user;
};

export const login = async ({ email, password }) => {
  const user = await repo.findByEmail(email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getMe = async (id) => {
  const user = await repo.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};