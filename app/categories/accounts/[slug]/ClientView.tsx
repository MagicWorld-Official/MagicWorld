// app/categories/accounts/[slug]/ClientView.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./view.module.css";
import { ShoppingCart, ZoomIn } from "lucide-react";

interface AccountDetail {
  title: string;
  badges: string[];
  img: string;
  desc: string;
  gallery: string[];
  price: number;
  isAvailable: boolean;
}

export default function ClientView({ item }: { item: AccountDetail }) {
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const safeMainImg = item.img || "/placeholder.jpg";

  return (
    <>
      <section className={styles.wrapper}>
        <div className="container">
          {/* Main Layout */}
          <div className={styles.layout}>
            {/* Main Image */}
            <div className={styles.mainImageWrapper}>
              <label htmlFor="main-modal" className={styles.mainImageLabel}>
                <Image
                  src={safeMainImg}
                  alt={item.title}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 600px"
                  className={styles.mainImage}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                />
                <div className={styles.zoomOverlay}>
                  <ZoomIn size={18} />
                  <span>Zoom in</span>
                </div>
              </label>
            </div>

            {/* Content */}
            <div className={styles.content}>
              <h1 className={styles.title}>{item.title}</h1>

              {item.badges.length > 0 && (
                <div className={styles.badges}>
                  {item.badges.map((badge, index) => (
                    <span key={index} className={styles.badge}>
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.priceStatus}>
                {item.price > 0 && (
                  <span className={styles.price}>
                    ₹{item.price.toLocaleString("en-IN")}
                  </span>
                )}
                <span
                  className={`${styles.status} ${
                    item.isAvailable ? styles.available : styles.sold
                  }`}
                >
                  {item.isAvailable ? "In Stock" : "Sold Out"}
                </span>
              </div>

              <div
                className={styles.description}
                dangerouslySetInnerHTML={{
                  __html: item.desc
                    .replace(/\n/g, "<br />")
                    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
                    .replace(/\*\*(.*?)\*\*/g, "<em>$1</em>"),
                }}
              />

              <button
                className={styles.cta}
                disabled={!item.isAvailable}
                onClick={() => item.isAvailable && setBuyModalOpen(true)}
              >
                {item.isAvailable ? (
                  <>
                    <ShoppingCart size={20} />
                    Buy Now
                  </>
                ) : (
                  "Currently Unavailable"
                )}
              </button>
            </div>
          </div>

          {/* Gallery */}
          {item.gallery.length > 0 && (
            <section className={styles.gallerySection}>
              <h2 className={styles.galleryTitle}>Additional Screenshots</h2>
              <div className={styles.galleryGrid}>
                {item.gallery.map((url, i) => (
                  <label
                    key={i}
                    htmlFor={`gallery-${i}`}
                    className={styles.galleryItem}
                  >
                    <Image
                      src={url || "/placeholder.jpg"}
                      alt={`${item.title} screenshot ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className={styles.galleryImage}
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    />
                    <div className={styles.zoomOverlay}>
                      <ZoomIn size={18} />
                      <span>View larger</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Image Zoom Modals (Main + Gallery) */}
        <input type="checkbox" id="main-modal" className={styles.modalToggle} />
        <div className={styles.modal}>
          <label htmlFor="main-modal" className={styles.backdrop} />
          <div className={styles.modalBox}>
            <label htmlFor="main-modal" className={styles.close}>×</label>
            <Image src={safeMainImg} alt={item.title} fill className={styles.modalImg} />
          </div>
        </div>

        {item.gallery.map((url, i) => (
          <div key={i}>
            <input type="checkbox" id={`gallery-${i}`} className={styles.modalToggle} />
            <div className={styles.modal}>
              <label htmlFor={`gallery-${i}`} className={styles.backdrop} />
              <div className={styles.modalBox}>
                <label htmlFor={`gallery-${i}`} className={styles.close}>×</label>
                <Image
                  src={url || "/placeholder.jpg"}
                  alt={`${item.title} screenshot ${i + 1}`}
                  fill
                  className={styles.modalImg}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Buy Contact Modal */}
        {buyModalOpen && (
          <div className={styles.buyModalOverlay} onClick={() => setBuyModalOpen(false)}>
            <div className={styles.buyModalBox} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.buyModalTitle}>Purchase This Account</h2>
              <p className={styles.buyModalDesc}>
                To buy <strong>{item.title}</strong> for{" "}
                <strong>₹{item.price.toLocaleString("en-IN")}</strong>, please contact us on Telegram for secure payment and instant delivery.
              </p>
              <a
                href="https://t.me/MagicWorld_Owner" // ← Change to your real Telegram
                target="_blank"
                rel="noopener noreferrer"
                className={styles.buyModalButton}
              >
                <ShoppingCart size={24} />
                Contact on Telegram
              </a>
              <button
                className={styles.buyModalClose}
                onClick={() => setBuyModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}