'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  Cpu,
  Target,
  Zap,
  BarChart3,
  Rocket,
  CheckCircle,
  ArrowRight,
  Shield,
  Search,
  Bot
} from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      icon: FileText,
      title: 'Upload Your CV',
      description: 'Simply upload your PDF resume. Our advanced AI scans and extracts your \"Resume DNA\" - including skills, experience, and education.',
      features: [
        'PDF Resume Parsing',
        'AI Skill Extraction',
        'Experience Analysis',
        'Automatic Profile Building'
      ]
    },
    {
      number: '02',
      icon: Target,
      title: 'Get Smart Recommendations',
      description: 'Based on your Resume DNA, our matchmaking engine finds the perfect roles for you. Free users get 10 curated recommendations daily.',
      features: [
        '10 Daily Recommendations (Free)',
        'Skill-based Matching',
        'Match Score Analysis',
        'Competition Insights'
      ]
    },
    {
      number: '03',
      icon: Bot,
      title: 'Activate AI Hunter',
      description: 'Upgrade to Pro and let AI Hunter automate your job search. It identifies high-match roles and can even auto-apply for you.',
      features: [
        'Unlimited Recommendations',
        'Auto-Apply Functionality',
        'Priority Listing',
        'Remote Job Focus'
      ]
    },
    {
      number: '04',
      icon: BarChart3,
      title: 'Track Performance',
      description: 'Monitor your application status, interview invites, and success rate through our comprehensive analytics dashboard.',
      features: [
        'Real-time Application Pulse',
        'Success Rate Tracking',
        'Performance Rankings',
        'Interview Scheduling'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background text-foreground">
      {/* Hero Section */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue mb-8"
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by Flumberico AI</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            How Flumberico Works
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Stop endless scrolling. Let our AI analyze your profile, find the perfect matches,
            and automate your applications.
          </motion.p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-12 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
              >
                {/* Visual Side */}
                <div className="flex-1 w-full">
                  <div className="relative aspect-video rounded-3xl overflow-hidden glass-card border border-border/50 p-8 flex items-center justify-center group">
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5 opacity-50 group-hover:opacity-100 transition-opacity" />

                    {/* Abstract UI Representation */}
                    <div className="relative z-10 w-full max-w-md">
                      <div className="bg-background/80 backdrop-blur-xl rounded-xl border border-border/50 p-6 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${index % 2 === 0 ? 'from-neon-blue to-cyan-400' : 'from-neon-purple to-pink-500'} flex items-center justify-center`}>
                            <step.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="h-2 w-24 bg-foreground/10 rounded-full mb-2" />
                            <div className="h-2 w-16 bg-foreground/10 rounded-full" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-2 w-full bg-foreground/5 rounded-full" />
                          ))}
                        </div>
                      </div>

                      {/* Floating Badge */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: -20, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="absolute -bottom-10 -right-4 bg-background border border-border/50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-neon-green" />
                        <span className="text-sm font-medium">AI Verified</span>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 w-full space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-bold text-white font-mono">
                      {step.number}
                    </span>
                    <h2 className="text-3xl font-bold text-foreground">
                      {step.title}
                    </h2>
                  </div>

                  <p className="text-lg text-gray-300 leading-relaxed">
                    {step.description}
                  </p>

                  <ul className="space-y-4">
                    {step.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-neon-blue/10 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4 text-neon-blue" />
                        </div>
                        <span className="text-gray-200">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="py-24 bg-background/50 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Powered by Advanced Technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="glass-card p-6 rounded-xl hover:border-neon-blue/50 transition-colors">
              <Cpu className="w-10 h-10 text-neon-blue mx-auto mb-4" />
              <h3 className="font-bold mb-2">Gemini 1.5 Flash</h3>
              <p className="text-sm text-gray-400">High-speed reasoning for resume parsing</p>
            </div>
            <div className="glass-card p-6 rounded-xl hover:border-neon-purple/50 transition-colors">
              <Bot className="w-10 h-10 text-neon-purple mx-auto mb-4" />
              <h3 className="font-bold mb-2">Vector Matching</h3>
              <p className="text-sm text-gray-400">Semantic search for precise job matching</p>
            </div>
            <div className="glass-card p-6 rounded-xl hover:border-neon-pink/50 transition-colors">
              <Shield className="w-10 h-10 text-neon-pink mx-auto mb-4" />
              <Bot className="w-10 h-10 text-neon-pink mx-auto mb-4 hidden" />
              <h3 className="font-bold mb-2">Secure Processing</h3>
              <p className="text-sm text-gray-400">Encrypted data handling & stealth mode</p>
            </div>
            <div className="glass-card p-6 rounded-xl hover:border-neon-green/50 transition-colors">
              <Zap className="w-10 h-10 text-neon-green mx-auto mb-4" />
              <h3 className="font-bold mb-2">Real-time Updates</h3>
              <p className="text-sm text-gray-400">Instant notifications & status tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 rounded-3xl relative overflow-hidden border-neon-blue/20">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-purple/5" />

            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">Ready to Automate Your Job Search?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of developers who are getting hired faster with Flumberico.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/onboarding"
                  className="futuristic-button flex items-center justify-center gap-2"
                >
                  Start For Free <Rocket className="w-5 h-5" />
                </Link>
                <Link
                  href="/search"
                  className="px-8 py-4 bg-background/50 border border-border/50 text-foreground rounded-xl font-bold hover:bg-background/80 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  Browse Jobs <Search className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}