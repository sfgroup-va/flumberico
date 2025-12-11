'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Crown,
  CheckCircle,
  X,
  Plus,
  Save,
  RefreshCw,
  DollarSign,
  Zap,
  Target,
  Users,
  Settings,
  Briefcase,
  Sparkles,
  Shield,
  Star
} from "lucide-react";
import Link from "next/link";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    jobApplications: number;
    aiHunterScans: number;
    resumeOptimizations: number;
    prioritySupport: boolean;
  };
  stripePriceId?: string;
  active: boolean;
}

export default function SubscriptionManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [status, router, session]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchPlans();
    }
  }, [status, session]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        setError('Failed to fetch subscription plans');
      }
    } catch (error) {
      setError('Error fetching subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = (planId: string, updates: Partial<SubscriptionPlan>) => {
    setPlans(prev => prev.map(plan =>
      plan.id === planId ? { ...plan, ...updates } : plan
    ));
  };

  const savePlans = async () => {
    try {
      setSaving(true);
      setError('');

      const response = await fetch('/api/admin/subscriptions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plans }),
      });

      if (response.ok) {
        setEditingPlan(null);
        // Show success message
      } else {
        setError('Failed to save subscription plans');
      }
    } catch (error) {
      setError('Error saving subscription plans');
    } finally {
      setSaving(false);
    }
  };

  const togglePlanStatus = (planId: string) => {
    updatePlan(planId, { active: !plans.find(p => p.id === planId)?.active });
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Users className="w-6 h-6" />;
      case 'pro':
        return <Crown className="w-6 h-6" />;
      default:
        return <Briefcase className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'pro':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-neon-blue transition-colors"
              >
                ← Admin Dashboard
              </Link>
              <div className="w-8 h-0.5 bg-border" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    Subscription Plans
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Manage pricing and features for user subscriptions
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchPlans}
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-neon-blue transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={savePlans}
                className="futuristic-button flex items-center gap-2"
                disabled={saving}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive"
          >
            {error}
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`glass-card p-8 border-2 ${
                plan.id === 'pro'
                  ? 'border-yellow-500/30 hover:border-yellow-500/50'
                  : 'border-border/50'
              } hover-glow relative`}
            >
              {/* Popular Badge for Pro */}
              {plan.id === 'pro' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getPlanColor(plan.id)} rounded-xl flex items-center justify-center text-white`}>
                    {getPlanIcon(plan.id)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.id} plan</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingPlan(editingPlan === plan.id ? null : plan.id)}
                    className="p-2 text-muted-foreground hover:text-neon-blue transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => togglePlanStatus(plan.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      plan.active
                        ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                        : 'bg-gray-500/10 text-gray-500 border border-gray-500/30'
                    }`}
                  >
                    {plan.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    {plan.currency === 'USD' ? '$' : plan.currency}
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
                {plan.id === 'free' && (
                  <p className="text-sm text-neon-green mt-1">Perfect for getting started</p>
                )}
                {plan.id === 'pro' && (
                  <p className="text-sm text-yellow-500 mt-1">Best value for job seekers</p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-sm">Features</h4>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limits */}
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-sm">Limits & Usage</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-neon-blue" />
                    <span className="text-sm">
                      Applications: {plan.limits.jobApplications === -1 ? 'Unlimited' : plan.limits.jobApplications}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-neon-purple" />
                    <span className="text-sm">
                      AI Scans: {plan.limits.aiHunterScans === -1 ? 'Unlimited' : plan.limits.aiHunterScans}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-neon-green" />
                    <span className="text-sm">
                      Resume Opt: {plan.limits.resumeOptimizations === -1 ? 'Unlimited' : plan.limits.resumeOptimizations}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">
                      Support: {plan.limits.prioritySupport ? 'Priority' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Mode */}
              {editingPlan === plan.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-background/50 rounded-lg border border-border/50 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Price ({plan.currency})</label>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={(e) => updatePlan(plan.id, { price: parseFloat(e.target.value) || 0 })}
                        className="w-full mt-1 px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm"
                        disabled={plan.id === 'free'}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Billing Cycle</label>
                      <select
                        value={plan.interval}
                        onChange={(e) => updatePlan(plan.id, { interval: e.target.value as 'month' | 'year' })}
                        className="w-full mt-1 px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm"
                        disabled={plan.id === 'free'}
                      >
                        <option value="month">Monthly</option>
                        <option value="year">Yearly</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stripe Price ID</label>
                    <input
                      type="text"
                      value={plan.stripePriceId || ''}
                      onChange={(e) => updatePlan(plan.id, { stripePriceId: e.target.value })}
                      placeholder="price_xxxxxxxxxxxxxx"
                      className="w-full mt-1 px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm"
                      disabled={plan.id === 'free'}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Usage Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 glass-card p-8"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Subscription Usage Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
              <h3 className="font-medium text-neon-blue mb-2">Free Plan</h3>
              <p className="text-sm text-muted-foreground">
                Perfect for users who want to explore the platform. Limited to 5 applications and basic features.
              </p>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h3 className="font-medium text-yellow-500 mb-2">Pro Plan</h3>
              <p className="text-sm text-muted-foreground">
                Best for serious job seekers. Unlimited AI Hunter applications and advanced features.
              </p>
            </div>
            <div className="p-4 bg-neon-purple/10 border border-neon-purple/30 rounded-lg">
              <h3 className="font-medium text-neon-purple mb-2">AI Hunter</h3>
              <p className="text-sm text-muted-foreground">
                Only available in Pro plan. Automatically applies to jobs while users sleep.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}