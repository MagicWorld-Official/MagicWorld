import styles from "./hero.module.css";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section id="home"
      className={styles.hero}
      aria-labelledby="hero-title"
      aria-describedby="hero-subtitle">
      <div className="container">
        <div className={styles.inner}>

          {/* LEFT CONTENT */}
          <div className={styles.left}>
            <h1 className={styles.title} id="hero-title">
              Unlock Premium Digital <span>Power</span>
            </h1>

            <p className={styles.subtitle} id="hero-subtitle">
              High-quality digital resources delivered fast. Optimized tools, verified utilities,
              and reliable services designed to upgrade your digital workflow.
            </p>

            <div className={styles.buttons}>
              <Link href="/#services" className={styles.primaryBtn}>
                Explore Services
              </Link>

              <Link href="/contact" className={styles.secondaryBtn}>
                Contact Us
              </Link>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className={styles.right}>
            <div className={styles.imageWrapper}>
              <Image
                src="/images/hero/hero.png"
                alt="Hero illustration showing digital tools and services"
                className={styles.heroImage}
                width={450}
                height={450}
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}