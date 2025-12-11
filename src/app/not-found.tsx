'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Home, Rocket, HelpCircle, ArrowRight, Ghost } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-blue/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-purple/20 rounded-full blur-3xl animate-pulse delay-700" />

      <main className="relative z-10 max-w-3xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 md:p-12 rounded-3xl border-neon-blue/30 shadow-2xl shadow-neon-blue/10"
        >
          {/* 404 Icon/Graphic */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 2
            }}
            className="inline-flex items-center justify-center w-24 h-24 mb-8 bg-background/50 rounded-full border border-neon-blue/50"
          >
            <Ghost className="w-12 h-12 text-neon-blue" />
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
            404
          </h1>

          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
            Page Lost in Cyberspace
          </h2>

          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            The AI agents have scoured our database but couldn't find the page you're looking for.
            It might have been moved, deleted, or never existed.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-10 relative">
            <input
              type="text"
              placeholder="Search for your dream job instead..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border border-border focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-neon-blue/10 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors"
              aria-label="Search"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Navigation Grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/"
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-blue/50 transition-all group"
            >
              <div className="p-3 rounded-full bg-neon-blue/10 text-neon-blue group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6" />
              </div>
              <span className="font-semibold">Go Home</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-purple/50 transition-all group"
            >
              <div className="p-3 rounded-full bg-neon-purple/10 text-neon-purple group-hover:scale-110 transition-transform">
                <Rocket className="w-6 h-6" />
              </div>
              <span className="font-semibold">Dashboard</span>
            </Link>

            <Link
              href="/contact"
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-green/50 transition-all group"
            >
              <div className="p-3 rounded-full bg-neon-green/10 text-neon-green group-hover:scale-110 transition-transform">
                <HelpCircle className="w-6 h-6" />
              </div>
              <span className="font-semibold">Get Help</span>
            </Link>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
