#!/usr/bin/env node

/**
 * Manual Feature Analysis Script
 * Analyzes the codebase for user feature completeness
 */

const fs = require('fs');
const path = require('path');

function analyzeFeatureCompleteness() {
  console.log('🔍 ANALISIS LENGKAP FITUR USER');
  console.log('='.repeat(60));

  const features = {
    authentication: {
      files: [],
      endpoints: [],
      components: [],
      status: 'unknown'
    },
    dashboard: {
      files: [],
      endpoints: [],
      components: [],
      status: 'unknown'
    },
    jobSearch: {
      files: [],
      endpoints: [],
      components: [],
      status: 'unknown'
    },
    recommendations: {
      files: [],
      endpoints: [],
      components: [],
      status: 'unknown'
    },
    autoApply: {
      files: [],
      endpoints: [],
      components: [],
      status: 'unknown'
    },
    applications: {
      files: [],
      endpoints: [],
      components: [],
      status: 'unknown'
    },
    profile: {
      files: [],
      endpoints: [],
      components: [],
      status: 'unknown'
    },
    subscription: {
      files: [],
      endpoints: [],
      components: [],
      status: 'unknown'
    }
  };

  // Analyze file structure
  function analyzeDirectory(dir, featureName) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isFile() && (item.includes('.tsx') || item.includes('.ts'))) {
        const content = fs.readFileSync(fullPath, 'utf8').toLowerCase();

        // Feature detection based on content
        if (content.includes('auth') || content.includes('signin') || content.includes('signup')) {
          if (!features.authentication.files.includes(fullPath)) {
            features.authentication.files.push(fullPath);
          }
        }

        if (content.includes('dashboard') || content.includes('command center')) {
          if (!features.dashboard.files.includes(fullPath)) {
            features.dashboard.files.push(fullPath);
          }
        }

        if (content.includes('job') || content.includes('recommendation')) {
          if (!features.jobSearch.files.includes(fullPath)) {
            features.jobSearch.files.push(fullPath);
          }
          if (content.includes('recommendation') || content.includes('match')) {
            if (!features.recommendations.files.includes(fullPath)) {
              features.recommendations.files.push(fullPath);
            }
          }
        }

        if (content.includes('auto') || content.includes('automated') || content.includes('ai hunter')) {
          if (!features.autoApply.files.includes(fullPath)) {
            features.autoApply.files.push(fullPath);
          }
        }

        if (content.includes('application') || content.includes('apply')) {
          if (!features.applications.files.includes(fullPath)) {
            features.applications.files.push(fullPath);
          }
        }

        if (content.includes('profile') || content.includes('user')) {
          if (!features.profile.files.includes(fullPath)) {
            features.profile.files.push(fullPath);
          }
        }

        if (content.includes('subscription') || content.includes('pro') || content.includes('pricing')) {
          if (!features.subscription.files.includes(fullPath)) {
            features.subscription.files.push(fullPath);
          }
        }
      } else if (stat.isDirectory()) {
        analyzeDirectory(fullPath, featureName);
      }
    });
  }

  // Analyze API endpoints
  function analyzeAPIEndpoints() {
    const apiDir = 'src/app/api';
    if (!fs.existsSync(apiDir)) return;

    const endpoints = fs.readdirSync(apiDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    endpoints.forEach(endpoint => {
      const endpointPath = path.join(apiDir, endpoint);
      const routeFile = path.join(endpointPath, 'route.ts');

      if (fs.existsSync(routeFile)) {
        // Categorize endpoints
        if (endpoint.includes('auth')) {
          features.authentication.endpoints.push(endpoint);
        } else if (endpoint.includes('user')) {
          features.profile.endpoints.push(endpoint);
          features.dashboard.endpoints.push(endpoint);
          features.applications.endpoints.push(endpoint);
        } else if (endpoint.includes('jobs')) {
          features.jobSearch.endpoints.push(endpoint);
          if (endpoint.includes('recommendation')) {
            features.recommendations.endpoints.push(endpoint);
          }
        } else if (endpoint.includes('subscription')) {
          features.subscription.endpoints.push(endpoint);
        } else if (endpoint.includes('ai-hunter')) {
          features.autoApply.endpoints.push(endpoint);
        }
      }
    });
  }

  // Analyze components
  function analyzeComponents() {
    const componentsDir = 'src/components';
    if (!fs.existsSync(componentsDir)) return;

    const components = fs.readdirSync(componentsDir)
      .filter(file => file.includes('.tsx'));

    components.forEach(component => {
      const componentPath = path.join(componentsDir, component);
      const content = fs.readFileSync(componentPath, 'utf8').toLowerCase();

      if (content.includes('auth') || content.includes('sign')) {
        features.authentication.components.push(component);
      }
      if (content.includes('dashboard') || content.includes('pulse') || content.includes('recommendation')) {
        features.dashboard.components.push(component);
      }
      if (content.includes('job') || content.includes('search')) {
        features.jobSearch.components.push(component);
      }
      if (content.includes('application') || content.includes('apply')) {
        features.applications.components.push(component);
      }
      if (content.includes('profile') || content.includes('user')) {
        features.profile.components.push(component);
      }
    });
  }

  // Perform analysis
  analyzeDirectory('src/app');
  analyzeAPIEndpoints();
  analyzeComponents();

  // Assess feature completeness
  function assessFeatureStatus(feature) {
    const fileCount = feature.files.length;
    const endpointCount = feature.endpoints.length;
    const componentCount = feature.components.length;

    if (fileCount > 0 && endpointCount > 0 && componentCount > 0) {
      return 'complete';
    } else if (fileCount > 0 && (endpointCount > 0 || componentCount > 0)) {
      return 'mostly_complete';
    } else if (fileCount > 0 || endpointCount > 0 || componentCount > 0) {
      return 'partial';
    } else {
      return 'missing';
    }
  }

  // Generate detailed report
  Object.keys(features).forEach(featureName => {
    const feature = features[featureName];
    feature.status = assessFeatureStatus(feature);

    console.log(`\n${featureName.toUpperCase()}: ${feature.status.toUpperCase()}`);
    console.log(`  Files: ${feature.files.length}`);
    console.log(`  API Endpoints: ${feature.endpoints.length}`);
    console.log(`  Components: ${feature.components.length}`);

    if (feature.files.length > 0) {
      console.log('  Key files:');
      feature.files.slice(0, 3).forEach(file => {
        console.log(`    - ${file}`);
      });
      if (feature.files.length > 3) {
        console.log(`    ... and ${feature.files.length - 3} more`);
      }
    }

    if (feature.endpoints.length > 0) {
      console.log('  API endpoints:');
      feature.endpoints.forEach(endpoint => {
        console.log(`    - /api/${endpoint}`);
      });
    }

    if (feature.components.length > 0) {
      console.log('  Components:');
      feature.components.forEach(component => {
        console.log(`    - ${component}`);
      });
    }
  });

  // Feature completeness summary
  console.log('\n📊 FEATURE COMPLETENESS SUMMARY:');
  console.log('='.repeat(60));

  let completeFeatures = 0;
  let mostlyCompleteFeatures = 0;
  let partialFeatures = 0;
  let missingFeatures = 0;

  Object.keys(features).forEach(featureName => {
    const status = features[featureName].status;
    switch (status) {
      case 'complete':
        completeFeatures++;
        console.log(`✅ ${featureName}: COMPLETE`);
        break;
      case 'mostly_complete':
        mostlyCompleteFeatures++;
        console.log(`🟡 ${featureName}: MOSTLY COMPLETE`);
        break;
      case 'partial':
        partialFeatures++;
        console.log(`🟠 ${featureName}: PARTIAL`);
        break;
      case 'missing':
        missingFeatures++;
        console.log(`❌ ${featureName}: MISSING`);
        break;
    }
  });

  const totalFeatures = Object.keys(features).length;
  const completenessRate = Math.round(((completeFeatures * 100) + (mostlyCompleteFeatures * 75) + (partialFeatures * 25)) / totalFeatures);

  console.log('\n📈 OVERALL COMPLETENESS: ' + completenessRate + '%');

  // Production readiness assessment
  console.log('\n🎯 PRODUCTION READINESS:');

  if (completenessRate >= 80) {
    console.log('🎉 READY FOR PRODUCTION');
    console.log('   Most features are complete and functional');
  } else if (completenessRate >= 60) {
    console.log('✅ ALMOST READY');
    console.log('   Minor development needed');
  } else if (completenessRate >= 40) {
    console.log('⚠️ NEEDS DEVELOPMENT');
    console.log('   Significant work required');
  } else {
    console.log('❌ NOT READY');
    console.log('   Major development needed');
  }

  // Critical features analysis
  console.log('\n🔥 CRITICAL FEATURES STATUS:');

  const criticalFeatures = ['authentication', 'dashboard', 'jobSearch', 'applications'];
  criticalFeatures.forEach(featureName => {
    const status = features[featureName].status;
    const emoji = status === 'complete' ? '✅' : status === 'mostly_complete' ? '🟡' : '❌';
    console.log(`${emoji} ${featureName}: ${status.replace('_', ' ').toUpperCase()}`);
  });

  return features;
}

