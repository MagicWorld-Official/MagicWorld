"use client";

import { useState, useEffect } from "react";
import styles from "./addProduct.module.css";

// Types
interface Price {
  day: number;
  week: number;
}

interface FeatureSection {
  title: string;
  items: string[];
}

interface FeaturesData {
  [category: string]: FeatureSection[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in environment variables.");
}

// Get token from sessionStorage (as set in your login)
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("adminToken");
};

// Authenticated fetch with 401 handling
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token. Please log in again.");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    sessionStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
    throw new Error("Session expired. Redirecting to login...");
  }

  return response;
};

export default function AddProductPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    slug: string;
    desc: string;
    image: string;
    version: string;
    size: string;
    updated: string;
    category: string;
    type: "mods" | "games" | "";
    downloadLink: string;
    productType: "paid" | "free";
    prices: Price;
    statusEnabled: boolean;
    statusLabel: string;
    featuresEnabled: boolean;
    featuresData: FeaturesData;
  }>({
    name: "",
    slug: "",
    desc: "",
    image: "",
    version: "",
    size: "",
    updated: "",
    category: "",
    type: "",
    downloadLink: "",
    productType: "paid",
    prices: { day: 0, week: 0 },
    statusEnabled: false,
    statusLabel: "",
    featuresEnabled: false,
    featuresData: {},
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "productType") {
      const type = value as "paid" | "free";
      setForm((prev) => ({
        ...prev,
        productType: type,
        prices: type === "free" ? { day: 0, week: 0 } : prev.prices,
      }));
      return;
    }

    if (name.startsWith("prices.")) {
      const field = name.split(".")[1] as "day" | "week";
      setForm((prev) => ({
        ...prev,
        prices: { ...prev.prices, [field]: Number(value) || 0 },
      }));
      return;
    }

    if (name === "type") {
      const typeValue = value as "mods" | "games" | "";
      setForm((prev) => ({ ...prev, [name]: typeValue }));
      return;
    }

    if (name === "slug") {
      const sanitizedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setForm((prev) => ({ ...prev, slug: sanitizedSlug }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Feature builder helpers
  const updateFeatures = (updater: (prev: FeaturesData) => FeaturesData) => {
    setForm((prev) => ({ ...prev, featuresData: updater(prev.featuresData || {}) }));
  };

  const addCategory = () => {
    const name = prompt("Enter category name:");
    if (!name?.trim()) return;
    updateFeatures((prev) => ({ ...prev, [name.trim()]: [] }));
  };

  const renameCategory = (oldName: string) => {
    const newName = prompt("Rename category to:", oldName);
    if (!newName?.trim() || newName.trim() === oldName) return;
    updateFeatures((prev) => {
      const { [oldName]: sections, ...rest } = prev;
      return sections ? { ...rest, [newName.trim()]: sections } : rest;
    });
  };

  const deleteCategory = (cat: string) => {
    if (!confirm(`Delete category "${cat}" and all its content?`)) return;
    updateFeatures((prev) => {
      const { [cat]: _, ...rest } = prev;
      return rest;
    });
  };

  const addSection = (cat: string) => {
    const title = prompt("Enter section title:");
    if (!title?.trim()) return;
    updateFeatures((prev) => ({
      ...prev,
      [cat]: [...(prev[cat] || []), { title: title.trim(), items: [] }],
    }));
  };

  const renameSection = (cat: string, index: number) => {
    const current = form.featuresData?.[cat]?.[index]?.title || "";
    const newTitle = prompt("Rename section:", current);
    if (!newTitle?.trim()) return;
    updateFeatures((prev) => {
      const sections = [...(prev[cat] || [])];
      sections[index] = { ...sections[index], title: newTitle.trim() };
      return { ...prev, [cat]: sections };
    });
  };

  const deleteSection = (cat: string, index: number) => {
    if (!confirm("Delete this section and all items?")) return;
    updateFeatures((prev) => ({
      ...prev,
      [cat]: (prev[cat] || []).filter((_, i) => i !== index),
    }));
  };

  const addItem = (cat: string, secIndex: number) => {
    const text = prompt("Enter new feature item:");
    if (!text?.trim()) return;
    updateFeatures((prev) => {
      const sections = [...(prev[cat] || [])];
      sections[secIndex] = {
        ...sections[secIndex],
        items: [...sections[secIndex].items, text.trim()],
      };
      return { ...prev, [cat]: sections };
    });
  };

  const editItem = (cat: string, secIndex: number, itemIndex: number) => {
    const current = form.featuresData?.[cat]?.[secIndex]?.items[itemIndex] || "";
    const newValue = prompt("Edit item:", current);
    if (newValue === null || !newValue.trim()) return;
    updateFeatures((prev) => {
      const items = [...prev[cat][secIndex].items];
      items[itemIndex] = newValue.trim();
      const sections = [...prev[cat]];
      sections[secIndex] = { ...sections[secIndex], items };
      return { ...prev, [cat]: sections };
    });
  };

  const deleteItem = (cat: string, secIndex: number, itemIndex: number) => {
    if (!confirm("Delete this item?")) return;
    updateFeatures((prev) => {
      const items = prev[cat][secIndex].items.filter((_, i) => i !== itemIndex);
      const sections = [...prev[cat]];
      sections[secIndex] = { ...sections[secIndex], items };
      return { ...prev, [cat]: sections };
    });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (form.productType === "free") {
      form.prices = { day: 0, week: 0 };
      if (!form.downloadLink.trim()) {
        setError("Free products require a download link.");
        setLoading(false);
        return;
      }
    } else if (form.prices.day === 0 && form.prices.week === 0) {
      setError("Paid products must have at least one positive price.");
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add product");
      }

      alert("Product added successfully!");
      setForm({
        name: "",
        slug: "",
        desc: "",
        image: "",
        version: "",
        size: "",
        updated: "",
        category: "",
        type: "",
        downloadLink: "",
        productType: "paid",
        prices: { day: 0, week: 0 },
        statusEnabled: false,
        statusLabel: "",
        featuresEnabled: false,
        featuresData: {},
      });
    } catch (err: any) {
      setError(err.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className="container">
        <h1 className={styles.title}>Add New Product</h1>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Product Type */}
          <div className={styles.group}>
            <label>Product Type</label>
            <select
              name="productType"
              value={form.productType}
              onChange={handleChange}
            >
              <option value="paid">Paid</option>
              <option value="free">Free</option>
            </select>
          </div>

          {/* Type (new field) */}
          <div className={styles.group}>
            <label>Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option value="mods">Mods</option>
              <option value="games">Games</option>
            </select>
          </div>

          {/* Name */}
          <div className={styles.group}>
            <label>Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              required
            />
          </div>

          {/* Slug */}
          <div className={styles.group}>
            <label>Slug *</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="product-slug"
              required
            />
          </div>

          {/* Description */}
          <div className={styles.group}>
            <label>Description</label>
            <textarea
              name="desc"
              value={form.desc}
              onChange={handleChange}
              rows={4}
              placeholder="Product description..."
            />
          </div>

          {/* Image URL */}
          <div className={styles.group}>
            <label>Image URL *</label>
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          {/* Version */}
          <div className={styles.group}>
            <label>Version</label>
            <input
              name="version"
              value={form.version}
              onChange={handleChange}
              placeholder="1.0.0"
            />
          </div>

          {/* Size */}
          <div className={styles.group}>
            <label>Size</label>
            <input
              name="size"
              value={form.size}
              onChange={handleChange}
              placeholder="50MB"
            />
          </div>

          {/* Updated */}
          <div className={styles.group}>
            <label>Updated</label>
            <input
              name="updated"
              value={form.updated}
              onChange={handleChange}
              placeholder="2023-10-01"
            />
          </div>

          {/* Category */}
          <div className={styles.group}>
            <label>Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category name"
            />
          </div>

          {/* Status Badge */}
          <div className={styles.group}>
            <label>Status Badge</label>
            <select
              value={form.statusEnabled ? "true" : "false"}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  statusEnabled: e.target.value === "true",
                }))
              }
            >
              <option value="false">Disabled</option>
              <option value="true">Enabled</option>
            </select>
          </div>

          {form.statusEnabled && (
            <div className={styles.group}>
              <label>Status Label</label>
              <input
                value={form.statusLabel}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, statusLabel: e.target.value }))
                }
                placeholder="e.g. New!"
              />
            </div>
          )}

          {/* Download Link (for free) */}
          {form.productType === "free" && (
            <div className={styles.group}>
              <label>Download Link *</label>
              <input
                name="downloadLink"
                value={form.downloadLink}
                onChange={handleChange}
                placeholder="https://example.com/download"
                required={form.productType === "free"}
              />
            </div>
          )}

          {/* Prices (for paid) */}
          {form.productType === "paid" && (
            <>
              <div className={styles.group}>
                <label>1 Day Price (₹)</label>
                <input
                  name="prices.day"
                  type="number"
                  min="0"
                  value={form.prices.day}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className={styles.group}>
                <label>1 Week Price (₹)</label>
                <input
                  name="prices.week"
                  type="number"
                  min="0"
                  value={form.prices.week}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </>
          )}

          {/* Features Toggle */}
          <div className={styles.group}>
            <label>Enable Features Section</label>
            <select
              value={form.featuresEnabled ? "true" : "false"}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  featuresEnabled: e.target.value === "true",
                }))
              }
            >
              <option value="false">Disabled</option>
              <option value="true">Enabled</option>
            </select>
          </div>

          {/* Features Builder */}
          {form.featuresEnabled && (
            <div className={styles.featureBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2>Features Builder</h2>
                <button type="button" className={styles.addBtn} onClick={addCategory}>
                  + Add Category
                </button>
              </div>

              {Object.keys(form.featuresData).length === 0 && (
                <p style={{ color: "#666", fontStyle: "italic" }}>No categories added yet.</p>
              )}

              {Object.entries(form.featuresData).map(([cat, sections]) => (
                <div key={cat} className={styles.categoryBlock}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <h4>{cat}</h4>
                    <div>
                      <button type="button" className={styles.smallBtn} onClick={() => renameCategory(cat)}>Rename</button>
                      <button type="button" className={styles.smallBtn} onClick={() => deleteCategory(cat)}>Delete</button>
                      <button type="button" className={styles.smallBtn} onClick={() => addSection(cat)}>+ Section</button>
                    </div>
                  </div>

                  {sections.map((sec, idx) => (
                    <div key={idx} className={styles.sectionBlock}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <strong>{sec.title}</strong>
                        <div>
                          <button type="button" className={styles.smallBtn} onClick={() => renameSection(cat, idx)}>Rename</button>
                          <button type="button" className={styles.smallBtn} onClick={() => deleteSection(cat, idx)}>Delete</button>
                          <button type="button" className={styles.smallBtn} onClick={() => addItem(cat, idx)}>+ Item</button>
                        </div>
                      </div>

                      <ul className={styles.itemList}>
                        {sec.items.length === 0 ? (
                          <li style={{ color: "#888", fontStyle: "italic" }}>No items yet</li>
                        ) : (
                          sec.items.map((item, iIdx) => (
                            <li key={iIdx} style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>{item}</span>
                              <div>
                                <button type="button" className={styles.smallBtn} onClick={() => editItem(cat, idx, iIdx)}>Edit</button>
                                <button type="button" className={styles.smallBtn} onClick={() => deleteItem(cat, idx, iIdx)}>Delete</button>
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}