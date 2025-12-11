import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

// Redis connection - disabled during build
const connection = process.env.NODE_ENV === 'production' ||
  (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-development-build')
  ? null
  : new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      connectTimeout: 10000,
      lazyConnect: true,
    } as any);

// Queue names
export const QUEUE_NAMES = {
  JOB_MATCHING: 'job-matching',
  JOB_APPLICATION: 'job-application',
  COVER_LETTER_GENERATION: 'cover-letter-generation',
  APPLICATION_TRACKING: 'application-tracking',
  EMAIL_NOTIFICATIONS: 'email-notifications'
} as const;

// Create queues - only if connection is available
export const jobMatchingQueue = connection ? new Queue(QUEUE_NAMES.JOB_MATCHING, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 20,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
}) : null;

export const jobApplicationQueue = connection ? new Queue(QUEUE_NAMES.JOB_APPLICATION, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
}) : null;

export const coverLetterQueue = connection ? new Queue(QUEUE_NAMES.COVER_LETTER_GENERATION, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 30,
    removeOnFail: 15,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
}) : null;

export const applicationTrackingQueue = connection ? new Queue(QUEUE_NAMES.APPLICATION_TRACKING, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 200,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
}) : null;

// Job data types
export interface JobMatchingJobData {
  userId: string;
  criteria: {
    jobTitles: string[];
    locations: string[];
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
    salaryMin?: number;
    salaryMax?: number;
    remoteOnly: boolean;
    excludeCompanies: string[];
  };
}

export interface JobApplicationJobData {
  userId: string;
  jobId: number;
  matchData: {
    jobTitle: string;
    companyName: string;
    matchScore: number;
    applicationUrl?: string;
    applicationEmail?: string;
  };
  coverLetter?: string;
}

export interface CoverLetterJobData {
  userId: string;
  jobId: number;
  jobTitle: string;
  companyName: string;
}

export interface ApplicationTrackingJobData {
  applicationId: string;
  jobId: number;
  userId: string;
  status: 'applied' | 'viewed' | 'interview' | 'rejected' | 'offer';
  timestamp: Date;
}

// Queue management functions
export class QueueManager {
  /**
   * Add a job matching task to the queue
   */
  static async addJobMatchingJob(data: JobMatchingJobData, delay = 0): Promise<void> {
    if (!jobMatchingQueue) return;
    await jobMatchingQueue.add('find-matches', data, {
      delay,
      priority: data.userId ? 10 : 5, // Higher priority for specific users
    });
  }

  /**
   * Add a job application task to the queue
   */
  static async addJobApplicationJob(data: JobApplicationJobData, delay = 0): Promise<void> {
    if (!jobApplicationQueue) return;
    await jobApplicationQueue.add('apply-to-job', data, {
      delay,
      priority: 10, // High priority for applications
    });
  }

  /**
   * Add a cover letter generation task to the queue
   */
  static async addCoverLetterJob(data: CoverLetterJobData, delay = 0): Promise<void> {
    if (!coverLetterQueue) return;
    await coverLetterQueue.add('generate-cover-letter', data, {
      delay,
      priority: 8,
    });
  }

  /**
   * Add an application tracking task to the queue
   */
  static async addApplicationTrackingJob(data: ApplicationTrackingJobData, delay = 0): Promise<void> {
    if (!applicationTrackingQueue) return;
    await applicationTrackingQueue.add('track-application', data, {
      delay,
      priority: 5,
    });
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats() {
    if (!connection) return { jobMatching: {}, jobApplication: {}, coverLetterGeneration: {}, applicationTracking: {} };

    const [matching, application, coverLetter, tracking] = await Promise.all([
      jobMatchingQueue?.getJobCounts() || Promise.resolve({}),
      jobApplicationQueue?.getJobCounts() || Promise.resolve({}),
      coverLetterQueue?.getJobCounts() || Promise.resolve({}),
      applicationTrackingQueue?.getJobCounts() || Promise.resolve({}),
    ]);

    return {
      jobMatching: matching,
      jobApplication: application,
      coverLetterGeneration: coverLetter,
      applicationTracking: tracking,
    };
  }

  /**
   * Clean up completed jobs
   */
  static async cleanupQueues(): Promise<void> {
    if (!connection) return;

    await Promise.all([
      jobMatchingQueue?.clean(24 * 60 * 60 * 1000, 0) || Promise.resolve(),
      jobApplicationQueue?.clean(7 * 24 * 60 * 60 * 1000, 0) || Promise.resolve(),
      coverLetterQueue?.clean(24 * 60 * 60 * 1000, 0) || Promise.resolve(),
      applicationTrackingQueue?.clean(30 * 24 * 60 * 60 * 1000, 0) || Promise.resolve(),
    ]);
  }

  /**
   * Pause all queues (for maintenance)
   */
  static async pauseAllQueues(): Promise<void> {
    if (!connection) return;

    await Promise.all([
      jobMatchingQueue?.pause() || Promise.resolve(),
      jobApplicationQueue?.pause() || Promise.resolve(),
      coverLetterQueue?.pause() || Promise.resolve(),
      applicationTrackingQueue?.pause() || Promise.resolve(),
    ]);
  }

  /**
   * Resume all queues
   */
  static async resumeAllQueues(): Promise<void> {
    if (!connection) return;

    await Promise.all([
      jobMatchingQueue?.resume() || Promise.resolve(),
      jobApplicationQueue?.resume() || Promise.resolve(),
      coverLetterQueue?.resume() || Promise.resolve(),
      applicationTrackingQueue?.resume() || Promise.resolve(),
    ]);
  }

  /**
   * Graceful shutdown
   */
  static async closeAllQueues(): Promise<void> {
    if (!connection) return;

    await Promise.all([
      jobMatchingQueue?.close() || Promise.resolve(),
      jobApplicationQueue?.close() || Promise.resolve(),
      coverLetterQueue?.close() || Promise.resolve(),
      applicationTrackingQueue?.close() || Promise.resolve(),
    ]);
    await connection.quit();
  }
}

// Error handling
if (connection) {
  connection.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  connection.on('connect', () => {
    console.log('Redis connected successfully');
  });
}

export default connection;