import crypto from "crypto";
import Payment from "../models/Payment.model.js"
import { createOrder as rpCreateOrder, validateWebhookSignature, refundPayment as rpRefund } from "../utils/razorpay.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import notifyOrderService from "../utils/orderService.js";
import logger from "../utils/logger.js";

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId, amount, currency = "INR", userId, idempotencyKey } = req.body;

  if (!orderId || !amount || !userId) {
    throw new ApiError(400, "OrderId, amount and userId are required");
  }

  if (idempotencyKey) {
    const existing = await Payment.findOne({ idempotencyKey });
    if (existing) {
      return res.status(200).json(new ApiResponse(200, existing, "Existing payment"));
    }
  }

  const receipt = orderId;
  const order = await rpCreateOrder({ amount, currency, receipt, notes: { orderId, userId } });

  const payment = await Payment.create({
    orderId,
    razorpayOrderId: order.id,
    amount,
    currency,
    status: "created",
    user: userId,
    idempotencyKey: idempotencyKey || undefined
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { order, payment }, "Order created successfully"));
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, "All fields are required");
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");

  const a = Buffer.from(razorpaySignature || "", "utf-8");
  const b = Buffer.from(expected, "utf-8");
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!valid) {
    throw new ApiError(400, "Invalid signature");
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    { razorpayPaymentId, razorpaySignature, status: "paid" },
    { new: true }
  );

  if (!payment) {
    throw new ApiError(404, "Payment record not found");
  }

  await notifyOrderService(payment.orderId, "paid");
  logger.info(`Payment verified for order ${payment.orderId}`);

  return res.status(200).json(new ApiResponse(200, payment, "Payment verified"));
});

const webhookHandler = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.body; 

  if (!validateWebhookSignature(rawBody, signature)) {
    logger.warn("Invalid webhook signature");
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  const event = JSON.parse(rawBody.toString());
  const { event: eventName, payload } = event;

  if (eventName === "payment.captured" || eventName === "payment.failed") {
    const entity = payload.payment.entity;
    const orderIdFromNotes = entity.notes?.orderId;

    let payment = await Payment.findOne({ razorpayPaymentId: entity.id });
    if (!payment) payment = await Payment.findOne({ razorpayOrderId: entity.order_id });

    if (!payment) {
      payment = await Payment.create({
        orderId: orderIdFromNotes || entity.order_id,
        razorpayOrderId: entity.order_id,
        razorpayPaymentId: entity.id,
        amount: ((entity.amount ?? 0) / 100),
        currency: entity.currency,
        status: eventName === "payment.captured" ? "paid" : "failed",
        user: entity.notes?.userId,
        raw: event
      });
    } else {
      payment.status = eventName === "payment.captured" ? "paid" : "failed";
      payment.raw = event;
      payment.razorpayPaymentId = entity.id;
      await payment.save();
    }

    await notifyOrderService(payment.orderId, payment.status === "paid" ? "paid" : "failed");
  }

  return res.status(200).json({ success: true });
});

const refundPayment = asyncHandler(async (req, res) => {
  const { razorpayPaymentId, amount } = req.body;

  if (!razorpayPaymentId) {
    throw new ApiError(400, "razorpayPaymentId required");
  }

  const payment = await Payment.findOne({ razorpayPaymentId });
  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  const amountPaise = amount != null ? Math.round(amount * 100) : null;
  const refund = await rpRefund(razorpayPaymentId, amountPaise);

  payment.refund = payment.refund || [];
  const refundAmountPaise = refund?.amount ?? amountPaise;
  payment.refund.push({
    refundId: refund?.id,
    amount: refundAmountPaise != null ? refundAmountPaise / 100 : undefined,
    status: refund?.status || "created"
  });

  if (refund && (refund.status === "processed" || refund.status === "completed")) {
    payment.status = "refunded";
  }

  await payment.save();
  await notifyOrderService(payment.orderId, "refunded");

  return res.status(200).json(new ApiResponse(200, refund, "Refund initiated"));
});

const getUserPayments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const payments = await Payment.find({ user: userId }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, payments, "User payments"));
});

const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, payments, "All payments"));
});

export { 
    createRazorpayOrder, 
    verifyPayment, 
    webhookHandler, 
    refundPayment, 
    getUserPayments, 
    getAllPayments };
