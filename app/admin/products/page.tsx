"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ← This was missing!
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

// Get token from sessionStorage
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("adminToken");
};

// Authenticated fetch
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
  const router = useRouter(); // ← Now properly imported

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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
    if (!editForm?.featuresData?.[cat]?.[index]) return;

    const current = editForm.featuresData[cat][index].title;
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
    if (!editForm?.featuresData?.[cat]) return;

    updateFeatures((prev) => ({
      ...prev,
      [cat]: (prev[cat] || []).filter((_, i) => i !== index),
    }));
  };

  const addItem = (cat: string, secIndex: number) => {
    if (!editForm?.featuresData?.[cat]?.[secIndex]) return;

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
    if (!editForm?.featuresData?.[cat]?.[secIndex]?.items[itemIndex]) return;

    const current = editForm.featuresData[cat][secIndex].items[itemIndex];
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
    if (!editForm?.featuresData?.[cat]?.[secIndex]) return;

    updateFeatures((prev) => {
      const items = prev[cat][secIndex].items.filter((_, i) => i !== itemIndex);
      const sections = [...prev[cat]];
      sections[secIndex] = { ...sections[secIndex], items };
      return { ...prev, [cat]: sections };
    });
  };

  const saveEdit = async () => {
    if (!editForm) return;

    const body: Partial<Product> = { ...editForm };

    if (editForm.productType === "free") {
      body.prices = { day: 0, week: 0 };
      if (!editForm.downloadLink?.trim()) {
        alert("Free products require a download link.");
        return;
      }
    }

    delete (body as any).productType;

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

  // Check auth and fetch products
  useEffect(() => {
    const token = getToken();

    if (!token) {
      setIsAuthenticated(false);
      router.replace("/admin/login");
      return;
    }

    setIsAuthenticated(true);
    fetchProducts();
  }, [router]);

  // Neutral loading screen to avoid hydration mismatch
  if (isAuthenticated === null || loading) {
    return (
      <div className={styles.wrapper}>
        <div className="container">
          <p className={styles.loading}>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null; // redirecting
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className="container">
          <p className={styles.error}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className="container">
        <h1 className={styles.title}>Manage Products</h1>

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

              {/* All your existing form fields here (unchanged from your working version) */}
              {/* ... (the full modal content you already have) ... */}

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