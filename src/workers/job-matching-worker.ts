import { Worker, Job } from 'bullmq';
import connection from '../lib/queue';
import { QUEUE_NAMES } from '../lib/queue';
import { JobMatchingEngine, JobMatch, MatchingCriteria } from '../lib/job-matcher';
import { QueueManager } from '../lib/queue';
import prisma from '../lib/prisma';

interface JobMatchingJobData {
  userId: string;
  criteria: MatchingCriteria;
}

export class JobMatchingWorker {
  private worker: Worker | null = null;

  constructor() {
    if (!connection) {
      console.warn('Redis not available - JobMatchingWorker disabled');
      return;
    }

    this.worker = new Worker(
      QUEUE_NAMES.JOB_MATCHING,
      this.processJobMatching.bind(this),
      {
        connection,
        concurrency: 2, // Process 2 jobs concurrently
        limiter: {
          max: 10,
          duration: 60000, // 10 jobs per minute
        },
      }
    );

    this.setupEventHandlers();
  }

  private async processJobMatching(job: Job<JobMatchingJobData>): Promise<void> {
    const { userId, criteria } = job.data;

    try {
      console.log(`Finding job matches for user ${userId}`);

      // Find matching jobs using AI
      const matches = await JobMatchingEngine.findMatchesForUser(criteria);

      if (matches.length === 0) {
        console.log(`No matches found for user ${userId}`);
        return;
      }

      // Process each match
      for (const match of matches) {
        // Check if user hasn't already applied to this job
        const existingApplication = await prisma.jobApplication.findUnique({
          where: {
            userId_jobId: {
              userId,
              jobId: match.jobId
            }
          }
        });

        if (existingApplication) {
          continue; // Skip already applied jobs
        }





        // Create a scouted application record
        const application = await prisma.jobApplication.create({
          data: {
            userId,
            jobId: match.jobId,
            status: 'scouted',
            notes: `AI Match Score: ${match.matchScore}/100\n\nMatch Reasons:\n${match.matchReasons.join('\n')}`,
          }
        });

        // Add cover letter generation job (with delay to avoid overwhelming AI)
        await QueueManager.addCoverLetterJob({
          userId,
          jobId: match.jobId,
          jobTitle: match.jobTitle,
          companyName: match.companyName,
        }, Math.random() * 30000); // Random delay up to 30 seconds

        // Add job application job (with longer delay for "stealth" timing)
        const applicationDelay = this.calculateApplicationDelay(criteria, match);
        await QueueManager.addJobApplicationJob({
          userId,
          jobId: match.jobId,
          matchData: {
            jobTitle: match.jobTitle,
            companyName: match.companyName,
            matchScore: match.matchScore,
            applicationUrl: match.applicationUrl,
            applicationEmail: match.applicationEmail,
          },
        }, applicationDelay);

        console.log(`Created scouted application for user ${userId} - ${match.jobTitle} at ${match.companyName}`);
      }

      // Update user's last scan time
      await prisma.user.update({
        where: { id: userId },
        data: {
          updatedAt: new Date()
        }
      });

      console.log(`Processed ${matches.length} matches for user ${userId}`);

    } catch (error) {
      console.error(`Error processing job matching for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate realistic application delay for "stealth" behavior
   */
  private calculateApplicationDelay(criteria: MatchingCriteria, match: JobMatch): number {
    // Base delay: 1-4 hours
    let delay = Math.random() * 3 * 60 * 60 * 1000 + 60 * 60 * 1000;

    // Add variance based on match score (better matches = faster response)
    const scoreMultiplier = 1 - (match.matchScore / 100) * 0.5;
    delay *= scoreMultiplier;

    // Add time-of-day considerations (don't apply at 3 AM)
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour < 8 || currentHour > 20) {
      // Delay until business hours
      const nextBusinessHour = currentHour < 8 ? 8 : 32; // Next day 8 AM
      const businessTime = new Date(now);
      businessTime.setHours(nextBusinessHour, 0, 0, 0);
      delay = Math.max(delay, businessTime.getTime() - now.getTime());
    }

    // Add some randomness to make it seem more human
    delay += Math.random() * 30 * 60 * 1000; // Up to 30 minutes random

    return Math.floor(delay);
  }

  private setupEventHandlers(): void {
    if (this.worker) {
      this.worker.on('completed', (job) => {
        console.log(`Job matching job ${job.id} completed for user ${job.data.userId}`);
      });

      this.worker.on('failed', (job, err) => {
        const jobId = job?.id || 'unknown';
        const userId = job?.data?.userId || 'unknown';
        console.error(`Job matching job ${jobId} failed for user ${userId}:`, err);
      });

      this.worker.on('error', (err) => {
        console.error('Job matching worker error:', err);
      });
    }

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down job matching worker...');
      await this.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Shutting down job matching worker...');
      await this.close();
      process.exit(0);
    });
  }

  /**
   * Get worker statistics
   */
  async getWorkerStats() {
    return {
      status: this.worker ? 'running' : 'disabled',
      workerId: this.worker?.id || 'none',
    };
  }

  /**
   * Close the worker
   */
  async close(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
  }
}

// Create and export the worker instance
export const jobMatchingWorker = new JobMatchingWorker();