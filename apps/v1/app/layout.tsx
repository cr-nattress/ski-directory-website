import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { WebVitals } from "@/components/WebVitals";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://skicolorado.com'),
  title: {
    default: 'Colorado Ski Resorts | Find Your Perfect Mountain',
    template: '%s | Ski Directory',
  },
  description: 'Discover 30+ Colorado ski resorts with real-time conditions, expert reviews, and detailed mountain stats. Find your perfect Colorado ski destination.',
  keywords: ['Colorado ski resorts', 'skiing Colorado', 'snowboarding', 'ski conditions', 'trail maps', 'Epic Pass', 'Ikon Pass'],
  authors: [{ name: 'Ski Directory' }],
  creator: 'Ski Directory',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Ski Directory',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans">
        <WebVitals />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
