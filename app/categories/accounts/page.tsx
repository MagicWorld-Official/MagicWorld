// app/categories/accounts/page.tsx
import Image from "next/image";
import Link from "next/link";
import styles from "./accounts.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Accounts | MagicWorld",
  description:
    "Browse trusted premium accounts including Netflix, Spotify, BGMI and more.",
  alternates: {
    canonical: "https://yourdomain.com/categories/accounts",
  },
};

interface AccountItem {
  title: string;
  type: string[];
  img: string;
  desc: string;
  slug: string;
}

/* ===============================
   DATA FETCH (PRODUCTION SAFE)
================================ */
async function getAccounts(): Promise<AccountItem[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/premium-accounts`,
      {
        next: { revalidate: 60 },
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60",
        },
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.accounts || [];
  } catch (err) {
    console.error("Fetch accounts error:", err);
    return [];
  }
}

export default async function AccountsPage() {
  const accounts = await getAccounts();
  const hasAccounts = accounts.length > 0;

  return (
    <section className={styles.wrapper}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Premium Accounts</h1>
          <p className={styles.subtitle}>
            Access verified, high-quality premium accounts for entertainment, productivity, and gaming needs.
          </p>
        </header>

        {hasAccounts ? (
          <div className={`${styles.grid} ${accounts.length === 1 ? styles.singleGrid : ""}`}>
            {accounts.map((item, index) => (
              <article key={item.slug} className={styles.card} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={styles.imageWrap}>
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, 300px"
                    priority={index < 3}
                    unoptimized
                  />
                </div>

                <h3 className={styles.cardTitle}>{item.title}</h3>

                {item.type?.length > 0 && (
                  <div className={styles.badgeRow}>
                    {item.type.map((badge) => (
                      <span key={badge} className={styles.badge}>
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                <p className={styles.desc}>{item.desc}</p>

                <div className={styles.btnWrapper}>
                  <Link
                    href={`/categories/accounts/${item.slug}`}
                    className={styles.btn}
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No premium accounts available at the moment. Check back soon!</p>
        )}
      </div>
    </section>
  );
}