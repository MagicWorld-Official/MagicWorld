"use client";

import { useState } from "react";
import styles from "./contact.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ type: "success", message: data.message });
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus({ type: "error", message: data.message || "Failed to send" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setStatus(null);
  };

  return (
    <section className={styles.contact}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.left}>
            <h1 className={styles.title}>Contact Us</h1>
            <p className={styles.subtitle}>
              Have a question or need support? Send us a message and we'll get back to you soon.
            </p>
            <ul className={styles.infoList}>
              <li><strong>Email:</strong> <a href="mailto:magicworldofficial.care@gmail.com">magicworldofficial.care@gmail.com</a></li>
              <li><strong>Location:</strong> Russia</li>
            </ul>
          </div>

          <div className={styles.right}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.field}>
                <label>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.field}>
                <label>Message *</label>
                <textarea
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modern Popup Modal for Status */}
      {status && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={status.type === "success" ? styles.successIcon : styles.errorIcon}>
              {status.type === "success" ? "✓" : "✕"}
            </div>
            <h2>{status.type === "success" ? "Message Sent!" : "Oops!"}</h2>
            <p>{status.message}</p>
            <button className={styles.closeButton} onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}