#!/usr/bin/env node

// Simple jobs sitemap generator (without database dependency)
// You can customize this to fetch from your database if needed

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://flumberico.vercel.app';

// Sample job slugs - replace with actual jobs from your database
const sampleJobSlugs = [
  'senior-frontend-developer-techcorp',
  'full-stack-engineer-startupxyz',
  'backend-developer-enterprise-inc',
  'machine-learning-engineer-ml-innovate',
  'react-developer-digital-agency',
  'nodejs-developer-fintech',
  'python-developer-data-science',
  'devops-engineer-cloud-company',
  'ui-ux-designer-creative-studio',
  'mobile-app-developer-tech-startup'
];

function generateJobsSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<!-- DYNAMIC JOBS SITEMAP - UPDATE WITH REAL JOBS -->\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add each job page
  sampleJobSlugs.forEach(slug => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}/jobs/${slug}</loc>\n`;
    sitemap += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += '    <priority>0.8</priority>\n';
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';

  // Write to file
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'jobs-sitemap.xml'), sitemap);

  console.log('✅ Sample jobs sitemap generated!');
  console.log('📁 File created: public/jobs-sitemap.xml');
  console.log(`📊 Total sample jobs: ${sampleJobSlugs.length}`);

  console.log('\n📝 To use real jobs:');
  console.log('1. Run: node scripts/generate-jobs-sitemap.js (with database)');
  console.log('2. Or update sampleJobSlugs array with real job slugs');
  console.log('3. Or fetch jobs from your API/database');
}

// Generate sitemap
generateJobsSitemap();