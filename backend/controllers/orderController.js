import mongoose from "mongoose";
import Order from "../models/Order.js";

const PAYMENT_STATUSES = ["pending", "paid", "failed"];
const ORDER_STATUSES = ["pending", "delivered", "cancelled"];

// CREATE ORDER (TEXT ONLY)
export const createOrder = async (req, res) => {
  try {
    const { productName, plan, price, email, telegram } = req.body;

    if (!productName || !price || !email) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const order = new Order({
      productName,
      plan,
      price,
      email,
      telegram,
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Cannot create order" });
  }
};

// GET ALL ORDERS (ADMIN)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Cannot fetch orders" });
  }
};

// UPDATE PAYMENT STATUS
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    if (!PAYMENT_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const updated = await Order.findByIdAndUpdate(
      id,
      { paymentStatus: status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ message: "Cannot update payment status" });
  }
};

// UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, orderStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const updateFields = {};

    if (paymentStatus) {
      if (!PAYMENT_STATUSES.includes(paymentStatus)) {
        return res.status(400).json({ message: "Invalid payment status" });
      }
      updateFields.paymentStatus = paymentStatus;
    }

    if (orderStatus) {
      if (!ORDER_STATUSES.includes(orderStatus)) {
        return res.status(400).json({ message: "Invalid order status" });
      }
      updateFields.orderStatus = orderStatus;
    }

    if (!Object.keys(updateFields).length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updated = await Order.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ message: "Cannot update order" });
  }
};

// DELETE ORDER
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Cannot delete order" });
  }
};

// CREATE ORDER WITH SCREENSHOT
export const uploadOrder = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Screenshot missing" });
    }

    const { productName, plan, price, email, telegram } = req.body;

    const order = new Order({
      productName,
      plan,
      price,
      email,
      telegram,
      paymentStatus: "pending",
      orderStatus: "pending",
      screenshot: `/uploads/${req.file.filename}`,
    });

    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Order upload failed" });
  }
};
