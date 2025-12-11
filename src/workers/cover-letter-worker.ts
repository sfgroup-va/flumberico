import { Worker, Job } from 'bullmq';
import connection from '../lib/queue';
import { QUEUE_NAMES } from '../lib/queue';
import { CoverLetterGenerator } from '../lib/cover-letter-generator';
import prisma from '../lib/prisma';

interface CoverLetterJobData {
  userId: string;
  jobId: number;
  jobTitle: string;
  companyName: string;
}

export class CoverLetterWorker {
  private worker: Worker | null = null;

  constructor() {
    if (!connection) {
      console.warn('Redis not available - CoverLetterWorker disabled');
      return;
    }

    this.worker = new Worker(
      QUEUE_NAMES.COVER_LETTER_GENERATION,
      this.processCoverLetter.bind(this),
      {
        connection,
        concurrency: 3, // Process 3 cover letters concurrently
        limiter: {
          max: 20,
          duration: 60000, // 20 cover letters per minute
        },
      }
    );

    this.setupEventHandlers();
  }

  private async processCoverLetter(job: Job<CoverLetterJobData>): Promise<void> {
    const { userId, jobId, jobTitle, companyName } = job.data;

    try {
      console.log(`Generating cover letter for user ${userId} - ${jobTitle} at ${companyName}`);

      // Generate the cover letter using AI
      const coverLetter = await CoverLetterGenerator.generateCoverLetterForApplication(userId, jobId);

      // Find the scouted application for this job
      const application = await prisma.jobApplication.findFirst({
        where: {
          userId,
          jobId,
          status: 'scouted'
        }
      });

      if (application) {
        // Update the application with the generated cover letter
        await prisma.jobApplication.update({
          where: { id: application.id },
          data: {
            coverLetter,
            updatedAt: new Date()
          }
        });

        console.log(`Cover letter generated and saved for application ${application.id}`);
      } else {
        console.log(`No scouted application found for user ${userId}, job ${jobId}`);
      }

    } catch (error) {
      console.error(`Error generating cover letter for user ${userId}, job ${jobId}:`, error);

      // Don't fail the job entirely, just log the error
      // The application process can continue without a cover letter
    }
  }

  private setupEventHandlers(): void {
    if (!this.worker) return;

    this.worker.on('completed', (job) => {
      console.log(`Cover letter job ${job.id} completed for user ${job.data.userId}`);
    });

    this.worker.on('failed', (job, err) => {
      const jobId = job?.id || 'unknown';
      const userId = job?.data?.userId || 'unknown';
      console.error(`Cover letter job ${jobId} failed for user ${userId}:`, err);
    });

    this.worker.on('error', (err) => {
      console.error('Cover letter worker error:', err);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down cover letter worker...');
      await this.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Shutting down cover letter worker...');
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
export const coverLetterWorker = new CoverLetterWorker();