#!/usr/bin/env node

// This script generates sitemap for all job pages
// It queries the database to get all active jobs

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'https://flumberico.vercel.app';

async function generateJobsSitemap() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 Fetching jobs from database...');

    // Get all approved and active jobs
    const jobs = await prisma.job.findMany({
      where: {
        approved: true,
        isActive: true,
      },
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`📊 Found ${jobs.length} active jobs`);

    // Generate sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<!-- DYNAMIC JOBS SITEMAP -->\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add each job page
    jobs.forEach(job => {
      const lastMod = job.updatedAt > job.createdAt ? job.updatedAt : job.createdAt;

      sitemap += '  <url>\n';
      sitemap += `    <loc>${BASE_URL}/jobs/${job.slug}</loc>\n`;
      sitemap += `    <lastmod>${lastMod.toISOString()}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';

    // Write to file
    const fs = require('fs');
    const path = require('path');

    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'jobs-sitemap.xml'), sitemap);

    console.log('✅ Jobs sitemap generated successfully!');
    console.log('📁 File created: public/jobs-sitemap.xml');
    console.log(`📊 Total jobs in sitemap: ${jobs.length}`);

    // Update main sitemap to include jobs sitemap
    await updateMainSitemap();

  } catch (error) {
    console.error('❌ Error generating jobs sitemap:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function updateMainSitemap() {
  const fs = require('fs');
  const path = require('path');

  const sitemapPath = path.join(__dirname, '../public/sitemap-index.xml');

  if (fs.existsSync(sitemapPath)) {
    let sitemapIndex = fs.readFileSync(sitemapPath, 'utf8');

    // Add jobs sitemap if not already present
    if (!sitemapIndex.includes('jobs-sitemap.xml')) {
      const jobsSitemapEntry = `  <sitemap>
    <loc>${BASE_URL}/jobs-sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;

      // Insert before closing tag
      sitemapIndex = sitemapIndex.replace(
        '</sitemapindex>',
        `${jobsSitemapEntry}\n</sitemapindex>`
      );

      fs.writeFileSync(sitemapPath, sitemapIndex);
      console.log('🔄 Updated main sitemap index to include jobs sitemap');
    }
  }
}

// Run the generator
generateJobsSitemap();