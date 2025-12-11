'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Settings,
  Zap,
  Rocket,
  BarChart3,
  Calendar,
  MapPin,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import ApplicationPulse from "@/components/ApplicationPulse";
import JobRecommendations from "@/components/JobRecommendations";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    totalApplications: 0,
    interviewsScheduled: 0,
    offersReceived: 0,
    successRate: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [isAIHunterActive, setIsAIHunterActive] = useState(false);
  const [userSubscription, setUserSubscription] = useState('free');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [hunterStatus, setHunterStatus] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState({
    applicationRate: 0,
    responseRate: 0,
    interviewRate: 0,
    userRanking: 0
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    // Prevent admin from accessing user dashboard
    if (status === "authenticated" && session?.user?.role === "admin") {
      router.push("/admin");
    }
  }, [status, router, session]);

  useEffect(() => {
    // Fetch user data when authenticated
    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile and stats
      const profileResponse = await fetch('/api/user/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setIsAIHunterActive(profileData.isActiveHunter || false);
        setUserSubscription(profileData.subscriptionTier || 'free');
      }

      // Fetch application stats
      const statsResponse = await fetch('/api/user/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats(statsData);
      }

      // Fetch recent applications
      const applicationsResponse = await fetch('/api/user/applications?limit=5');
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setRecentApplications(applicationsData.applications || []);
      }

      // Fetch AI Hunter status
      const hunterResponse = await fetch('/api/ai-hunter/scan');
      if (hunterResponse.ok) {
        const hunterData = await hunterResponse.json();
        setHunterStatus(hunterData);
      }

      // Calculate performance metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const performanceResponse = await fetch(`/api/user/performance?startDate=${thirtyDaysAgo.toISOString()}`);
      if (performanceResponse.ok) {
        const perfData = await performanceResponse.json();
        setPerformanceData(perfData);
      } else {
        // Calculate basic performance from existing stats
        const interviewRate = userStats.totalApplications > 0
          ? Math.round((userStats.interviewsScheduled / userStats.totalApplications) * 100)
          : 0;

        setPerformanceData({
          applicationRate: userStats.totalApplications > 0 ? Math.round(userStats.totalApplications / 30) : 0,
          responseRate: userStats.successRate,
          interviewRate,
          userRanking: userStats.totalApplications > 0 ? Math.max(15, 100 - userStats.totalApplications) : 85
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const toggleAIHunter = async () => {
    try {
      const response = await fetch('/api/user/toggle-hunter', {
        method: 'POST',
      });

      if (response.ok) {
        setIsAIHunterActive(!isAIHunterActive);
        // Refresh hunter status
        fetchHunterStatus();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to toggle AI Hunter');
      }
    } catch (error) {
      console.error('Error toggling AI Hunter:', error);
      alert('Network error. Please try again.');
    }
  };

  const runAIHunterScan = async () => {
    if (!isAIHunterActive || userSubscription !== 'pro') {
      alert('Please activate AI Hunter and upgrade to Pro first');
      return;
    }

    setIsScanning(true);
    setScanResults(null);

    try {
      const response = await fetch('/api/ai-hunter/scan', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setScanResults(data);

        // Show success message
        if (data.scanResults?.applicationsQueued > 0) {
          alert(`AI Hunter scan completed! Found ${data.scanResults.totalMatches} matches and queued ${data.scanResults.applicationsQueued} applications.`);
        } else {
          alert('AI Hunter scan completed, but no high-quality matches found at this time.');
        }

        // Refresh data
        fetchUserData();
      } else {
        const errorData = await response.json();
        if (errorData.limitReached) {
          alert(`Daily application limit reached. You've applied to ${errorData.currentCount} jobs today. Limit: ${errorData.limit}`);
        } else {
          alert(errorData.error || 'Failed to run AI Hunter scan');
        }
      }
    } catch (error) {
      console.error('Error running AI Hunter scan:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const fetchHunterStatus = async () => {
    try {
      const response = await fetch('/api/ai-hunter/scan');
      if (response.ok) {
        const data = await response.json();
        setHunterStatus(data);
      }
    } catch (error) {
      console.error('Error fetching hunter status:', error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
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
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Command Center
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {session?.user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-muted-foreground hover:text-neon-blue transition-colors"
              >
                Browse Jobs
              </Link>
              <Link
                href="/settings"
                className="text-muted-foreground hover:text-neon-blue transition-colors"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Job Recommendations */}
        <JobRecommendations
          subscriptionTier={userSubscription as 'free' | 'pro'}
          userId={session?.user?.id || ''}
        />

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-3xl font-bold text-neon-blue">{userStats.totalApplications}</p>
              </div>
              <FileText className="w-8 h-8 text-neon-blue opacity-50" />
            </div>
          </div>
          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interviews Scheduled</p>
                <p className="text-3xl font-bold text-neon-green">{userStats.interviewsScheduled}</p>
              </div>
              <Calendar className="w-8 h-8 text-neon-green opacity-50" />
            </div>
          </div>
          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offers Received</p>
                <p className="text-3xl font-bold text-neon-purple">{userStats.offersReceived}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-neon-purple opacity-50" />
            </div>
          </div>
          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold text-neon-pink">{userStats.successRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-neon-pink opacity-50" />
            </div>
          </div>
        </motion.div>

        {/* Application Pulse & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Application Pulse */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ApplicationPulse />
          </motion.div>

          {/* Performance Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-neon-blue" />
                Performance Overview
              </h3>
              <span className="text-sm text-muted-foreground">Last 30 days</span>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Application Rate</span>
                  <span className="font-medium">{performanceData.applicationRate}/day</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-neon-blue to-neon-purple h-2 rounded-full" style={{ width: `${Math.min(100, performanceData.applicationRate * 5)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Response Rate</span>
                  <span className="font-medium">{performanceData.responseRate}%</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-neon-green to-neon-blue h-2 rounded-full" style={{ width: `${performanceData.responseRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Interview Rate</span>
                  <span className="font-medium">{performanceData.interviewRate}%</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-neon-purple to-neon-pink h-2 rounded-full" style={{ width: `${performanceData.interviewRate}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
              <p className="text-xs text-neon-blue">
                <Zap className="inline w-3 h-3 mr-1" />
                You're performing better than {100 - performanceData.userRanking}% of users!
                {userStats.totalApplications > 0 && ` (${userStats.totalApplications} applications)`}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/search"
              className="p-4 bg-background/50 border border-border/50 rounded-lg hover:border-neon-blue/50 hover:bg-neon-blue/10 transition-all duration-200"
            >
              <Target className="w-6 h-6 text-neon-blue mb-2" />
              <h4 className="font-medium">Browse Jobs</h4>
              <p className="text-sm text-muted-foreground">Find matching opportunities</p>
            </Link>

            {isAIHunterActive && userSubscription === 'pro' ? (
              <button
                onClick={runAIHunterScan}
                disabled={!hunterStatus?.status?.canScan || isScanning}
                className="p-4 bg-background/50 border border-border/50 rounded-lg hover:border-neon-green/50 hover:bg-neon-green/10 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2 mb-2">
                  {isScanning ? (
                    <div className="w-6 h-6 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Zap className="w-6 h-6 text-neon-green" />
                  )}
                  <h4 className="font-medium">Run AI Scan</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isScanning ? 'Scanning for matches...' : 'Find and apply to jobs'}
                </p>
              </button>
            ) : (
              <Link
                href="/upgrade"
                className="p-4 bg-background/50 border border-border/50 rounded-lg hover:border-neon-green/50 hover:bg-neon-green/10 transition-all duration-200"
              >
                <Rocket className="w-6 h-6 text-neon-green mb-2" />
                <h4 className="font-medium">Activate AI Hunter</h4>
                <p className="text-sm text-muted-foreground">
                  {userSubscription === 'free' ? 'Upgrade to Pro' : 'Enable automation'}
                </p>
              </Link>
            )}

            <Link
              href="/analytics"
              className="p-4 bg-background/50 border border-border/50 rounded-lg hover:border-neon-purple/50 hover:bg-neon-purple/10 transition-all duration-200"
            >
              <BarChart3 className="w-6 h-6 text-neon-purple mb-2" />
              <h4 className="font-medium">View Analytics</h4>
              <p className="text-sm text-muted-foreground">Performance insights</p>
            </Link>

            <Link
              href="/onboarding"
              className="p-4 bg-background/50 border border-border/50 rounded-lg hover:border-neon-pink/50 hover:bg-neon-pink/10 transition-all duration-200"
            >
              <FileText className="w-6 h-6 text-neon-pink mb-2" />
              <h4 className="font-medium">Upload CV</h4>
              <p className="text-sm text-muted-foreground">Update your resume</p>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}