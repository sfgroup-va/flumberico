const { enhanceJobDescription } = require("../src/lib/google-ai.ts");

async function testHTMLEnhancement() {
  console.log("🧪 Testing HTML Enhancement System...");

  try {
    const testJob = {
      title: "Senior Product Designer",
      companyName: "ApexFlow Technologies",
      location: "San Francisco, California",
      description: "Looking for an experienced product designer to join our design team. Need someone who can create user-centered digital experiences and work with product managers and engineers.",
      salary: 84000,
      type: "Full-Time",
      locationType: "Hybrid"
    };

    console.log(`📝 Testing: ${testJob.title} at ${testJob.companyName}`);

    const enhancedDescription = await enhanceJobDescription(
      testJob.description,
      testJob.title,
      testJob.companyName,
      testJob.location,
      `$${(testJob.salary/12).toLocaleString()}/month`,
      testJob.type
    );

    console.log("✅ Enhancement completed!\n");
    console.log("📄 ENHANCED HTML OUTPUT:");
    console.log("=" .repeat(80));
    console.log(enhancedDescription);
    console.log("=" .repeat(80));
    console.log("\n");

    // Check for HTML structure
    const hasH2 = enhancedDescription.includes('<h2>');
    const hasH3 = enhancedDescription.includes('<h3>');
    const hasUL = enhancedDescription.includes('<ul>');
    const hasLI = enhancedDescription.includes('<li>');
    const hasStrong = enhancedDescription.includes('<strong>');
    const hasEm = enhancedDescription.includes('<em>');
    const hasP = enhancedDescription.includes('<p>');

    // Check that NO markdown exists
    const hasMarkdownHeaders = enhancedDescription.includes('###');
    const hasMarkdownBold = enhancedDescription.includes('**');
    const hasMarkdownItalic = enhancedDescription.includes('* ');

    console.log("🔍 HTML Structure Analysis:");
    console.log(`• Has H2 tags: ${hasH2 ? '✅' : '❌'}`);
    console.log(`• Has UL lists: ${hasUL ? '✅' : '❌'}`);
    console.log(`• Has LI items: ${hasLI ? '✅' : '❌'}`);
    console.log(`• Has STRONG tags: ${hasStrong ? '✅' : '❌'}`);
    console.log(`• Has EM tags: ${hasEm ? '✅' : '❌'}`);
    console.log(`• Has P tags: ${hasP ? '✅' : '❌'}`);
    console.log(`• No markdown headers: ${!hasMarkdownHeaders ? '✅' : '❌'}`);
    console.log(`• No markdown bold: ${!hasMarkdownBold ? '✅' : '❌'}`);
    console.log(`• No markdown italic: ${!hasMarkdownItalic ? '✅' : '❌'}`);

    const htmlScore = [hasH2, hasUL, hasLI, hasStrong, hasEm, hasP].filter(Boolean).length;
    const markdownFree = [!hasMarkdownHeaders, !hasMarkdownBold, !hasMarkdownItalic].filter(Boolean).length;

    console.log(`\n🎯 HTML Quality Score: ${htmlScore}/6`);
    console.log(`🎯 Markdown-Free Score: ${markdownFree}/3`);
    console.log(`🎯 Overall Score: ${Math.round(((htmlScore + markdownFree) / 9) * 100)}%`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testHTMLEnhancement();