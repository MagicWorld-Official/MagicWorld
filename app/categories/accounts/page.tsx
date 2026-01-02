// app/categories/accounts/page.tsx (Updated with Improved Price Badge)
import Image from "next/image";
import Link from "next/link";
import styles from "./accounts.module.css";
import type { Metadata } from "next";
import { Search, Filter } from "lucide-react";

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
  type: string;
  img: string;
  desc: string;
  slug: string;
  price: number;
  isAvailable: boolean;
}

/* =============================== DATA FETCH =============================== */
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

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : data.accounts || [];
  } catch (err) {
    console.error("Fetch accounts error:", err);
    return [];
  }
}

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <section className={styles.wrapper}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Premium Accounts</h1>
          <p className={styles.subtitle}>
            Access verified, high-quality premium accounts for entertainment,
            gaming, and social platforms.
          </p>
        </header>

        {/* Search + Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search accounts..."
              className={styles.searchInput}
              id="search-input"
            />
          </div>

          <div className={styles.filterWrapper}>
            <Filter className={styles.filterIcon} size={20} />
            <select className={styles.filterSelect} id="type-filter">
              <option value="">All Categories</option>
              <option value="Social">Social Accounts</option>
              <option value="Game">Game Accounts</option>
            </select>
          </div>
        </div>

        {/* Accounts Grid */}
        {accounts.length > 0 ? (
          <div
            className={`${styles.grid} ${accounts.length === 1 ? styles.singleGrid : ""}`}
            id="accounts-grid"
          >
            {accounts.map((item, index) => (
              <article
                key={item.slug}
                className={styles.card}
                data-type={item.type.toLowerCase()}
                data-search={`${item.title} ${item.desc}`.toLowerCase()}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
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
                  {!item.isAvailable && (
                    <div className={styles.soldOverlay}>Sold Out</div>
                  )}
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>

                  {/* Type & Price Badges */}
                  <div className={styles.badgeRow}>
                    <span
                      className={`${styles.badge} ${
                        item.type === "Social" ? styles.socialBadge : styles.gameBadge
                      }`}
                    >
                      {item.type}
                    </span>
                    {item.price > 0 && (
                      <span className={styles.priceBadge}>
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Short Description */}
                  <p className={styles.desc}>{item.desc}</p>

                  {/* View Button */}
                  <div className={styles.btnWrapper}>
                    <Link
                      href={`/categories/accounts/${item.slug}`}
                      className={`${styles.btn} ${!item.isAvailable ? styles.btnDisabled : ""}`}
                    >
                      {item.isAvailable ? "View Details" : "Unavailable"}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            No premium accounts available at the moment. Check back soon!
          </p>
        )}
      </div>

      {/* Client-side Filtering Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', () => {
              const searchInput = document.getElementById('search-input');
              const typeFilter = document.getElementById('type-filter');
              const grid = document.getElementById('accounts-grid');
              const cards = grid ? grid.querySelectorAll('.${styles.card.replace(
                ".",
                ""
              )}') : [];

              const filterAccounts = () => {
                const searchTerm = searchInput.value.toLowerCase().trim();
                const selectedType = typeFilter.value.toLowerCase();

                cards.forEach(card => {
                  const cardSearchText = card.getAttribute('data-search') || '';
                  const cardType = card.getAttribute('data-type') || '';

                  const matchesSearch = cardSearchText.includes(searchTerm);
                  const matchesType = selectedType === '' || cardType === selectedType;

                  if (matchesSearch && matchesType) {
                    card.style.display = '';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                  } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    setTimeout(() => { card.style.display = 'none'; }, 300);
                  }
                });
              };

              searchInput?.addEventListener('input', filterAccounts);
              typeFilter?.addEventListener('change', filterAccounts);
            });
          `,
        }}
      />
    </section>
  );
}