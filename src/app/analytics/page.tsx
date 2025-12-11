'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  FileText,
  Briefcase,
  Building,
  Award,
  Activity,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  overview: {
    isActiveHunter: boolean;
    subscriptionTier: string;
    lastScanAt: string | null;
    timeframe: string;
    totalApplications: number;
    aiGeneratedApplications: number;
    manualApplications: number;
    aiAutomationRate: number;
  };
  performance: {
    interviewRate: number;
    offerRate: number;
    responseRate: number;
    interviewsScheduled: number;
    offersReceived: number;
    averageMatchScore: number;
  };
  quota: {
    dailyLimit: number;
    usedToday: number;
    remaining: number;
    resetTime: string;
  };
  trends: {
    dailyApplications: Array<{
      date: string;
      total: number;
      aiGenerated: number;
      manual: number;
      avgMatchScore: number;
    }>;
    matchScoreDistribution: Record<string, number>;
    statusBreakdown: Record<string, number>;
  };
  insights: {
    topCompanies: Array<{
      name: string;
      applications: number;
      avgMatchScore: number;
      lastApplied: string;
    }>;
    hunterActivity: Record<string, any>;
    recommendations: string[];
  };
}

export default function Analytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (status === "authenticated" && session?.user?.role === "admin") {
      router.push("/admin");
    }
  }, [status, router, session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAnalytics();
    }
  }, [status, timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai-hunter/analytics?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
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
              <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  AI Hunter Analytics
                </h1>
                <p className="text-sm text-muted-foreground">
                  Performance insights and trends for your automated job hunting
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <button
                onClick={fetchAnalytics}
                className="p-2 hover:bg-neon-blue/10 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-neon-blue transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-3xl font-bold text-neon-blue">{analytics.overview.totalApplications}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.overview.aiAutomationRate}% AI automated
                </p>
              </div>
              <FileText className="w-8 h-8 text-neon-blue opacity-50" />
            </div>
          </div>

          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-3xl font-bold text-neon-green">{analytics.performance.responseRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.performance.interviewsScheduled} interviews
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-neon-green opacity-50" />
            </div>
          </div>

          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Match Score</p>
                <p className="text-3xl font-bold text-neon-purple">{analytics.performance.averageMatchScore}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  AI matching quality
                </p>
              </div>
              <Target className="w-8 h-8 text-neon-purple opacity-50" />
            </div>
          </div>

          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Automation</p>
                <p className="text-3xl font-bold text-neon-pink">{analytics.overview.aiAutomationRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.overview.aiGeneratedApplications} AI generated
                </p>
              </div>
              <Zap className="w-8 h-8 text-neon-pink opacity-50" />
            </div>
          </div>
        </motion.div>

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Application Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-neon-blue" />
              Application Trends
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {analytics.trends.dailyApplications.slice(0, 10).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">{new Date(day.date).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">
                        {day.avgMatchScore}% avg match
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-neon-blue rounded-full" />
                        <span className="text-xs text-neon-blue">AI: {day.aiGenerated}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-muted rounded-full" />
                        <span className="text-xs text-muted-foreground">Manual: {day.manual}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold">{day.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Match Score Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-neon-purple" />
              Match Score Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(analytics.trends.matchScoreDistribution).map(([range, count]) => {
                const totalAiApps = Math.max(1, analytics.overview.aiGeneratedApplications);
                const percentage = (count / totalAiApps) * 100;
                const color = range.startsWith('90') ? 'neon-green' :
                             range.startsWith('80') ? 'neon-blue' :
                             range.startsWith('70') ? 'neon-purple' :
                             range.startsWith('60') ? 'yellow-500' : 'orange-500';

                return (
                  <div key={range} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{range}%</span>
                      <span className="text-muted-foreground">{count} applications</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2">
                      <div
                        className={`${
                          color === 'neon-green' ? 'bg-neon-green' :
                          color === 'neon-blue' ? 'bg-neon-blue' :
                          color === 'neon-purple' ? 'bg-neon-purple' :
                          color === 'yellow-500' ? 'bg-yellow-500' : 'bg-orange-500'
                        } h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Top Companies and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Companies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-neon-blue" />
              Top Companies Applied
            </h3>
            <div className="space-y-4">
              {analytics.insights.topCompanies.slice(0, 8).map((company, index) => (
                <div key={company.name} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{company.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {company.applications} applications • {company.avgMatchScore}% avg match
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(company.lastApplied).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-neon-green" />
              AI Recommendations
            </h3>
            <div className="space-y-3">
              {analytics.insights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-neon-green">{recommendation}</span>
                </div>
              ))}
            </div>

            {analytics.insights.recommendations.length === 0 && (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Great job! Your AI Hunter is performing optimally.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Hunter Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-neon-pink" />
            Hunter Activity Log
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.insights.hunterActivity).map(([action, data]: [string, any]) => (
              <div key={action} className="p-4 bg-background/50 rounded-lg">
                <div className="text-sm font-medium capitalize mb-2">{action.replace(/_/g, ' ')}</div>
                <div className="text-2xl font-bold text-neon-pink">{data.count}</div>
                <div className="text-xs text-muted-foreground">
                  {data.successRate}% success rate
                </div>
                {data.avgProcessingTime && (
                  <div className="text-xs text-muted-foreground">
                    {data.avgProcessingTime}ms avg
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}