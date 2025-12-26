import "./globals.css";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import type { Metadata, Viewport } from "next";

/* ✅ MOVE viewport + themeColor HERE */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

/* ✅ metadata WITHOUT viewport / themeColor */
export const metadata: Metadata = {
  metadataBase: new URL("https://yourdomain.com"),

  title: {
    default: "MagicWorld",
    template: "%s",
  },

  description:
    "MagicWorld provides premium digital tools, optimized utilities, enhanced performance software, and modern solutions.",

  keywords: [
    "digital tools",
    "premium software",
    "utilities",
    "optimized apps",
    "performance tools",
    "MagicWorld",
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: "https://yourdomain.com",
    title: "MagicWorld – Premium Digital Tools",
    description:
      "Explore advanced tools, enhanced utilities, and modern optimized software.",
    siteName: "MagicWorld",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "MagicWorld Website Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "MagicWorld",
    description:
      "Premium tools, optimized software, and enhanced digital experiences.",
    images: ["/og-default.png"],
  },

  alternates: {
    canonical: "https://yourdomain.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
