import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true
    },
    razorpayOrderId: {
      type: String,
      required: true
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true
    },
    razorpaySignature: {
      type: String
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    email: {
      type: String
    },
    contact: {
      type: String
    },
    idempotencyKey: {
      type: String,
      index: true,
      unique: true,
      sparse: true
    },
    refund: [
      {
        refundId: String,
        amount: Number,
        status: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    raw: {
      type: Object
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
