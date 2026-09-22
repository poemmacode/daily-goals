import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { LanguageProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daily Goals® | Data-Driven Habit Tracker & Productivity System",
  description:
    "Stop relying on streaks and start building systems. Daily Goals® uses data, failure tracking, and AI to help you achieve your goals through actionable insights.",
  openGraph: {
    title: "Daily Goals® | Data-Driven Habit Tracker & Productivity System",
    description:
      "Stop relying on streaks and start building systems. Daily Goals® uses data, failure tracking, and AI to help you achieve your goals through actionable insights.",
    images: [
      {
        url: "/thumbnail-json-strucuted-data-goal-tracker.jpg",
        width: 1200,
        height: 630,
        alt: "Daily Goals® — data-driven habit tracker",
      },
    ],
    type: "website",
    siteName: "Daily Goals®",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Goals® | Data-Driven Habit Tracker & Productivity System",
    description:
      "Stop relying on streaks and start building systems. Daily Goals® uses data, failure tracking, and AI to help you achieve your goals through actionable insights.",
    images: ["/thumbnail-json-strucuted-data-goal-tracker.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <Navbar />
          <div className="flex-1 pb-20 md:pb-0">{children}</div>
          <Footer />
          <BottomNav />
          <CookieConsent />
        </LanguageProvider>
      </body>
    </html>
  );
}
