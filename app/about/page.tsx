import type { Metadata } from "next";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "MagicWorld -  About",
  description:
    "Learn more about MagicWorld, our mission, and how we curate high-quality digital tools and resources.",
  alternates: {
    canonical: "https://yourdomain.com/about",
  },
};

export default function AboutPage() {
  return (
    <section className={styles.about} aria-labelledby="about-title">
      <div className="container">
        <article className={styles.innerSingle}>
          <h1 id="about-title" className={styles.title}>
            About MagicWorld
          </h1>

          <p className={styles.text}>
            MagicWorld provides a curated selection of digital tools, resources,
            and utilities designed to enhance your digital experience. Our goal
            is to offer a clean, fast, and reliable platform where users can
            discover high-quality digital assets with ease.
          </p>

          <p className={styles.text}>
            All resources listed on our platform are gathered from publicly
            available sources across the internet. We focus on organizing and
            indexing these tools in a simple and user-friendly format so users
            can explore and access them quickly.
          </p>

          <h2 className={styles.subtitle}>DMCA Disclaimer</h2>

          <p className={styles.text}>
            MagicWorld does not host or store any files on its servers. All
            content displayed on our platform is indexed from third-party
            websites that are freely accessible online. We do not claim
            ownership of external content and are not responsible for materials
            hosted elsewhere.
          </p>

          <p className={styles.text}>
            If you believe links shown on our platform infringe upon your
            intellectual property rights, please contact the original hosting
            provider directly. Valid takedown notices are respected, and we
            remove indexed links when required.
          </p>
        </article>
      </div>
    </section>
  );
}
