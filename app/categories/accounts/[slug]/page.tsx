import Image from "next/image";
import { notFound } from "next/navigation";
import styles from "./view.module.css";
import type { Metadata } from "next";

interface AccountDetail {
  title: string;
  type: string[];
  img: string;
  desc: string;
  gallery: string[];
}

/* ===============================
   METADATA
================================ */
export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;

  const formatted = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${formatted} | Premium Account`,
    description: `View details and images for ${formatted}.`,
    alternates: {
      canonical: `https://yourdomain.com/categories/accounts/${slug}`,
    },
  };
}

/* ===============================
   DATA FETCH
================================ */
async function getAccount(slug: string): Promise<AccountDetail | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/premium-accounts/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  const data = await res.json();
  const raw = data?.account ?? data;

  if (!raw || typeof raw !== "object") return null;

  return {
    title: raw.title ?? "",
    desc: raw.desc ?? "",
    img: raw.img ?? "",
    type: Array.isArray(raw.type) ? raw.type : [],
    gallery: Array.isArray(raw.gallery) ? raw.gallery : [],
  };
}

/* ===============================
   PAGE
================================ */
export default async function AccountViewPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const item = await getAccount(slug);

  if (!item) notFound();

  return (
    <section className={styles.wrapper}>
      <div className="container">
        <article className={styles.layout}>
          {/* MAIN IMAGE */}
          <label htmlFor="img-modal" className={styles.media}>
            <Image
              src={item.img}
              alt={item.title}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 600px"
              className={styles.image}
            />
            <span className={styles.zoomHint}>Click to view</span>
          </label>

          {/* CONTENT */}
          <div className={styles.content}>
            <h1 className={styles.title}>{item.title}</h1>

            {item.type.length > 0 && (
              <ul className={styles.badgeRow}>
                {item.type.map((b) => (
                  <li key={b} className={styles.badge}>{b}</li>
                ))}
              </ul>
            )}

            <p className={styles.desc}>{item.desc}</p>
            <button className={styles.cta}>Get Now</button>
          </div>
        </article>

        {/* GALLERY */}
        {item.gallery.length > 0 && (
          <section className={styles.gallery}>
            <h2 className={styles.galleryTitle}>Account Images</h2>

            <div className={styles.galleryGrid}>
              {item.gallery.map((img, i) => (
                <label
                  key={i}
                  htmlFor={`gallery-${i}`}
                  className={styles.galleryItem}
                >
                  <Image
                    src={img}
                    alt={`${item.title} image ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 240px"
                    className={styles.galleryImg}
                  />
                  <span className={styles.zoomHint}>View</span>
                </label>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ========= MAIN IMAGE MODAL ========= */}
      <input type="checkbox" id="img-modal" className={styles.modalToggle} />
      <div className={styles.modal}>
        <label htmlFor="img-modal" className={styles.modalBackdrop} />
        <div className={styles.modalContent}>
          <label htmlFor="img-modal" className={styles.closeBtn}>×</label>
          <Image
            src={item.img}
            alt={item.title}
            fill
            className={styles.modalImage}
          />
        </div>
      </div>

      {/* ========= GALLERY MODALS ========= */}
      {item.gallery.map((img, i) => (
        <div key={i}>
          <input
            type="checkbox"
            id={`gallery-${i}`}
            className={styles.modalToggle}
          />
          <div className={styles.modal}>
            <label
              htmlFor={`gallery-${i}`}
              className={styles.modalBackdrop}
            />
            <div className={styles.modalContent}>
              <label
                htmlFor={`gallery-${i}`}
                className={styles.closeBtn}
              >
                ×
              </label>
              <Image src={img} alt="" fill className={styles.modalImage} />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
