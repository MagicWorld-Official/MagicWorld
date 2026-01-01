"use client";

import { useState } from "react";
import styles from "./features.module.css";

type FeatureSection = {
  title: string;
  items: string[];
};

type FeaturesData = {
  [key: string]: FeatureSection[];
};

export default function Features({ data }: { data: FeaturesData }) {
  if (!data || Object.keys(data).length === 0) return null;

  const tabs = Object.keys(data);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={styles.features} aria-labelledby="features-title">
      <div className="container">
        <header className={styles.header}>
          <h2 id="features-title" className={styles.heading}>
            Product Features
          </h2>
          <p className={styles.subheading}>
            Explore what’s included, organized by category.
          </p>
        </header>

        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {data[activeTab].map((section, index) => {
            const open = openIndex === index;

            return (
              <div
                key={index}
                className={`${styles.accordion} ${open ? styles.activeAccordion : ""}`}
              >
                <button
                  className={`${styles.accordionHeader} ${
                    open ? styles.openHeader : ""
                  }`}
                  onClick={() =>
                    setOpenIndex(open ? null : index)
                  }
                  aria-expanded={open}
                >
                  <span>{section.title}</span>
                  <span className={styles.chevron} />
                </button>

                <div
                  className={`${styles.accordionBody} ${
                    open ? styles.bodyOpen : ""
                  }`}
                >
                  <ul className={styles.list}>
                    {section.items.map((item, i) => (
                      <li key={i} className={styles.item}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}