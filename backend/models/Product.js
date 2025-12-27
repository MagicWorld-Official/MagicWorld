import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    desc: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    version: {
      type: String,
      trim: true,
    },

    size: {
      type: String,
      trim: true,
    },

    updated: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
    },

    /* ✅ STATUS */
    statusEnabled: {
      type: Boolean,
      default: false,
    },

    statusLabel: {
      type: String,
      trim: true,
    },

    downloadLink: {
      type: String,
      default: "",
      trim: true,
    },

    prices: {
      day: { type: Number, default: 0, min: 0 },
      week: { type: Number, default: 0, min: 0 },
    },

    featuresEnabled: {
      type: Boolean,
      default: false,
    },

    featuresData: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 }, { unique: true });

export default mongoose.model("Product", productSchema);
