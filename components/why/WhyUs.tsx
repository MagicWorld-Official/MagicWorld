import styles from "./whyus.module.css";
import Image from "next/image";

export default function WhyUs() {
  return (
    <section
      className={styles.why}
      aria-labelledby="why-title"
    >
      <div className="container">
        <div className={styles.inner}>
          {/* LEFT SIDE */}
          <div className={styles.left}>
            <h2 id="why-title" className={styles.title}>
              Why Choose Us
            </h2>
            <p className={styles.subtitle}>
              Your trusted source for secure, fast, and high-quality digital
              resources.
            </p>

            <ul className={styles.list}>
              <li>
                <span className={styles.bullet} aria-hidden="true">✔</span>
                Fast and dependable delivery on all digital items.
              </li>
              <li>
                <span className={styles.bullet} aria-hidden="true">✔</span>
                All resources are validated for safety, quality, and performance.
              </li>
              <li>
                <span className={styles.bullet} aria-hidden="true">✔</span>
                Clean, modern interface for effortless browsing and access.
              </li>
              <li>
                <span className={styles.bullet} aria-hidden="true">✔</span>
                Responsive support ready whenever you need guidance.
              </li>
            </ul>
          </div>

          {/* RIGHT SIDE */}
          <div className={styles.right}>
            <div className={styles.box}>
              <Image
                src="/images/whychossus/whychossus.png"
                alt="Why choose MagicWorld"
                fill
                priority
                sizes="(max-width: 900px) 320px, 380px"
                className={styles.boxImage}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
