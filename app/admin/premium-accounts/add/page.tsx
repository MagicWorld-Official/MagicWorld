"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./add.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function AddPremiumAccount() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<string[]>([]);
  const [badge, setBadge] = useState("");

  const [img, setImg] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [galleryInput, setGalleryInput] = useState("");

  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isAvailable, setIsAvailable] = useState(true);

  const generateSlug = (text: string) =>
    text.toLowerCase().trim().replace(/\s+/g, "-");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      img,
      gallery,
      desc,
      price: Number(price) || 0,
      isAvailable,
      slug: generateSlug(title),

      // 🔑 FIX: send badges in both keys
      badges: type,
      type: type,
    };

    const res = await fetch(`${API_URL}/premium-accounts/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/premium-accounts");
    } else {
      console.error(await res.text());
      alert("Failed to create account");
    }
  };

  return (
    <section className={styles.dashboard}>
      <div className="container">
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Add Premium Account</h1>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Badges</label>
            <div className={styles.badgeInputRow}>
              <input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  if (!badge.trim()) return;
                  setType([...type, badge.trim()]);
                  setBadge("");
                }}
              >
                Add
              </button>
            </div>

            {type.length > 0 && (
              <div className={styles.badgeList}>
                {type.map((b, i) => (
                  <span key={i} className={styles.badge}>
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Main Image URL</label>
            <input
              type="text"
              value={img}
              onChange={(e) => setImg(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Gallery Images</label>
            <div className={styles.badgeInputRow}>
              <input
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  if (!galleryInput.trim()) return;
                  setGallery([...gallery, galleryInput.trim()]);
                  setGalleryInput("");
                }}
              >
                Add
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value ? Number(e.target.value) : "")
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Availability</label>
              <select
                value={isAvailable ? "yes" : "no"}
                onChange={(e) => setIsAvailable(e.target.value === "yes")}
              >
                <option value="yes">Available</option>
                <option value="no">Unavailable</option>
              </select>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Create Account
          </button>
        </form>
      </div>
    </section>
  );
}
