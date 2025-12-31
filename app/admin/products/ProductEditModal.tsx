// app/admin/manage-products/ProductEditModal.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "./manageProducts.module.css";

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
  _id?: string;
  slug: string;
  name: string;
  desc: string;
  image: string;
  version: string;
  size: string;
  updated: string;
  category: string;
  type?: string;
  prices: Price;
  downloadLink?: string;
  statusEnabled?: boolean;
  statusLabel?: string;
  featuresEnabled?: boolean;
  featuresData?: FeaturesData;
}

type ProductType = "paid" | "free";

interface ProductEditModalProps {
  product: Product | null;        // null = create new, object = edit existing
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
}

export default function ProductEditModal({ product, isOpen, onClose, onSave }: ProductEditModalProps) {
  const isNew = !product?._id;

  const [form, setForm] = useState<Product & { productType: ProductType }>({
    _id: "",
    slug: "",
    name: "",
    desc: "",
    image: "",
    version: "",
    size: "",
    updated: "",
    category: "",
    type: "",
    prices: { day: 0, week: 0 },
    downloadLink: "",
    statusEnabled: false,
    statusLabel: "",
    featuresEnabled: false,
    featuresData: {},
    productType: "paid",
  });

  const [saving, setSaving] = useState(false);

  // Critical Fix: Sync form when product prop changes
  useEffect(() => {
    if (!isOpen) return; // Only update when modal is open

    if (product) {
      const isFree = product.prices.day === 0 && product.prices.week === 0;

      setForm({
        _id: product._id || "",
        slug: product.slug || "",
        name: product.name || "",
        desc: product.desc || "",
        image: product.image || "",
        version: product.version || "",
        size: product.size || "",
        updated: product.updated || "",
        category: product.category || "",
        type: product.type || "",
        prices: product.prices || { day: 0, week: 0 },
        downloadLink: product.downloadLink || "",
        statusEnabled: product.statusEnabled ?? false,
        statusLabel: product.statusLabel || "",
        featuresEnabled: product.featuresEnabled ?? false,
        featuresData: product.featuresData || {},
        productType: isFree ? "free" : "paid",
      });
    } else {
      // For "Add New" — reset to empty
      setForm({
        _id: "",
        slug: "",
        name: "",
        desc: "",
        image: "",
        version: "",
        size: "",
        updated: "",
        category: "",
        type: "",
        prices: { day: 0, week: 0 },
        downloadLink: "",
        statusEnabled: false,
        statusLabel: "",
        featuresEnabled: false,
        featuresData: {},
        productType: "paid",
      });
    }
  }, [product, isOpen]);

  // Feature builder functions (same as before)
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

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.image.trim()) {
      alert("Name, slug, and image URL are required.");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      alert("Slug can only contain lowercase letters, numbers, and hyphens.");
      return;
    }

    if (form.productType === "free") {
      form.prices = { day: 0, week: 0 };
      if (!form.downloadLink?.trim()) {
        alert("Free products require a download link.");
        return;
      }
    } else if (form.prices.day === 0 && form.prices.week === 0) {
      alert("Paid products must have at least one positive price.");
      return;
    }

    setSaving(true);
    try {
      // Clone to avoid mutating state directly
      const toSave = { ...form } as Product;
      delete (toSave as any).productType; // Don't send productType to backend

      await onSave(toSave);
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>
          {isNew ? "Create New Product" : `Edit Product: ${form.name}`}
        </h2>

        {/* === FORM FIELDS START === */}
        <div className={styles.modalGroup}>
          <label>Product Type</label>
          <select
            value={form.productType}
            onChange={(e) => setForm((p) => ({ ...p, productType: e.target.value as ProductType }))}
          >
            <option value="paid">Paid</option>
            <option value="free">Free</option>
          </select>
        </div>

        <div className={styles.modalGroup}>
          <label>Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Product Name"
          />
        </div>

        <div className={styles.modalGroup}>
          <label>Slug *</label>
          <input
            value={form.slug}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                slug: e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "-")
                  .replace(/-+/g, "-")
                  .replace(/^-|-$/g, ""),
              }))
            }
            placeholder="my-awesome-product"
          />
        </div>

        <div className={styles.modalGroup}>
          <label>Description</label>
          <textarea
            rows={3}
            value={form.desc}
            onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))}
          />
        </div>

        <div className={styles.modalGroup}>
          <label>Image URL *</label>
          <input
            value={form.image}
            onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className={styles.modalGroup}>
          <label>Version</label>
          <input value={form.version} onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))} />
        </div>

        <div className={styles.modalGroup}>
          <label>Size</label>
          <input value={form.size} onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))} />
        </div>

        <div className={styles.modalGroup}>
          <label>Updated Date</label>
          <input value={form.updated} onChange={(e) => setForm((p) => ({ ...p, updated: e.target.value }))} />
        </div>

        <div className={styles.modalGroup}>
          <label>Category</label>
          <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
        </div>

        <div className={styles.modalGroup}>
          <label>Type</label>
          <select
            value={form.type || ""}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
          >
            <option value="">Select Type</option>
            <option value="mods">Mods</option>
            <option value="games">Games</option>
          </select>
        </div>

        {/* Status Badge */}
        <div className={styles.modalGroup}>
          <label>Status Badge</label>
          <select
            value={form.statusEnabled ? "true" : "false"}
            onChange={(e) => setForm((p) => ({ ...p, statusEnabled: e.target.value === "true" }))}
          >
            <option value="false">Disabled</option>
            <option value="true">Enabled</option>
          </select>
        </div>

        {form.statusEnabled && (
          <div className={styles.modalGroup}>
            <label>Status Label</label>
            <input
              value={form.statusLabel}
              onChange={(e) => setForm((p) => ({ ...p, statusLabel: e.target.value }))}
              placeholder="e.g. Main Account Safe"
            />
          </div>
        )}

        {/* Download Link (only for free) */}
        {form.productType === "free" && (
          <div className={styles.modalGroup}>
            <label>Download Link *</label>
            <input
              value={form.downloadLink}
              onChange={(e) => setForm((p) => ({ ...p, downloadLink: e.target.value }))}
              placeholder="https://example.com/download.zip"
            />
          </div>
        )}

        {/* Prices (only for paid) */}
        {form.productType === "paid" && (
          <>
            <div className={styles.modalGroup}>
              <label>1 Day Price (₹)</label>
              <input
                type="number"
                min="0"
                value={form.prices.day}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    prices: { ...p.prices, day: Number(e.target.value) || 0 },
                  }))
                }
              />
            </div>

            <div className={styles.modalGroup}>
              <label>1 Week Price (₹)</label>
              <input
                type="number"
                min="0"
                value={form.prices.week}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    prices: { ...p.prices, week: Number(e.target.value) || 0 },
                  }))
                }
              />
            </div>
          </>
        )}

        {/* Features Section */}
        <div className={styles.modalGroup}>
          <label>Enable Features Section</label>
          <select
            value={form.featuresEnabled ? "true" : "false"}
            onChange={(e) => setForm((p) => ({ ...p, featuresEnabled: e.target.value === "true" }))}
          >
            <option value="false">Disabled</option>
            <option value="true">Enabled</option>
          </select>
        </div>

        {form.featuresEnabled && (
          <div className={styles.featureBox}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3>Features Builder</h3>
              <button className={styles.addBtn} onClick={addCategory}>
                + Add Category
              </button>
            </div>

            {Object.entries(form.featuresData || {}).map(([cat, sections]) => (
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

        {/* === ACTIONS === */}
        <div className={styles.modalActions}>
          <button className={styles.closeBtn} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}