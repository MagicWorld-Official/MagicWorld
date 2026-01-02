// components/Footer.tsx (or wherever your Footer is)
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

          {/* CONTACT + TELEGRAM */}
          <div className={styles.contact}>
            <h4>Contact</h4>
            <p>
              Email:{" "}
              <a href="mailto:magicworldofficial.care@gmail.com">
                magicworldofficial.care@gmail.com
              </a>
            </p>

            {/* Telegram Link */}
            <p className={styles.social}>
              <a
                href="https://t.me/MagicWorld_Owner" // ← Change to your actual Telegram username or channel
                target="_blank"
                rel="noopener noreferrer"
                className={styles.telegramLink}
                aria-label="Join us on Telegram"
              >
                <svg
                  className={styles.telegramIcon}
                  viewBox="0 0 240 240"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="120" cy="120" r="120" fill="#40B3E0" />
                  <path
                    d="M57.5 118.4l24.6 9.1 9.5 30.6c.7 2.2 1.8 2.9 3.1 2.7.9-.1 1.8-.7 2.4-1.4l13.7-13.3 27.5 20.2c3.1 1.7 5.3.8 6.1-2.6l11-51.8 22.3-6.3c2.4-.7 2.4-2.4.3-3.5l-99.9-38.6c-4.1-1.6-7.6.3-6.6 4.8z"
                    fill="#FFFFFF"
                  />
                </svg>
                <span>@MagicWorld_Owner</span> {/* ← Change to your actual handle */}
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