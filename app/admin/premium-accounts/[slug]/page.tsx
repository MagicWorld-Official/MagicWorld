"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

interface AccountItem {
  _id: string;
  title: string;
  type: string[];
  img: string;
  gallery: string[];
  desc: string;
  price: number;
  isAvailable: boolean;
  slug: string;
}

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function EditPremiumAccount({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountItem | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<string[]>([]);
  const [badge, setBadge] = useState("");

  const [img, setImg] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [galleryInput, setGalleryInput] = useState("");

  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      const res = await fetch(
        `http://localhost:5000/premium-accounts/${slug}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        router.push("/admin/premium-accounts");
        return;
      }

      const data = await res.json();

      setAccount(data);
      setTitle(data.title ?? "");
      setType(Array.isArray(data.type) ? data.type : []);
      setImg(data.img ?? "");
      setGallery(Array.isArray(data.gallery) ? data.gallery : []);
      setDesc(data.desc ?? "");
      setPrice(Number(data.price) || 0);
      setIsAvailable(Boolean(data.isAvailable));

      setLoading(false);
    };

    fetchData();
  }, [slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    const payload = {
      title,
      type,
      img,
      gallery,
      desc,
      price,
      isAvailable,
      slug: generateSlug(title), // 🔥 AUTO-UPDATE SLUG
    };

    const res = await fetch(
      `http://localhost:5000/premium-accounts/${account._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      router.push("/admin/premium-accounts");
    }
  };

  if (loading) return <p>Loading account…</p>;

  return (
    <div className={styles.dashboard}>
      <div className="container">
        <h1 className={styles.title}>Edit Premium Account</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

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

          <div className={styles.badgeList}>
            {type.map((b, i) => (
              <span key={i} className={styles.badge}>{b}</span>
            ))}
          </div>

          <label>Main Image URL</label>
          <input value={img} onChange={(e) => setImg(e.target.value)} required />

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

          <div className={styles.galleryList}>
            {gallery.map((g, i) => (
              <span key={i} className={styles.galleryItem}>{g}</span>
            ))}
          </div>

          <label>Description</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} required />

          <label>Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          <label>Available?</label>
          <select
            value={isAvailable ? "yes" : "no"}
            onChange={(e) => setIsAvailable(e.target.value === "yes")}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <button type="submit" className={styles.submitBtn}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
