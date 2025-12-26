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
}

interface Props {
  products: Product[];
}

export default function CategoryClient({ products }: Props) {
  const ITEMS_PER_LOAD = 10;
  const safeProducts = Array.isArray(products) ? products : [];

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);

  const visibleProducts = safeProducts.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount((v) => v + ITEMS_PER_LOAD);
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

        {visibleProducts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>
            No utilities available at the moment.
          </p>
        ) : (
          <div className={styles.grid}>
            {visibleProducts.map((item) => (
              <Link
                key={item._id}
                href={`/products/${item.slug}`}
                className={styles.card}
              >
                <div className={styles.bgWrap}>
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    fill
                    className={styles.bgImage}
                    sizes="(max-width: 900px) 100vw, 33vw"
                  />
                </div>

                <div className={styles.overlay}></div>

                <div className={styles.info}>
                  <h3>{item.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}

        {visibleCount < safeProducts.length && (
          <div className={styles.loadMoreWrap}>
            <button
              type="button"
              onClick={loadMore}
              className={styles.loadMoreBtn}
            >
              Load More
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
