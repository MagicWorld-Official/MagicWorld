"use client";

import { useEffect, useState } from "react";
import styles from "./manageProducts.module.css";

type EditFormType = {
  [key: string]: any;
  featuresData: {
    [key: string]: {
      title: string;
      items: string[];
    }[];
  };
};

export default function ManageProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormType | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        { cache: "no-store" }
      );

      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch {
      setProducts([]);
    }

    setLoading(false);
  };

  const deleteProduct = async (slug: string) => {
    if (!confirm("Delete this product?")) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await res.json();

    if (data.success) {
      alert("Product deleted");
      fetchProducts();
    }
  };

  const openEdit = (product: any) => {
    const isFree = product.prices.day === 0 && product.prices.week === 0;

    setEditForm({
      ...product,
      productType: isFree ? "free" : "paid",
      statusEnabled: product.statusEnabled || false,
      statusLabel: product.statusLabel || "",
      featuresEnabled: product.featuresEnabled || false,
      featuresData: product.featuresData || {},
    });

    setEditOpen(true);
  };

  // ---------------------------
// FEATURE ACTIONS
  // ---------------------------

  const addCategory = () => {
    const name = prompt("New category:");
    if (!name) return;

    setEditForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        featuresData: { ...prev.featuresData, [name]: [] }
      };
    });
  };

  const renameCategory = (cat: string) => {
    const newName = prompt("Rename category:", cat);
    if (!newName || newName === cat) return;

    setEditForm(prev => {
      if (!prev) return prev;
      const copy = { ...prev.featuresData };
      copy[newName] = copy[cat];
      delete copy[cat];
      return { ...prev, featuresData: copy };
    });
  };

  const deleteCategory = (cat: string) => {
    if (!confirm("Delete category?")) return;

    setEditForm(prev => {
      if (!prev) return prev;
      const copy = { ...prev.featuresData };
      delete copy[cat];
      return { ...prev, featuresData: copy };
    });
  };

  const addSection = (cat: string) => {
    const title = prompt("New section:");
    if (!title) return;

    setEditForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        featuresData: {
          ...prev.featuresData,
          [cat]: [...prev.featuresData[cat], { title, items: [] }]
        }
      };
    });
  };

  const renameSection = (cat: string, index: number) => {
    if (!editForm) return;

    const curr = editForm.featuresData[cat][index].title;
    const newTitle = prompt("Rename section:", curr);
    if (!newTitle) return;

    setEditForm(prev => {
      if (!prev) return prev;
      const copy = { ...prev.featuresData };
      copy[cat][index].title = newTitle;
      return { ...prev, featuresData: copy };
    });
  };

  const deleteSection = (cat: string, index: number) => {
    if (!confirm("Delete section?")) return;

    setEditForm(prev => {
      if (!prev) return prev;
      const copy = { ...prev.featuresData };
      copy[cat].splice(index, 1);
      return { ...prev, featuresData: copy };
    });
  };

  const addItem = (cat: string, secIndex: number) => {
    const text = prompt("New item:");
    if (!text) return;

    setEditForm(prev => {
      if (!prev) return prev;
      const copy = { ...prev.featuresData };
      copy[cat][secIndex].items.push(text);
      return { ...prev, featuresData: copy };
    });
  };

  const editItem = (cat: string, secIndex: number, itemIndex: number) => {
    if (!editForm) return;

    const curr = editForm.featuresData[cat][secIndex].items[itemIndex];
    const newValue = prompt("Edit item:", curr);
    if (!newValue) return;

    setEditForm(prev => {
      if (!prev) return prev;
      const copy = { ...prev.featuresData };
      copy[cat][secIndex].items[itemIndex] = newValue;
      return { ...prev, featuresData: copy };
    });
  };

  const deleteItem = (cat: string, secIndex: number, itemIndex: number) => {
    if (!confirm("Delete item?")) return;

    setEditForm(prev => {
      if (!prev) return prev;
      const copy = { ...prev.featuresData };
      copy[cat][secIndex].items.splice(itemIndex, 1);
      return { ...prev, featuresData: copy };
    });
  };

  // ---------------------------
