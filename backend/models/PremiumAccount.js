import mongoose from "mongoose";

const premiumAccountSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    badges: {
      type: [String],
      default: [],
    },

    img: {
      type: String,
      required: true,
      trim: true,
    },

    gallery: {
      type: [String],
      default: [],
    },

    desc: {
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

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

premiumAccountSchema.index({ slug: 1 }, { unique: true });

export default mongoose.model("PremiumAccount", premiumAccountSchema);
