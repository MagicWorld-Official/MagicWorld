import express from "express";
import {
  getAccounts,
  getAccountBySlug,
  createAccount,
  getAccountById,
  updateAccount,
  deleteAccount,
} from "../controllers/premiumAccountController.js";

import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* 🔐 ADMIN ROUTES */
router.get("/admin/id/:id", adminAuth, getAccountById);
router.post("/admin", adminAuth, createAccount);
router.put("/admin/:id", adminAuth, updateAccount);
router.delete("/admin/:id", adminAuth, deleteAccount);

/* 🌍 PUBLIC ROUTES */
router.get("/", getAccounts);
router.get("/:slug", getAccountBySlug);

export default router;
