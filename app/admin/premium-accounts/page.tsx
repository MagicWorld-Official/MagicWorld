"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./accounts.module.css";

interface AccountItem {
  _id: string;
  title: string;
  img: string;
  price: number;
  isAvailable: boolean;
  slug: string;
}

export default function PremiumAccountsList() {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("http://localhost:5000/premium-accounts");
      const data = await res.json();

      // 🔧 normalize backend response without touching backend
      const normalized: AccountItem[] = (Array.isArray(data) ? data : []).map(
        (item: any) => ({
          _id: item._id,
          title: item.title,
          img: item.img,
          slug: item.slug,
          price: typeof item.price === "number" ? item.price : 0,
          isAvailable:
            typeof item.isAvailable === "boolean" ? item.isAvailable : true,
        })
      );

      setAccounts(normalized);
    } catch (err) {
      console.error("Fetch failed:", err);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("Delete this account permanently?")) return;

    await fetch(`http://localhost:5000/premium-accounts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchAccounts();
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading) return <p className={styles.loading}>Loading accounts…</p>;

  return (
    <section className={styles.dashboard}>
      <div className="container">
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Premium Accounts</h1>

          <Link href="/admin/premium-accounts/add" className={styles.addBtn}>
            + Add Account
          </Link>
        </header>

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
                />
                <span className={styles.accountTitle}>{acc.title}</span>
              </div>

              <span className={styles.price}>₹{acc.price}</span>

              <span
                className={
                  acc.isAvailable
                    ? styles.statusActive
                    : styles.statusInactive
                }
              >
                {acc.isAvailable ? "Available" : "Unavailable"}
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
      </div>
    </section>
  );
}
