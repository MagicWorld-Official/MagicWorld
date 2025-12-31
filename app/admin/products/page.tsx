// app/admin/manage-products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./manageProducts.module.css";
import ProductEditModal from "./ProductEditModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface Product {
  _id: string;
  slug: string;
  name: string;
  desc: string;
  image: string;
  prices: { day: number; week: number };
  // ... other fields
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const getToken = () => (typeof window !== "undefined" ? sessionStorage.getItem("adminToken") : null);

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token.");

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (res.status === 401) throw new Error("Session expired. Please log in again.");
  return res;
};

export default function ManageProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/products");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err: any) {
      if (err.message.includes("Session expired")) router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await apiFetch(`/products/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).message || "Delete failed");
      alert("Product deleted!");
      setDeleteId(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSave = async (product: Product) => {
    const method = product._id ? "PUT" : "POST";
    const url = product._id ? `/products/${product._id}` : "/products";

    const res = await apiFetch(url, {
      method,
      body: JSON.stringify(product),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Save failed");
    }

    fetchProducts();
  };

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }
    fetchProducts();
  }, [router]);

  if (loading) return <p>Loading products...</p>;

  return (
    <div className={styles.wrapper}>
      <div className="container">
        <h1 className={styles.title}>Manage Products</h1>

        <button className={styles.addBtn} onClick={() => setEditProduct({} as Product)}>
          + Add New Product
        </button>

        <div className={styles.grid}>
          {products.map((item) => (
            <div key={item._id} className={styles.card}>
              <img src={item.image} className={styles.thumb} alt={item.name} />
              <div className={styles.info}>
                <h3>{item.name}</h3>
                <p className={styles.slug}>/{item.slug}</p>
                {item.prices.day === 0 && item.prices.week === 0 ? (
                  <p className={styles.free}>Free</p>
                ) : (
                  <p className={styles.paid}>
                    ₹{item.prices.day}/day • ₹{item.prices.week}/week
                  </p>
                )}
              </div>
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => setEditProduct(item)}>
                  Edit
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => setDeleteId(item._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <ProductEditModal
          product={editProduct}
          isOpen={!!editProduct}
          onClose={() => setEditProduct(null)}
          onSave={handleSave}
        />

        <DeleteConfirmModal
          isOpen={!!deleteId}
          productName={products.find(p => p._id === deleteId)?.name || ""}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </div>
  );
}