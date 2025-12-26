import type { Metadata } from "next";
import CategoryClient from "./CategoryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Utilities & Mods | MagicWorld",
  description:
    "Browse premium enhanced tools, optimized utilities, and refined modded resources from MagicWorld.",
  keywords: [
    "hacks",
    "mods",
    "utilities",
    "tools",
    "optimized utilities",
    "digital products",
    "MagicWorld",
  ],
  alternates: {
    canonical: "https://yourdomain.com/categories/hacks-mods",
  },
  openGraph: {
    type: "website",
    title: "Utilities & Mods | MagicWorld",
    description:
      "Explore enhanced tools and optimized modded resources at MagicWorld.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "MagicWorld Utilities & Mods",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Utilities & Mods | MagicWorld",
    description:
      "Discover premium digital tools and optimized modded software.",
    images: ["/og-default.png"],
  },
};

/* ===============================
   DATA FETCH (PRODUCTION SAFE)
================================ */
async function fetchProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?category=hacks-mods`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) return [];

    const data = await res.json();

    // 🔒 normalize response
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;

    console.error("Unexpected products response:", data);
    return [];
  } catch (err) {
    console.error("Fetch hacks-mods error:", err);
    return [];
  }
}

/* ===============================
   PAGE
================================ */
export default async function CategoryPage() {
  const products = await fetchProducts();

  return <CategoryClient products={products} />;
}
