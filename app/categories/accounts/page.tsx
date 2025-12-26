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
        // ISR for prod, fresh enough
        next: { revalidate: 60 },
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();

    // backend may return:
    // [] OR { success, data } OR { success, accounts }
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.accounts)) return data.accounts;

    return [];
  } catch {
    // silent fail in prod
    return [];
  }
}

/* ===============================
   PAGE
================================ */
export default async function PremiumAccountsPage() {
  const accounts = await getAccounts();

  return (
    <section className={styles.wrapper}>
      <div className="container">
        <header className={styles.header}>
          <h1>Premium Accounts</h1>
          <p>
            Explore a curated list of verified premium accounts available for
            personal and professional use.
          </p>
        </header>

        {accounts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>
            No premium accounts available at the moment.
          </p>
        ) : (
          <div
            className={`${styles.grid} ${
              accounts.length === 1 ? styles.singleGrid : ""
            }`}
          >
            {accounts.map((item) => (
              <article key={item.slug} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className={styles.image}
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

                <Link
                  href={`/categories/accounts/${item.slug}`}
                  className={styles.btn}
                >
                  View Details
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
