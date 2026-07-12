const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validateUuidParam = (paramName = "id", label = "ID") => {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!UUID_PATTERN.test(String(value ?? ""))) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ID",
          message: `Invalid ${label}.`,
        },
      });
    }

    next();
  };
};
