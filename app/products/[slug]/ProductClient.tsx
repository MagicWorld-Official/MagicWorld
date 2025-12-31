"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./product.module.css";
import Features from "../../../components/features/Features";

type FeaturesData = Record<string, { title: string; items: string[] }[]>;

type Product = {
  name: string;
  image?: string;
  desc?: string;
  version?: string;
  size?: string;
  updated?: string;
  longDesc?: string;
  statusEnabled?: boolean;
  statusLabel?: string;
  prices?: { day?: number; week?: number };
  downloadLink?: string;
  featuresEnabled?: boolean;
  featuresData?: FeaturesData;
};

export default function ProductClient({ product }: { product: Product }) {
  const isFree = (product.prices?.day ?? 0) === 0 && (product.prices?.week ?? 0) === 0;

  // ORDER STATE
  const [orderOpen, setOrderOpen] = useState(false);
  const [plan, setPlan] = useState<"1 Day" | "1 Week" | "">("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

  // Reset message when modal closes
  useEffect(() => {
    if (!orderOpen) setMessage(null);
  }, [orderOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && setOrderOpen(false);
    if (orderOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [orderOpen]);

  const openOrder = (selectedPlan: "1 Day" | "1 Week") => {
    setPlan(selectedPlan);
    setOrderOpen(true);
  };

  const closeOrder = () => {
    setOrderOpen(false);
    setEmail("");
    setTelegram("");
    setFile(null);
    setLoading(false);
    setMessage(null);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFile(null);
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setMessage({ type: "error", text: "Only JPG, PNG, or WEBP images are allowed." });
      setFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: "error", text: "File too large. Maximum size is 5MB." });
      setFile(null);
      return;
    }

    setFile(file);
    setMessage(null);
  };

  const placeOrder = async () => {
    setMessage(null);

    if (!email.trim()) return setMessage({ type: "error", text: "Email is required." });
    if (!telegram.trim()) return setMessage({ type: "error", text: "Telegram username is required." });
    if (!file) return setMessage({ type: "error", text: "Payment screenshot is required." });

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("productName", product.name);
      formData.append("plan", plan);
      formData.append("price", String(plan === "1 Day" ? product.prices?.day ?? 0 : product.prices?.week ?? 0));
      formData.append("email", email.trim());
      formData.append("telegram", telegram.trim());
      formData.append("status", "pending");
      formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to submit order. Please try again.");
      }

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Order submitted successfully! We'll verify your payment soon." });
        setTimeout(closeOrder, 2500);
      } else {
        setMessage({ type: "error", text: data.message || "Order failed. Please try again." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Network error. Check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className={styles.product}>
        <div className="container">
          <div className={styles.inner}>
            {/* Image Section */}
            <div className={styles.left}>
              <div className={styles.imageWrap}>
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className={styles.image}
                    unoptimized // ← Fixes all external image errors permanently
                  />
                ) : (
                  <div className={styles.imagePlaceholder} />
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className={styles.right}>
              {product.statusEnabled && product.statusLabel && (
                <span className={styles.statusBadge}>{product.statusLabel}</span>
              )}

              <h1 className={styles.title}>{product.name}</h1>
              {product.desc && <p className={styles.desc}>{product.desc}</p>}

              <ul className={styles.meta}>
                {product.version && (
                  <li><strong>Version:</strong> {product.version}</li>
                )}
                {product.size && (
                  <li><strong>Size:</strong> {product.size}</li>
                )}
                {product.updated && (
                  <li><strong>Updated:</strong> {product.updated}</li>
                )}
              </ul>

              {product.longDesc && <p className={styles.longDesc}>{product.longDesc}</p>}

              <div className={styles.buttons}>
                {isFree ? (
                  <a
                    href={product.downloadLink || "#"}
                    className={styles.downloadBtn}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Free
                  </a>
                ) : (
                  <>
                    <button
                      className={styles.buyBtn}
                      onClick={() => openOrder("1 Day")}
                      disabled={loading}
                    >
                      Buy 1 Day – ₹{product.prices?.day ?? "—"}
                    </button>
                    <button
                      className={styles.buyBtn}
                      onClick={() => openOrder("1 Week")}
                      disabled={loading}
                    >
                      Buy 1 Week – ₹{product.prices?.week ?? "—"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {product.featuresEnabled && product.featuresData && (
        <Features data={product.featuresData} />
      )}

      {/* Order Modal */}
      {orderOpen && (
        <div className={styles.orderOverlay} onClick={closeOrder}>
          <div className={styles.orderBox} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.orderTitle}>Complete Your Purchase</h2>

            <div className={styles.orderSummary}>
              <p><strong>Product:</strong> {product.name}</p>
              <p><strong>Plan:</strong> {plan}</p>
              <p><strong>Price:</strong> ₹{plan === "1 Day" ? product.prices?.day : product.prices?.week}</p>
            </div>

            <div className={styles.payBox}>
              <h3>Payment Instructions</h3>
              <p>
                Send payment to UPI ID: <strong>{process.env.NEXT_PUBLIC_UPI_ID || "yodhdhillon02@ybl"}</strong>
              </p>
              <p>After payment, upload a clear screenshot below.</p>
            </div>

            <div className={styles.orderGroup}>
              <label>Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
                required
              />
            </div>

            <div className={styles.orderGroup}>
              <label>Telegram Username *</label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@yourusername"
                disabled={loading}
                required
              />
            </div>

            <div className={styles.orderGroup}>
              <label>Payment Screenshot *</label>
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                disabled={loading}
              />
              <small>Max 5MB • JPG, PNG, WEBP</small>
            </div>

            {message && (
              <div className={message.type === "success" ? styles.successMsg : styles.errorMsg}>
                {message.text}
              </div>
            )}

            <div className={styles.orderButtons}>
              <button
                className={styles.confirmBtn}
                onClick={placeOrder}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Order"}
              </button>
              <button
                className={styles.cancelBtn}
                onClick={closeOrder}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}