import Product from "../models/Product.js";

// Validate features structure so admin doesn't break UI
function sanitizeFeatures(raw = {}) {
  const clean = {};

  for (const key of Object.keys(raw)) {
    const sections = Array.isArray(raw[key]) ? raw[key] : [];

    clean[key] = sections.map(section => ({
      title: String(section.title || ""),
      items: Array.isArray(section.items)
        ? section.items.map(i => String(i))
        : []
    }));
  }

  return clean;
}

/* 🌍 Public: Get all products */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find(
      {},
      "name slug desc prices featuresEnabled featuresData statusEnabled statusLabel image"
    ).sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch {
    res.status(500).json({ success: false, message: "Cannot fetch products" });
  }
};

/* 🌍 Public: Get single product (FIXED) */
export const getProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    // ⬅️ IMPORTANT CHANGE: return FULL product
    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch {
    res.status(500).json({ success: false, message: "Cannot fetch product" });
  }
};

/* 🔐 Admin: Create product */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      desc,
      image,
      version,
      size,
      updated,
      category,
      statusEnabled,
      statusLabel,
      prices,
      downloadLink,
      featuresEnabled,
      featuresData,
    } = req.body;

    const product = new Product({
      name,
      slug,
      desc,
      image,
      version,
      size,
      updated,
      category,

      /* ✅ NEW STATUS FIELDS */
      statusEnabled: Boolean(statusEnabled),
      statusLabel: statusLabel || "",

      prices: {
        day: prices?.day || 0,
        week: prices?.week || 0,
      },

      downloadLink: downloadLink || "",
      featuresEnabled: Boolean(featuresEnabled),
      featuresData: sanitizeFeatures(featuresData),
    });

    await product.save();

    res.json({ success: true, product });
  } catch {
    res.status(400).json({ success: false, message: "Cannot add product" });
  }
};

/* 🔐 Admin: Update product */
export const updateProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    const {
      name,
      desc,
      image,
      version,
      size,
      updated,
      category,
      statusEnabled,
      statusLabel,
      prices,
      downloadLink,
      featuresEnabled,
      featuresData,
    } = req.body;

    const updatedProduct = await Product.findOneAndUpdate(
      { slug },
      {
        name,
        desc,
        image,
        version,
        size,
        updated,
        category,

        /* ✅ NEW STATUS FIELDS */
        statusEnabled: Boolean(statusEnabled),
        statusLabel: statusLabel || "",

        prices: {
          day: prices?.day || 0,
          week: prices?.week || 0,
        },

        downloadLink: downloadLink || "",
        featuresEnabled: Boolean(featuresEnabled),
        featuresData: sanitizeFeatures(featuresData),
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product: updatedProduct });
  } catch {
    res.status(500).json({ success: false, message: "Error updating product" });
  }
};

/* 🔐 Admin: Delete product */
export const deleteProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    const deleted = await Product.findOneAndDelete({ slug });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
};
