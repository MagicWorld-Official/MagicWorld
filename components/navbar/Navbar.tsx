"use client";

import { useState, useEffect } from "react";
import styles from "./navbar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const toggle = () => setOpen(prev => !prev);
  const close = () => setOpen(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className={styles.navbar} aria-label="Main navigation">
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          MagicWorld
        </Link>

        <button
          className={`${styles.menuButton} ${open ? styles.menuOpen : ""}`}
          onClick={toggle}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </button>

        <ul className={`${styles.navlinks} ${open ? styles.showMenu : ""}`}>
          <li>
            <Link
              href="/"
              className={pathname === "/" ? styles.activeLink : ""}
              onClick={close}
            >
              Home
            </Link>
          </li>

          <li>
            <Link href="/#services" onClick={close}>
              Services
            </Link>
          </li>

          <li>
            <Link
              href="/about"
              className={pathname === "/about" ? styles.activeLink : ""}
              onClick={close}
            >
              About
            </Link>
          </li>

          <li>
            <Link
              href="/contact"
              className={pathname === "/contact" ? styles.activeLink : ""}
              onClick={close}
            >
              Contact Us
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}