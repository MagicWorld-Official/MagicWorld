"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./accounts.module.css";

interface AccountItem {
  _id: string;
  title: string;
  img: string;
  price: number;
  isAvailable: boolean;
  slug: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("adminToken");
};

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized");

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    sessionStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
    return null as never;
  }

  return res;
};

export default function PremiumAccountsList() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch("/premium-accounts");
      if (!res) return;

      if (!res.ok) throw new Error("Failed to fetch accounts");

      const data = await res.json();

      const normalized: AccountItem[] = (Array.isArray(data) ? data : []).map((item: any) => ({
        _id: item._id || "",
        title: item.title || "Untitled",
        img: item.img || "/placeholder.jpg",
        slug: item.slug || "",
        price: typeof item.price === "number" ? item.price : 0,
        isAvailable: typeof item.isAvailable === "boolean" ? item.isAvailable : true,
      }));

      setAccounts(normalized);
    } catch (err: any) {
      setError(err.message || "Failed to load accounts");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("Permanently delete this premium account?")) return;

    try {
      const res = await apiFetch(`/premium-accounts/admin/${id}`, {
        method: "DELETE",
      });
      if (!res) return;

      if (!res.ok) throw new Error("Delete failed");

      alert("Account deleted!");
      fetchAccounts();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  // Auth check on mount (client-only)
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setIsAuthenticated(true);
    fetchAccounts();
  }, [router]);

  // Show nothing during auth check to prevent hydration mismatch
  if (isAuthenticated === null) {
    return <p className={styles.loading}>Checking authentication...</p>;
  }

  return (
    <section className={styles.dashboard}>
      <div className="container">
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Premium Accounts</h1>
          <Link href="/admin/premium-accounts/add" className={styles.addBtn}>
            + Add Account
          </Link>
        </header>

        {loading && <p className={styles.loading}>Loading accounts…</p>}

        {error && <p style={{ color: "red", margin: "1rem 0" }}>{error}</p>}

        {!loading && !error && accounts.length === 0 && (
          <p style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            No premium accounts found. Click "+ Add Account" to create one.
          </p>
        )}

        {accounts.length > 0 && (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Account</span>
              <span>Price</span>
              <span>Status</span>
              <span className={styles.actionsCol}>Actions</span>
            </div>

            {accounts.map((acc) => (
              <div key={acc._id} className={styles.tableRow}>
                <div className={styles.accountCell}>
                  <img
                    src={acc.img}
                    alt={acc.title}
                    className={styles.tableImg}
                    onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                  />
                  <span className={styles.accountTitle}>{acc.title}</span>
                </div>

                <span className={styles.price}>₹{acc.price}</span>

                <span
                  className={acc.isAvailable ? styles.statusActive : styles.statusInactive}
                  aria-label={acc.isAvailable ? "Available" : "Sold"}
                >
                  {acc.isAvailable ? "Available" : "Sold"}
                </span>

                <div className={styles.actions}>
                  <Link
                    href={`/admin/premium-accounts/${acc.slug}`}
                    className={styles.editBtn}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteAccount(acc._id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}