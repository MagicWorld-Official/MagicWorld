import type { Metadata } from "next";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "MagicWorld - Contact",
  description:
    "Get in touch with MagicWorld for support, questions, or inquiries about our digital tools and services.",
  alternates: {
    canonical: "https://yourdomain.com/contact",
  },
};

export default function ContactPage() {
  return (
    <section className={styles.contact} aria-labelledby="contact-title">
      <div className="container">
        <div className={styles.inner}>
          {/* LEFT SIDE */}
          <div className={styles.left}>
            <h1 id="contact-title" className={styles.title}>
              Contact Us
            </h1>

            <p className={styles.subtitle}>
              Have a question or need help? Reach out using the details below.
            </p>

            <ul className={styles.infoList}>
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:magicworldofficial.contact@gmail.com">
                  magicworldofficial.care@gmail.com
                </a>
              </li>
              <li>
                <strong>Location:</strong> Russia
              </li>
            </ul>
          </div>

          {/* RIGHT SIDE (STATIC FORM UI) */}
          <div className={styles.right}>
            <div className={styles.form} aria-label="Contact form">
              <div className={styles.field}>
                <label>Name</label>
                <input type="text" placeholder="Your Name" disabled />
              </div>

              <div className={styles.field}>
                <label>Email</label>
                <input type="email" placeholder="Your Email" disabled />
              </div>

              <div className={styles.field}>
                <label>Message</label>
                <textarea placeholder="Write your message here..." disabled />
              </div>

              <button className={styles.btn} disabled>
                Send Message
              </button>

              <p
                style={{
                  marginTop: "12px",
                  fontSize: "0.9rem",
                  color: "#777",
                  textAlign: "center",
                }}
              >
                Contact form submission coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
