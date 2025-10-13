import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
  logger.error(err);

  const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
  const message = typeof err?.message === "string" ? err.message : "Internal Server Error";
  const errors = Array.isArray(err?.errors) ? err.errors : [];

  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

export default errorMiddleware;
