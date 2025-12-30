// app/categories/accounts/[slug]/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import styles from "./view.module.css";
import type { Metadata } from "next";

interface AccountDetail {
  title: string;
  badges: string[];
  img: string;
  desc: string;
  gallery: string[];
  price: number;
  isAvailable: boolean;
}

/* ===============================
   DYNAMIC METADATA
================================ */
export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const account = await fetchAccount(slug);

  if (!account) {
    return { title: "Account Not Found" };
  }

  return {
    title: `${account.title} | Premium Account`,
    description: account.desc.slice(0, 160) + "...",
    openGraph: {
      title: account.title,
      description: account.desc,
      images: [account.img],
    },
  };
}

/* ===============================
   FETCH DATA
================================ */
async function fetchAccount(slug: string): Promise<AccountDetail | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/premium-accounts/${slug}`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const raw = data?.account ?? data;

    if (!raw) return null;

    return {
      title: raw.title || "Premium Account",
      badges: Array.isArray(raw.badges) ? raw.badges : [],
      img: raw.img || "/placeholder.jpg",
      desc: raw.desc || "No description available.",
      gallery: Array.isArray(raw.gallery)
        ? raw.gallery.filter((url: string) => url?.trim())
        : [],
      price: Number(raw.price) || 0,
      isAvailable: raw.isAvailable !== false,
    };
  } catch {
    return null;
  }
}

/* ===============================
   MAIN PAGE
================================ */
export default async function AccountViewPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const item = await fetchAccount(slug);

  if (!item) notFound();

  const safeMainImg = item.img || "/placeholder.jpg";

  return (
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
                <span>🔍 Click to zoom</span>
              </div>
            </label>
          </div>

          {/* Content */}
          <div className={styles.content}>
            <h1 className={styles.title}>{item.title}</h1>

            {/* Badges */}
            {item.badges.length > 0 && (
              <div className={styles.badges}>
                {item.badges.map((badge) => (
                  <span key={badge} className={styles.badge}>
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {/* Price & Status */}
            <div className={styles.priceStatus}>
              {item.price > 0 && (
                <span className={styles.price}>₹{item.price}</span>
              )}
              <span
                className={`${styles.status} ${
                  item.isAvailable ? styles.available : styles.sold
                }`}
              >
                {item.isAvailable ? "Available" : "Sold Out"}
              </span>
            </div>

            {/* Description */}
            <div
              className={styles.description}
              dangerouslySetInnerHTML={{
                __html: item.desc
                  .replace(/\n/g, "<br>")
                  .replace(/\*(.*?)\*/g, "<strong>$1</strong>"),
              }}
            />

            {/* CTA */}
            <button
              className={styles.cta}
              disabled={!item.isAvailable}
            >
              {item.isAvailable ? "Buy Now" : "Unavailable"}
            </button>
          </div>
        </div>

        {/* Gallery */}
        {item.gallery.length > 0 && (
          <section className={styles.gallerySection}>
            <h2 className={styles.galleryTitle}>More Screenshots</h2>
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
                    <span>🔍 View</span>
                  </div>
                </label>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Main Image Modal */}
      <input type="checkbox" id="main-modal" className={styles.modalToggle} />
      <div className={styles.modal}>
        <label htmlFor="main-modal" className={styles.backdrop} />
        <div className={styles.modalBox}>
          <label htmlFor="main-modal" className={styles.close}>×</label>
          <Image
            src={safeMainImg}
            alt={item.title}
            fill
            className={styles.modalImg}
          />
        </div>
      </div>

      {/* Gallery Modals */}
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
    </section>
  );
}