import express from 'express';
import { dailyOrders,
    monthlyRevenue,
    topProducts
 } from '../controllers/analytics.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorizeRole from '../middlewares/authorizedRole.middleware.js';

const router = express.Router();

router.get("/orders/daily", authMiddleware, authorizeRole("admin"), dailyOrders);
router.get("/revenue/monthly", authMiddleware, authorizeRole("admin"), monthlyRevenue);
router.get("/top-products", authMiddleware, authorizeRole("admin"), topProducts);

export default router;

