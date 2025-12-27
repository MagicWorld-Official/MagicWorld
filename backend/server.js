import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

import adminRoutes from "./routes/adminRoutes.js";
import adminAuth from "./middleware/adminAuth.js";

import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import premiumAccountRoutes from "./routes/premiumAccountRoutes.js";

dotenv.config();
connectDB();

const app = express();

/* CORS */
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());

/* Parsers */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Static uploads (read-only) */
app.use("/uploads", express.static("uploads"));

/* PUBLIC ROUTES */
app.use("/admin", adminRoutes);
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);
app.use("/premium-accounts", premiumAccountRoutes);

/* PROTECTED ADMIN ROUTES */
app.use("/admin/orders", adminAuth, orderRoutes);
app.use("/admin/products", adminAuth, productRoutes);
app.use("/admin/premium-accounts", adminAuth, premiumAccountRoutes);

/* Health check */
app.get("/", (req, res) => {
  res.send("MagicWorld backend is running");
});

/* Global error handler */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
