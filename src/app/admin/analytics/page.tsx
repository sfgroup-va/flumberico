'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  FileText,
  Briefcase,
  DollarSign,
  Calendar,
  Target,
  Sparkles,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Building,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  users: {
    total: number;
    new: number;
    activeHunters: number;
    activationRate: number;
  };
  applications: {
    total: number;
    new: number;
    aiGenerated: number;
    aiGenerationRate: number;
    breakdown: Record<string, number>;
    interviewRate: number;
    offerRate: number;
  };
  jobs: {
    total: number;
    new: number;
    approved: number;
    approvalRate: number;
  };
  subscriptions: {
    breakdown: Record<string, number>;
    proCount: number;
  };
  revenue: {
    estimatedMonthly: number;
    estimatedPeriod: number;
    currency: string;
  };
  performance: {
    averageSalaryApplied: number;
    topCompanies: Array<{ company: string; count: number }>;
    totalRecentApplications: number;
  };
  growth: {
    userGrowth: number;
    applicationGrowth: number;
    previousPeriod: {
      users: number;
      applications: number;
    };
  };
}

export default function AdminAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "admin")) {
      router.push("/admin/login");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchAnalytics();
    }
  }, [status, session, selectedPeriod]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-muted-foreground hover:text-neon-blue transition-colors"
              >
                <ArrowUp className="w-4 h-4 rotate-180" />
                Back to Dashboard
              </Link>
              <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Platform performance and user insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
          </div>
        ) : analytics ? (
          <>
            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
            >
              <MetricCard
                title="Total Users"
                value={analytics.users.total}
                change={analytics.growth.userGrowth}
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="Active Hunters"
                value={analytics.users.activeHunters}
                subtitle={`${analytics.users.activationRate}% activation rate`}
                icon={Target}
                color="purple"
              />
              <MetricCard
                title="Applications"
                value={analytics.applications.total}
                change={analytics.growth.applicationGrowth}
                icon={FileText}
                color="green"
              />
              <MetricCard
                title="AI Generated"
                value={analytics.applications.aiGenerated}
                subtitle={`${analytics.applications.aiGenerationRate}% of total`}
                icon={Sparkles}
                color="pink"
              />
              <MetricCard
                title="Monthly Revenue"
                value={`$${analytics.revenue.estimatedMonthly.toLocaleString()}`}
                subtitle={`${analytics.subscriptions.proCount} Pro users`}
                icon={DollarSign}
                color="yellow"
              />
            </motion.div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Application Breakdown */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-neon-blue" />
                  Application Status Breakdown
                </h3>
                <div className="space-y-4">
                  {Object.entries(analytics.applications.breakdown).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                        <span className="capitalize text-sm">{status}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{count}</span>
                        <span className="text-sm text-muted-foreground">
                          {((count / analytics.applications.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Subscription Breakdown */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-neon-purple" />
                  Subscription Breakdown
                </h3>
                <div className="space-y-4">
                  {Object.entries(analytics.subscriptions.breakdown).map(([tier, count]) => (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${tier === 'pro' ? 'bg-neon-green' : 'bg-muted'}`} />
                        <span className="capitalize text-sm">{tier}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{count}</span>
                        <span className="text-sm text-muted-foreground">
                          {((count / (analytics.subscriptions.breakdown.free + analytics.subscriptions.breakdown.pro)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Conversion Rate</span>
                      <span className="font-semibold text-neon-green">
                        {((analytics.subscriptions.proCount / analytics.users.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Success Rates */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-green" />
                  Success Rates
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Interview Rate</span>
                    <span className="font-semibold text-neon-blue">
                      {analytics.applications.interviewRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Offer Rate</span>
                    <span className="font-semibold text-neon-purple">
                      {analytics.applications.offerRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Applied Salary</span>
                    <span className="font-semibold text-neon-green">
                      ${analytics.performance.averageSalaryApplied.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Top Companies */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Building className="w-5 h-5 text-neon-pink" />
                  Top Companies
                </h3>
                <div className="space-y-3">
                  {analytics.performance.topCompanies.slice(0, 8).map((company, index) => (
                    <div key={company.company} className="flex items-center justify-between">
                      <span className="text-sm truncate">{company.company}</span>
                      <span className="text-sm font-semibold">{company.count} apps</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Growth Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-neon-blue" />
                  Growth Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">User Growth</span>
                    <div className="flex items-center gap-2">
                      {analytics.growth.userGrowth >= 0 ? (
                        <ArrowUp className="w-4 h-4 text-neon-green" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-destructive" />
                      )}
                      <span className={`font-semibold ${analytics.growth.userGrowth >= 0 ? 'text-neon-green' : 'text-destructive'}`}>
                        {Math.abs(analytics.growth.userGrowth)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Application Growth</span>
                    <div className="flex items-center gap-2">
                      {analytics.growth.applicationGrowth >= 0 ? (
                        <ArrowUp className="w-4 h-4 text-neon-green" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-destructive" />
                      )}
                      <span className={`font-semibold ${analytics.growth.applicationGrowth >= 0 ? 'text-neon-green' : 'text-destructive'}`}>
                        {Math.abs(analytics.growth.applicationGrowth)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="text-xs text-muted-foreground">
                      Period: {analytics.period} | Period over Period
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Revenue Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-neon-yellow" />
                Revenue Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-neon-yellow">
                    ${analytics.revenue.estimatedMonthly.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-neon-green">
                    ${analytics.revenue.estimatedPeriod.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{analytics.period} Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-neon-blue">
                    ${((analytics.revenue.estimatedPeriod / (parseInt(analytics.period) / 30)) * 365).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Projected Annual</p>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </main>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  subtitle?: string;
  icon: any;
  color: string;
}

function MetricCard({ title, value, change, subtitle, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-neon-blue',
    purple: 'text-neon-purple',
    green: 'text-neon-green',
    pink: 'text-neon-pink',
    yellow: 'text-neon-yellow'
  };

  return (
    <div className="glass-card p-6 hover-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl flex items-center justify-center">
          <Icon className={`w-6 h-6 ${colorClasses[color as keyof typeof colorClasses]}`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${change >= 0 ? 'text-neon-green' : 'text-destructive'}`}>
            {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span className="text-sm font-semibold">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'scouted': return 'bg-neon-purple';
    case 'applied': return 'bg-neon-blue';
    case 'viewed': return 'bg-neon-green';
    case 'interview': return 'bg-neon-pink';
    case 'offer': return 'bg-neon-green';
    case 'rejected': return 'bg-destructive';
    default: return 'bg-muted';
  }
}