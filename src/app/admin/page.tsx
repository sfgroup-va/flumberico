'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminWrapper from "./components/AdminWrapper";
import {
  Upload,
  FileSpreadsheet,
  Sparkles,
  Database,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Settings,
  LogOut,
  Plus,
  RefreshCw,
  Activity,
  Briefcase,
  Target,
  Crown
} from "lucide-react";

interface Activity {
  id: string;
  action: string;
  success: boolean;
  details: any;
  userName: string;
  userEmail: string;
  createdAt: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  approved: boolean;
  createdAt: string;
}

interface Stats {
  jobs: {
    total: number;
    approved: number;
    pending: number;
    processedWithAI: number;
    approvalRate: number;
  };
  users: {
    total: number;
    active: number;
    subscriptions: Record<string, number>;
  };
  applications: {
    total: number;
    recent: number;
    statusDistribution: Record<string, number>;
  };
  recentActivity: Activity[];
  recentJobs: Job[];
}

function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    jobs: {
      total: 0,
      approved: 0,
      pending: 0,
      processedWithAI: 0,
      approvalRate: 0
    },
    users: {
      total: 0,
      active: 0,
      subscriptions: { free: 0, pro: 0 }
    },
    applications: {
      total: 0,
      recent: 0,
      statusDistribution: {}
    },
    recentActivity: [],
    recentJobs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      // Redirect to signin page (middleware will handle this)
      // Don't manually redirect to avoid loops
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      // Redirect non-admin users away from admin area
      router.push("/");
    }
  }, [status, router, session]);

  useEffect(() => {
    // Fetch real-time stats
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchStats();
      // Refresh stats every 30 seconds
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [status, session]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch admin stats');
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
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
    return null; // Will redirect
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
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Admin Command Center
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {session?.user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchStats}
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-neon-blue transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                href="/"
                className="text-muted-foreground hover:text-neon-blue transition-colors"
              >
                View Site
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="glass-card p-6 hover-glow relative">
            {loading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <RefreshCw className="w-5 h-5 animate-spin text-neon-blue" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold text-neon-blue">{stats.jobs.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.jobs.approvalRate}% approval rate
                </p>
              </div>
              <FileText className="w-8 h-8 text-neon-blue opacity-50" />
            </div>
          </div>
          <div className="glass-card p-6 hover-glow relative">
            {loading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <RefreshCw className="w-5 h-5 animate-spin text-neon-green" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-neon-green">{stats.jobs.approved.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.jobs.total > 0 ? Math.round((stats.jobs.approved / stats.jobs.total) * 100) : 0}% of total
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-neon-green opacity-50" />
            </div>
          </div>
          <div className="glass-card p-6 hover-glow relative">
            {loading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <RefreshCw className="w-5 h-5 animate-spin text-neon-pink" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-neon-pink">{stats.jobs.pending.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.jobs.total > 0 ? Math.round((stats.jobs.pending / stats.jobs.total) * 100) : 0}% need review
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-neon-pink opacity-50" />
            </div>
          </div>
          <div className="glass-card p-6 hover-glow relative">
            {loading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <RefreshCw className="w-5 h-5 animate-spin text-neon-purple" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Processed</p>
                <p className="text-3xl font-bold text-neon-purple">{stats.jobs.processedWithAI.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.jobs.total > 0 ? Math.round((stats.jobs.processedWithAI / stats.jobs.total) * 100) : 0}% enhanced
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-neon-purple opacity-50" />
            </div>
          </div>
        </motion.div>

        {/* Additional Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-neon-blue">{stats.users.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.users.active} active ({stats.users.total > 0 ? Math.round((stats.users.active / stats.users.total) * 100) : 0}%)
                </p>
              </div>
              <Users className="w-6 h-6 text-neon-blue opacity-50" />
            </div>
          </div>
          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-neon-green">{stats.applications.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.applications.recent} in last 24h
                </p>
              </div>
              <Target className="w-6 h-6 text-neon-green opacity-50" />
            </div>
          </div>
          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pro Subscriptions</p>
                <p className="text-2xl font-bold text-neon-purple">{(stats.users.subscriptions?.pro || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats.users.subscriptions?.free || 0).toLocaleString()} free users
                </p>
              </div>
              <Briefcase className="w-6 h-6 text-neon-purple opacity-50" />
            </div>
          </div>
        </motion.div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CSV Import */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Import Jobs</h2>
                <p className="text-sm text-muted-foreground">Bulk import jobs with AI enhancement</p>
              </div>
            </div>

            <Link
              href="/admin/import"
              className="w-full futuristic-button flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Import CSV File
            </Link>

            <div className="mt-6 p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
              <p className="text-xs text-neon-blue">
                <Sparkles className="inline w-3 h-3 mr-1" />
                Your CSV will be processed with Google Gemini AI to enhance job descriptions
              </p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-green to-neon-blue rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Quick Actions</h2>
                <p className="text-sm text-muted-foreground">Manage your job board</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/admin/jobs"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                Manage Jobs
              </Link>
              <Link
                href="/admin/jobs/new"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-background/50 border border-border/50 rounded-lg hover:border-neon-blue/50 hover:bg-neon-blue/10 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Single Job
              </Link>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-background/50 border border-border/50 rounded-lg hover:border-neon-green/50 hover:bg-neon-green/10 transition-all duration-200">
                <TrendingUp className="w-4 h-4" />
                View Analytics
              </button>
              <Link
                href="/admin/subscriptions"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-background/50 border border-border/50 rounded-lg hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all duration-200"
              >
                <Crown className="w-4 h-4" />
                Manage Subscriptions
              </Link>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-background/50 border border-border/50 rounded-lg hover:border-neon-purple/50 hover:bg-neon-purple/10 transition-all duration-200">
                <Users className="w-4 h-4" />
                Manage Users
              </button>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <button
              onClick={fetchStats}
              className="flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground hover:text-neon-blue transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activity.success ? 'bg-neon-green animate-pulse' : 'bg-neon-pink'
                      }`} />
                    <div>
                      <p className="font-medium capitalize">{activity.action.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.userName} • {activity.userEmail}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity found</p>
                <p className="text-sm">Activity will appear here as users interact with the system</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Jobs</h2>
            <Link
              href="/admin/jobs"
              className="flex items-center gap-2 px-3 py-1 text-sm text-neon-blue hover:text-neon-blue/80 transition-colors"
            >
              View All
              <FileText className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentJobs.length > 0 ? (
              stats.recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${job.approved ? 'bg-neon-green' : 'bg-neon-pink'
                      }`} />
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.company} • {job.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${job.approved
                        ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                        : 'bg-neon-pink/10 text-neon-pink border border-neon-pink/30'
                      }`}>
                      {job.approved ? 'Approved' : 'Pending'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No jobs found</p>
                <p className="text-sm">Import your first CSV file to get started</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminWrapper>
      <AdminDashboard />
    </AdminWrapper>
  );
}