import styles from "./services.module.css";
import Link from "next/link";

export default function Services() {
  return (
    <section
      id="services"
      className={styles.services}
      aria-labelledby="services-title"
    >
      <div className="container">
        <header className={styles.header}>
          <h2 id="services-title" className={styles.title}>
            Our Services
          </h2>
          <p className={styles.subtitle}>
            Discover carefully curated digital tools and trusted online
            resources designed to support your daily productivity.
          </p>
        </header>

        <div className={styles.grid}>
          {/* Enhanced Utilities */}
          <article className={styles.card}>
            <div className={styles.icon}>⚡</div>
            <h3>Enhanced Utilities</h3>
            <p>
              Refined digital tools crafted to streamline workflows and
              improve performance.
            </p>
            <Link href="/categories/utilities-mods" className={styles.cardBtn}>
              Explore
            </Link>
          </article>

          {/* Premium Accounts */}
          <article className={styles.card}>
            <div className={styles.icon}>👤</div>
            <h3>Premium Accounts</h3>
            <p>
              Access a selection of verified, high-quality accounts suitable
              for various professional and personal uses.
            </p>
            <Link href="/categories/accounts" className={styles.cardBtn}>
              Explore
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}