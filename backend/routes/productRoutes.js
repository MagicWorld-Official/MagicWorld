import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  deleteProduct,
  updateProduct
} from "../controllers/productController.js";

import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* 🌍 PUBLIC ROUTES */
router.get("/", getProducts);
router.get("/:slug", getProduct);

/* 🔐 ADMIN ROUTES */
router.post("/", adminAuth, createProduct);
router.put("/:slug", adminAuth, updateProduct);
router.delete("/:slug", adminAuth, deleteProduct);

export default router;
