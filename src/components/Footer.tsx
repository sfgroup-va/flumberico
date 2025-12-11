"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Heart,
  Rocket,
  Target,
  Users,
  Shield,
  Zap,
  ChevronRight,
  ArrowUpRight,
  FileText,
  ScrollText,
  AlertCircle
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const socialLinks = [
    {
      icon: Facebook,
      href: "#",
      label: "Facebook",
      color: "hover:text-blue-400"
    },
    {
      icon: Twitter,
      href: "#",
      label: "Twitter",
      color: "hover:text-cyan-400"
    },
    {
      icon: Linkedin,
      href: "#",
      label: "LinkedIn",
      color: "hover:text-blue-500"
    },
    {
      icon: Github,
      href: "#",
      label: "GitHub",
      color: "hover:text-gray-400"
    }
  ];

  const quickLinks = [
    { href: "/how-it-works", label: "How It Works", icon: Target },
    { href: "/pricing", label: "Pricing Plans", icon: Zap },
    { href: "/about", label: "About Us", icon: Users },
    { href: "/contact", label: "Contact", icon: Mail }
  ];

  const jobSeekerLinks = [
    { href: "/jobs", label: "Browse Jobs", icon: Target },
    { href: "/auth/signup", label: "Create Account", icon: Users },
    { href: "/auth/signin", label: "Sign In", icon: Shield },
    { href: "/upgrade", label: "Premium Features", icon: Rocket }
  ];

  const legalLinks = [
    { href: "/privacy", label: "Privacy Policy", icon: Shield },
    { href: "/terms", label: "Terms of Service", icon: ScrollText },
    { href: "/disclaimer", label: "Disclaimer", icon: AlertCircle }
  ];

  return (
    <footer className="relative bg-gradient-to-t from-background via-card/50 to-transparent">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-neon-blue/10 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Top Wave Border */}
        <div className="relative h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-purple to-transparent animate-pulse"></div>
        </div>

        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 py-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

            {/* Brand Section */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 group">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src="/Favicon Flumberico.png"
                      alt="Flumberico Favicon"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent transform group-hover:scale-110 transition-transform duration-300">
                    Flumberico
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Revolutionizing job search with cutting-edge AI technology.
                We connect talented developers with their dream opportunities across North America.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Connect:</span>
                <div className="flex gap-2">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className={`w-10 h-10 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg flex items-center justify-center text-muted-foreground ${social.color} transition-all duration-300 hover:scale-110 hover:border-neon-blue/50`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-neon-blue" />
                <h4 className="text-lg font-semibold text-foreground">Quick Links</h4>
              </div>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-muted-foreground hover:text-blue-400 hover:font-medium hover:tracking-wide transition-all duration-300 group"
                    >
                      <link.icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                        {link.label}
                      </span>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Job Seekers */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-neon-purple" />
                <h4 className="text-lg font-semibold text-foreground">For Job Seekers</h4>
              </div>
              <ul className="space-y-3">
                {jobSeekerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-muted-foreground hover:text-purple-400 hover:font-medium hover:tracking-wide transition-all duration-300 group"
                    >
                      <link.icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                        {link.label}
                      </span>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal & Support */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h4 className="text-lg font-semibold text-foreground">Legal & Support</h4>
              </div>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-muted-foreground hover:text-cyan-400 hover:font-medium hover:tracking-wide transition-all duration-300 group"
                    >
                      <link.icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                        {link.label}
                      </span>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="mailto:hello@flumberico.com"
                    className="flex items-center gap-2 text-muted-foreground hover:text-blue-400 hover:font-medium hover:tracking-wide transition-all duration-300 group"
                  >
                    <Mail className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                      Support
                    </span>
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Contact Info Section */}
          <motion.div
            variants={itemVariants}
            className="mt-16 p-8 glass-card rounded-2xl border border-border/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-neon-purple/5 to-cyan-500/5"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-neon-blue/20 rounded-lg flex items-center justify-center group-hover:bg-neon-blue/30 transition-colors duration-300">
                  <Mail className="w-6 h-6 text-neon-blue" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email Us</p>
                  <a href="mailto:hello@flumberico.com" className="text-foreground hover:text-neon-blue transition-colors">
                    hello@flumberico.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-neon-purple/20 rounded-lg flex items-center justify-center group-hover:bg-neon-purple/30 transition-colors duration-300">
                  <Phone className="w-6 h-6 text-neon-purple" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Call Us</p>
                  <a href="tel:1-336-457-3841" className="text-foreground hover:text-neon-purple transition-colors">
                    1-336-457-3841
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors duration-300">
                  <MapPin className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Visit Us</p>
                  <p className="text-foreground">
                    Greensboro, NC
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-7xl mx-auto px-4 py-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <motion.div variants={itemVariants} className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  © {currentYear} Flumberico. All rights reserved.
                </span>
                <div className="w-1 h-1 bg-neon-blue rounded-full"></div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  Made with
                  <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                  in USA
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Powered by</span>
                <a
                  href="https://jetdigitalpro.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1 bg-neon-blue/20 rounded-full border border-neon-blue/30 hover:bg-neon-blue/30 hover:border-neon-blue/50 transition-all duration-300 hover:scale-105"
                >
                  <Rocket className="w-4 h-4 text-neon-blue" />
                  <span className="text-sm font-medium text-neon-blue">JetDigitalPro</span>
                </a>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="w-10 h-10 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg flex items-center justify-center text-muted-foreground hover:text-neon-blue hover:border-neon-blue/50 transition-all duration-300 hover:scale-110"
                  aria-label="Back to top"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}