import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://yourdomain.com";

  // Fetch real products from backend
  let products: any[] = [];

  try {
    const res = await fetch("http://localhost:5000/api/products", {
      cache: "no-store",
    });
    products = await res.json();
  } catch {
    products = [];
  }

  const productUrls = products.map((product: any) => ({
    url: `${siteUrl}/product/${product.slug}`,
    lastModified: new Date(product.updatedAt || new Date()),
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/categories/hacks-mods`,
      lastModified: new Date(),
    },
    ...productUrls,
  ];
}
