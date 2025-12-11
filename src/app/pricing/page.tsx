'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle,
  Rocket,
  Crown,
  Zap,
  Star,
  Shield,
  Clock,
  Briefcase,
  TrendingUp,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {

  const stats = [
    { label: 'Success Rate', value: '83%', icon: TrendingUp, color: 'text-neon-green' },
    { label: 'Happy Users', value: '1,247', icon: Users, color: 'text-neon-blue' },
    { label: 'Jobs Applied', value: '5,423', icon: Briefcase, color: 'text-neon-purple' },
    { label: 'Day Guarantee', value: '30', icon: Shield, color: 'text-neon-pink' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <div className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue mb-8">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Upgrade to Pro</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Activate AI Hunter
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Let the magic happen automatically. Stop manually applying and let AI handle the heavy lifting while you sleep.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 rounded-xl text-center border-border/50 hover:border-neon-blue/30 transition-colors"
              >
                <div className={`w-10 h-10 mx-auto rounded-full bg-background/50 flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-3xl p-8 border-border relative overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Star className="w-24 h-24 text-muted-foreground" />
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-muted-foreground">Perfect for testing the waters</p>
            </div>

            <div className="mb-8 p-4 bg-background/50 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 text-xl font-bold mb-1">
                AI Job Matching Engine
              </div>
              <div className="text-sm text-muted-foreground">
                Basic access to our matching algorithms
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                '10 job recommendations daily',
                'Manual applications only',
                'Save up to 10 jobs',
                'Basic profile creation',
                'Email notifications'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/"
              className="w-full py-4 rounded-xl font-bold bg-secondary hover:bg-secondary/80 transition-colors text-center border border-border"
            >
              Continue with Free
            </Link>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-3xl p-8 border-neon-blue/50 relative overflow-hidden flex flex-col shadow-2xl shadow-neon-blue/10"
          >
            {/* Gradient Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5" />

            <div className="absolute top-0 right-0 bg-neon-blue text-background text-xs font-bold px-3 py-1 rounded-bl-xl z-20">
              MOST POPULAR
            </div>

            <div className="relative z-10 mb-8">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-neon-blue">Pro</h3>
                  <p className="text-muted-foreground">Maximum automation & reach</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">$15</div>
                  <div className="text-sm text-muted-foreground">/month</div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mb-8 p-4 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-xl border border-neon-blue/20">
              <div className="flex items-center gap-2 text-xl font-bold mb-1 text-neon-blue">
                <Crown className="w-5 h-5" />
                Everything in Free +
              </div>
              <div className="text-sm text-foreground/80">
                Unlock full AI Hunter capabilities
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1 relative z-10">
              {[
                'Unlimited AI recommendations',
                'Manual + automated applications',
                'AI cover letter generator',
                'While-you-sleep automation',
                'Unlimited job saves',
                'Advanced application tracking',
                '30-day interview guarantee'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/signup?plan=pro"
              className="relative z-10 w-full py-4 rounded-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:opacity-90 transition-opacity text-center flex items-center justify-center gap-2"
            >
              Subscribe Now <Rocket className="w-4 h-4" />
            </Link>

            <div className="mt-4 text-center text-xs text-muted-foreground relative z-10">
              <Shield className="w-3 h-3 inline mr-1" />
              30-Day Interview Guarantee included
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Guarantee */}
      <div className="py-12 border-t border-border/50 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-neon-blue" />
              <span>30-Day Interview Guarantee</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-purple" />
              <span>Priority Support</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-neon-pink" />
              <span>Unlimited Applications</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}