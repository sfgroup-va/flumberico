import ViralHomePage from "@/components/ViralHomePage";
import { Metadata } from "next";

// SEO Metadata
export const metadata: Metadata = {
  title: "Flumberico - AI-Powered Job Hunting | Stop Applying, Start Getting Interviews",
  description: "AI applies to 200+ perfect-fit jobs monthly while you sleep. Just $15/month or get Pro plan FREE by referring 2 friends. 83% success rate with 30-day interview guarantee.",
  keywords: [
    "AI job search",
    "automated job applications",
    "job hunting AI",
    "AI-powered job board",
    "job application automation",
    "career search AI",
    "get hired with AI",
    "job matching AI",
    "interview preparation AI",
    "resume optimization AI"
  ],
  authors: [{ name: "Flumberico Team" }],
  creator: "Flumberico",
  publisher: "Flumberico",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://your-domain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXTAUTH_URL || 'https://your-domain.com',
    title: 'Flumberico - AI-Powered Job Hunting | Stop Applying, Start Getting Interviews',
    description: 'AI applies to 200+ perfect-fit jobs monthly while you sleep. Just $15/month or get Pro plan FREE by referring 2 friends.',
    siteName: 'Flumberico',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Flumberico - AI-Powered Job Hunting Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flumberico - AI-Powered Job Hunting',
    description: 'AI applies to 200+ perfect-fit jobs monthly while you sleep. Just $15/month or get Pro plan FREE.',
    images: ['/og-image.jpg'],
  },
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  // Schema.org structured data
  other: {
    'application/ld+json': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Flumberico",
      "description": "AI-powered job hunting platform that automatically applies to perfect-fit jobs while you sleep",
      "url": process.env.NEXTAUTH_URL || 'https://your-domain.com',
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "15",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "2847"
      },
      "author": {
        "@type": "Organization",
        "name": "Flumberico Team"
      }
    })
  }
};

export default function Home() {
  return <ViralHomePage />;
}