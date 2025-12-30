"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./edit.module.css";

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

export default function EditPremiumAccount({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const paramsData = use(params);
  const slug = paramsData.slug;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking

  const [accountId, setAccountId] = useState<string>("");

  const [title, setTitle] = useState("");
  const [slugState, setSlugState] = useState("");
  const [badges, setBadges] = useState<string[]>([]);
  const [currentBadge, setCurrentBadge] = useState("");

  const [img, setImg] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [currentGalleryUrl, setCurrentGalleryUrl] = useState("");

  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isAvailable, setIsAvailable] = useState(true);

  // Auto-generate slug
  useEffect(() => {
    if (title) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setSlugState(generated);
    }
  }, [title]);

  // Check auth + fetch account
  useEffect(() => {
    const token = getToken();

    if (!token) {
      setIsAuthenticated(false);
      router.replace("/admin/login");
      return;
    }

    setIsAuthenticated(true);

    const fetchAccount = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await apiFetch(`/premium-accounts/${slug}`);

        if (!res.ok) throw new Error("Account not found");

        const data = await res.json();

        setAccountId(data._id || "");
        setTitle(data.title || "");
        setSlugState(data.slug || "");
        setBadges(Array.isArray(data.badges) ? data.badges : []);
        setImg(data.img || "");
        setGallery(Array.isArray(data.gallery) ? data.gallery : []);
        setDesc(data.desc || "");
        setPrice(data.price || 0);
        setIsAvailable(data.isAvailable !== false);
      } catch (err: any) {
        setError(err.message || "Failed to load account");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [slug, router]);

  // Badge handlers
  const addBadge = () => {
    if (!currentBadge.trim()) return;
    if (badges.includes(currentBadge.trim())) {
      alert("Badge already added");
      return;
    }
    setBadges([...badges, currentBadge.trim()]);
    setCurrentBadge("");
  };

  const removeBadge = (index: number) => {
    setBadges(badges.filter((_, i) => i !== index));
  };

  const addGalleryImage = () => {
    if (!currentGalleryUrl.trim()) return;
    if (gallery.includes(currentGalleryUrl.trim())) {
      alert("Image already added");
      return;
    }
    setGallery([...gallery, currentGalleryUrl.trim()]);
    setCurrentGalleryUrl("");
  };

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) {
      alert("Account ID missing");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      badges,
      img: img.trim(),
      gallery,
      desc: desc.trim(),
      slug: slugState,
      price: Number(price) || 0,
      isAvailable,
    };

    try {
      const res = await apiFetch(`/premium-accounts/admin/${accountId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Update failed");
      }

      alert("Account updated successfully!");
      router.push("/admin/premium-accounts");
    } catch (err: any) {
      setError(err.message || "Failed to save");
      alert(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Show neutral loading until we know auth status
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
        <h1 className={styles.pageTitle}>Edit Premium Account</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title */}
          <div className={styles.group}>
            <label>Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className={styles.group}>
            <label>Slug (auto-generated)</label>
            <input type="text" value={slugState} readOnly className={styles.readonly} />
          </div>

          {/* Badges */}
          <div className={styles.group}>
            <label>Badges</label>
            <div className={styles.inputRow}>
              <input
                type="text"
                value={currentBadge}
                onChange={(e) => setCurrentBadge(e.target.value)}
                placeholder="e.g. 4K, Family Sharing"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBadge())}
              />
              <button type="button" onClick={addBadge}>
                Add
              </button>
            </div>

            {badges.length > 0 && (
              <div className={styles.tagList}>
                {badges.map((b, i) => (
                  <span key={i} className={styles.tag}>
                    {b}
                    <button type="button" onClick={() => removeBadge(i)} className={styles.removeBtn}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Main Image */}
          <div className={styles.group}>
            <label>Main Image URL *</label>
            <input type="url" value={img} onChange={(e) => setImg(e.target.value)} required />
            {img && (
              <div className={styles.imagePreview}>
                <Image src={img} alt="Preview" width={400} height={225} className={styles.previewImg} unoptimized />
              </div>
            )}
          </div>

          {/* Gallery */}
          <div className={styles.group}>
            <label>Gallery Images</label>
            <div className={styles.inputRow}>
              <input
                type="url"
                value={currentGalleryUrl}
                onChange={(e) => setCurrentGalleryUrl(e.target.value)}
                placeholder="https://example.com/img.jpg"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGalleryImage())}
              />
              <button type="button" onClick={addGalleryImage}>
                Add
              </button>
            </div>

            {gallery.length > 0 && (
              <div className={styles.galleryPreview}>
                {gallery.map((url, i) => (
                  <div key={i} className={styles.galleryItem}>
                    <Image src={url} alt={`Gallery ${i + 1}`} width={200} height={120} className={styles.galleryThumb} unoptimized />
                    <button type="button" onClick={() => removeGalleryImage(i)} className={styles.removeBtn}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className={styles.group}>
            <label>Description *</label>
            <textarea rows={6} value={desc} onChange={(e) => setDesc(e.target.value)} required />
          </div>

          {/* Price & Status */}
          <div className={styles.row}>
            <div className={styles.group}>
              <label>Price (₹)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
              />
            </div>

            <div className={styles.group}>
              <label>Status</label>
              <select value={isAvailable ? "available" : "sold"} onChange={(e) => setIsAvailable(e.target.value === "available")}>
                <option value="available">Available</option>
                <option value="sold">Sold / Unavailable</option>
              </select>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}