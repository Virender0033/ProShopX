import express from "express";
import { authMiddleware, authorizeRole } from "../middlewares/auth.middleware.js";
import {
  createRazorpayOrder,
  verifyPayment,
  webhookHandler,
  refundPayment,
  getUserPayments,
  getAllPayments
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", authMiddleware, createRazorpayOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.post("/refund", authMiddleware, refundPayment);

router.get("/history/user", authMiddleware, getUserPayments);
router.get("/history/admin", authMiddleware, authorizeRole("admin"), getAllPayments);

router.post("/webhook/razorpay", webhookHandler);

export default router;
