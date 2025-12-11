#!/usr/bin/env node

// Test script to verify AI enhancement functionality
require('dotenv').config({ path: '.env' });

const { enhanceJobDescription } = require('../src/lib/google-ai.ts');

async function testAIEnhancement() {
  console.log('🚀 Testing AI Job Description Enhancement...\n');

  const testDescription = `We are looking for a Senior Frontend Developer to join our team.
You will work on React applications and collaborate with designers.
Requirements: 5+ years experience, React, TypeScript, CSS.
Salary: $100k-$120k. Remote work possible.`;

  try {
    console.log('📝 Original Description:');
    console.log(testDescription);
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('✨ Enhancing with AI...');
    const enhanced = await enhanceJobDescription(testDescription);

    console.log('🎯 Enhanced Description:');
    console.log(enhanced);
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('✅ AI Enhancement Test Passed!');
    console.log(`📊 Original length: ${testDescription.length} characters`);
    console.log(`📊 Enhanced length: ${enhanced.length} characters`);
    console.log(`📈 Length increase: ${((enhanced.length - testDescription.length) / testDescription.length * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ AI Enhancement Test Failed:', error.message);

    if (error.message.includes('404')) {
      console.log('\n💡 Solution: Check if the Google AI model name is correct.');
      console.log('   Current models: gemini-2.0-flash, gemini-2.0-flash-lite, gemini-1.5-flash (fallback)');
      console.log('   Available models: gemini-2.0-flash, gemini-2.5-flash, gemini-2.0-flash-lite');
    }

    if (error.message.includes('API key')) {
      console.log('\n💡 Solution: Check if GOOGLE_AI_API_KEY is set in .env file');
    }
  }
}

// Test API key validation
function testAPIKey() {
  console.log('🔑 Checking API Key Configuration...\n');

  if (!process.env.GOOGLE_AI_API_KEY) {
    console.log('❌ GOOGLE_AI_API_KEY not found in environment variables');
    console.log('💡 Solution: Add GOOGLE_AI_API_KEY to your .env file');
    return false;
  }

  if (process.env.GOOGLE_AI_API_KEY === 'AIzaSyBezoJ90G3uI8F8ze7ypZJbzHFKYP3A06A') {
    console.log('⚠️  Using default/example API key');
    console.log('💡 Solution: Replace with your actual Google AI API key');
    return false;
  }

  console.log('✅ API key found and appears to be custom');
  return true;
}

// Run tests
async function runTests() {
  console.log('🧪 Google AI Enhancement Test Suite');
  console.log('=====================================\n');

  const hasValidKey = testAPIKey();

  if (hasValidKey) {
    await testAIEnhancement();
  } else {
    console.log('\n⏭️  Skipping AI enhancement test due to API key issues');
  }

  console.log('\n🏁 Test Suite Complete');
}

runTests().catch(console.error);