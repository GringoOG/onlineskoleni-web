import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SubstituteFulfillmentBanner } from "@/components/SubstituteFulfillmentBanner";
import { CookieBanner } from "@/components/CookieBanner";
import { GoogleTag } from "@/components/GoogleTag";
import { SmoothScrollHandler } from "@/components/SmoothScrollHandler";
import { site } from "@/lib/content";
import { getAdminSession } from "@/lib/admin/auth";
import { getDefaultAdminRedirect, type AdminRole } from "@/lib/admin/roles";
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

  let adminUser: { username: string; role: AdminRole; homeHref: string } | null =
    null;
  try {
    const adminSession = await getAdminSession();
    if (adminSession) {
      adminUser = {
        username: adminSession.username,
        role: adminSession.role,
        homeHref: getDefaultAdminRedirect(adminSession.role),
      };
    }
  } catch {
    adminUser = null;
  }

  return (
    <html lang="cs" className={`${inter.variable} h-full`}>
      <head>
        <GoogleTag />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <Header lmsUser={lmsUser} adminUser={adminUser} />
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
