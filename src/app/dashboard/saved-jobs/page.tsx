'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Heart,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Clock,
  ArrowRight,
  Trash2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import companyLogoPlaceholder from '@/assets/company-logo-placeholder.png';
import { formatSalary, relativeDate } from '@/lib/utils';
import Image from 'next/image';

interface SavedJob {
  id: number;
  slug: string;
  title: string;
  companyName: string;
  type: string;
  locationType: string;
  location: string;
  salary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  companyLogoUrl: string | null;
  createdAt: string;
  aiEnhancedDescription: string | null;
  savedAt: string;
  isSaved: boolean;
  company?: {
    name: string;
    logo: string | null;
    industry: string | null;
  };
}

export default function SavedJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [unsaveLoading, setUnsaveLoading] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/saved-jobs');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSavedJobs();
    }
  }, [status]);

  const fetchSavedJobs = async (offset = 0, append = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/save-job?limit=20&offset=${offset}`);

      if (!response.ok) {
        throw new Error('Failed to fetch saved jobs');
      }

      const data = await response.json();

      if (append) {
        setSavedJobs(prev => [...prev, ...data.savedJobs]);
      } else {
        setSavedJobs(data.savedJobs);
      }

      setHasMore(data.hasMore);
      setError(null);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      setError('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId: number) => {
    if (unsaveLoading) return;

    setUnsaveLoading(jobId);
    try {
      const response = await fetch('/api/user/save-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, action: 'unsave' }),
      });

      if (response.ok) {
        setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to unsave job');
      }
    } catch (error) {
      console.error('Error unsaving job:', error);
      alert('Network error. Please try again.');
    } finally {
      setUnsaveLoading(null);
    }
  };

  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading saved jobs...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-neon-pink to-neon-purple rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
                Saved Jobs
              </h1>
              <p className="text-muted-foreground">
                Jobs you've saved for later review
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{savedJobs.length} saved jobs</span>
            <span>•</span>
            <span>Updated {relativeDate(new Date())}</span>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-6 border border-red-500/20"
          >
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => fetchSavedJobs()}>Try Again</Button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {savedJobs.length === 0 && !error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No saved jobs yet</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring and save jobs that interest you for later review.
            </p>
            <Link href="/">
              <Button className="futuristic-button">
                Browse Jobs
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Saved Jobs List */}
        <div className="space-y-4">
          {savedJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass-card group relative overflow-hidden border border-border/50 hover:border-neon-pink/50"
            >
              <div className="p-6">
                <div className="flex gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-border/50 hover:scale-110 transition-transform duration-300">
                      <Image
                        src={job.companyLogoUrl || companyLogoPlaceholder}
                        alt={`${job.companyName} logo`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Job Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold mb-1 group-hover:text-neon-pink transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-muted-foreground mb-3">{job.companyName}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location || 'Remote'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatSalary(job.salaryMin, job.salaryMax, job.salary ? parseInt(job.salary.replace(/[^0-9]/g, '')) || null : null)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Saved {relativeDate(new Date(job.savedAt))}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnsaveJob(job.id)}
                          disabled={unsaveLoading === job.id}
                          className="hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500"
                        >
                          {unsaveLoading === job.id ? (
                            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>

                        <Link href={`/jobs/${job.slug}`}>
                          <Button size="sm" className="futuristic-button">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8"
          >
            <Button
              onClick={() => fetchSavedJobs(savedJobs.length, true)}
              disabled={loading}
              variant="outline"
              size="lg"
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              ) : null}
              Load More Jobs
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}