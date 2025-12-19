import express from "express";
import upload from "../middleware/upload.js";
import {
  createOrder,
  getOrders,
  updatePaymentStatus,
  updateOrderStatus,
  deleteOrder,
  uploadOrder,
} from "../controllers/orderController.js";

const router = express.Router();

/* 🌍 PUBLIC ROUTES */

// CREATE TEXT-ONLY ORDER
router.post("/", createOrder);

// UPLOAD ORDER WITH SCREENSHOT
router.post("/upload", upload.single("file"), uploadOrder);

/* 🔐 ADMIN ROUTES */

// GET ALL ORDERS
router.get("/", getOrders);

// UPDATE PAYMENT STATUS
router.put("/payment/:id", updatePaymentStatus);

// UPDATE ORDER STATUS
router.put("/status/:id", updateOrderStatus);

// DELETE ORDER
router.delete("/:id", deleteOrder);

export default router;
