#!/usr/bin/env ts-node

/**
 * Script to run AI Hunter workers locally
 * Usage: npm run workers or node scripts/run-workers.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workers = [
  {
    name: 'Job Matching Worker',
    script: join(__dirname, '../src/workers/job-matching-worker.ts'),
    env: { WORKER_TYPE: 'job-matching' }
  },
  {
    name: 'Automation Worker',
    script: join(__dirname, '../src/workers/automation-worker.ts'),
    env: { WORKER_TYPE: 'automation' }
  },
  {
    name: 'Cover Letter Worker',
    script: join(__dirname, '../src/workers/cover-letter-worker.ts'),
    env: { WORKER_TYPE: 'cover-letter' }
  }
];

console.log('🚀 Starting AI Hunter Workers...\n');

const runningWorkers: any[] = [];

function startWorker(workerConfig: any) {
  console.log(`Starting ${workerConfig.name}...`);

  const child = spawn('npx', ['tsx', workerConfig.script], {
    stdio: 'inherit',
    env: { ...process.env, ...workerConfig.env },
    cwd: join(__dirname, '..')
  });

  child.on('error', (error) => {
    console.error(`❌ Failed to start ${workerConfig.name}:`, error.message);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`\n📴 ${workerConfig.name} was killed by signal: ${signal}`);
    } else if (code !== 0) {
      console.log(`\n❌ ${workerConfig.name} exited with code: ${code}`);
    } else {
      console.log(`\n✅ ${workerConfig.name} exited successfully`);
    }
  });

  runningWorkers.push({ name: workerConfig.name, process: child });
  return child;
}

// Start all workers
workers.forEach(startWorker);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down workers gracefully...');

  runningWorkers.forEach(({ name, process: child }) => {
    console.log(`Stopping ${name}...`);
    child.kill('SIGTERM');
  });

  // Force exit after 5 seconds
  setTimeout(() => {
    console.log('Forcing exit...');
    process.exit(1);
  }, 5000);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down workers...');

  runningWorkers.forEach(({ name, process: child }) => {
    console.log(`Stopping ${name}...`);
    child.kill('SIGTERM');
  });
});

console.log('✅ All workers started. Press Ctrl+C to stop.\n');
console.log('Workers running:');
workers.forEach(worker => {
  console.log(`  • ${worker.name}`);
});
console.log('\nMonitor logs above for worker activity.\n');