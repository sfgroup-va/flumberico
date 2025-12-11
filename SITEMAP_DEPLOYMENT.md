
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
```javascript
const BASE_URL = 'https://your-domain.com';
```
To your actual domain name.

### 2. Generate Jobs Sitemap with Real Data
Run the database-connected version:
```bash
node scripts/generate-jobs-sitemap.js
```

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
```json
{
  "scripts": {
    "sitemap": "node scripts/generate-all-sitemaps.js",
    "sitemap:jobs": "node scripts/generate-jobs-sitemap.js"
  }
}
```

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
