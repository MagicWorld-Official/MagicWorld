"use client";

import { useState } from "react";
import styles from "./addProduct.module.css";

type FeatureSection = {
  title: string;
  items: string[];
};

type FeaturesData = {
  [key: string]: FeatureSection[];
};

export default function AddProductPage() {
  const [loading, setLoading] = useState(false);

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
    prices: { day: number; week: number };
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
    featuresEnabled: false,
    featuresData: {}
  });

  // -------------------------------------------------------------
  // HANDLE INPUTS
  // -------------------------------------------------------------
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "productType") {
      setForm(prev => ({
        ...prev,
        productType: value,
        prices: value === "free" ? { day: 0, week: 0 } : prev.prices
      }));
      return;
    }

    if (name.startsWith("prices.")) {
      const key = name.split(".")[1];
      setForm(prev => ({
        ...prev,
        prices: { ...prev.prices, [key]: Number(value) }
      }));
      return;
    }

    if (name === "name") {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-");

      setForm(prev => ({ ...prev, name: value, slug }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  // -------------------------------------------------------------
  // FEATURE HANDLING
  // -------------------------------------------------------------
  const addCategory = () => {
    const name = prompt("Category name:");
    if (!name) return;

    setForm(prev => ({
      ...prev,
      featuresData: { ...prev.featuresData, [name]: [] }
    }));
  };

  const addSection = (cat: string) => {
    const title = prompt("Section title:");
    if (!title) return;

    setForm(prev => ({
      ...prev,
      featuresData: {
        ...prev.featuresData,
        [cat]: [...(prev.featuresData[cat] || []), { title, items: [] }]
      }
    }));
  };

  const addItem = (cat: string, index: number) => {
    const text = prompt("Feature item:");
    if (!text) return;

    setForm(prev => {
      const copy = { ...prev.featuresData };
      copy[cat] = [...copy[cat]];
      copy[cat][index] = {
        ...copy[cat][index],
        items: [...copy[cat][index].items, text]
      };

      return { ...prev, featuresData: copy };
    });
  };

  // -------------------------------------------------------------
  // SUBMIT FORM
  // -------------------------------------------------------------
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (form.productType === "free" && !form.downloadLink.trim()) {
      alert("Free product must contain a download link.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.success) {
        alert("Product added successfully.");

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
          featuresEnabled: false,
          featuresData: {}
        });

        window.location.href = "/admin/products";
      } else {
        alert("Failed to add product.");
      }
    } catch {
      alert("Something went wrong.");
    }

    setLoading(false);
  };

        // -------------------------------------------------------------

        return (
          <div className={styles.wrapper}>
            <div className="container">
              <h1 className={styles.title}>Add New Product</h1>

              <form className={styles.form} onSubmit={handleSubmit}>

                {/* TYPE */}
                <div className={styles.group}>
                  <label>Product Type</label>
                  <select name="productType" value={form.productType} onChange={handleChange}>
                    <option value="paid">Paid Product</option>
                    <option value="free">Free Product</option>
                  </select>
                </div>

                {/* BASIC */}
                <div className={styles.group}>
                  <label>Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required />
                </div>

                <div className={styles.group}>
                  <label>Slug</label>
                  <input name="slug" value={form.slug} onChange={handleChange} required />
                </div>

                <div className={styles.group}>
                  <label>Description</label>
                  <input name="desc" value={form.desc} onChange={handleChange} required />
                </div>

                <div className={styles.group}>
                  <label>Image URL</label>
                  <input name="image" value={form.image} onChange={handleChange} required />
                </div>

                <div className={styles.group}>
                  <label>Download Link {form.productType === "free" && "(required)"}</label>
                  <input
                    name="downloadLink"
                    value={form.downloadLink}
                    onChange={handleChange}
                    disabled={form.productType === "paid"}
                    required={form.productType === "free"}
                  />
                </div>

                {/* DETAILS */}
                <div className={styles.row}>
                  <div className={styles.group}>
                    <label>Version</label>
                    <input name="version" value={form.version} onChange={handleChange} />
                  </div>

                  <div className={styles.group}>
                    <label>Size</label>
                    <input name="size" value={form.size} onChange={handleChange} />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.group}>
                    <label>Updated On</label>
                    <input name="updated" value={form.updated} onChange={handleChange} />
                  </div>

                  <div className={styles.group}>
                    <label>Category</label>
                    <input name="category" value={form.category} onChange={handleChange} />
                  </div>
                </div>

                {/* PRICES */}
                {form.productType === "paid" && (
                  <div className={styles.row}>
                    <div className={styles.group}>
                      <label>1 Day Price</label>
                      <input
                        type="number"
                        name="prices.day"
                        value={form.prices.day}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.group}>
                      <label>1 Week Price</label>
                      <input
                        type="number"
                        name="prices.week"
                        value={form.prices.week}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* FEATURES ENABLE */}
                <div className={styles.group}>
                  <label>Enable Features</label>
                  <select
                    name="featuresEnabled"
                    value={String(form.featuresEnabled)}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        featuresEnabled: e.target.value === "true"
                      }))
                    }
                  >
                    <option value="false">Disabled</option>
                    <option value="true">Enabled</option>
                  </select>
                </div>

                {/* FEATURE BUILDER */}
                {form.featuresEnabled && (
                  <div className={styles.featureBox}>
                    <h2>Features</h2>

                    <button type="button" className={styles.addBtn} onClick={addCategory}>
                      + Add Category
                    </button>

                    {Object.keys(form.featuresData).length === 0 && (
                      <p className={styles.empty}>No categories yet</p>
                    )}

                    {Object.keys(form.featuresData).map(cat => (
                      <div key={cat} className={styles.categoryBlock}>
                        <h3>{cat}</h3>

                        <button className={styles.smallBtn} type="button" onClick={() => addSection(cat)}>
                          + Add Section
                        </button>

                        {form.featuresData[cat].map((sec: any, idx: number) => (
                          <div key={idx} className={styles.sectionBlock}>
                            <strong>{sec.title}</strong>

                            <button
                              type="button"
                              className={styles.smallBtn}
                              onClick={() => addItem(cat, idx)}
                            >
                              + Add Item
                            </button>

                            {sec.items.length === 0 && (
                              <p className={styles.emptySmall}>No items yet</p>
                            )}

                            <ul className={styles.itemList}>
                              {sec.items.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* SUBMIT */}
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? "Adding..." : "Add Product"}
                </button>
              </form>
            </div>
          </div>
        );
      }
