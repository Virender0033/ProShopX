import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import paymentRoutes from "./routes/payment.route.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import logger from "./utils/logger.js";

dotenv.config();

const app = express();

app.use("/api/v1/payments/webhook/razorpay", express.raw({ type: "application/json" }));

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/payments", paymentRoutes);

app.use(errorMiddleware);

const { MONGODB_URI, PORT = 5004 } = process.env;

if (!MONGODB_URI) {
  logger.error("MONGODB_URI is not set");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info("MongoDB connected");
    app.listen(PORT, () => logger.info(`Payment service running on port ${PORT}`));
  })
  .catch((err) => {
    logger.error("MongoDB connection error: " + err.message);
    process.exit(1);
  });
