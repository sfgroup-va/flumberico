#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Base URL for your site
const BASE_URL = 'https://flumbericoco.com';

// Static pages that should be included in sitemap
const staticPages = [
  // Core Pages
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/jobs', changefreq: 'daily', priority: 0.9 },
  { url: '/search', changefreq: 'weekly', priority: 0.8 },

  // Information Pages
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  { url: '/how-it-works', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact', changefreq: 'monthly', priority: 0.6 },
  { url: '/pricing', changefreq: 'weekly', priority: 0.8 },

  // Legal Pages
  { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { url: '/terms', changefreq: 'yearly', priority: 0.3 },
  { url: '/disclaimer', changefreq: 'yearly', priority: 0.3 },

  // Authentication Pages (lower priority, noindex for some)
  { url: '/auth/signin', changefreq: 'monthly', priority: 0.4 },
  { url: '/auth/signup', changefreq: 'monthly', priority: 0.4 },

  // User Pages (dynamic, should be noindex for authenticated pages)
  { url: '/dashboard', changefreq: 'weekly', priority: 0.6 },
  { url: '/profile', changefreq: 'monthly', priority: 0.5 },
  { url: '/settings', changefreq: 'monthly', priority: 0.5 },
  { url: '/preferences', changefreq: 'monthly', priority: 0.5 },
  { url: '/applications', changefreq: 'daily', priority: 0.6 },
  { url: '/analytics', changefreq: 'weekly', priority: 0.6 },
  { url: '/upgrade', changefreq: 'weekly', priority: 0.7 },
  { url: '/onboarding', changefreq: 'monthly', priority: 0.5 },

  // Job Submission
  { url: '/jobs/new', changefreq: 'monthly', priority: 0.5 },
  { url: '/job-submitted', changefreq: 'monthly', priority: 0.4 },
];

// Function to generate sitemap XML
function generateSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  staticPages.forEach(page => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}${page.url}</loc>\n`;
    sitemap += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';
  return sitemap;
}

// Function to generate sitemap index (for multiple sitemaps)
function generateSitemapIndex() {
  let index = '<?xml version="1.0" encoding="UTF-8"?>\n';
  index += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Main sitemap
  index += '  <sitemap>\n';
  index += `    <loc>${BASE_URL}/sitemap.xml</loc>\n`;
  index += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
  index += '  </sitemap>\n';

  index += '</sitemapindex>';
  return index;
}

// Generate and save sitemap
const sitemap = generateSitemap();
const sitemapIndex = generateSitemapIndex();

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write sitemap files
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), sitemapIndex);

console.log('✅ Sitemap generated successfully!');
console.log('📁 Files created:');
console.log('   - public/sitemap.xml');
console.log('   - public/sitemap-index.xml');
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log(`📊 Total pages: ${staticPages.length}`);

// Generate sitemap structure report
console.log('\n📋 Sitemap Structure:');
console.log('='.repeat(50));

const categorizedPages = {
  'Core Pages': staticPages.filter(p => ['/', '/jobs', '/search'].includes(p.url)),
  'Information': staticPages.filter(p => ['/about', '/how-it-works', '/contact', '/pricing'].includes(p.url)),
  'Legal': staticPages.filter(p => ['/privacy', '/terms', '/disclaimer'].includes(p.url)),
  'Authentication': staticPages.filter(p => p.url.includes('/auth/')),
  'User Dashboard': staticPages.filter(p => ['/dashboard', '/profile', '/settings', '/preferences', '/applications', '/analytics', '/upgrade', '/onboarding'].includes(p.url)),
  'Job Management': staticPages.filter(p => ['/jobs/new', '/job-submitted'].includes(p.url))
};

Object.entries(categorizedPages).forEach(([category, pages]) => {
  console.log(`\n${category}:`);
  pages.forEach(page => {
    console.log(`  ${page.url} (priority: ${page.priority})`);
  });
});

console.log('\n🎯 SEO Recommendations:');
console.log('• Set canonical URLs in Next.js head');
console.log('• Add meta robots="noindex" for authenticated pages');
console.log('• Submit sitemap to Google Search Console');
console.log('• Monitor crawl stats in Google Search Console');
console.log('• Update sitemap when adding new pages');