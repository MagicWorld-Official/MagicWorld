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

    if (name === "name") {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      setForm((prev) => ({
        ...prev,
        name: value,
        slug: generatedSlug,
      }));
      return;
    }

    // Handle statusEnabled toggle
    if (name === "statusEnabled") {
      setForm((prev) => ({
        ...prev,
        statusEnabled: value === "true",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Feature builders
  const addCategory = () => {
    const name = prompt("Enter category name:");
    if (!name?.trim()) return;

    setForm((prev) => ({
      ...prev,
      featuresData: { ...prev.featuresData, [name.trim()]: [] },
    }));
  };

  const addSection = (cat: string) => {
    const title = prompt("Enter section title:");
    if (!title?.trim()) return;

    setForm((prev) => ({
      ...prev,
      featuresData: {
        ...prev.featuresData,
        [cat]: [...(prev.featuresData[cat] || []), { title: title.trim(), items: [] }],
      },
    }));
  };

  const addItem = (cat: string, secIndex: number) => {
    const text = prompt("Enter new feature item:");
    if (!text?.trim()) return;

    setForm((prev) => {
      const sections = [...prev.featuresData[cat]];
      sections[secIndex] = {
        ...sections[secIndex],
        items: [...sections[secIndex].items, text.trim()],
      };
      return {
        ...prev,
        featuresData: { ...prev.featuresData, [cat]: sections },
      };
    });
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!form.name || !form.slug || !form.image || !form.desc) {
      alert("Please fill in all required fields: Name, Slug, Image, Description.");
      setLoading(false);
      return;
    }

    if (form.productType === "free" && !form.downloadLink.trim()) {
      alert("Free products require a download link.");
      setLoading(false);
      return;
    }

    if (form.productType === "paid" && form.prices.day <= 0 && form.prices.week <= 0) {
      alert("Paid products must have at least one price greater than 0.");
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to add product");
      }

      const data = await res.json();

      if (data.success) {
        alert("Product added successfully!");
        // Reset form
        setForm({
          name: "",
          slug: "",
          desc: "",
          image: "",
          version: "",
          size: "",
          updated: "",
          category: "",
          downloadLink: "",
          productType: "paid",
          prices: { day: 0, week: 0 },
          statusEnabled: false,
          statusLabel: "",
          featuresEnabled: false,
          featuresData: {},
        });
        window.location.href = "/admin/products";
      }
    } catch (err: any) {
      const msg = err.message || "Something went wrong. Please try again.";
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // Auth check
  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/admin/login";
    }
  }, []);

  if (!getToken()) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className="container">
        <h1 className={styles.title}>Add New Product</h1>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Product Type */}
          <div className={styles.group}>
            <label>Product Type</label>
            <select name="productType" value={form.productType} onChange={handleChange}>
              <option value="paid">Paid Product</option>
              <option value="free">Free Product</option>
            </select>
          </div>

          {/* Status Badge */}
          <div className={styles.group}>
            <label>Status Badge</label>
            <select
              name="statusEnabled"
              value={form.statusEnabled ? "true" : "false"}
              onChange={handleChange}
            >
              <option value="false">Disabled</option>
              <option value="true">Enabled</option>
            </select>
          </div>

          {form.statusEnabled && (
            <div className={styles.group}>
              <label>Status Label (e.g. Main Account Safe)</label>
              <input
                name="statusLabel"
                value={form.statusLabel}
                onChange={handleChange}
                placeholder="Main Account Safe"
              />
            </div>
          )}

          {/* Basic Info */}
          <div className={styles.group}>
            <label>Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className={styles.group}>
            <label>Slug (auto-generated)</label>
            <input name="slug" value={form.slug} onChange={handleChange} required />
          </div>

          <div className={styles.group}>
            <label>Description *</label>
            <textarea
              name="desc"
              value={form.desc}
              onChange={handleChange}
              rows={4}
              required
              style={{ resize: "vertical" }}
            />
          </div>

          <div className={styles.group}>
            <label>Image URL *</label>
            <input name="image" value={form.image} onChange={handleChange} required />
          </div>

          <div className={styles.group}>
            <label>
              Download Link {form.productType === "free" && <span style={{ color: "red" }}>*</span>}
            </label>
            <input
              name="downloadLink"
              value={form.downloadLink}
              onChange={handleChange}
              disabled={form.productType === "paid"}
              required={form.productType === "free"}
            />
          </div>

          {/* Extra Details */}
          <div className={styles.row}>
            <div className={styles.group}>
              <label>Version</label>
              <input name="version" value={form.version} onChange={handleChange} />
            </div>
            <div className={styles.group}>
              <label>Size (e.g. 150MB)</label>
              <input name="size" value={form.size} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.group}>
              <label>Updated On</label>
              <input
                name="updated"
                value={form.updated}
                onChange={handleChange}
                placeholder="e.g. December 2025"
              />
            </div>
            <div className={styles.group}>
              <label>Category</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Cheat, Tool"
              />
            </div>
          </div>

          {/* Prices */}
          {form.productType === "paid" && (
            <div className={styles.row}>
              <div className={styles.group}>
                <label>1 Day Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  name="prices.day"
                  value={form.prices.day}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.group}>
                <label>1 Week Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  name="prices.week"
                  value={form.prices.week}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
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
                  <h3 style={{ margin: "0.5rem 0" }}>{cat}</h3>
                  <button type="button" className={styles.smallBtn} onClick={() => addSection(cat)}>
                    + Add Section
                  </button>

                  {sections.map((sec, idx) => (
                    <div key={idx} className={styles.sectionBlock}>
                      <strong>{sec.title}</strong>
                      <button type="button" className={styles.smallBtn} onClick={() => addItem(cat, idx)}>
                        + Add Item
                      </button>

                      {sec.items.length === 0 ? (
                        <p style={{ color: "#888", fontSize: "0.9rem", margin: "0.5rem 0" }}>
                          No items yet
                        </p>
                      ) : (
                        <ul className={styles.itemList}>
                          {sec.items.map((item, iIdx) => (
                            <li key={iIdx}>{item}</li>
                          ))}
                        </ul>
                      )}
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