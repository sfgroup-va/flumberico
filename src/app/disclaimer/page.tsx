'use client';

import { Metadata } from 'next';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Info,
  Shield,
  BrainCircuit,
  Target,
  CheckCircle,
  Eye,
  Star,
  Mail,
  Phone,
  MapPin,
  Bot
} from 'lucide-react';

export default function DisclaimerPage() {
  const lastUpdated = 'December 7, 2025';

  const disclaimers = [
    {
      title: 'AI Technology Limitations',
      icon: Bot,
      content: 'Our services utilize Artificial Intelligence (AI) to automate job searching and applications. While highly advanced, AI is not infallible. It may occasionally misinterpret job descriptions or select opportunities that are not a perfect match. Users are encouraged to review applications periodically.'
    },
    {
      title: 'No Guarantee of Employment',
      icon: Target,
      content: 'Flumberico provides tools to enhance your job search, not a promise of employment. Hiring decisions are made solely by third-party employers. We do not guarantee interviews (outside of our specific 30-day money-back guarantee terms) or job offers.'
    },
    {
      title: 'Not Professional Career Advice',
      icon: Info,
      content: 'Content provided by our AI agents, blogs, or support team is for informational purposes only. It does not constitute professional career counseling, legal, or financial advice. Consult with qualified professionals for specific guidance.'
    },
    {
      title: 'Third-Party Links & Data',
      icon: BrainCircuit,
      content: 'Our service aggregates data from various job boards and external sites. We are not responsible for the content, privacy policies, or practices of these third-party websites. Applying to a job via our agent may subject you to the terms of those external platforms.'
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-orange/10 border border-neon-orange/20 text-neon-orange mb-8">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Important Legal Notice</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-neon-orange via-red-500 to-neon-pink bg-clip-text text-transparent">
            Disclaimer
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Transparency is key. Please understand the capabilities and limitations of our AI tools.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/60">
            <Info className="w-4 h-4" />
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
          className="glass-card p-8 rounded-3xl border-neon-orange/20 mb-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-orange/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-neon-orange/10 flex items-center justify-center shrink-0">
              <Shield className="w-8 h-8 text-neon-orange" />
            </div>
            <div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                By using Flumberico, you acknowledge that you have read and understood this disclaimer.
                If you do not agree with any part of this disclaimer, please do not use our services.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {disclaimers.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
              className="glass-card p-8 rounded-2xl border-border/50 hover:border-neon-orange/30 transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center group-hover:bg-neon-orange/10 transition-colors">
                  <item.icon className="w-6 h-6 text-neon-orange" />
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {item.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Contact Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="glass-card p-10 rounded-3xl border-neon-blue/20 bg-neon-blue/5 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Still Have Questions?</h2>
            <div className="grid md:grid-cols-3 gap-6">

              <a href="mailto:hello@flumberico.com" className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-neon-blue" />
                </div>
                <span className="font-medium text-sm">hello@flumberico.com</span>
              </a>

              <a href="tel:13364573841" className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-neon-purple" />
                </div>
                <span className="font-medium text-sm">1-336-457-3841</span>
              </a>

              <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-default">
                <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-neon-green" />
                </div>
                <span className="font-medium text-sm">Greensboro, NC</span>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}