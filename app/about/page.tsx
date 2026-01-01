import type { Metadata } from "next";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "MagicWorld - About",
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
        <article className={styles.inner}>
          {/* Hero Title */}
          <header className={styles.header}>
            <h1 id="about-title" className={styles.title}>
              About <span className={styles.highlight}>MagicWorld</span>
            </h1>
            <p className={styles.tagline}>
              Curating the finest digital tools and resources for a seamless experience.
            </p>
          </header>

          {/* Main Content */}
          <div className={styles.content}>
            <section className={styles.section}>
              <h2 className={styles.subtitle}>Our Mission</h2>
              <p className={styles.text}>
                MagicWorld is dedicated to providing a <strong>clean, fast, and reliable</strong> platform where users can discover high-quality digital assets, utilities, mods, and games. We carefully curate and organize publicly available resources from across the internet, making them easy to find and access in one trusted place.
              </p>
              <p className={styles.text}>
                Our focus is on quality over quantity — every tool featured here is selected for its usefulness, performance, and user value. We aim to save you time and enhance your digital workflow.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.subtitle}>What We Do</h2>
              <p className={styles.text}>
                We index and showcase tools from third-party sources that are freely available online. MagicWorld does <strong>not host, store, or distribute</strong> any files — we simply act as a discovery platform, connecting you to the best resources the web has to offer.
              </p>
              <p className={styles.text}>
                From powerful mods to innovative games and utilities, everything is presented in a modern, intuitive interface designed for speed and clarity.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.subtitle}>DMCA & Legal Disclaimer</h2>
              <div className={styles.disclaimer}>
                <p className={styles.text}>
                  MagicWorld does not host any copyrighted material on its servers. All content is linked from external, publicly accessible sources. We do not claim ownership over any linked resources.
                </p>
                <p className={styles.text}>
                  We fully respect intellectual property rights. If you believe any link on our platform infringes copyright, please contact us at{" "}
                  <a href="mailto:magicworldofficial.care@gmail.com" className={styles.emailLink}>
                    magicworldofficial.care@gmail.com
                  </a>{" "}
                  with a valid DMCA notice, and we will promptly remove the link.
                </p>
              </div>
            </section>

            <footer className={styles.footer}>
              <p className={styles.footerText}>
                Thank you for being part of the MagicWorld community. 💫
              </p>
            </footer>
          </div>
        </article>
      </div>
    </section>
  );
}