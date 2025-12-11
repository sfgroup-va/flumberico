#!/usr/bin/env node

// Master script to generate all sitemaps for Flumbericoco AI Job Board

const fs = require('fs');
const path = require('path');

console.log('🗺️  GENERATING ALL SITEMAPS FOR FLUMBERICOCO AI JOB BOARD');
console.log('='.repeat(60));

// Function to run individual sitemap generators
async function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const process = spawn('node', [scriptName], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Script ${scriptName} failed with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

// Function to verify generated files
function verifySitemaps() {
  const publicDir = path.join(__dirname, '../public');
  const requiredFiles = [
    'sitemap.xml',
    'sitemap-index.xml',
    'admin-sitemap.xml',
    'jobs-sitemap.xml',
    'robots.txt'
  ];

  console.log('\n📋 VERIFICATION:');
  console.log('-'.repeat(30));

  let allFilesExist = true;

  requiredFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const fileSize = (stats.size / 1024).toFixed(2);
      console.log(`✅ ${file} (${fileSize} KB)`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allFilesExist = false;
    }
  });

  return allFilesExist;
}

// Function to generate deployment instructions
function generateDeploymentInstructions() {
  const instructions = `
# 🚀 SITEMAP DEPLOYMENT INSTRUCTIONS

## 📁 Generated Files
- public/sitemap.xml - Main sitemap with all static pages
- public/sitemap-index.xml - Sitemap index (for multiple sitemaps)
- public/jobs-sitemap.xml - Dynamic job listings
- public/admin-sitemap.xml - Admin pages (internal use only)
- public/robots.txt - Search engine instructions

## 🔧 BEFORE DEPLOYMENT

### 1. Update Base URL
Edit all generator scripts and change:
\`\`\`javascript
const BASE_URL = 'https://your-domain.com';
\`\`\`
To your actual domain name.

### 2. Generate Jobs Sitemap with Real Data
Run the database-connected version:
\`\`\`bash
node scripts/generate-jobs-sitemap.js
\`\`\`

### 3. Test Sitemaps
Access these URLs in your browser:
- https://your-domain.com/sitemap.xml
- https://your-domain.com/robots.txt
- https://your-domain.com/jobs-sitemap.xml

## 📤 SEARCH ENGINE SUBMISSION

### Google Search Console
1. Go to Google Search Console
2. Add your property (domain)
3. Submit sitemap.xml
4. Submit jobs-sitemap.xml

### Bing Webmaster Tools
1. Go to Bing Webmaster Tools
2. Add your site
3. Submit sitemap.xml

## ⚙️ AUTOMATION (Optional)

### npm script in package.json
Add this to your package.json:
\`\`\`json
{
  "scripts": {
    "sitemap": "node scripts/generate-all-sitemaps.js",
    "sitemap:jobs": "node scripts/generate-jobs-sitemap.js"
  }
}
\`\`\`

### GitHub Actions for auto-generation
Create .github/workflows/sitemap.yml for automatic sitemap updates.

## 🔄 MAINTENANCE

### Update sitemaps when:
- Adding new static pages
- Major site structure changes
- Job content updates
- Domain changes

### Schedule:
- Run weekly for jobs sitemap
- Run monthly for static sitemap
- Run after major site updates

## ⚠️ IMPORTANT NOTES

- Update BASE_URL before deployment
- Test sitemaps in staging first
- Monitor Google Search Console for errors
- Keep admin pages out of public sitemap
- Use canonical URLs in your pages
`;

  fs.writeFileSync(path.join(__dirname, '../SITEMAP_DEPLOYMENT.md'), instructions);
  console.log('📝 Created: SITEMAP_DEPLOYMENT.md');
}

// Main execution
async function main() {
  try {
    console.log('\n1️⃣ Generating main sitemap...');
    await runScript('scripts/generate-sitemap.js');

    console.log('\n2️⃣ Generating admin sitemap...');
    await runScript('scripts/generate-admin-sitemap.js');

    console.log('\n3️⃣ Generating jobs sitemap...');
    await runScript('scripts/generate-jobs-sitemap-simple.js');

    console.log('\n4️⃣ Verifying all files...');
    const allGood = verifySitemaps();

    console.log('\n5️⃣ Generating deployment instructions...');
    generateDeploymentInstructions();

    if (allGood) {
      console.log('\n🎉 ALL SITEMAPS GENERATED SUCCESSFULLY!');
      console.log('\n📊 SUMMARY:');
      console.log('✅ Main sitemap: public/sitemap.xml');
      console.log('✅ Admin sitemap: public/admin-sitemap.xml');
      console.log('✅ Jobs sitemap: public/jobs-sitemap.xml');
      console.log('✅ Robots.txt: public/robots.txt');
      console.log('✅ Deployment guide: SITEMAP_DEPLOYMENT.md');

      console.log('\n🚀 NEXT STEPS:');
      console.log('1. Update BASE_URL in scripts to your domain');
      console.log('2. Test sitemaps at your-domain.com/sitemap.xml');
      console.log('3. Submit to Google Search Console');
      console.log('4. Run jobs sitemap with real database data');
      console.log('5. Set up automated generation (optional)');

    } else {
      console.log('\n❌ SOME FILES ARE MISSING - CHECK ERRORS ABOVE');
    }

  } catch (error) {
    console.error('\n❌ ERROR GENERATING SITEMAPS:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();