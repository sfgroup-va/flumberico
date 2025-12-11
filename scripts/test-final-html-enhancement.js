const { enhanceJobDescriptionWithHTML } = require("../src/lib/google-ai-html-enhanced.ts");

async function testFinalHTMLEnhancement() {
  console.log("🧪 Testing Final HTML Enhancement System...");

  try {
    const testJob = {
      title: "Senior Product Designer",
      companyName: "ApexFlow Technologies",
      location: "San Francisco, California",
      description: "Looking for an experienced product designer to join our design team. Need someone who can create user-centered digital experiences and work with product managers and engineers.",
      salary: "$7,000/month",
      type: "Full-Time",
      locationType: "Hybrid"
    };

    console.log(`📝 Testing: ${testJob.title} at ${testJob.companyName}`);
    console.log(`💰 Salary: ${testJob.salary}`);
    console.log(`📍 Location: ${testJob.location} (${testJob.locationType})\n`);

    const enhancedDescription = await enhanceJobDescriptionWithHTML(
      testJob.description,
      testJob.title,
      testJob.companyName,
      testJob.location,
      testJob.salary,
      testJob.type
    );

    console.log("✅ Enhancement completed!\n");
    console.log("📄 FINAL HTML OUTPUT:");
    console.log("=" .repeat(80));
    console.log(enhancedDescription);
    console.log("=" .repeat(80));
    console.log("\n");

    // Comprehensive HTML structure validation
    const validation = {
      hasH2: enhancedDescription.includes('<h2>'),
      hasUL: enhancedDescription.includes('<ul>'),
      hasLI: enhancedDescription.includes('<li>'),
      hasStrong: enhancedDescription.includes('<strong>'),
      hasEm: enhancedDescription.includes('<em>'),
      hasP: enhancedDescription.includes('<p>'),
      hasClosingTags: enhancedDescription.includes('</ul>') && enhancedDescription.includes('</h2>') && enhancedDescription.includes('</p>'),
      noMarkdownHeaders: !enhancedDescription.includes('###'),
      noMarkdownBold: !enhancedDescription.includes('**'),
      noMarkdownItalic: !enhancedDescription.includes('* '),
      hasSalaryInfo: enhancedDescription.includes('7,000') || enhancedDescription.includes('Competitive'),
      hasCompanyInfo: enhancedDescription.includes('ApexFlow'),
      hasAllSections: enhancedDescription.includes('About the Role') &&
                   enhancedDescription.includes('Key Responsibilities') &&
                   enhancedDescription.includes('Requirements & Qualifications') &&
                   enhancedDescription.includes('What We Offer') &&
                   enhancedDescription.includes('Why Join')
    };

    console.log("🔍 HTML Structure Validation:");
    console.log(`• Has H2 headers: ${validation.hasH2 ? '✅' : '❌'}`);
    console.log(`• Has UL lists: ${validation.hasUL ? '✅' : '❌'}`);
    console.log(`• Has LI items: ${validation.hasLI ? '✅' : '❌'}`);
    console.log(`• Has STRONG tags: ${validation.hasStrong ? '✅' : '❌'}`);
    console.log(`• Has EM tags: ${validation.hasEm ? '✅' : '❌'}`);
    console.log(`• Has P tags: ${validation.hasP ? '✅' : '❌'}`);
    console.log(`• Has closing tags: ${validation.hasClosingTags ? '✅' : '❌'}`);
    console.log(`• No markdown headers: ${validation.noMarkdownHeaders ? '✅' : '❌'}`);
    console.log(`• No markdown bold: ${validation.noMarkdownBold ? '✅' : '❌'}`);
    console.log(`• No markdown italic: ${validation.noMarkdownItalic ? '✅' : '❌'}`);
    console.log(`• Includes salary info: ${validation.hasSalaryInfo ? '✅' : '❌'}`);
    console.log(`• Includes company info: ${validation.hasCompanyInfo ? '✅' : '❌'}`);
    console.log(`• Has all 5 sections: ${validation.hasAllSections ? '✅' : '❌'}`);

    const htmlScore = [validation.hasH2, validation.hasUL, validation.hasLI, validation.hasStrong, validation.hasEm, validation.hasP, validation.hasClosingTags].filter(Boolean).length;
    const markdownFreeScore = [validation.noMarkdownHeaders, validation.noMarkdownBold, validation.noMarkdownItalic].filter(Boolean).length;
    const contentScore = [validation.hasSalaryInfo, validation.hasCompanyInfo, validation.hasAllSections].filter(Boolean).length;

    console.log(`\n📊 Quality Scores:`);
    console.log(`• HTML Structure: ${htmlScore}/7`);
    console.log(`• Markdown-Free: ${markdownFreeScore}/3`);
    console.log(`• Content Quality: ${contentScore}/3`);
    console.log(`• Overall Score: ${Math.round(((htmlScore + markdownFreeScore + contentScore) / 13) * 100)}%`);

    if (htmlScore >= 6 && markdownFreeScore === 3 && contentScore >= 2) {
      console.log(`\n🎉 EXCELLENT! HTML enhancement system is working perfectly!`);
      console.log(`   ✅ Professional HTML structure`);
      console.log(`   ✅ No markdown contamination`);
      console.log(`   ✅ Rich, detailed content`);
    } else if (htmlScore >= 4 && markdownFreeScore >= 2) {
      console.log(`\n✅ GOOD! HTML enhancement system is functional.`);
    } else {
      console.log(`\n⚠️ NEEDS IMPROVEMENT - Check HTML enhancement logic.`);
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testFinalHTMLEnhancement();