"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./product.module.css";
import Features from "../../../components/features/Features";

// Define the expected shape for featuresData (adjust if your Features component expects something more specific)
type FeaturesData = Record<
  string,
  { title: string; items: string[] }[]
>;

type Product = {
  name: string;
  image?: string;
  desc?: string;
  version?: string;
  size?: string;
  updated?: string;
  longDesc?: string;

  /* STATUS */
  statusEnabled?: boolean;
  statusLabel?: string;

  prices?: { day?: number; week?: number };
  downloadLink?: string;
  featuresEnabled?: boolean;
  featuresData?: FeaturesData; // Now properly typed as optional FeaturesData
};

export default function ProductClient({ product }: { product: Product }) {
  const isFree =
    (product.prices?.day ?? 0) === 0 && (product.prices?.week ?? 0) === 0;

  // ORDER POPUP
  const [orderOpen, setOrderOpen] = useState(false);
  const [plan, setPlan] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

  useEffect(() => {
    if (!orderOpen) {
      setMessage(null);
    }
  }, [orderOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOrderOpen(false);
    }
    if (orderOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [orderOpen]);

  const openOrder = (selectedPlan: string) => {
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
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      return;
    }

    if (!ACCEPTED_TYPES.includes(f.type)) {
      setMessage({ type: "error", text: "Only JPG, PNG or WEBP images are allowed." });
      setFile(null);
      return;
    }

    if (f.size > MAX_FILE_SIZE) {
      setMessage({ type: "error", text: "File is too large. Max 5MB allowed." });
      setFile(null);
      return;
    }

    setFile(f);
    setMessage(null);
  };

  const placeOrder = async () => {
    setMessage(null);

    if (!email.trim() || !telegram.trim()) {
      setMessage({ type: "error", text: "Email and Telegram Username are required." });
      return;
    }

    if (!file) {
      setMessage({ type: "error", text: "Payment screenshot is required." });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("productName", product.name);
      formData.append("plan", plan);
      formData.append(
        "price",
        String(plan === "1 Day" ? product.prices?.day ?? 0 : product.prices?.week ?? 0)
      );
      formData.append("email", email);
      formData.append("telegram", telegram);
      formData.append("status", "pending");
      formData.append("file", file);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeout);

      if (!res.ok) {
        let text = "Failed to place order.";
        try {
          const errBody = await res.json();
          if (errBody?.message) text = errBody.message;
        } catch {}
        setMessage({ type: "error", text });
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data?.success) {
        setMessage({ type: "success", text: "Order placed! We'll verify payment manually." });
        setTimeout(() => closeOrder(), 1800);
      } else {
        setMessage({ type: "error", text: data?.message || "Failed to place order." });
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setMessage({ type: "error", text: "Request timed out. Try again." });
      } else {
        setMessage({ type: "error", text: "Network error. Try again later." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className={styles.product}>
        <div className="container">
          <div className={styles.inner}>
            {/* LEFT IMAGE */}
            <div className={styles.left}>
              <div className={styles.imageWrap}>
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className={styles.image}
                    priority
                    sizes="(max-width: 900px) 100vw, 420px"
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>No image</div>
                )}
              </div>
            </div>

            {/* RIGHT INFO */}
            <div className={styles.right}>
              <h1 className={styles.title}>{product.name}</h1>
              {product.statusEnabled && product.statusLabel && (
                <div className={styles.statusBadge}>
                  {product.statusLabel}
                </div>
              )}
              <p className={styles.desc}>{product.desc}</p>

              <ul className={styles.meta}>
                <li>
                  <strong>Version:</strong> {product.version ?? "—"}
                </li>
                <li>
                  <strong>Size:</strong> {product.size ?? "—"}
                </li>
                <li>
                  <strong>Updated:</strong> {product.updated ?? "—"}
                </li>
              </ul>

              {product.longDesc && <p className={styles.longDesc}>{product.longDesc}</p>}

              <div className={styles.buttons}>
                {isFree ? (
                  <a href={product.downloadLink} className={styles.downloadBtn} download>
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

      {/* FEATURES - Only render if enabled AND data exists */}
      {product.featuresEnabled && product.featuresData && (
        <Features data={product.featuresData} />
      )}

      {/* ORDER POPUP */}
      {orderOpen && (
        <div
          className={styles.orderOverlay}
          onClick={closeOrder}
          role="dialog"
          aria-modal="true"
          aria-label="Order dialog"
        >
          <div
            className={styles.orderBox}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <h2 className={styles.orderTitle}>Complete Purchase</h2>

            <p className={styles.orderProduct}>
              <strong>Product:</strong> {product.name}
            </p>
            <p className={styles.orderPlan}>
              <strong>Plan:</strong> {plan}
            </p>

            <div className={styles.payBox}>
              <h3>Send Payment</h3>
              <p>
                UPI ID: <b>{process.env.NEXT_PUBLIC_UPI_ID ?? "yodhdhillon02@ybl"}</b>
              </p>
              <p>After payment, upload screenshot below.</p>
            </div>

            <div className={styles.orderGroup}>
              <label htmlFor="order-email">Email Address</label>
              <input
                id="order-email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={styles.orderGroup}>
              <label htmlFor="order-telegram">Telegram Username</label>
              <input
                id="order-telegram"
                type="text"
                placeholder="@username"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={styles.orderGroup}>
              <label htmlFor="order-file">Upload Payment Screenshot</label>
              <input
                id="order-file"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                disabled={loading}
              />
              <small style={{ color: "#666" }}>Max 5MB. JPG / PNG / WEBP.</small>
            </div>

            {message && (
              <div
                role="status"
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 8,
                  background: message.type === "error" ? "#ffecec" : "#e6ffed",
                  color: message.type === "error" ? "#a00" : "#064e12",
                }}
              >
                {message.text}
              </div>
            )}

            <div className={styles.orderButtons}>
              <button
                className={styles.confirmBtn}
                onClick={placeOrder}
                disabled={loading}
                type="button"
              >
                {loading ? "Submitting..." : "Submit Order"}
              </button>
              <button className={styles.cancelBtn} onClick={closeOrder} type="button" disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}