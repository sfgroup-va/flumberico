'use client';

import { Metadata } from 'next';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  Database,
  CheckCircle,
  Users,
  FileText,
  Mail,
  Zap,
  Server,
  Key,
  Globe
} from 'lucide-react';

// SEO Metadata would be handled via layout/config in a real next.js app moving forward, 
// but keeping it simple here as this is a client component now for animations.

export default function PrivacyPolicyPage() {
  const lastUpdated = 'December 7, 2025';

  const sections = [
    {
      title: '1. AI & Data Collection',
      icon: Database,
      items: [
        'Personal Identifiers: Name, email, phone, location',
        'Professional Data: Resume content, work history, skills taxonomy',
        'AI Training: Aggregated, anonymized data usually used to improve matching algorithms. We NEVER sell your raw personal data.',
        'Behavioral Data: Job click history, application status tracking'
      ]
    },
    {
      title: '2. Automated Applications',
      icon: Zap,
      items: [
        'Agent Authorization: By using "AI Hunter", you authorize our agents to submit applications on your behalf.',
        'Credential Storage: Encrypted storage of board-specific credentials if required.',
        'Consent Logs: Every automated action is logged and available for your review.',
        'Rate Limiting: We mimic human behavior to protect your reputation.'
      ]
    },
    {
      title: '3. Stealth Mode & Privacy',
      icon: Eye,
      items: [
        'Employer Blocking: We automatically block your current employer from seeing your profile.',
        'Data Anonymization: Option to hide PII (Personally Identifiable Information) until interview request.',
        'Right to be Forgotten: Complete data wipe available upon account deletion.',
        'Third-Party Sharing: Shared only with prospective employers you approve.'
      ]
    },
    {
      title: '4. Security Infrastructure',
      icon: Lock,
      items: [
        'Encryption: AES-256 for data at rest, TLS 1.3 for data in transit.',
        'Access Control: Zero-trust architecture for internal staff access.',
        'Audits: Quarterly security penetration testing.',
        'Payment Info: Handled exclusively by Stripe (PCI-DSS Service Provider Level 1).'
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green mb-8">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Bank-Grade Security</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple bg-clip-text text-transparent">
            Privacy Policy
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            We're building the future of AI recruitment, and that starts with absolute trust.
            Here's how we protect your career data.
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
          className="glass-card p-8 rounded-3xl border-neon-blue/20 mb-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-transparent pointer-events-none" />
          <div className="flex items-start gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-neon-blue/10 flex items-center justify-center shrink-0">
              <Key className="w-8 h-8 text-neon-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Data, Your Control</h2>
              <p className="text-muted-foreground leading-relaxed">
                Flumberbico (Flumberico Inc.) respects your privacy. Unlike traditional job boards that sell your resume to the highest bidder,
                our business model is subscription-based. <strong className="text-neon-blue">You are the customer, not the product.</strong> We use your data solely to train your personal AI agent ('AI Hunter')
                to find and apply to jobs that match your criteria.
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
              className="glass-card p-8 rounded-2xl border-border/50 hover:border-neon-purple/30 transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center group-hover:bg-neon-purple/10 transition-colors">
                  <section.icon className="w-6 h-6 text-neon-purple" />
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

        {/* Global Compliance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span className="font-bold">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-bold">CCPA Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              <span className="font-bold">SOC2 Type II</span>
            </div>
          </div>
        </motion.div>

        {/* Contact Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-16 text-center"
        >
          <div className="glass-card p-8 max-w-2xl mx-auto rounded-3xl border-neon-green/20 bg-neon-green/5">
            <h3 className="text-xl font-bold mb-4">Privacy Concerns?</h3>
            <p className="text-muted-foreground mb-6">
              Our Data Protection Officer (DPO) is available to address any concerns regarding your personal information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:privacy@flumberico.com"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neon-green/10 text-neon-green hover:bg-neon-green/20 transition-colors font-medium"
              >
                <Mail className="w-4 h-4" />
                privacy@flumberico.com
              </a>
              <a
                href="/contact"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-white/5 transition-colors font-medium"
              >
                Subject Access Request
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}