'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Rocket,
  CheckCircle,
  AlertCircle,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Star,
  Target,
  Clock,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  Crown
} from "lucide-react";

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  description: string;
}

export default function UpgradePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [success, setSuccess] = useState(false);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);

  const pricingPlans: PricingPlan[] = [
    {
      name: "Free",
      price: 0,
      period: "forever",
      description: "Perfect for manual job hunting",
      highlighted: false,
      features: [
        "AI Job Matching Engine",
        "10 job recommendations daily",
        "Manual applications only",
        "Save up to 10 jobs",
        "Basic profile creation",
      ],
    },
    {
      name: "Pro",
      price: billingCycle === 'monthly' ? 15 : 12,
      period: "month",
      description: "Automate your entire job search",
      highlighted: true,
      badge: "MOST POPULAR",
      features: [
        "Everything in Free",
        "Unlimited AI recommendations",
        "Manual + automated applications",
        "AI cover letter generator",
        "While-you-sleep automation",
        "Unlimited job saves",
        "30-day interview guarantee"
      ],
    }
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (typeof window !== 'undefined') {
      setIsDevelopmentMode(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    }
  }, [status, router]);

  const handleSubscribe = async (planName: string) => {
    if (planName === "Free") {
      router.push("/dashboard");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          priceId: billingCycle === 'monthly' ? 'price_monthly' : 'price_annual', // Mock ID
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/upgrade?canceled=true`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment failed");
      }

      const { url } = await response.json();
      if (url) window.location.href = url;
      else throw new Error("Payment URL not received");

    } catch (error) {
      console.error("Payment error:", error);
      if (error instanceof Error && error.message.includes("STRIPE")) {
        // Fallback for demo if stripe not configured
        setError("Stripe integration pending. Contact demo support.");
      } else {
        setError(error instanceof Error ? error.message : "Payment failed");
      }
      setIsProcessing(false);
    }
  };

  // URL Params Check
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setSuccess(true);
      window.history.replaceState({}, '', '/upgrade');
    }
    if (urlParams.get('canceled') === 'true') {
      setError('Payment was canceled. You can try again anytime.');
      window.history.replaceState({}, '', '/upgrade');
    }
  }, []);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background text-foreground pb-20">

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-8 max-w-md w-full border-neon-green/50"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-neon-green/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-neon-green" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Pro!</h2>
              <p className="text-muted-foreground mb-8">
                Your AI Hunter is active. Start applying automatically now.
              </p>
              <button onClick={() => setSuccess(false)} className="w-full futuristic-button">
                Go to Command Center
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative pt-24 pb-12 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-blue/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <span className="px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-sm font-medium mb-6 inline-block">
            🚀 Supercharge Your Job Search
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Choose Your Power Level
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop applying manually. Let AI do the heavy lifting while you focus on interviews.
          </p>
        </motion.div>
      </div>

      {/* Social Proof */}
      <div className="max-w-5xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 glass-card p-6 rounded-2xl border-white/5">
          {[
            { label: "Success Rate", value: "83%", color: "text-neon-green" },
            { label: "Active Users", value: "12k+", color: "text-neon-blue" },
            { label: "Jobs Applied", value: "5M+", color: "text-neon-purple" },
            { label: "Interviews", value: "4.2/mo", color: "text-neon-pink" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-muted-foreground'}`}>Monthly</span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
          className="w-14 h-7 bg-white/10 rounded-full relative transition-colors hover:bg-white/20"
        >
          <div className={`absolute top-1 w-5 h-5 bg-neon-blue rounded-full transition-all duration-300 ${billingCycle === 'monthly' ? 'left-1' : 'left-8'}`} />
        </button>
        <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-white' : 'text-muted-foreground'}`}>
          Yearly <span className="text-neon-green text-xs ml-1">(Save 20%)</span>
        </span>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-8 mb-20">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 ${plan.highlighted
              ? 'bg-white/5 border border-neon-blue shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]'
              : 'bg-white/5 border border-white/10 hover:border-white/20'
              }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-neon-blue to-neon-purple text-white text-xs font-bold rounded-full shadow-lg">
                {plan.badge}
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              {billingCycle === 'annual' && plan.price > 0 && (
                <p className="text-xs text-neon-green mt-2">Billed ${plan.price * 12} yearly</p>
              )}
            </div>

            <div className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 shrink-0 ${plan.highlighted ? 'text-neon-blue' : 'text-muted-foreground'}`} />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe(plan.name)}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${plan.highlighted
                ? 'bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90 shadow-lg shadow-neon-blue/20'
                : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
            >
              {isProcessing ? (
                <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                plan.name === "Free" ? "Continue Free" : "Upgrade to Pro"
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "Can I cancel my subscription anytime?", a: "Yes, absolutely. There are no lock-in contracts. You can cancel with one click from your dashboard." },
            { q: "Does the 30-day guarantee really work?", a: "Yes. If our AI doesn't land you an interview request within 30 days of active use (Pro plan), we'll refund your last payment." },
            { q: "Is my data safe?", a: "We use bank-grade encryption and never sell your personal data. We only use it to train your personal job-hunting agent." }
          ].map((faq, i) => (
            <div key={i} className="glass-card p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Developer Note */}
      {isDevelopmentMode && error && (
        <div className="max-w-md mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
          <p className="text-red-400 text-sm flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </p>
        </div>
      )}

    </div>
  );
}