import axios from "axios";
import PendingTask from "../models/pendingTask.model.js";
import logger from "./logger.js";

const ORDER_BASE = process.env.ORDER_SERVICE_BASE_URL;

const notifyOrderService = async (orderId, status) => {
  try {
    await axios.patch(`${ORDER_BASE}/${orderId}/status`, { status }, { timeout: 5000 });
    logger.info(`Order-service notified: ${orderId} -> ${status}`);
  } catch (err) {
    logger.error(`Order-service notify failed for ${orderId}: ${err.message}`);
    try {
      await PendingTask.create({
        type: "ORDER_UPDATE",
        payload: { orderId, status },
        lastError: err.message
      });
    } catch (dbErr) {
      logger.error(`Failed to record pending task for ${orderId}: ${dbErr.message}`);8
    }
  }
};

export default notifyOrderService;
