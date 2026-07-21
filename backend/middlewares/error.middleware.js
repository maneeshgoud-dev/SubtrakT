const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} →`, err.message);

    // Invalid MongoDB ObjectId (e.g. /subscriptions/not-an-id)
    if (err.name === "CastError") {
      error.message = "The requested resource could not be found. Please check the ID and try again.";
      error.statusCode = 404;
    }

    // MongoDB duplicate key (e.g. email already registered)
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "field";
      const value = err.keyValue?.[field] || "";
      error.message =
        field === "email"
          ? `An account with the email "${value}" already exists. Try signing in instead.`
          : `A record with this ${field} already exists. Please use a different value.`;
      error.statusCode = 409;
    }

    // Mongoose schema validation errors (missing required fields, enum mismatch, etc.)
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => {
        // Make minLength/maxLength messages friendlier
        if (e.kind === "minlength") return `${e.path} is too short (minimum ${e.properties.minlength} characters).`;
        if (e.kind === "maxlength") return `${e.path} is too long (maximum ${e.properties.maxlength} characters).`;
        if (e.kind === "enum")      return `"${e.value}" is not a valid option for ${e.path}.`;
        if (e.kind === "required")  return `${e.path} is required.`;
        return e.message;
      });
      error.message = messages.join(" ");
      error.statusCode = 400;
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
      error.message = "Your session is invalid. Please sign in again.";
      error.statusCode = 401;
    }
    if (err.name === "TokenExpiredError") {
      error.message = "Your session has expired. Please sign in again.";
      error.statusCode = 401;
    }

    res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message: error.message || "Something went wrong on our end. Please try again in a moment.",
      });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
