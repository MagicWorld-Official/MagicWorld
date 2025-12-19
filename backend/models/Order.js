import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    plan: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    telegram: {
      type: String,
      trim: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "delivered", "cancelled"],
      default: "pending",
    },

    screenshot: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
