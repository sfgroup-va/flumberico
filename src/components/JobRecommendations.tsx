'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Target,
  Heart,
  ExternalLink,
  Zap,
  Rocket,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Eye,
  Save,
  X
} from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
    industry?: string;
  };
  location: string;
  locationType: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: string;
  description: string;
  requiredSkills?: string;
  applicationUrl?: string;
  createdAt: string;
  matchScore: number;
  matchReasons: string[];
  urgency: 'high' | 'medium' | 'low';
  competitionLevel: 'low' | 'medium' | 'high';
  isSaved: boolean;
}

interface JobRecommendationsProps {
  subscriptionTier: 'free' | 'pro';
  userId: string;
}

export default function JobRecommendations({ subscriptionTier, userId }: JobRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [loadingSave, setLoadingSave] = useState<string | null>(null);
  const [autoAppliedJobs, setAutoAppliedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async (append = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/recommendations?limit=10&offset=${append ? offset : 0}`);

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();

      if (append) {
        setRecommendations(prev => [...prev, ...data.recommendations]);
        setOffset(prev => prev + data.recommendations.length);
      } else {
        setRecommendations(data.recommendations);
        setOffset(data.recommendations.length);
      }

      setHasMore(data.hasMore);
      setDailyLimit(data.dailyLimit);
      setDailyUsed(data.dailyUsed);

      // Auto apply for Pro Plan users (only on initial load, not append)
      if (!append && subscriptionTier === 'pro') {
        await autoApplyForProUsers(data.recommendations);
      }

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load job recommendations');
    } finally {
      setLoading(false);
    }
  };

  const autoApplyForProUsers = async (jobs: any[]) => {
    // Only auto apply to jobs with high match score (70+) and remote location
    const eligibleJobs = jobs.filter(job =>
      job.matchScore >= 70 && job.locationType?.toLowerCase() === 'remote'
    );

    for (const job of eligibleJobs) {
      try {
        // Check daily limit before applying
        if (dailyUsed >= dailyLimit) {
          break;
        }

        const response = await fetch('/api/user/apply-job', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: job.id,
            method: 'automated'
          })
        });

        if (response.ok) {
          setDailyUsed(prev => prev + 1);
          setAutoAppliedJobs(prev => new Set(prev).add(job.id.toString()));
          console.log(`Auto applied to job: ${job.title}`);
        } else {
          const data = await response.json();
          if (data.error !== 'Already applied to this job') {
            console.error(`Failed to auto apply to ${job.title}:`, data.error);
          }
        }
      } catch (error) {
        console.error(`Error auto applying to ${job.title}:`, error);
      }
    }
  };

  const handleSaveJob = async (jobId: string, isCurrentlySaved: boolean) => {
    try {
      setLoadingSave(jobId);

      const action = isCurrentlySaved ? 'unsave' : 'save';
      const response = await fetch('/api/user/save-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          action
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.limitReached) {
          setError(errorData.message);
          return;
        }
        throw new Error(errorData.error || 'Failed to save job');
      }

      // Update local state
      setRecommendations(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, isSaved: !isCurrentlySaved }
          : job
      ));

    } catch (error) {
      console.error('Error saving job:', error);
      setError('Failed to save job');
    } finally {
      setLoadingSave(null);
    }
  };

  const handleApplyJob = async (jobId: string, method: 'manual' | 'automated') => {
    try {
      const response = await fetch('/api/user/apply-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          method
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeRequired) {
          setError('Pro subscription required for automated applications');
          return;
        }
        if (data.error === 'Already applied to this job') {
          setError('You have already applied for this job');
          return;
        }
        if (data.error === 'Job not found') {
          setError('This job is no longer available');
          return;
        }
        throw new Error(data.error || 'Failed to apply for job');
      }

      // Redirect to application URL or show success
      if (data.jobInfo?.applicationUrl) {
        window.open(data.jobInfo.applicationUrl, '_blank');
      } else {
        // Show success message
        alert(`Application submitted successfully for ${data.jobInfo.title}`);
      }

    } catch (error) {
      console.error('Error applying for job:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply for job';
      setError(errorMessage);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-neon-green';
    if (score >= 80) return 'text-neon-blue';
    if (score >= 70) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min) return 'Salary not disclosed';
    if (!max) return `$${min.toLocaleString()}+`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading && recommendations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Jobs For You
            </h2>
            <p className="text-muted-foreground">
              AI-powered recommendations based on your profile
              {subscriptionTier === 'pro' && autoAppliedJobs.size > 0 && (
                <span className="ml-2 text-neon-green">
                  • {autoAppliedJobs.size} auto-applied
                </span>
              )}
            </p>
          </div>
          {subscriptionTier === 'free' && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Daily Recommendations
              </div>
              <div className="text-lg font-semibold text-neon-blue">
                {dailyUsed} / {dailyLimit}
              </div>
            </div>
          )}
        </div>

        {subscriptionTier === 'free' && dailyUsed >= dailyLimit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <div className="flex-1">
              <p className="text-sm text-orange-500 font-medium">
                Daily limit reached
              </p>
              <p className="text-xs text-orange-500/80">
                Upgrade to Pro for unlimited recommendations
              </p>
            </div>
            <Link
              href="/upgrade"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Upgrade
            </Link>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-destructive hover:text-destructive/80"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Job Recommendations */}
      <div className="space-y-4">
        {recommendations.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card p-6 hover:shadow-lg transition-all duration-300 ${autoAppliedJobs.has(job.id.toString()) ? 'ring-2 ring-neon-green/50' : ''}`}
          >
            {/* Auto Applied Badge */}
            {autoAppliedJobs.has(job.id.toString()) && (
              <div className="flex items-center gap-2 mb-3 px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded-lg">
                <Zap className="w-4 h-4 text-neon-green" />
                <span className="text-sm font-medium text-neon-green">Auto Applied</span>
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {job.company?.logo ? (
                    <img
                      src={job.company.logo}
                      alt={job.company.name || 'Company'}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company?.name || 'Unknown Company'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                    {job.locationType && (
                      <span className="px-2.5 py-1 bg-neon-blue/10 text-neon-blue rounded-md text-xs font-medium">
                        {job.locationType}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(job.createdAt)}</span>
                  </div>
                </div>

                {/* Match Score and Reasons */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4" />
                    <span className={`text-sm font-medium ${getMatchScoreColor(job.matchScore)}`}>
                      {job.matchScore}% Match
                    </span>
                  </div>
                  {job.matchReasons.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.matchReasons.slice(0, 2).map((reason, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 bg-neon-blue/10 text-neon-blue rounded-md font-medium"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs ${getUrgencyColor(job.urgency)}`}>
                    {job.urgency} urgency
                  </span>
                  {job.competitionLevel && (
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded text-xs">
                      {job.competitionLevel} competition
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleSaveJob(job.id, job.isSaved)}
                  disabled={loadingSave === job.id}
                  className={`p-2 rounded-lg transition-colors ${
                    job.isSaved
                      ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                      : 'bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20'
                  } ${loadingSave === job.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={job.isSaved ? 'Remove from saved' : 'Save job'}
                >
                  {loadingSave === job.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : job.isSaved ? (
                    <Heart className="w-4 h-4 fill-current" />
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                </button>

                {job.applicationUrl && (
                  <button
                    onClick={() => window.open(job.applicationUrl, '_blank')}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    title="View original job posting"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Apply Actions */}
            <div className="flex gap-3 pt-4 border-t border-border/50">
              <button
                onClick={() => handleApplyJob(job.id, 'manual')}
                className="w-full px-4 py-2 bg-neon-blue text-white rounded-lg font-medium hover:bg-neon-blue/90 transition-colors flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Apply Now
              </button>
            </div>
          </motion.div>
        ))}

        {recommendations.length === 0 && !loading && (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete your profile to get personalized job recommendations
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neon-blue text-white rounded-lg font-medium hover:bg-neon-blue/90 transition-colors"
            >
              Complete Profile
              <Rocket className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && recommendations.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchRecommendations(true)}
            disabled={loading}
            className="px-6 py-3 bg-neon-blue text-white rounded-lg font-medium hover:bg-neon-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load More Jobs
                <TrendingUp className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}