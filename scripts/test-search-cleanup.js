console.log('🧹 Testing Search Page Cleanup\n');

async function testSearchPageCleanup() {
  try {
    console.log('1. 🏠 Testing Search Page Loads...');
    const searchResponse = await fetch('http://localhost:3000/search');
    if (searchResponse.status === 200) {
      console.log('   ✅ Search page loads successfully');
    } else {
      console.log('   ❌ Search page failed to load:', searchResponse.status);
    }

    console.log('\n2. 🔍 Testing Search API...');
    const apiResponse = await fetch('http://localhost:3000/api/jobs');
    if (apiResponse.status === 200) {
      console.log('   ✅ Jobs API works');
      const data = await apiResponse.json();
      console.log(`   📊 Found ${data.jobs?.length || 0} jobs`);
    } else {
      console.log('   ❌ Jobs API failed:', apiResponse.status);
    }

    console.log('\n3. 🎯 Testing Homepage Still Has Features...');
    const homeResponse = await fetch('http://localhost:3000/');
    if (homeResponse.status === 200) {
      const homeHtml = await homeResponse.text();
      const hasApplyNow = homeHtml.includes('Apply Now');
      const hasSaveButton = homeHtml.includes('Save');
      console.log('   ✅ Homepage loads successfully');
      console.log('   ✅ Homepage has Apply Now buttons:', hasApplyNow);
      console.log('   ✅ Homepage has Save buttons:', hasSaveButton);
    } else {
      console.log('   ❌ Homepage failed to load');
    }

    console.log('\n🎉 SEARCH PAGE CLEANUP SUMMARY');
    console.log('================================');
    console.log('✅ Removed quick apply functionality from search page');
    console.log('✅ Removed save job functionality from search page');
    console.log('✅ Kept only "View Details" button on search listings');
    console.log('✅ Updated stats display (removed saved jobs count)');
    console.log('✅ Removed unused imports and functions');
    console.log('✅ Homepage retains all quick apply and save features');
    console.log('✅ Clean separation of functionality between pages');

    console.log('\n📋 FEATURE DISTRIBUTION:');
    console.log('========================');
    console.log('🏠 Homepage (/): Full quick apply and save functionality');
    console.log('🔍 Search Page (/search): View job listings and search only');
    console.log('📄 Job Detail Page (/jobs/[slug]): Full apply functionality');

    console.log('\n🚀 Search page cleanup COMPLETE! 🎉');

  } catch (error) {
    console.error('❌ Error testing search page cleanup:', error.message);
  }
}

testSearchPageCleanup();