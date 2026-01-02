// app/categories/accounts/[slug]/page.tsx
import { notFound } from "next/navigation";
import ClientView from "./ClientView";
import type { Metadata } from "next";

interface AccountDetail {
  title: string;
  badges: string[];
  img: string;
  desc: string;
  gallery: string[];
  price: number;
  isAvailable: boolean;
}

/* =============================== DYNAMIC METADATA =============================== */
export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const account = await fetchAccount(slug);

  if (!account) {
    return { title: "Account Not Found" };
  }

  return {
    title: `${account.title} | Premium Account`,
    description: account.desc.slice(0, 160) + "...",
    openGraph: {
      title: account.title,
      description: account.desc,
      images: [account.img],
    },
  };
}

/* =============================== FETCH DATA =============================== */
async function fetchAccount(slug: string): Promise<AccountDetail | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/premium-accounts/${slug}`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const raw = data?.account ?? data;

    if (!raw) return null;

    return {
      title: raw.title || "Premium Account",
      badges: Array.isArray(raw.badges) ? raw.badges : [],
      img: raw.img || "/placeholder.jpg",
      desc: raw.desc || "No description available.",
      gallery: Array.isArray(raw.gallery)
        ? raw.gallery.filter((url: string) => url?.trim())
        : [],
      price: Number(raw.price) || 0,
      isAvailable: raw.isAvailable !== false,
    };
  } catch {
    return null;
  }
}

/* =============================== PAGE =============================== */
export default async function AccountViewPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const item = await fetchAccount(slug);

  if (!item) notFound();

  return <ClientView item={item} />;
}