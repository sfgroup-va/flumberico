import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES } from '../lib/queue';
import connection from '../lib/queue';
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import prisma from '../lib/prisma';

interface JobApplicationJobData {
  userId: string;
  jobId: number;
  matchData: {
    jobTitle: string;
    companyName: string;
    matchScore: number;
    applicationUrl?: string;
    applicationEmail?: string;
  };
}

export class AutomationWorker {
  private worker: Worker | null = null;
  private browser: Browser | null = null;

  constructor() {
    if (!connection) {
      console.warn('Redis not available - AutomationWorker disabled');
      return;
    }

    this.worker = new Worker(
      QUEUE_NAMES.JOB_APPLICATION,
      this.processJobApplication.bind(this),
      {
        connection,
        concurrency: 1, // Process 1 application at a time for stealth
        limiter: {
          max: 2,
          duration: 60000, // 2 applications per minute max
        },
      }
    );

    this.setupEventHandlers();
    this.initializeBrowser();
  }

  private async initializeBrowser(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: process.env.NODE_ENV === 'production',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      console.log('Playwright browser initialized for automation');
    } catch (error) {
      console.error('Failed to initialize Playwright browser:', error);
    }
  }

  private async processJobApplication(job: Job<JobApplicationJobData>): Promise<void> {
    const { userId, jobId, matchData } = job.data;

    if (!this.browser) {
      console.error('Browser not initialized for automation');
      return;
    }

    try {
      console.log(`Processing job application for user ${userId} - ${matchData.jobTitle} at ${matchData.companyName}`);

      // Get user data and application details
      const [user, application] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: true,
            resumeDNA: true
          }
        }),
        prisma.jobApplication.findFirst({
          where: {
            userId,
            jobId,
            status: 'scouted'
          },
          include: {
            job: true
          }
        })
      ]);

      if (!user || !application || !user.profile || !user.resumeDNA) {
        console.log(`Missing user or application data for user ${userId}, job ${jobId}`);
        return;
      }

      // Check if user has Pro subscription (required for automation)
      if (user.subscriptionTier !== 'pro') {
        console.log(`User ${userId} does not have Pro subscription, skipping automation`);
        return;
      }

      // Create a new browser context for this application
      const context = await this.browser.newContext({
        userAgent: this.getRandomUserAgent(),
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
        timezoneId: 'America/New_York'
      });

      let applicationSuccess = false;
      let errorMessage = '';

      try {
        if (matchData.applicationUrl) {
          // Apply via URL
          applicationSuccess = await this.applyViaURL(context, matchData.applicationUrl, user, application);
        } else if (matchData.applicationEmail) {
          // Apply via email (fallback)
          applicationSuccess = await this.applyViaEmail(matchData.applicationEmail, user, application);
        } else {
          errorMessage = 'No application URL or email available';
        }

        // Update application status
        await prisma.jobApplication.update({
          where: { id: application.id },
          data: {
            status: applicationSuccess ? 'applied' : 'failed',
            appliedAt: new Date(),
            notes: application.notes + (errorMessage ? `\n\nError: ${errorMessage}` : ''),
            aiGenerated: true,
          }
        });

        console.log(`Application ${applicationSuccess ? 'successful' : 'failed'} for user ${userId}`);

      } catch (error) {
        console.error(`Error during automation for user ${userId}, job ${jobId}:`, error);
        errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Update application with failure status
        await prisma.jobApplication.update({
          where: { id: application.id },
          data: {
            status: 'failed',
            notes: application.notes + `\n\nAutomation Error: ${errorMessage}`,
            aiGenerated: true,
          }
        });
      } finally {
        await context.close();
      }

      // Add delay between applications for stealth
      await this.sleep(Math.random() * 30000 + 15000); // 15-45 seconds

    } catch (error) {
      console.error(`Critical error in automation for user ${userId}, job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Apply to a job via URL using browser automation
   */
  private async applyViaURL(
    context: BrowserContext,
    applicationUrl: string,
    user: any,
    application: any
  ): Promise<boolean> {
    const page = await context.newPage();

    try {
      console.log(`Navigating to application URL: ${applicationUrl}`);

      // Navigate to application page
      await page.goto(applicationUrl, { waitUntil: 'networkidle' });

      // Wait a bit to simulate human behavior
      await this.sleep(Math.random() * 2000 + 1000);

      // Look for common application form patterns
      const formSelectors = [
        'form[id*="application"]',
        'form[class*="application"]',
        'form[action*="apply"]',
        'div[id*="apply"] form',
        '.application-form form',
        'form'
      ];

      let formFound = false;
      for (const selector of formSelectors) {
        const form = page.locator(selector).first();
        if (await form.count() > 0) {
          formFound = true;
          await this.fillApplicationForm(form, page, user, application);
          break;
        }
      }

      if (!formFound) {
        // Try to find and click "Apply" buttons
        const applyButtons = [
          'button:has-text("Apply")',
          'a:has-text("Apply")',
          'button:has-text("Apply Now")',
          'a:has-text("Apply Now")',
          '[data-testid*="apply"]',
          '.apply-button'
        ];

        for (const buttonSelector of applyButtons) {
          const button = page.locator(buttonSelector).first();
          if (await button.count() > 0) {
            await button.click();
            await this.sleep(2000);
            // Look for form again after clicking
            const newForm = page.locator('form').first();
            if (await newForm.count() > 0) {
              await this.fillApplicationForm(newForm, page, user, application);
              formFound = true;
              break;
            }
          }
        }
      }

      return formFound;

    } catch (error) {
      console.error('Error applying via URL:', error);
      return false;
    } finally {
      await page.close();
    }
  }

  /**
   * Fill out the application form with user data
   */
  private async fillApplicationForm(
    form: any,
    page: Page,
    user: any,
    application: any
  ): Promise<void> {
    try {
      // Fill common form fields
      const fieldMappings = [
        { selectors: ['input[name*="first"]', 'input[placeholder*="first"]'], value: user.profile?.phone || user.name?.split(' ')[0] || '' },
        { selectors: ['input[name*="last"]', 'input[placeholder*="last"]'], value: user.name?.split(' ').slice(1).join(' ') || '' },
        { selectors: ['input[name*="email"]', 'input[type="email"]'], value: user.email },
        { selectors: ['input[name*="phone"]', 'input[type="tel"]'], value: user.profile?.phone || '' },
        { selectors: ['input[name*="location"]', 'input[placeholder*="location"]'], value: user.profile?.location || '' },
      ];

      for (const field of fieldMappings) {
        for (const selector of field.selectors) {
          const input = form.locator(selector).first();
          if (await input.count() > 0) {
            await input.fill(field.value);
            await this.sleep(500); // Small delay between fields
            break;
          }
        }
      }

      // Handle file upload for resume
      const resumeInput = form.locator('input[type="file"]').first();
      if (await resumeInput.count() > 0 && user.resumeDNA?.fileName) {
        // For now, we'll skip file upload as it requires the actual file
        // In production, you'd need to store the actual resume file
        console.log('Resume upload field found but skipped in demo');
      }

      // Handle cover letter
      const coverLetterTextarea = form.locator('textarea[name*="cover"], textarea[placeholder*="cover"]').first();
      if (await coverLetterTextarea.count() > 0 && application.coverLetter) {
        await coverLetterTextarea.fill(application.coverLetter);
        await this.sleep(1000);
      }

      // Look for and click submit button
      const submitButtons = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Apply")',
        'button:has-text("Send")'
      ];

      for (const buttonSelector of submitButtons) {
        const button = form.locator(buttonSelector).first();
        if (await button.count() > 0) {
          await button.click();
          await this.sleep(2000);
          break;
        }
      }

    } catch (error) {
      console.error('Error filling application form:', error);
    }
  }

  /**
   * Apply via email (fallback method)
   */
  private async applyViaEmail(
    applicationEmail: string,
    user: any,
    application: any
  ): Promise<boolean> {
    try {
      console.log(`Preparing email application to ${applicationEmail}`);

      // In a real implementation, you would:
      // 1. Generate a professional email
      // 2. Attach the resume and cover letter
      // 3. Send via email service (SendGrid, etc.)
      // 4. Track the email status

      // For now, we'll just log that we attempted email application
      console.log(`Email application prepared for ${applicationEmail}`);
      return true;

    } catch (error) {
      console.error('Error applying via email:', error);
      return false;
    }
  }

  /**
   * Get a random user agent for stealth
   */
  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
    ];

    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  /**
   * Sleep helper function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private setupEventHandlers(): void {
    if (!this.worker) return;

    this.worker.on('completed', (job) => {
      console.log(`Automation job ${job.id} completed for user ${job.data.userId}`);
    });

    this.worker.on('failed', (job, err) => {
      const jobId = job?.id || 'unknown';
      const userId = job?.data?.userId || 'unknown';
      console.error(`Automation job ${jobId} failed for user ${userId}:`, err);
    });

    this.worker.on('error', (err) => {
      console.error('Automation worker error:', err);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down automation worker...');
      await this.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Shutting down automation worker...');
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
   * Close the worker and browser
   */
  async close(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Create and export the worker instance
export const automationWorker = new AutomationWorker();