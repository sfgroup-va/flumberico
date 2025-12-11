"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  MapPin,
  Rocket,
  Gift,
  Share2,
  CheckCircle2,
  ArrowRight,
  Target,
  Shield,
  Star,
  Crown,
  Award,
  Copy,
  Twitter,
  Linkedin,
  MessageCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import FeaturedJobs from "./FeaturedJobs";

// SEO Metadata would be handled in the page component

export default function ViralHomePage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [referralData, setReferralData] = useState({
    referralCode: "",
    referralsCount: 0,
    nextReward: "1 month FREE",
    progressPercentage: 0,
    shareUrl: "",
    stats: {
      totalJobs: 15847,
      newToday: 127, // Initial value, updated by useEffect
      successRate: 83,
      activeMembers: 5423,
      spotsLeft: 892
    }
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Load saved referral data from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const savedReferralData = localStorage.getItem('referralData');
      if (savedReferralData) {
        try {
          const parsed = JSON.parse(savedReferralData);
          setReferralData(prev => ({
            ...prev,
            referralCode: parsed.referralCode || prev.referralCode,
            referralsCount: parsed.referralsCount || prev.referralsCount,
            progressPercentage: parsed.progressPercentage || prev.progressPercentage,
            shareUrl: parsed.shareUrl || prev.shareUrl,
            stats: prev.stats // Keep current stats
          }));
        } catch (error) {
          console.error('Error parsing saved referral data:', error);
        }
      }
    }

    // Set a random number for "New Today" client-side to keep it looking dynamic but consistent per session
    setReferralData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        newToday: Math.floor(Math.random() * (150 - 50 + 1)) + 50
      }
    }));

    // Fetch real stats from database
    const fetchRealStats = async () => {
      try {
        const response = await fetch('/api/jobs/stats');
        if (response.ok) {
          const stats = await response.json();
          setReferralData(prev => ({
            ...prev,
            stats: {
              totalJobs: stats.totalJobs,
              newToday: stats.newToday || Math.floor(new Date().getDate() * 3.14 + 50),
              successRate: stats.successRate,
              activeMembers: prev.stats.activeMembers, // Keep simulated value for now
              spotsLeft: prev.stats.spotsLeft // Keep simulated value for now
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching job stats:', error);
        // Keep default values if fetch fails
      }
    };

    fetchRealStats();

    // Generate referral code if user is logged in (only generate once)
    if (session?.user && !referralData.referralCode) {
      const code = session.user.email?.slice(0, 4).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
      const newReferralData = {
        referralCode: code,
        shareUrl: `${window.location.origin}?ref=${code}`,
        referralsCount: 0, // Start with 0 instead of random
        progressPercentage: 0 // Start with 0 instead of random
      };

      setReferralData(prev => ({
        ...prev,
        ...newReferralData
      }));

      // Save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('referralData', JSON.stringify(newReferralData));
      }
    }

  }, [session]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareReferral = (platform: string) => {
    const message = `🚀 Get FREE Pro access on this AI job platform! Use my link and skip the waitlist: ${referralData.shareUrl}`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralData.shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`
    };
    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  if (!mounted) return null;

  // Pre-compute background particle styles to avoid hydration mismatch
  const backgroundParticles = Array.from({ length: 20 }, (_, i) => ({
    size: (i * 123 % 300) + 50, // Deterministic pseudo-random
    left: (i * 456 % 100),
    top: (i * 789 % 100),
    delay: (i * 234 % 5),
    duration: (i * 567 % 10) + 10
  }));

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
      <div className="fixed inset-0">
        {backgroundParticles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-500/10 animate-pulse"
            style={{
              width: particle.size + "px",
              height: particle.size + "px",
              left: particle.left + "%",
              top: particle.top + "%",
              animationDelay: particle.delay + "s",
              animationDuration: particle.duration + "s"
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center space-y-8">
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Stop Applying to Jobs.
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Start Getting Interviews.
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
              >
                AI applies to <span className="text-blue-400 font-semibold">200+ perfect-fit jobs monthly</span> while you sleep.
                <span className="text-green-400 font-semibold"> Just $15/month</span> or get it <span className="text-yellow-400 font-bold">FREE forever</span>.
              </motion.p>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {!session ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    href="/auth/signup"
                    className="futuristic-button flex items-center gap-2"
                  >
                    <Rocket className="w-5 h-5" />
                    Start Free Trial
                  </Link>

                  <div className="text-center">
                    <p className="text-gray-400 mb-2">OR</p>
                    <Link
                      href="#referral"
                      className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                    >
                      Refer 2 Friends → Get Pro FREE
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <span className="text-lg font-semibold">Welcome back, {session.user?.name?.split(' ')[0]}!</span>
                    </div>
                    <p className="text-gray-300 mb-4">You're on the path to FREE Pro access. Share your link below:</p>

                    {/* Referral Progress */}
                    <div className="bg-black/30 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Your Progress</span>
                        <span className="text-sm font-semibold text-blue-400">
                          {referralData.referralsCount}/2 friends
                        </span>
                      </div>

                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(referralData.referralsCount / 2) * 100}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                      </div>

                      <p className="text-xs text-gray-400">
                        {2 - referralData.referralsCount} more friend{2 - referralData.referralsCount !== 1 ? 's' : ''} for 1 month FREE!
                      </p>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center mt-4">
                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                      <button
                        onClick={() => shareReferral('twitter')}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Twitter className="w-4 h-4" />
                        Share
                      </button>
                      <button
                        onClick={() => shareReferral('linkedin')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Linkedin className="w-4 h-4" />
                        Share
                      </button>
                      <button
                        onClick={() => shareReferral('whatsapp')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  30-Day Guarantee
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Cancel Anytime
                </span>
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  4.9/5 Rating
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Live Stats */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-12 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: referralData.stats.totalJobs.toLocaleString(), label: "AI-Enhanced Jobs", icon: Search, color: "text-blue-400" },
                { value: `${referralData.stats.successRate}%`, label: "Success Rate", icon: TrendingUp, color: "text-green-400" },
                { value: referralData.stats.activeMembers.toLocaleString(), label: "Active Members", icon: Users, color: "text-purple-400" },
                { value: referralData.stats.newToday, label: "New Today", icon: Sparkles, color: "text-orange-400" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-colors"
                >
                  <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Featured Job Listings */}
        <FeaturedJobs />

        {/* How It Works */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  How AI Gets You Hired
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Stop wasting hours on applications. Let AI do the heavy lifting while you focus on what matters.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: 1,
                  title: "Create Profile",
                  description: "Tell AI your dream job and skills in 2 minutes",
                  icon: Target,
                  color: "from-blue-500 to-blue-600"
                },
                {
                  step: 2,
                  title: "AI Scans 500K+ Jobs",
                  description: "Our AI finds perfect matches across all job boards",
                  icon: Search,
                  color: "from-purple-500 to-purple-600"
                },
                {
                  step: 3,
                  title: "Smart Applications",
                  description: "AI customizes applications for each job",
                  icon: Sparkles,
                  color: "from-pink-500 to-pink-600"
                },
                {
                  step: 4,
                  title: "Get Interviews",
                  description: "Receive interview requests and job offers",
                  icon: Award,
                  color: "from-green-500 to-green-600"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group hover:scale-105">
                    <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-blue-400 mb-2">Step {step.step}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Referral Program Section */}
        <section id="referral" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-blue-900/20">
          <div className="max-w-7xl mx-auto text-center space-y-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Get Pro Plan for FREE
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Share with friends and earn months of Pro access. Help your network while getting rewarded.
              </p>
            </motion.div>

            {/* Reward Tiers */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                {
                  friends: 2,
                  reward: "1 Month FREE",
                  value: "$15 value",
                  popular: true,
                  color: "from-blue-500 to-blue-600"
                },
                {
                  friends: 5,
                  reward: "3 Months FREE",
                  value: "$45 value",
                  color: "from-purple-500 to-purple-600"
                },
                {
                  friends: 10,
                  reward: "6 Months FREE",
                  value: "$90 value",
                  color: "from-pink-500 to-pink-600"
                },
                {
                  friends: 20,
                  reward: "9 Months FREE",
                  value: "$270 value",
                  badge: "Super Saver",
                  color: "from-green-500 to-green-600"
                }
              ].map((tier, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white/5 backdrop-blur-sm border ${tier.popular ? 'border-yellow-400/50' : 'border-white/10'} rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group hover:scale-105`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold rounded-full">
                      {tier.badge}
                    </div>
                  )}
                  {tier.popular && (
                    <div className="absolute top-2 right-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  )}

                  <div className="text-center space-y-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${tier.color} rounded-full text-2xl font-bold text-white`}>
                      {tier.friends}
                    </div>
                    <h3 className="text-xl font-bold text-white">{tier.reward}</h3>
                    <p className="text-gray-400 text-sm">{tier.value}</p>
                    <div className="text-xs text-gray-500">
                      {tier.friends} friend{tier.friends !== 1 ? 's' : ''} needed
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-8 backdrop-blur-sm max-w-4xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Why Share With Friends?</h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Help Your Network</span>
                  </div>
                  <p className="text-sm text-gray-400">Your friends get the same AI-powered job hunting advantage</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Gift className="w-5 h-5" />
                    <span className="font-semibold">Earn Rewards</span>
                  </div>
                  <p className="text-sm text-gray-400">Get months of free access just for sharing</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Award className="w-5 h-5" />
                    <span className="font-semibold">Unlock Achievements</span>
                  </div>
                  <p className="text-sm text-gray-400">Earn badges and recognition as a top referrer</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Success Stories
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Join thousands who've transformed their job search with AI
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Chen",
                  role: "Product Designer",
                  company: "Spotify",
                  result: "8 interviews in 2 weeks",
                  story: "I was applying to 50+ jobs weekly with no luck. AI Hunter got me 8 interviews in 2 weeks and landed me my dream job!",
                  image: "/Sarah Chen.jpg",
                  rating: 5
                },
                {
                  name: "Marcus Rodriguez",
                  role: "Software Engineer",
                  company: "Google",
                  result: "$140K salary increase",
                  story: "The AI applications were better than my own. Negotiated 40% higher salary with AI-powered insights.",
                  image: "/Marcus Rodriguez.jpg",
                  rating: 5
                },
                {
                  name: "Sofia Morales",
                  role: "Marketing Manager",
                  company: "Meta",
                  result: "Saved 20+ hours/week",
                  story: "Went from applying manually to AI doing everything. Got promoted at my dream company!",
                  image: "/Sofia Morales.jpg",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>

                  <p className="text-gray-300 mb-6 italic leading-relaxed">
                    "{testimonial.story}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role} at {testimonial.company}</div>
                      <div className="text-sm text-green-400 font-medium">{testimonial.result}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing & CTA */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-purple-900/20">
          <div className="max-w-7xl mx-auto text-center space-y-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Simple, Transparent Pricing
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Just $15/month for unlimited job applications. Or get it FREE with referrals.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="text-3xl font-bold text-gray-300 mb-6">$0</div>
                <ul className="space-y-3 text-left text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Browse 100+ jobs daily
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Basic job matching
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Limited applications (5/day)
                  </li>
                </ul>
                <Link href={session ? "/dashboard" : "/auth/signup"} className="block w-full text-center mt-6 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  Start Free
                </Link>
              </motion.div>

              {/* Pro Plan */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-8 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300"
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-sm font-bold rounded-full">
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="text-3xl font-bold text-white mb-2">$15</div>
                <div className="text-sm text-gray-300 mb-6">per month</div>
                <ul className="space-y-3 text-left text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Unlimited applications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    AI-powered matching
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Custom AI applications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Advanced analytics
                  </li>
                </ul>
                <Link href={session ? "/upgrade" : "/auth/signup?plan=pro"} className="futuristic-button block w-full text-center mt-6">
                  Get Pro - Or Refer 2 Friends
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-8 backdrop-blur-sm max-w-4xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-white mb-4">🏆 30-Day Satisfaction Guarantee</h3>
              <p className="text-gray-300 mb-6 text-lg">
                Not satisfied with our AI-powered job hunting? Get a full refund within 30 days.
              </p>
              <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Risk-free trial
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Cancel anytime
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Priority support
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-6xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Ready to Land Your Dream Job?
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Join <span className="text-blue-400 font-semibold">{referralData.stats.activeMembers.toLocaleString()}+ job seekers</span> who've already transformed their career search.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  href={session ? "/dashboard" : "/auth/signup"}
                  className="futuristic-button flex items-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  Start Free Trial
                </Link>

                <div className="text-center">
                  <p className="text-gray-400 mb-2">OR</p>
                  <Link
                    href="#referral"
                    className="text-blue-400 hover:text-blue-300 transition-colors font-semibold text-lg"
                  >
                    Refer 2 Friends → Get Pro FREE
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-400">
                <span>⚡ Start Your Free Trial Today</span>
                <span>🎯 Limited Founding Member Spots</span>
                <span>💎 30-Day Satisfaction Guarantee</span>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}