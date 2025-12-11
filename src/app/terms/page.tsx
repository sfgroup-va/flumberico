'use client';

import { Metadata } from 'next';
import { motion } from 'framer-motion';
import {
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Users,
  Gavel,
  Mail,
  Scale,
  CreditCard,
  Zap,
  RefreshCw
} from 'lucide-react';

export default function TermsOfServicePage() {
  const lastUpdated = 'December 7, 2025';

  const sections = [
    {
      title: '1. AI Agent Authorization',
      icon: Zap,
      items: [
        'By activating "AI Hunter", you grant Flumberico explicit permission to act as your digital agent.',
        'This includes creating accounts, submitting applications, and communicating with employers on your behalf.',
        'You acknowledge that automated applications are submitted based on the criteria you provide.'
      ]
    },
    {
      title: '2. User Responsibilities',
      icon: Users,
      items: [
        'Accuracy: You certify that all data (resume, skills, experience) provided is 100% accurate.',
        'Monitoring: You agree to periodically review submitted applications via your dashboard.',
        'Credentials: You are responsible for safeguarding your Flumberico account credentials.',
        'Good Faith: You will not use the service to spam employers or submit fraudulent applications.'
      ]
    },
    {
      title: '3. 30-Day Interview Guarantee',
      icon: Shield,
      items: [
        'Eligibility: Applies to "Pro" users who maintain an active subscription for 30 consecutive days.',
        'Requirement: User must complete their profile to 100% and approve at least 50 automated applications.',
        'Refund: If no interview requests are received after meeting criteria, a full refund of the last month\'s fee is issued.',
        'Claim Process: Claims must be submitted via the Support page within 7 days of the 30-day period ending.'
      ]
    },
    {
      title: '4. Subscription & Billing',
      icon: CreditCard,
      items: [
        'Billing Cycle: Subscriptions are billed monthly or annually in advance.',
        'Cancellation: You may cancel at any time via the dashboard. Access continues until the end of the billing period.',
        'Refunds: Except for the Guarantee, all fees are non-refundable once paid.',
        'Price Changes: We reserve the right to change prices with 30 days notice.'
      ]
    }
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple mb-8">
            <Scale className="w-4 h-4" />
            <span className="text-sm font-medium">Terms of Service</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            User Agreement
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Clear rules for a powerful tool. Please read these terms to understand
            how our AI represents you in the job market.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/60">
            <FileText className="w-4 h-4" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 pb-20">

        {/* Intro Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 rounded-3xl border-neon-purple/20 mb-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-transparent pointer-events-none" />
          <div className="flex items-start gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-neon-purple/10 flex items-center justify-center shrink-0">
              <Gavel className="w-8 h-8 text-neon-purple" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By creating an account or using Flumberico's AI services, you agree to enter into a legally binding contract with Flumberico Inc.
                If you do not agree to these terms, <strong>do not use our services</strong>. These terms govern your use of our website,
                AI agents, and related applications.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Policy Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
              className="glass-card p-8 rounded-2xl border-border/50 hover:border-neon-blue/30 transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center group-hover:bg-neon-blue/10 transition-colors">
                  <section.icon className="w-6 h-6 text-neon-blue" />
                </div>
                <h3 className="text-xl font-bold">{section.title}</h3>
              </div>

              <ul className="space-y-4">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-neon-green shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 glass-card p-6 rounded-2xl border-neon-orange/20 bg-neon-orange/5 flex items-start gap-4"
        >
          <AlertTriangle className="w-6 h-6 text-neon-orange shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-neon-orange mb-2">Disclaimer of Warranties</h3>
            <p className="text-sm text-muted-foreground">
              While we strive for perfection, Flumberico cannot guarantee a specific employment outcome outside of the terms of our Interview Guarantee.
              The job market is dynamic, and hiring decisions ultimately rest with the employers. We provide tools to maximize your chances,
              not a guaranteed job offer.
            </p>
          </div>
        </motion.div>

        {/* Contact Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-16 text-center"
        >
          <h3 className="text-xl font-bold mb-6">Questions about these Terms?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:legal@flumberico.com"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 transition-colors font-medium"
            >
              <Mail className="w-4 h-4" />
              legal@flumberico.com
            </a>
            <a
              href="/contact"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-white/5 transition-colors font-medium"
            >
              Generic Support
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
}