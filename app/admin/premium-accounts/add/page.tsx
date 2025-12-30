"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./add.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in environment variables.");
}

// Get token from sessionStorage (set during admin login)
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("adminToken");
};

// Authenticated fetch with 401 redirect
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized");

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    sessionStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
    throw new Error("Session expired");
  }

  return res;
};

export default function AddPremiumAccount() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [badges, setBadges] = useState<string[]>([]);
  const [currentBadge, setCurrentBadge] = useState("");

  const [img, setImg] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [currentGalleryUrl, setCurrentGalleryUrl] = useState("");

  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isAvailable, setIsAvailable] = useState(true);

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generated);
    } else {
      setSlug("");
    }
  }, [title]);

  // Add badge
  const addBadge = () => {
    if (!currentBadge.trim()) return;
    if (badges.includes(currentBadge.trim())) {
      alert("Badge already added");
      return;
    }
    setBadges([...badges, currentBadge.trim()]);
    setCurrentBadge("");
  };

  // Remove badge
  const removeBadge = (index: number) => {
    setBadges(badges.filter((_, i) => i !== index));
  };

  // Add gallery image
  const addGalleryImage = () => {
    if (!currentGalleryUrl.trim()) return;
    if (gallery.includes(currentGalleryUrl.trim())) {
      alert("Image already in gallery");
      return;
    }
    setGallery([...gallery, currentGalleryUrl.trim()]);
    setCurrentGalleryUrl("");
  };

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!title.trim() || !img.trim() || !desc.trim()) {
      alert("Title, Main Image, and Description are required.");
      setLoading(false);
      return;
    }

    const payload = {
      title: title.trim(),
      badges,
      img: img.trim(),
      gallery,
      desc: desc.trim(),
      slug,
      price: Number(price) || 0,
      isAvailable,
    };

    try {
      const res = await apiFetch("/premium-accounts/admin", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to create account");
      }

      alert("Premium account created successfully!");
      router.push("/admin/premium-accounts");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account");
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Auth check on mount
  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
    }
  }, [router]);

  // Prevent hydration mismatch
  if (!getToken()) {
    return <p className={styles.loading}>Redirecting to login...</p>;
  }

  return (
    <section className={styles.dashboard}>
      <div className="container">
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Add Premium Account</h1>
        </header>

        {error && <p style={{ color: "red", margin: "1rem 0" }}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title & Slug */}
          <div className={styles.formGroup}>
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Netflix Ultra HD"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Slug (auto-generated)</label>
            <input type="text" value={slug} readOnly className={styles.readonly} />
          </div>

          {/* Badges */}
          <div className={styles.formGroup}>
            <label>Badges</label>
            <div className={styles.inputRow}>
              <input
                type="text"
                value={currentBadge}
                onChange={(e) => setCurrentBadge(e.target.value)}
                placeholder="e.g. 4K, Ad-Free"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBadge())}
              />
              <button type="button" onClick={addBadge}>
                Add Badge
              </button>
            </div>

            {badges.length > 0 && (
              <div className={styles.tagList}>
                {badges.map((b, i) => (
                  <span key={i} className={styles.tag}>
                    {b}
                    <button
                      type="button"
                      onClick={() => removeBadge(i)}
                      className={styles.removeTag}
                      aria-label="Remove badge"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Main Image */}
          <div className={styles.formGroup}>
            <label>Main Image URL *</label>
            <input
              type="url"
              value={img}
              onChange={(e) => setImg(e.target.value)}
              required
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Gallery */}
          <div className={styles.formGroup}>
            <label>Gallery Images (optional)</label>
            <div className={styles.inputRow}>
              <input
                type="url"
                value={currentGalleryUrl}
                onChange={(e) => setCurrentGalleryUrl(e.target.value)}
                placeholder="https://example.com/gallery1.jpg"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGalleryImage())}
              />
              <button type="button" onClick={addGalleryImage}>
                Add Image
              </button>
            </div>

            {gallery.length > 0 && (
              <div className={styles.galleryPreview}>
                {gallery.map((url, i) => (
                  <div key={i} className={styles.galleryItem}>
                    <img src={url} alt={`Gallery ${i + 1}`} className={styles.galleryThumb} />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className={styles.removeGallery}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label>Description *</label>
            <textarea
              rows={5}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
              placeholder="Full account details, warranty, etc."
            />
          </div>

          {/* Price & Availability */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Price (₹)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="0"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <select value={isAvailable ? "available" : "sold"} onChange={(e) => setIsAvailable(e.target.value === "available")}>
                <option value="available">Available</option>
                <option value="sold">Sold / Unavailable</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Creating..." : "Create Premium Account"}
          </button>
        </form>
      </div>
    </section>
  );
}