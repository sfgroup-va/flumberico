#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Base URL for your site
const BASE_URL = 'https://your-domain.com';

// Admin pages (NOT for search engines - internal use only)
const adminPages = [
  { url: '/admin', changefreq: 'weekly', priority: 0.3, noindex: true },
  { url: '/admin/jobs', changefreq: 'daily', priority: 0.4, noindex: true },
  { url: '/admin/analytics', changefreq: 'daily', priority: 0.4, noindex: true },
  { url: '/admin/import', changefreq: 'monthly', priority: 0.3, noindex: true },
  { url: '/admin/subscriptions', changefreq: 'weekly', priority: 0.4, noindex: true },
  { url: '/admin/jobs/new', changefreq: 'weekly', priority: 0.3, noindex: true },
];

// Dynamic admin pages (job management)
const dynamicAdminPatterns = [
  { pattern: '/admin/jobs/[slug]', noindex: true, description: 'Job detail and management' },
  { pattern: '/admin/jobs/[slug]/edit', noindex: true, description: 'Edit job page' },
];

// Function to generate admin sitemap
function generateAdminSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<!-- ADMIN SITEMAP - FOR INTERNAL USE ONLY -->\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add admin pages with noindex
  adminPages.forEach(page => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}${page.url}</loc>\n`;
    sitemap += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    if (page.noindex) {
      sitemap += '    <!-- NOTE: This page should have meta robots="noindex" -->\n';
    }
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';
  return sitemap;
}

// Generate and save admin sitemap
const adminSitemap = generateAdminSitemap();

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write admin sitemap file
fs.writeFileSync(path.join(publicDir, 'admin-sitemap.xml'), adminSitemap);

console.log('🔒 Admin Sitemap generated successfully!');
console.log('📁 File created:');
console.log('   - public/admin-sitemap.xml');
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log(`📊 Total admin pages: ${adminPages.length}`);

console.log('\n📋 Admin Pages Structure:');
console.log('='.repeat(50));

const categorizedAdminPages = {
  'Main Dashboard': ['/admin'],
  'Job Management': ['/admin/jobs', '/admin/jobs/new'],
  'Analytics': ['/admin/analytics'],
  'User Management': ['/admin/subscriptions'],
  'Data Import': ['/admin/import'],
  'Dynamic Pages': dynamicAdminPatterns.map(p => p.pattern)
};

Object.entries(categorizedAdminPages).forEach(([category, pages]) => {
  console.log(`\n${category}:`);
  pages.forEach(page => {
    if (typeof page === 'string') {
      console.log(`  ${page}`);
    } else {
      console.log(`  ${page.pattern} - ${page.description}`);
    }
  });
});

console.log('\n⚠️  IMPORTANT SEO NOTES:');
console.log('• ALL admin pages should have meta robots="noindex, nofollow"');
console.log('• Admin sitemap should NOT be submitted to search engines');
console.log('• Use robots.txt to disallow crawling of admin areas');
console.log('• Ensure proper authentication/authorization for all admin routes');

console.log('\n📝 robots.txt Recommendations:');
console.log('User-agent: *');
console.log('Disallow: /admin/');
console.log('Disallow: /api/');
console.log('Disallow: /auth/');
console.log('Allow: /');

console.log('\n🔐 Security Recommendations:');
console.log('• Implement rate limiting for admin endpoints');
console.log('• Use HTTPS for all admin pages');
console.log('• Add IP whitelisting if necessary');
console.log('• Log all admin access attempts');
console.log('• Use 2FA for admin accounts');