// app/admin/manage-products/ProductEditModal.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "./manageProducts.module.css";

// === All types defined locally ===
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
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
}

// === Component ===
export default function ProductEditModal({
  product,
  isOpen,
  onClose,
  onSave,
}: ProductEditModalProps) {
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
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [selectedCategoryForSection, setSelectedCategoryForSection] = useState<string | null>(null);

  // Sync form when modal opens or product changes
  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      const isFree = product.prices.day === 0 && product.prices.week === 0;
      setForm({
        ...product,
        productType: isFree ? "free" : "paid",
        prices: product.prices ?? { day: 0, week: 0 },
        featuresData: product.featuresData ?? {},
        downloadLink: product.downloadLink ?? "",
        statusLabel: product.statusLabel ?? "",
      });
    } else {
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

    setNewCategoryName("");
    setNewSectionTitle("");
    setSelectedCategoryForSection(null);
  }, [product, isOpen]);

  const updateFeatures = (updater: (prev: FeaturesData) => FeaturesData) => {
    setForm((prev) => ({
      ...prev,
      featuresData: updater(prev.featuresData ?? {}),
    }));
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (form.featuresData?.[name]) {
      alert("Category already exists!");
      return;
    }
    updateFeatures((prev) => ({ ...prev, [name]: [] }));
    setNewCategoryName("");
  };

  const renameCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    if (form.featuresData?.[trimmed]) {
      alert("Category name already exists!");
      return;
    }
    updateFeatures((prev) => {
      const { [oldName]: sections, ...rest } = prev;
      return sections ? { ...rest, [trimmed]: sections } : rest;
    });
  };

  const deleteCategory = (cat: string) => {
    if (!window.confirm(`Delete category "${cat}" and all its content?`)) return;
    updateFeatures((prev) => {
      const { [cat]: _, ...rest } = prev;
      return rest;
    });
  };

  const addSection = () => {
    const title = newSectionTitle.trim();
    const cat = selectedCategoryForSection;
    if (!title || !cat) return;

    updateFeatures((prev) => ({
      ...prev,
      [cat]: [...(prev[cat] ?? []), { title, items: [] }],
    }));

    setNewSectionTitle("");
    setSelectedCategoryForSection(null);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.image.trim()) {
      alert("Name, Slug, and Image URL are required.");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      alert("Slug can only contain lowercase letters, numbers, and hyphens.");
      return;
    }

    if (form.productType === "free") {
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
      const toSave = { ...form };
      delete (toSave as any).productType;

      await onSave(toSave as Product);
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
          {isNew ? "Create New Product" : `Edit Product: ${form.name || "Untitled"}`}
        </h2>

        {/* Product Type */}
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

        {/* Name */}
        <div className={styles.modalGroup}>
          <label>Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Product Name"
          />
        </div>

        {/* Slug */}
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

        {/* Description */}
        <div className={styles.modalGroup}>
          <label>Description</label>
          <textarea
            rows={4}
            value={form.desc}
            onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))}
            placeholder="Brief description of the product..."
          />
        </div>

        {/* Image URL */}
        <div className={styles.modalGroup}>
          <label>Image URL *</label>
          <input
            value={form.image}
            onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Grid: Version & Size */}
        <div className={styles.grid2}>
          <div className={styles.modalGroup}>
            <label>Version</label>
            <input
              value={form.version}
              onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))}
              placeholder="1.0.0"
            />
          </div>
          <div className={styles.modalGroup}>
            <label>Size</label>
            <input
              value={form.size}
              onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))}
              placeholder="150 MB"
            />
          </div>
        </div>

        {/* Grid: Updated & Category */}
        <div className={styles.grid2}>
          <div className={styles.modalGroup}>
            <label>Updated Date</label>
            <input
              value={form.updated}
              onChange={(e) => setForm((p) => ({ ...p, updated: e.target.value }))}
              placeholder="2025-12-31"
            />
          </div>
          <div className={styles.modalGroup}>
            <label>Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              placeholder="Tools"
            />
          </div>
        </div>

        {/* Type (Mods/Games) */}
        <div className={styles.modalGroup}>
          <label>Type</label>
          <select
            value={form.type ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value || undefined }))}
          >
            <option value="">None</option>
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

        {/* Download Link (Free) */}
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

        {/* Prices (Paid) */}
        {form.productType === "paid" && (
          <div className={styles.grid2}>
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
          </div>
        )}

        {/* Features Toggle */}
        <div className={styles.modalGroup}>
          <label>Enable Features Section</label>
          <select
            value={form.featuresEnabled ? "true" : "false"}
            onChange={(e) => setForm((p) => ({ ...p, featuresEnabled: e.target.value === "true" }))}
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        {/* Features Builder */}
        {form.featuresEnabled && (
          <div className={styles.featureBox}>
            <div className={styles.sectionHeader}>
              <h3>Features Builder</h3>
              <div className={styles.inlineForm}>
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  placeholder="New category name"
                />
                <button onClick={addCategory} className={styles.addBtn}>
                  Add Category
                </button>
              </div>
            </div>

            {Object.keys(form.featuresData ?? {}).length === 0 ? (
              <p style={{ color: "#888", fontStyle: "italic", textAlign: "center", padding: "2rem 0" }}>
                No feature categories yet. Add one above!
              </p>
            ) : (
              Object.entries(form.featuresData ?? {}).map(([cat, sections]) => (
                <div key={cat} className={styles.categoryBlock}>
                  <div className={styles.categoryHeader}>
                    <input
                      value={cat}
                      onChange={(e) => renameCategory(cat, e.target.value)}
                      className={styles.categoryTitleInput}
                    />
                    <div>
                      <button onClick={() => deleteCategory(cat)} className={styles.dangerBtn}>
                        Delete
                      </button>
                      <button onClick={() => setSelectedCategoryForSection(cat)} className={styles.smallBtn}>
                        + Section
                      </button>
                    </div>
                  </div>

                  {selectedCategoryForSection === cat && (
                    <div className={styles.inlineForm} style={{ margin: "1rem 0" }}>
                      <input
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSection()}
                        placeholder="Section title"
                        autoFocus
                      />
                      <button onClick={addSection} className={styles.addBtn}>
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCategoryForSection(null);
                          setNewSectionTitle("");
                        }}
                        className={styles.closeBtn}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {sections.map((sec, idx) => (
                    <div key={idx} className={styles.sectionBlock}>
                      <div className={styles.sectionHeader}>
                        <input
                          value={sec.title}
                          onChange={(e) =>
                            updateFeatures((prev) => {
                              const updated = [...prev[cat]];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              return { ...prev, [cat]: updated };
                            })
                          }
                          className={styles.sectionTitleInput}
                        />
                        <button
                          onClick={() =>
                            updateFeatures((prev) => ({
                              ...prev,
                              [cat]: prev[cat].filter((_, i) => i !== idx),
                            }))
                          }
                          className={styles.dangerBtn}
                        >
                          Delete
                        </button>
                      </div>

                      <ul className={styles.itemList}>
                        {sec.items.map((item, iIdx) => (
                          <li key={iIdx} className={styles.featureItem}>
                            <input
                              value={item}
                              onChange={(e) =>
                                updateFeatures((prev) => {
                                  const updatedItems = [...prev[cat][idx].items];
                                  updatedItems[iIdx] = e.target.value;
                                  const updatedSections = [...prev[cat]];
                                  updatedSections[idx] = { ...updatedSections[idx], items: updatedItems };
                                  return { ...prev, [cat]: updatedSections };
                                })
                              }
                              placeholder="Feature item..."
                            />
                            <button
                              onClick={() =>
                                updateFeatures((prev) => {
                                  const filtered = prev[cat][idx].items.filter((_, i) => i !== iIdx);
                                  const updatedSections = [...prev[cat]];
                                  updatedSections[idx] = { ...updatedSections[idx], items: filtered };
                                  return { ...prev, [cat]: updatedSections };
                                })
                              }
                              className={styles.dangerBtn}
                            >
                              ×
                            </button>
                          </li>
                        ))}
                        <li>
                          <button
                            onClick={() =>
                              updateFeatures((prev) => {
                                const updatedSections = [...prev[cat]];
                                updatedSections[idx].items.push("");
                                return { ...prev, [cat]: updatedSections };
                              })
                            }
                            className={styles.addItemBtn}
                          >
                            + Add Item
                          </button>
                        </li>
                      </ul>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.modalActions}>
          <button onClick={onClose} disabled={saving} className={styles.closeBtn}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}