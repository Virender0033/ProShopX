import express from 'express';
import { 
    createProduct, 
    getAllProducts, 
    getProductById, 
    updateProduct,
    deleteProduct 
} from '../controllers/product.controller.js';
import upload from '../middleware/upload.middleware.js';
import authMiddleware from '../middleware/auth.middleware.js';
import authorizeRole from '../middleware/authorizedRole.middleware.js';

const router = express.Router();

router.post("/", authMiddleware, authorizeRole("admin"),upload.single("image"), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id",authMiddleware, authorizeRole("admin"),upload.single("image"), updateProduct);
router.delete("/:id", authMiddleware, authorizeRole("admin"), deleteProduct);

export default router;