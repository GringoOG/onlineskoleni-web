import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SubstituteFulfillmentBanner } from "@/components/SubstituteFulfillmentBanner";
import { CookieBanner } from "@/components/CookieBanner";
import { GoogleTag } from "@/components/GoogleTag";
import { SmoothScrollHandler } from "@/components/SmoothScrollHandler";
import { site } from "@/lib/content";
import { getLmsUserSummary } from "@/lib/lms/get-lms-user-summary";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.onlineskoleni.eu"),
  title: {
    default: `${site.name} – Online školení BOZP, PO a zákonné kurzy`,
    template: `%s | ${site.name}`,
  },
  description: site.tagline,
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: site.name,
    title: `${site.name} – Online školení BOZP, PO`,
    description: site.tagline,
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/images/logo.svg",
    apple: "/images/logo.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a1b",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lmsUser = await getLmsUserSummary();

  return (
    <html lang="cs" className={`${inter.variable} h-full`}>
      <head>
        <GoogleTag />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <Header lmsUser={lmsUser} />
        <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))]">
          <SubstituteFulfillmentBanner variant="strip" />
          {children}
        </main>
        <Footer />
        <CookieBanner />
        <SmoothScrollHandler />
      </body>
    </html>
  );
}
