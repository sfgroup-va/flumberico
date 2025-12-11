'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Target,
  Lightbulb,
  Award,
  Globe,
  Heart,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Facebook,
  CheckCircle,
  TrendingUp,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const stats = [
    { number: '83%', label: 'Success Rate', icon: TrendingUp, color: 'text-neon-green' },
    { number: '94%', label: 'Match Accuracy', icon: Target, color: 'text-neon-blue' },
    { number: '3.8k+', label: 'Active Users', icon: Users, color: 'text-neon-purple' },
    { number: '40hr', label: 'Saved Weekly', icon: Clock, color: 'text-neon-pink' }
  ];

  const features = [
    {
      icon: Target,
      title: 'Precision Matching',
      description: 'Our vector-based matching engine analyzes your resume DNA against thousands of job descriptions to find your perfect fit.',
      color: 'text-neon-blue'
    },
    {
      icon: Zap,
      title: 'AI Hunter',
      description: 'Automate your job search with our intelligent agent that finds, qualifies, and applies to relevant positions 24/7.',
      color: 'text-neon-purple'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Stealth mode ensures your current employer never knows you\'re looking. Your data is encrypted and secure.',
      color: 'text-neon-green'
    }
  ];

  const team = [
    {
      name: 'Alex Chen',
      role: 'Founder & CEO',
      description: 'Former tech recruiter turned AI engineer. Built the core matching algorithm.',
      avatar: '/Alex Chen.png',
      linkedin: '#'
    },
    {
      name: 'Sarah Johnson',
      role: 'Head of AI',
      description: 'PhD in Machine Learning. Leads our vector search and NLP initiatives.',
      avatar: '/Sarah Johnson.jpg',
      linkedin: '#'
    },
    {
      name: 'Marcus Williams',
      role: 'Product Lead',
      description: 'Obsessed with UX. Ensures Flumberico is intuitive and powerful.',
      avatar: '/Marcus Williams.jpg',
      linkedin: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <div className="relative py-24 px-4 text-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue mb-8">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Our Mission</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            We're Building the Future of <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Career Advancement
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Flumberico exists to eliminate the inefficiency of modern job hunting.
            We believe talent should be matched with opportunity instantly, without the noise.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 rounded-xl border-border/50 hover:border-neon-blue/30 transition-colors"
              >
                <div className={`w-12 h-12 mx-auto rounded-full bg-background/50 flex items-center justify-center mb-4 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Story Section */}
      <div className="py-24 bg-background/50 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Why We Started</h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  The job search process is broken. It's a black hole of applications,
                  ghosting, and generic rejection emails. We saw brilliant people getting
                  ignored by outdated ATS systems.
                </p>
                <p>
                  So we built Flumberico using the same advanced AI that tech giants use,
                  but put it in the hands of the job seeker. Our goal is simple:
                  <span className="text-neon-blue font-semibold"> Normalize getting hired based on merit, not keywords.</span>
                </p>
              </div>
            </motion.div>

            <div className="grid gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-xl flex items-start gap-4 border-border/50 hover:border-neon-purple/30 transition-colors"
                >
                  <div className={`mt-1 ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-16">Meet the Builders</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="glass-card p-8 rounded-2xl border-border/50 hover:border-neon-blue/30 transition-all duration-300 hover:-translate-y-2">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-xl" />
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="relative w-full h-full rounded-full object-cover border-2 border-border group-hover:border-neon-blue transition-colors bg-background"
                    />
                  </div>

                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <div className="text-neon-purple font-medium text-sm mb-4">{member.role}</div>
                  <p className="text-muted-foreground text-sm mb-6">
                    {member.description}
                  </p>

                  <div className="flex justify-center gap-4">
                    <Link href={member.linkedin} className="p-2 rounded-full bg-background/50 hover:bg-neon-blue/10 hover:text-neon-blue transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-24 bg-background/50 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Get in Touch</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-xl text-center hover:border-neon-blue/30 transition-colors">
              <Mail className="w-8 h-8 text-neon-blue mx-auto mb-4" />
              <h3 className="font-bold mb-2">Email</h3>
              <p className="text-sm text-muted-foreground">hello@flumberico.com</p>
            </div>
            <div className="glass-card p-6 rounded-xl text-center hover:border-neon-purple/30 transition-colors">
              <Phone className="w-8 h-8 text-neon-purple mx-auto mb-4" />
              <h3 className="font-bold mb-2">Phone</h3>
              <p className="text-sm text-muted-foreground">1 336-457-3841</p>
            </div>
            <div className="glass-card p-6 rounded-xl text-center hover:border-neon-pink/30 transition-colors">
              <MapPin className="w-8 h-8 text-neon-pink mx-auto mb-4" />
              <h3 className="font-bold mb-2">HQ</h3>
              <p className="text-sm text-muted-foreground">4976 Keyser Ridge Road<br />Greensboro, NC 27401</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}