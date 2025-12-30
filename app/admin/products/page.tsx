"use client";

import { useEffect, useState } from "react";
import styles from "./manageProducts.module.css";

// Proper Types
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

interface Product {
  _id: string;
  slug: string;
  name: string;
  desc: string;
  image: string;
  prices: Price;
  downloadLink?: string;
  statusEnabled?: boolean;
  statusLabel?: string;
  featuresEnabled?: boolean;
  featuresData?: FeaturesData;
}

type ProductType = "paid" | "free";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
}

// Get token from localStorage (common keys: "token", "authToken", "jwt")
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("adminToken");
};

// Authenticated fetch helper
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token. Please log in.");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (response.status === 401) {
    throw new Error("Session expired. Please log in again.");
  }

  return response;
};

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<(Product & { productType: ProductType }) | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch("/products");

      if (!res.ok) throw new Error("Failed to load products");

      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err: any) {
      setError(err.message || "Could not load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await apiFetch(`/products/${slug}`, { method: "DELETE" });

      if (!res.ok) throw new Error("Delete failed");

      alert("Product deleted successfully!");
      fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  const openEdit = (product: Product) => {
    const isFree = product.prices.day === 0 && product.prices.week === 0;

    setEditForm({
      ...product,
      productType: isFree ? "free" : "paid",
      statusEnabled: product.statusEnabled ?? false,
      statusLabel: product.statusLabel ?? "",
      featuresEnabled: product.featuresEnabled ?? false,
      featuresData: product.featuresData ?? {},
    });
    setEditOpen(true);
  };

  // Immutable feature updates
  const updateFeatures = (updater: (prev: FeaturesData) => FeaturesData) => {
    setEditForm((prev) =>
      prev ? { ...prev, featuresData: updater(prev.featuresData ?? {}) } : null
    );
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
    const current = editForm?.featuresData[cat][index]?.title || "";
    const newTitle = prompt("Rename section:", current);
    if (!newTitle?.trim()) return;
    updateFeatures((prev) => {
      const sections = [...prev[cat]];
      sections[index] = { ...sections[index], title: newTitle.trim() };
      return { ...prev, [cat]: sections };
    });
  };

  const deleteSection = (cat: string, index: number) => {
    if (!confirm("Delete this section and all items?")) return;
    updateFeatures((prev) => ({
      ...prev,
      [cat]: prev[cat].filter((_, i) => i !== index),
    }));
  };

  const addItem = (cat: string, secIndex: number) => {
    const text = prompt("Enter new item:");
    if (!text?.trim()) return;
    updateFeatures((prev) => {
      const sections = [...prev[cat]];
      sections[secIndex] = {
        ...sections[secIndex],
        items: [...sections[secIndex].items, text.trim()],
      };
      return { ...prev, [cat]: sections };
    });
  };

  const editItem = (cat: string, secIndex: number, itemIndex: number) => {
    const current = editForm?.featuresData[cat][secIndex]?.items[itemIndex] || "";
    const newValue = prompt("Edit item:", current);
    if (newValue == null) return;
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

  const saveEdit = async () => {
    if (!editForm) return;

    const body: Partial<Product> & { productType?: string } = { ...editForm };

    if (editForm.productType === "free") {
      body.prices = { day: 0, week: 0 };
      if (!editForm.downloadLink?.trim()) {
        alert("Free products require a download link.");
        return;
      }
    }

    delete body.productType;

    try {
      const res = await apiFetch(`/products/${editForm.slug}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Product updated successfully!");
      setEditOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to save changes");
    }
  };

  useEffect(() => {
    if (getToken()) {
      fetchProducts();
    } else {
      setError("Please log in to manage products.");
      setLoading(false);
    }
  }, []);

  // If no token → show login prompt
  if (!getToken()) {
    return (
      <div className={styles.wrapper}>
        <div className="container" style={{ textAlign: "center", padding: "5rem 1rem" }}>
          <h1>Authentication Required</h1>
          <p>You need to be logged in to access this page.</p>
          <button
            onClick={() => (window.location.href = "/login")}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className="container">
        <h1 className={styles.title}>Manage Products</h1>

        {loading && <p>Loading products...</p>}
        {error && <p style={{ color: "red", margin: "1rem 0" }}>{error}</p>}
        {!loading && !error && products.length === 0 && <p>No products found.</p>}

        <div className={styles.grid}>
          {products.map((item) => (
            <div key={item._id} className={styles.card}>
              <img src={item.image} className={styles.thumb} alt={item.name} />
              <div className={styles.info}>
                <h3>{item.name}</h3>
                <p className={styles.slug}>/{item.slug}</p>
                {item.prices.day === 0 && item.prices.week === 0 ? (
                  <p className={styles.free}>Free Product</p>
                ) : (
                  <p className={styles.paid}>
                    ₹{item.prices.day} / Day • ₹{item.prices.week} / Week
                  </p>
                )}
              </div>
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => openEdit(item)}>
                  Edit
                </button>
                <button className={styles.deleteBtn} onClick={() => deleteProduct(item.slug)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editOpen && editForm && (
          <div className={styles.modalOverlay} onClick={() => setEditOpen(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Edit Product: {editForm.name}</h2>

              {/* Form fields same as before but cleaner */}
              <div className={styles.modalGroup}>
                <label>Product Type</label>
                <select
                  value={editForm.productType}
                  onChange={(e) =>
                    setEditForm((p) => p ? { ...p, productType: e.target.value as ProductType } : null)
                  }
                >
                  <option value="paid">Paid</option>
                  <option value="free">Free</option>
                </select>
              </div>

              <div className={styles.modalGroup}>
                <label>Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => p ? { ...p, name: e.target.value } : null)}
                />
              </div>

              <div className={styles.modalGroup}>
                <label>Description</label>
                <input
                  value={editForm.desc}
                  onChange={(e) => setEditForm((p) => p ? { ...p, desc: e.target.value } : null)}
                />
              </div>

              <div className={styles.modalGroup}>
                <label>Image URL</label>
                <input
                  value={editForm.image}
                  onChange={(e) => setEditForm((p) => p ? { ...p, image: e.target.value } : null)}
                />
              </div>

              {/* Status Badge */}
              <div className={styles.modalGroup}>
                <label>Status Badge</label>
                <select
                  value={editForm.statusEnabled ? "true" : "false"}
                  onChange={(e) =>
                    setEditForm((p) => p ? { ...p, statusEnabled: e.target.value === "true" } : null)
                  }
                >
                  <option value="false">Disabled</option>
                  <option value="true">Enabled</option>
                </select>
              </div>

              {editForm.statusEnabled && (
                <div className={styles.modalGroup}>
                  <label>Status Text</label>
                  <input
                    placeholder="e.g. Main Account Safe"
                    value={editForm.statusLabel}
                    onChange={(e) => setEditForm((p) => p ? { ...p, statusLabel: e.target.value } : null)}
                  />
                </div>
              )}

              <div className={styles.modalGroup}>
                <label>Download Link (Free only)</label>
                <input
                  value={editForm.downloadLink || ""}
                  disabled={editForm.productType === "paid"}
                  onChange={(e) => setEditForm((p) => p ? { ...p, downloadLink: e.target.value } : null)}
                />
              </div>

              {editForm.productType === "paid" && (
                <>
                  <div className={styles.modalGroup}>
                    <label>1 Day Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.prices.day}
                      onChange={(e) =>
                        setEditForm((p) =>
                          p ? { ...p, prices: { ...p.prices, day: Number(e.target.value) || 0 } } : null
                        )
                      }
                    />
                  </div>
                  <div className={styles.modalGroup}>
                    <label>1 Week Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.prices.week}
                      onChange={(e) =>
                        setEditForm((p) =>
                          p ? { ...p, prices: { ...p.prices, week: Number(e.target.value) || 0 } } : null
                        )
                      }
                    />
                  </div>
                </>
              )}

              <div className={styles.modalGroup}>
                <label>Enable Features Section</label>
                <select
                  value={editForm.featuresEnabled ? "true" : "false"}
                  onChange={(e) =>
                    setEditForm((p) => p ? { ...p, featuresEnabled: e.target.value === "true" } : null)
                  }
                >
                  <option value="false">Disabled</option>
                  <option value="true">Enabled</option>
                </select>
              </div>

              {editForm.featuresEnabled && (
                <div className={styles.featureBox}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <h3>Features Builder</h3>
                    <button className={styles.addBtn} onClick={addCategory}>
                      + Add Category
                    </button>
                  </div>

                  {Object.entries(editForm.featuresData).map(([cat, sections]) => (
                    <div key={cat} className={styles.categoryBlock}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <h4>{cat}</h4>
                        <div>
                          <button className={styles.smallBtn} onClick={() => renameCategory(cat)}>Rename</button>
                          <button className={styles.smallBtn} onClick={() => deleteCategory(cat)}>Delete</button>
                          <button className={styles.smallBtn} onClick={() => addSection(cat)}>+ Section</button>
                        </div>
                      </div>

                      {sections.map((sec, idx) => (
                        <div key={idx} className={styles.sectionBlock}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <strong>{sec.title}</strong>
                            <div>
                              <button className={styles.smallBtn} onClick={() => renameSection(cat, idx)}>Rename</button>
                              <button className={styles.smallBtn} onClick={() => deleteSection(cat, idx)}>Delete</button>
                              <button className={styles.smallBtn} onClick={() => addItem(cat, idx)}>+ Item</button>
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
                                    <button className={styles.smallBtn} onClick={() => editItem(cat, idx, iIdx)}>Edit</button>
                                    <button className={styles.smallBtn} onClick={() => deleteItem(cat, idx, iIdx)}>Delete</button>
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

              <div className={styles.modalActions}>
                <button className={styles.closeBtn} onClick={() => setEditOpen(false)}>
                  Cancel
                </button>
                <button className={styles.saveBtn} onClick={saveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}