export const validateRegister = ({
  name,
  email,
  password,
  role,
}) => {
  if (!name || !email || !password || !role) {
    throw new Error("All fields are required");
  }

  if (password.length < 8) {
    throw new Error(
      "Password must be at least 8 characters"
    );
  }

  const roles = [
    "Fleet Manager",
    "Driver",
    "Safety Officer",
    "Financial Analyst",
  ];

  if (!roles.includes(role)) {
    throw new Error("Invalid role");
  }
};

export const validateLogin = ({
  email,
  password,
}) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
};