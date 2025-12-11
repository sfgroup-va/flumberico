'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  Calendar,
  AlertCircle,
  Target,
  Briefcase,
  MapPin,
  Building,
  Sparkles,
  Zap,
  Filter,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  notes?: string;
  aiGenerated: boolean;
  job: {
    id: number;
    title: string;
    companyName: string;
    location?: string;
    type: string;
    salary?: number;
    slug: string;
  };
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchApplications();
    }
  }, [status]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scouted':
        return <Target className="w-5 h-5 text-neon-purple" />;
      case 'applied':
        return <FileText className="w-5 h-5 text-neon-blue" />;
      case 'viewed':
        return <Clock className="w-5 h-5 text-neon-green" />;
      case 'interview':
        return <Calendar className="w-5 h-5 text-neon-pink" />;
      case 'offer':
        return <CheckCircle className="w-5 h-5 text-neon-green" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scouted':
        return 'bg-neon-purple/10 border-neon-purple/30 text-neon-purple';
      case 'applied':
        return 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue';
      case 'viewed':
        return 'bg-neon-green/10 border-neon-green/30 text-neon-green';
      case 'interview':
        return 'bg-neon-pink/10 border-neon-pink/30 text-neon-pink';
      case 'offer':
        return 'bg-neon-green/10 border-neon-green/30 text-neon-green';
      case 'rejected':
        return 'bg-destructive/10 border-destructive/30 text-destructive';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-neon-blue transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  My Applications
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track your job application progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Status Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <Filter className="w-5 h-5 text-neon-blue" />
            <h3 className="text-lg font-semibold">Filter by Status</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-neon-blue text-white'
                  : 'bg-background/50 text-muted-foreground hover:bg-neon-blue/10 hover:text-neon-blue'
              }`}
            >
              All ({applications.length})
            </button>
            {['scouted', 'applied', 'viewed', 'interview', 'offer', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 capitalize ${
                  filter === status
                    ? getStatusColor(status)
                    : 'bg-background/50 text-muted-foreground hover:bg-neon-blue/10 hover:text-neon-blue'
                }`}
              >
                {status} ({statusCounts[status] || 0})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="glass-card p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          ) : filteredApplications.length > 0 ? (
            filteredApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`glass-card p-6 hover-glow ${getStatusColor(application.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(application.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">
                          {application.job.title}
                        </h4>
                        {application.aiGenerated && (
                          <div className="flex items-center gap-1 px-3 py-1 bg-neon-blue/20 rounded-full">
                            <Zap className="w-4 h-4 text-neon-blue" />
                            <span className="text-sm text-neon-blue">AI Applied</span>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {application.job.companyName}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {application.job.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {application.job.type}
                        </div>
                        {application.job.salary && (
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            ${application.job.salary.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium capitalize">
                        {application.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {formatRelativeTime(application.appliedAt)}
                    </p>
                    <Link
                      href={`/jobs/${application.job.slug}`}
                      className="text-sm text-neon-blue hover:text-neon-purple transition-colors"
                    >
                      View Job →
                    </Link>
                  </div>
                </div>

                </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center"
            >
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground mb-6">
                {filter === 'all'
                  ? "You haven't applied to any jobs yet. Your AI Hunter will start finding opportunities soon."
                  : `No applications with status "${filter}".`
                }
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg hover:from-neon-purple hover:to-neon-blue transition-all duration-200"
              >
                <Target className="w-4 h-4" />
                Find Jobs
              </Link>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}