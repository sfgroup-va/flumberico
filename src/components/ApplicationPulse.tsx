'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  Calendar,
  Briefcase,
  MapPin,
  Building,
  AlertCircle,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  job: {
    title: string;
    companyName: string;
    location?: string;
    type: string;
    salary: number;
    salaryMin?: number;
    salaryMax?: number;
  };
  notes?: string;
  aiGenerated: boolean;
  matchScore?: number;
  matchReasoning?: string;
  applicationSource: string;
  stealthDelay?: number;
}

interface PulseUpdate {
  type: string;
  applications?: Application[];
  total?: number;
  timestamp: string;
}

export default function ApplicationPulse() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Initialize SSE connection
    const eventSource = new EventSource('/api/user/applications/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('Application Pulse connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data: PulseUpdate = JSON.parse(event.data);

        if (data.type === 'applications_update' && data.applications) {
          setApplications(data.applications);
          setLastUpdate(data.timestamp);
        } else if (data.type === 'heartbeat') {
          // Keep connection alive
          setLastUpdate(data.timestamp);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scouted':
        return <Target className="w-4 h-4 text-neon-purple" />;
      case 'applied':
        return <FileText className="w-4 h-4 text-neon-blue" />;
      case 'viewed':
        return <Clock className="w-4 h-4 text-neon-green" />;
      case 'interview':
        return <Calendar className="w-4 h-4 text-neon-pink" />;
      case 'offer':
        return <CheckCircle className="w-4 h-4 text-neon-green" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="w-5 h-5 text-neon-purple" />
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
              isConnected ? 'bg-neon-green animate-pulse' : 'bg-muted'
            }`} />
          </div>
          <h3 className="text-xl font-semibold">Application Pulse</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {lastUpdate && formatRelativeTime(lastUpdate)}
          </span>
          <Link
            href="/applications"
            className="text-sm text-neon-blue hover:text-neon-purple transition-colors"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Connection Status */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-sm flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Connecting to Application Pulse...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {applications.length > 0 ? (
            applications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${getStatusColor(application.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(application.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">
                          {application.job.title}
                        </h4>
                        {application.aiGenerated && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-neon-blue/20 rounded-full">
                            <Zap className="w-3 h-3 text-neon-blue" />
                            <span className="text-xs text-neon-blue">AI</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs opacity-80 mb-2">
                        {application.job.companyName}
                      </p>
                      <div className="flex items-center gap-3 text-xs opacity-70">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {application.job.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {application.job.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {application.job.salaryMin && application.job.salaryMax
                            ? `$${application.job.salaryMin.toLocaleString()} - $${application.job.salaryMax.toLocaleString()}`
                            : application.job.salary
                            ? `$${application.job.salary.toLocaleString()}`
                            : 'Salary not disclosed'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs font-medium capitalize mb-1">
                      {application.status}
                    </p>
                    <p className="text-xs opacity-70">
                      {formatRelativeTime(application.appliedAt)}
                    </p>
                  </div>
                </div>

                {/* Application Details */}
                {application.applicationSource === 'ai_hunter' && (
                  <div className="mt-3 pt-3 border-t border-current/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <Target className="w-3 h-3" />
                        <span>AI Hunter Application</span>
                      </div>
                      {application.stealthDelay && (
                        <div className="flex items-center gap-1 text-xs opacity-70">
                          <Clock className="w-3 h-3" />
                          <span>Stealth delay: {Math.round(application.stealthDelay / 60)}m</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs opacity-70 italic">
                      Automated by AI Hunter
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No applications yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your AI Hunter will start finding opportunities soon
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {applications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {isConnected ? 'Live updates' : 'Reconnecting...'}
            </span>
            <span>
              {applications.filter(app => app.aiGenerated).length} AI-generated
            </span>
          </div>
        </div>
      )}
    </div>
  );
}