// Auto-apply system specific analysis
function analyzeAutoApplySystem() {
  console.log('\n🤖 AUTO-APPLY SYSTEM DEEP DIVE');
  console.log('='.repeat(60));

  const autoApplyFiles = [
    'src/components/JobRecommendations.tsx',
    'src/app/api/user/apply-job/route.ts',
    'src/app/api/ai-hunter/scan/route.ts'
  ];

  let autoAnalysis = {
    hasAutoApplyLogic: false,
    hasProPlanCheck: false,
    hasMatchScoreThreshold: false,
    hasDailyLimit: false,
    hasVisualFeedback: false,
    status: 'unknown'
  };

  autoApplyFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');

      console.log(`\n📄 Analyzing: ${file}`);

      // Check for auto-apply logic
      if (content.includes('autoApply') || content.includes('auto-apply') || content.includes('automated')) {
        autoAnalysis.hasAutoApplyLogic = true;
        console.log('  ✅ Contains auto-apply logic');
      }

      // Check for Pro Plan verification
      if (content.includes('subscription') && content.includes('pro')) {
        autoAnalysis.hasProPlanCheck = true;
        console.log('  ✅ Checks for Pro Plan subscription');
      }

      // Check for match score threshold
      if (content.includes('matchScore') && (content.includes('>= 70') || content.includes('>=70'))) {
        autoAnalysis.hasMatchScoreThreshold = true;
        console.log('  ✅ Uses match score threshold (70%+)');
      }

      // Check for daily limits
      if (content.includes('daily') && (content.includes('limit') || content.includes('quota'))) {
        autoAnalysis.hasDailyLimit = true;
        console.log('  ✅ Implements daily limits');
      }

      // Check for visual feedback
      if (content.includes('Auto Applied') || content.includes('auto-applied') || content.includes('lightning')) {
        autoAnalysis.hasVisualFeedback = true;
        console.log('  ✅ Provides visual feedback');
      }
    } else {
      console.log(`\n❌ File not found: ${file}`);
    }
  });

  // Determine overall status
  const score = Object.values(autoAnalysis).filter(val => val === true).length;
  if (score >= 4) {
    autoAnalysis.status = 'complete';
  } else if (score >= 3) {
    autoAnalysis.status = 'functional';
  } else if (score >= 2) {
    autoAnalysis.status = 'partial';
  } else {
    autoAnalysis.status = 'incomplete';
  }

  console.log(`\n📊 Auto-Apply System Status: ${autoAnalysis.status.toUpperCase()}`);
  console.log(`Score: ${score}/5 components implemented`);

  return autoAnalysis;
}

