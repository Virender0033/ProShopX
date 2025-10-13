import Razorpay from "razorpay";
import crypto from "crypto";
import logger from "./logger.js";
import dotenv from 'dotenv';

dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const retry = async (fn, retries = 2, delayMs = 500) => {
  try {
    return await fn();
  } catch (err) {
    logger.error(`Razorpay retry error: ${err.message}`);
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, delayMs));
    return retry(fn, retries - 1, delayMs * 2);
  }
};

const createOrder = async ({ amount, currency = "INR", receipt, notes = {} }) => {
  return retry(() =>
    instance.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt,
      notes
    })
  );
};

const refundPayment = async (razorpayPaymentId, amountPaise = null) => {
  const options = { payment_id: razorpayPaymentId };
  if (amountPaise != null) options.amount = amountPaise;
  return retry(() => instance.payments.refund(options));
};

const validateWebhookSignature = (rawBodyBuffer, signature) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBodyBuffer)
    .digest("hex");

  try {
    const bufferA = Buffer.from(signature || "", "utf-8");
    const bufferB = Buffer.from(expected, "utf-8");

    if (bufferA.length !== bufferB.length) return false;
    return crypto.timingSafeEqual(bufferA, bufferB);
  } catch (err) {
    logger.error(`Webhook signature validation failed: ${err.message}`);
    return false;
  }
};

export { 
    instance,
    createOrder, 
    refundPayment, 
    validateWebhookSignature };