// SAVE PRODUCT
  // ---------------------------

  const saveEdit = async () => {
    if (!editForm) return;

    const body = { ...editForm };

    if (body.productType === "free") {
      body.prices = { day: 0, week: 0 };
      if (!body.downloadLink.trim()) {
        alert("Free product needs a download link.");
        return;
      }
    }

    delete body.productType;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${editForm.slug}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    if (data.success) {
      alert("Updated");
      setEditOpen(false);
      fetchProducts();
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className="container">
        <h1 className={styles.title}>Manage Products</h1>

        <div className={styles.grid}>
          {products.map(item => (
            <div key={item._id} className={styles.card}>
              <img src={item.image} className={styles.thumb} alt={item.name} />

              <div className={styles.info}>
                <h3>{item.name}</h3>
                <p className={styles.slug}>/{item.slug}</p>

                {item.prices.day === 0 ? (
                  <p className={styles.free}>Free Product</p>
                ) : (
                  <p className={styles.paid}>
                    ₹{item.prices.day} Day • ₹{item.prices.week} Week
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

        {/* EDIT MODAL */}
        {editOpen && editForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>Edit Product</h2>

              {/* Type */}
              <div className={styles.modalGroup}>
                <label>Product Type</label>
                <select
                  value={editForm.productType}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, productType: e.target.value } : null)}
                >
                  <option value="paid">Paid</option>
                  <option value="free">Free</option>
                </select>
              </div>

              {/* Basic */}
              <div className={styles.modalGroup}>
                <label>Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>

              {/* STATUS BADGE */}
              <div className={styles.modalGroup}>
                <label>Status Badge</label>
                <select
                  value={String(editForm.statusEnabled)}
                  onChange={(e) =>
                    setEditForm(prev => prev ? {
                      ...prev,
                      statusEnabled: e.target.value === "true",
                    } : null)
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
                    placeholder="Main Account Safe"
                    value={editForm.statusLabel || ""}
                    onChange={(e) =>
                      setEditForm(prev => prev ? {
                        ...prev,
                        statusLabel: e.target.value,
                      } : null)
                    }
                  />
                </div>
              )}

              <div className={styles.modalGroup}>
                <label>Description</label>
                <input
                  value={editForm.desc}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, desc: e.target.value } : null)}
                />
              </div>

              <div className={styles.modalGroup}>
                <label>Image</label>
                <input
                  value={editForm.image}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, image: e.target.value } : null)}
                />
              </div>

              <div className={styles.modalGroup}>
                <label>Download Link (Free only)</label>
                <input
                  value={editForm.downloadLink || ""}
                  disabled={editForm.productType === "paid"}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, downloadLink: e.target.value } : null)}
                />
              </div>

              {/* Price */}
              {editForm.productType === "paid" && (
                <>
                  <div className={styles.modalGroup}>
                    <label>1 Day Price</label>
                    <input
                      type="number"
                      value={editForm.prices.day}
                      onChange={(e) =>
                        setEditForm(prev => prev ? {
                          ...prev,
                          prices: { ...prev.prices, day: Number(e.target.value) || 0 },
                        } : null)
                      }
                    />
                  </div>

                  <div className={styles.modalGroup}>
                    <label>1 Week Price</label>
                    <input
                      type="number"
                      value={editForm.prices.week}
                      onChange={(e) =>
                        setEditForm(prev => prev ? {
                          ...prev,
                          prices: { ...prev.prices, week: Number(e.target.value) || 0 },
                        } : null)
                      }
                    />
                  </div>
                </>
              )}

              {/* Enable features */}
              <div className={styles.modalGroup}>
                <label>Enable Features</label>
                <select
                  value={String(editForm.featuresEnabled)}
                  onChange={(e) =>
                    setEditForm(prev => prev ? { ...prev, featuresEnabled: e.target.value === "true" } : null)
                  }
                >
                  <option value="false">Disabled</option>
                  <option value="true">Enabled</option>
                </select>
              </div>

              {/* FEATURE BUILDER */}
              {editForm.featuresEnabled && (
                <div className={styles.featureBox}>
                  <h3>Features</h3>

                  <button className={styles.addBtn} onClick={addCategory}>
                    + Add Category
                  </button>

                  {Object.keys(editForm.featuresData).map(cat => (
                    <div key={cat} className={styles.categoryBlock}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <h4>{cat}</h4>
                        <div>
                          <button className={styles.smallBtn} onClick={() => renameCategory(cat)}>Rename</button>
                          <button className={styles.smallBtn} onClick={() => deleteCategory(cat)}>Delete</button>
                          <button className={styles.smallBtn} onClick={() => addSection(cat)}>+ Section</button>
                        </div>
                      </div>

                      {editForm.featuresData[cat].map((sec: any, idx: number) => (
                        <div key={idx} className={styles.sectionBlock}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong>{sec.title}</strong>
                            <div>
                              <button className={styles.smallBtn} onClick={() => renameSection(cat, idx)}>Rename</button>
                              <button className={styles.smallBtn} onClick={() => deleteSection(cat, idx)}>Delete</button>
                              <button className={styles.smallBtn} onClick={() => addItem(cat, idx)}>+ Item</button>
                            </div>
                          </div>

                          <ul className={styles.itemList}>
                            {sec.items.map((item: string, itemIndex: number) => (
                              <li key={itemIndex} style={{ display: "flex", justifyContent: "space-between" }}>
                                {item}
                                <div>
                                  <button className={styles.smallBtn} onClick={() => editItem(cat, idx, itemIndex)}>Edit</button>
                                  <button className={styles.smallBtn} onClick={() => deleteItem(cat, idx, itemIndex)}>Delete</button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.modalActions}>
                <button className={styles.closeBtn} onClick={() => setEditOpen(false)}>Close</button>
                <button className={styles.saveBtn} onClick={saveEdit}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}