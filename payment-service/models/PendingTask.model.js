import mongoose from "mongoose";

const pendingTaskSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["ORDER_UPDATE", "REFUND_UPDATE"],
      required: true
    },
    payload: {
      type: Object,
      required: true
    },
    retries: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["pending", "processing", "failed", "completed"],
      default: "pending"
    },
    lastError: String
  },
  {
    timestamps: true
  }
);

const PendingTask = mongoose.model("PendingTask", pendingTaskSchema);

export default PendingTask;
