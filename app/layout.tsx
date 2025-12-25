import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";

import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "AllAboutAnime | Anime News, Reviews, Recommendations & Guides",
    template: "%s | AllAboutAnime",
  },
  description:
    "AllAboutAnime is your ultimate destination for anime news, reviews, episode guides, top anime recommendations, character breakdowns, and everything otaku.",
  openGraph: {
    title: "AllAboutAnime | Anime News & Reviews",
    description:
      "Discover anime reviews, top recommendations, episode guides, and latest anime news.",
    url: "https://allaboutanime.in",
    siteName: "AllAboutAnime",
    images: [
      {
        url: "/og-image.jpg", // stored in /public
        width: 1200,
        height: 630,
        alt: "AllAboutAnime - Anime Blog",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  keywords: [
    "anime",
    "anime news",
    "anime reviews",
    "top anime",
    "best anime to watch",
    "anime recommendations",
    "anime characters",
    "anime blogs",
    "manga",
    "otaku",
    "anime guides",
  ],
  metadataBase: new URL("https://allaboutanime.in"),
  alternates: {
    canonical: "https://allaboutanime.in",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <head>
        {/* Google Analytics */}
        {/* The Script tags are now handled by the GoogleAnalytics component */}
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Analytics Script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RH8MBD5H6M"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RH8MBD5H6M');
          `}
        </Script>

        <AuthProvider>
          <GoogleAnalytics />
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
