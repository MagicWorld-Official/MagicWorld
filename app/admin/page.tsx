"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 🔐 Verify admin session on page load
  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        sessionStorage.removeItem("adminToken");
        router.replace("/admin/login");
      });
  }, []);

  // 🚪 Proper logout (httpOnly cookie)
  const logout = () => {
    sessionStorage.removeItem("adminToken");
    router.replace("/admin/login");
  };

  if (loading) {
    return <p style={{ padding: "20px" }}>Checking admin access…</p>;
  }

  return (
    <section className={styles.dashboard}>
      <div className="container">
        {/* TOP BAR */}
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>
              Manage content, products, and premium accounts
            </p>
          </div>

          <button className={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>

        {/* GRID */}
        <div className={styles.grid}>
          <Link href="/admin/products" className={styles.card}>
            <h3>Products</h3>
            <p>Add, edit, and manage store products.</p>
          </Link>

          <Link href="/admin/products/add" className={styles.card}>
            <h3>Add Product</h3>
            <p>Create a new product listing.</p>
          </Link>

          <Link href="/admin/orders" className={styles.card}>
            <h3>Orders</h3>
            <p>View and manage customer orders.</p>
          </Link>

          <Link href="/admin/premium-accounts" className={styles.card}>
            <h3>Premium Accounts</h3>
            <p>Manage premium account listings.</p>
          </Link>

          <div className={`${styles.card} ${styles.disabled}`}>
            <h3>Settings</h3>
            <p>Coming soon</p>
          </div>
        </div>
      </div>
    </section>
  );
}
