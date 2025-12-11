import { jobMatchingWorker } from './job-matching-worker';
import { coverLetterWorker } from './cover-letter-worker';
import { automationWorker } from './automation-worker';
import { QueueManager } from '../lib/queue';

async function startWorkers() {
  console.log('🚀 Starting Flumberico Background Workers...');

  // Handle graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n📴 Received ${signal}. Gracefully shutting down workers...`);

    try {
      await Promise.all([
        jobMatchingWorker.close(),
        coverLetterWorker.close(),
        automationWorker.close(),
        QueueManager.closeAllQueues()
      ]);

      console.log('✅ All workers shut down gracefully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Register shutdown handlers
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });

  // Start monitoring
  console.log('✅ Workers started successfully');
  console.log('📊 Job Matching Worker: Active');
  console.log('📝 Cover Letter Worker: Active');
  console.log('🤖 Automation Worker: Active');
  console.log('🔄 Background processing is running...\n');

  // Optional: Log queue stats every 5 minutes
  setInterval(async () => {
    try {
      const stats = await QueueManager.getQueueStats();
      const jobMatching = stats.jobMatching as any;
      const jobApplication = stats.jobApplication as any;
      const coverLetterGeneration = stats.coverLetterGeneration as any;

      console.log('📊 Queue Stats:', {
        jobMatching: {
          waiting: jobMatching.waiting || 0,
          active: jobMatching.active || 0,
          completed: jobMatching.completed || 0
        },
        jobApplication: {
          waiting: jobApplication.waiting || 0,
          active: jobApplication.active || 0,
          completed: jobApplication.completed || 0
        },
        coverLetterGeneration: {
          waiting: coverLetterGeneration.waiting || 0,
          active: coverLetterGeneration.active || 0,
          completed: coverLetterGeneration.completed || 0
        }
      });
    } catch (error) {
      console.error('Error getting queue stats:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Start workers if this file is run directly
if (require.main === module) {
  startWorkers().catch(error => {
    console.error('❌ Failed to start workers:', error);
    process.exit(1);
  });
}

export { startWorkers };