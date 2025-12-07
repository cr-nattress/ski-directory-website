import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { WebVitals } from "@/components/WebVitals";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/InstallPrompt";
import { QueryProvider } from "@shared/api";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://skidirectory.org'),
  title: {
    default: 'Ski Directory | Find Your Perfect Ski Resort in North America',
    template: '%s | Ski Directory',
  },
  description: 'Discover 100+ ski resorts across the US and Canada. Compare terrain stats, real-time snow conditions, trail maps, and pass information. Find your perfect mountain.',
  keywords: ['ski resorts', 'skiing', 'snowboarding', 'ski conditions', 'trail maps', 'Epic Pass', 'Ikon Pass', 'Colorado ski resorts', 'Utah ski resorts', 'Canada skiing'],
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
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ski Directory',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Ski Directory',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Ski Directory - Find Your Perfect Ski Resort',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@skidirectory',
    images: ['/images/og-default.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <meta name="theme-color" content="#1E40AF" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <GoogleAnalytics />
      </head>
      <body className="font-sans pb-20 md:pb-0">
        <QueryProvider>
          <WebVitals />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <MobileBottomNav />
          <ServiceWorkerRegistration />
          <InstallPrompt />
        </QueryProvider>
      </body>
    </html>
  );
}
