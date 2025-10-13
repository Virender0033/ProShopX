import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorizeRole from '../middlewares/authorizeRoles.middleware.js';
import { createOrder,getOrderById, getAllOrders, getMyOrders } from '../controllers/order.controller.js';


const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/my", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);
router.get("/", authMiddleware, authorizeRole("admin"), getAllOrders);

export default router;