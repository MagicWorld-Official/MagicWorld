"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./category.module.css";

interface Product {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  type?: "mods" | "games"; // New field from backend
}

interface Props {
  products: Product[];
}

export default function CategoryClient({ products }: Props) {
  const ITEMS_PER_LOAD = 12;
  const safeProducts = Array.isArray(products) ? products : [];

  // Filter state
  const [filter, setFilter] = useState<"all" | "mods" | "games">("all");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);

  // Apply filter
  const filteredProducts = safeProducts.filter((p) => {
    if (filter === "all") return true;
    const productType = p.type ? String(p.type).trim().toLowerCase() : '';
    return productType === filter;
  });

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_LOAD);
  };

  // Safe image fallback
  const getImageSrc = (image?: string) => {
    return image && image.trim() ? image.trim() : "/placeholder.png";
  };

  return (
    <section className={styles.category}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Utilities & Mods</h1>
          <p className={styles.subtitle}>
            Explore a refined selection of enhanced tools, modded utilities, and optimized resources.
          </p>
        </header>

        {/* Filter Tabs */}
        <div className={styles.filterBar}>
          <button
            className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
            onClick={() => {
              setFilter("all");
              setVisibleCount(ITEMS_PER_LOAD); // reset load more on filter change
            }}
          >
            All Items
          </button>
          <button
            className={`${styles.filterBtn} ${filter === "mods" ? styles.active : ""}`}
            onClick={() => {
              setFilter("mods");
              setVisibleCount(ITEMS_PER_LOAD);
            }}
          >
            Mods
          </button>
          <button
            className={`${styles.filterBtn} ${filter === "games" ? styles.active : ""}`}
            onClick={() => {
              setFilter("games");
              setVisibleCount(ITEMS_PER_LOAD);
            }}
          >
            Games
          </button>
        </div>

        {/* Product Grid */}
        {visibleProducts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888", padding: "80px 0", fontSize: "1.1rem" }}>
            No {filter === "all" ? "" : filter} available at the moment.
          </p>
        ) : (
          <div className={styles.grid}>
            {visibleProducts.map((item, index) => (
              <Link
                key={item._id}
                href={`/products/${item.slug}`}
                className={styles.card}
                style={{ animationDelay: `${index * 0.1}s` }} // Staggered animation
              >
                <div className={styles.bgWrap}>
                  <Image
                    src={getImageSrc(item.image)}
                    alt={item.name}
                    fill
                    sizes="(max-width: 900px) 100vw, 33vw"
                    className={styles.bgImage}
                    priority={visibleProducts.indexOf(item) < 6} // Priority for first row
                    unoptimized // Safe for external images (imgbb.co, etc.)
                  />
                </div>

                <div className={styles.overlay}></div>

                <div className={styles.info}>
                  <h3>{item.name}</h3>
                  {item.type && typeof item.type === 'string' && (
                    <span className={styles.typeTag}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {visibleCount < filteredProducts.length && (
          <div className={styles.loadMoreWrap}>
            <button type="button" onClick={loadMore} className={styles.loadMoreBtn}>
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
}