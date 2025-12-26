import type { Metadata } from "next";
import Script from "next/script";
import Hero from "../components/hero/Hero";
import Services from "../components/services/Services";
import WhyUs from "../components/why/WhyUs";

export const metadata: Metadata = {
  title: "MagicWorld - Home",
  description:
    "MagicWorld offers premium digital tools, reliable utilities, and optimized performance solutions designed to upgrade your digital experience.",
  alternates: {
    canonical: "https://yourdomain.com",
  },
};

export default function HomePage() {
  return (
    <>
      <Script
        id="home-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "MagicWorld",
            url: "https://yourdomain.com",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://yourdomain.com/search?q={query}",
              "query-input": "required name=query"
            }
          })
        }}
      />
      <Hero />
      <Services />
      <WhyUs />
    </>
  );
}
