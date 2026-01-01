import styles from "./footer.module.css";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className={styles.footer} aria-labelledby="footer-title">
      <div className="container">
        <div className={styles.inner}>
          {/* BRAND */}
          <div className={styles.brand}>
            <h3 id="footer-title">MagicWorld</h3>
            <p>
              Level up your digital world with fast, verified, and reliable
              resources.
            </p>
          </div>

          {/* QUICK LINKS */}
          <nav className={styles.links} aria-label="Footer navigation">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/#services">Services</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </nav>

          {/* CONTACT */}
          <div className={styles.contact}>
            <h4>Contact</h4>
            <p>
              Email:{" "}
              <a href="mailto:magicworldofficial.contact@gmail.com">
                magicworldofficial.care@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT AREA */}
        <div className={styles.bottom}>
          <p>
            © {new Date().getFullYear()} MagicWorld. All rights reserved.
          </p>
          <span className={styles.versionBadge}>V1.0</span>
        </div>
      </div>
    </footer>
  );
}