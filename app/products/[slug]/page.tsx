import ProductClient from "./ProductClient";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Product {
  name: string;
  desc?: string;
  slug: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* ===============================
   DATA FETCH
================================ */
async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.API_URL}/products/${slug}`,
      {
        next: { revalidate: 60 }, // ✅ ISR for production
      }
    );

    if (!res.ok) return null;

    const data = await res.json();

    // keep original intent, just unwrap backend response safely
    if (data?.product) return data.product;
    if (data && typeof data === "object") return data;

    return null;
  } catch {
    return null;
  }
}

/* ===============================
   METADATA
================================ */
export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  const { slug } = await props.params;

  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | MagicWorld",
      description: "This product does not exist.",
    };
  }

  return {
    title: `${product.name} | MagicWorld`,
    description: product.desc || "Product details and features.",
    alternates: {
      canonical: `https://yourdomain.com/products/${product.slug}`,
    },
  };
}

/* ===============================
   PAGE
================================ */
export default async function ProductPage(props: PageProps) {
  const { slug } = await props.params;

  const product = await getProduct(slug);

  if (!product) notFound();

  return <ProductClient product={product} />;
}
