import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import NextAuthProvider from "@/components/providers/SessionProvider";
import WebsiteSchema from "@/components/WebsiteSchema";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Flumberico",
    template: "%s | Flumberico",
  },
  description: "Stop Applying. Start Getting Interviews. AI-powered job hunting that works while you sleep.",
  icons: {
    icon: "/Flumberico Logo_FIX.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-w-[350px]`} suppressHydrationWarning>
        {/* Website Schema Markup */}
        <WebsiteSchema />

        <NextAuthProvider>
          <Navbar />
          {children}
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