// Database analysis
function analyzeDatabaseSetup() {
  console.log('\n🗄️ DATABASE SETUP ANALYSIS');
  console.log('='.repeat(60));

  const schemaFile = 'prisma/schema.prisma';
  if (!fs.existsSync(schemaFile)) {
    console.log('❌ Prisma schema not found');
    return null;
  }

  const schema = fs.readFileSync(schemaFile, 'utf8');

  const analysis = {
    hasUserTable: schema.includes('model User'),
    hasJobTable: schema.includes('model Job'),
    hasApplicationTable: schema.includes('model Application'),
    hasSubscriptionTable: schema.includes('model Subscription'),
    hasProfileTable: schema.includes('model Profile'),
    hasUserPreferencesTable: schema.includes('UserPreferences')
  };

  Object.keys(analysis).forEach(key => {
    const status = analysis[key] ? '✅' : '❌';
    const table = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${table}: ${analysis[key] ? 'Present' : 'Missing'}`);
  });

  const score = Object.values(analysis).filter(val => val === true).length;
  console.log(`\n📊 Database Completeness: ${score}/6 tables`);

  return analysis;
}

// Main execution
function runCompleteAnalysis() {
  const featureAnalysis = analyzeFeatureCompleteness();
  const autoApplyAnalysis = analyzeAutoApplySystem();
  const databaseAnalysis = analyzeDatabaseSetup();

  // Final recommendations
  console.log('\n🎯 RECOMMENDATIONS');
  console.log('='.repeat(60));

  console.log('\n1. IMMEDIATE ACTIONS:');
  if (featureAnalysis.authentication.status !== 'complete') {
    console.log('   - Complete authentication system implementation');
  }
  if (featureAnalysis.dashboard.status !== 'complete') {
    console.log('   - Finalize dashboard functionality');
  }
  if (autoApplyAnalysis.status !== 'complete') {
    console.log('   - Complete auto-apply system components');
  }

  console.log('\n2. PRODUCTION PREPARATION:');
  console.log('   - Set up production environment variables');
  console.log('   - Configure production database');
  console.log('   - Set up error monitoring');
  console.log('   - Implement logging and analytics');

  console.log('\n3. TESTING:');
  console.log('   - Manual testing at http://localhost:3000');
  console.log('   - Test all user workflows');
  console.log('   - Verify auto-apply functionality');
  console.log('   - Test subscription features');

  console.log('\n4. DEPLOYMENT:');
  console.log('   - Choose hosting platform (Vercel, Railway, etc.)');
  console.log('   - Set up CI/CD pipeline');
  console.log('   - Configure backup strategies');
  console.log('   - Set up monitoring and alerts');

  console.log('\n✅ ANALYSIS COMPLETE!');
  console.log('Your SaaS job board is ready for the next phase of development.');
}

runCompleteAnalysis();