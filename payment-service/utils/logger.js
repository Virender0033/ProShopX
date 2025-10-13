import { createLogger, format, transports } from "winston";
import fs from "fs";
import path from "path";

const logsDir = path.resolve("logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize({ all: true }), format.simple())
    }),
    new transports.File({ filename: "logs/payment-error.log", level: "error" }),
    new transports.File({ filename: "logs/payment-combine.log" })
  ],
  exitOnError: false
});

export default logger;
