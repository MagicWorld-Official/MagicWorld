import mongoose from "mongoose";
import PremiumAccount from "../models/PremiumAccount.js";

/* 🌍 Public: Get all accounts */
export const getAccounts = async (req, res) => {
  try {
    const accounts = await PremiumAccount.find().select(
      "title slug desc img type"
    );

    return res.json(Array.isArray(accounts) ? accounts : []);
  } catch (error) {
    console.error("Get accounts error:", error.message);
    return res.status(500).json([]);
  }
};

/* 🌍 Public: Get single account by slug */
export const getAccountBySlug = async (req, res) => {
  try {
    const account = await PremiumAccount.findOne(
      { slug: req.params.slug },
      "title slug desc img type gallery price"
    );

    if (!account) {
      return res.status(404).json({ success: false });
    }

    // 🔑 RETURN DIRECTLY (frontend expects raw object)
    return res.json(account);
  } catch (error) {
    console.error("Get account by slug error:", error.message);
    return res.status(500).json({ success: false });
  }
};

/* 🔐 Admin: Get account by ID */
export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid account ID" });
    }

    const account = await PremiumAccount.findById(id);
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json({ success: true, account });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

/* 🔐 Admin: Create new account */
export const createAccount = async (req, res) => {
  try {
    const {
      title,
      slug,
      desc,
      img,
      type = [],
      gallery = [],
      price,
    } = req.body;

    const account = await PremiumAccount.create({
      title,
      slug,
      desc,
      img,
      type,
      gallery,
      price,
    });

    res.status(201).json({ success: true, account });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/* 🔐 Admin: Update account */
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid account ID" });
    }

    const account = await PremiumAccount.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json({ success: true, account });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/* 🔐 Admin: Delete account */
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid account ID" });
    }

    const account = await PremiumAccount.findByIdAndDelete(id);
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};
