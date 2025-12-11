import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function enhanceJobDescriptionWithHTML(
  originalDescription: string,
  jobTitle: string = '',
  company: string = '',
  location: string = '',
  salary: string = '',
  jobType: string = ''
): Promise<string> {
  // Enhanced HTML fallback function
  function createHTMLEnhancement(description: string): string {
    const sections: string[] = [];

    // About the Role
    sections.push(`<h2>About the Role</h2>`);

    if (jobTitle) {
      sections.push(`<p>${company || 'Our innovative company'} is looking for a highly skilled and experienced ${jobTitle} to join our growing team. This position is ideal for professionals who are passionate about making a meaningful impact in a dynamic, fast-paced environment.</p>`);
      sections.push(`<p>You will work directly with <em>cross-functional teams</em> to drive innovation and deliver exceptional results. If you are excited about solving complex challenges and contributing to a company that values creativity and collaboration, this role is for you.</p>`);
    } else {
      sections.push(`<p>We are seeking a talented professional to join our innovative team. This role offers the opportunity to make a significant impact while working with cutting-edge technologies and methodologies.</p>`);
      sections.push(`<p>Join us in building solutions that matter and be part of a <em>culture</em> that values innovation, growth, and excellence.</p>`);
    }

    // Key Responsibilities
    sections.push(`<h2>Key Responsibilities</h2>`);
    sections.push(`<ul>`);
    const responsibilities = [
      `<li>Drive innovation and excellence in daily operations and strategic initiatives</li>`,
      `<li>Collaborate effectively with cross-functional teams to achieve project goals</li>`,
      `<li>Contribute to the development and implementation of best practices and methodologies</li>`,
      `<li>Analyze data and insights to inform decision-making and continuous improvement</li>`,
      `<li>Communicate effectively with stakeholders at all levels of the organization</li>`,
      `<li>Stay current with industry trends and emerging technologies relevant to the role</li>`
    ];
    responsibilities.forEach(resp => sections.push(resp));
    sections.push(`</ul>`);

    // Requirements & Qualifications
    sections.push(`<h2>Requirements & Qualifications</h2>`);
    sections.push(`<ul>`);
    const requirements = [
      `<li><strong>${Math.floor(Math.random() * 3) + 3}+ years</strong> of relevant experience in a similar role</li>`,
      `<li><strong>Strong problem-solving skills</strong> and attention to detail</li>`,
      `<li><strong>Excellent communication</strong> and collaboration abilities</li>`,
      `<li>Proven track record of delivering high-quality results</li>`,
      `<li>Ability to adapt to changing priorities and work independently</li>`,
      `<li>Passion for continuous learning and professional development</li>`
    ];
    requirements.forEach(req => sections.push(req));
    sections.push(`</ul>`);

    // What We Offer
    sections.push(`<h2>What We Offer</h2>`);
    sections.push(`<ul>`);
    const benefits = [
      `<li><strong>${salary || 'Competitive salary'}</strong> with performance-based bonuses</li>`,
      `<li>Comprehensive health, dental, and vision insurance plans</li>`,
      `<li>Flexible work arrangements with remote/hybrid options</li>`,
      `<li>Professional development budget for learning opportunities</li>`,
      `<li>Collaborative and inclusive work environment</li>`,
      `<li>Modern office setup with cutting-edge tools and technology</li>`
    ];
    benefits.forEach(benefit => sections.push(benefit));
    sections.push(`</ul>`);

    // Why Join
    sections.push(`<h2>Why Join ${company || 'Our Company'}</h2>`);
    sections.push(`<p>${company || 'Our company'} is a fast-growing organization dedicated to innovation and excellence. Here, your ideas matter, and your contributions will have a real impact on our success and growth.</p>`);
    sections.push(`<p>You'll join a talented and supportive <em>team</em> where creativity, collaboration, and continuous improvement drive everything we do. This is your opportunity to build something meaningful while advancing your career in a dynamic environment.</p>`);

    return sections.join('\n');
  }

  // Create comprehensive job context
  const isSalaryMissing = !salary || salary === '0' || salary === '$0' || salary.toLowerCase() === 'competitive';

  const jobContext = `
Job Title: ${jobTitle || 'Senior Professional'}
Company: ${company || 'Innovative Tech Company'}
Location: ${location || 'Remote/Hybrid'}
Salary: ${isSalaryMissing ? 'MISSING - PLEASE ESTIMATE BASED ON MARKET RATE' : salary}
Employment Type: ${jobType || 'Full-Time'}
  `.trim();

  const prompt = `You are an expert job description writer for a leading tech recruitment platform. Transform this job description into a comprehensive, professional, and engaging job posting that attracts top talent.

Job Context:
${jobContext}

Original Description:
${originalDescription}

Create a detailed, professional job description using DIRECT HTML tags (NOT markdown). Return ONLY HTML content ready to be displayed in a web page.

EXACT HTML STRUCTURE REQUIRED:

<h2>About the Role</h2>
<p>[Write 2-3 compelling paragraphs about the position, company mission, and impact. Make it engaging and professional. Include what makes this role exciting and meaningful.]</p>

<h2>Key Responsibilities</h2>
<ul>
  <li>Design end-to-end user experiences for web and mobile products</li>
  <li>Create wireframes, prototypes, user flows, and high-fidelity UI</li>
  <li>Conduct user research, interviews, and usability testing</li>
  <li>Collaborate closely with Product Managers and Engineers</li>
  <li>Develop, maintain, and scale our Design System</li>
  <li>Ensure accessibility and usability best practices across the product</li>
</ul>

<h2>Requirements & Qualifications</h2>
<ul>
  <li><strong>4+ years</strong> of experience as a Product Designer or UI/UX Designer</li>
  <li><strong>Strong portfolio</strong> demonstrating UI/UX work, process, and outcomes</li>
  <li><strong>Expert-level proficiency</strong> in Figma and prototyping tools</li>
  <li>Ability to conduct user research and apply insights effectively</li>
  <li><strong>Strong understanding</strong> of modern design systems and usability patterns</li>
  <li>Excellent communication, collaboration, and problem-solving skills</li>
  <li>Ability to work in a fast-paced agile environment</li>
</ul>

<h2>What We Offer</h2>
<ul>
  <li><strong>${isSalaryMissing ? '[ESTIMATED SALARY RANGE IN USD]: $XX,XXX - $XX,XXX' : salary}</strong> + yearly performance bonuses</li>
  <li>Health, dental, and vision insurance plans</li>
  <li><strong>20 days paid vacation</strong> + company holidays</li>
  <li>Hybrid work environment (2–3 days in-office)</li>
  <li>Annual learning and development budget</li>
  <li>Modern office setup, ergonomic equipment, and creative workspace</li>
</ul>

<h2>Why Join ${company || 'Our Company'}</h2>
<p>${company || 'Our company'} is a fast-growing company dedicated to building innovative solutions. Your ideas matter, and you'll join a talented and supportive team where creativity, experimentation, and innovation drive everything we do.</p>

<p>This is your opportunity to design meaningful products that impact the daily workflow of thousands of users across the country. We offer competitive compensation, excellent benefits, and a collaborative environment where your voice is heard and your contributions make a real difference.</p>

CRITICAL REQUIREMENTS:
1. **Pure HTML Only**: Use actual HTML tags (<h1>, <h2>, <h3>, <h4>, <ul>, <li>, <strong>, <em>, <p>)
2. **NO Markdown**: Do NOT use #, ##, ### or * for formatting
3. **SALARY ESTIMATION**: If the provided salary is "MISSING" or empty, you MUST estimate a competitive market salary range in USD ($) for this role and location based on 2025 standards. NEVER leave it as "Competitive" or "$0". Example: "$120,000 - $150,000".
4. **Professional Content**: Each section should be substantive and detailed
5. **Specific Details**: Include concrete information about the role and company
6. **Modern Language**: Use inclusive, professional, engaging language
7. **Real Company Feel**: Make it sound like an actual professional job posting
8. **Complete Information**: Include salary, benefits, location details if available

Requirements:
- Use <h2> for main section headers
- Use <ul> and <li> for all bulleted lists
- Use <strong> for important terms like years of experience, key skills
- Use <em> for company culture mentions like team, culture, growth
- Use <p> for all paragraph text
- Make each bullet point detailed and action-oriented
- Include specific numbers, technologies, and expectations where appropriate

Return ONLY the HTML content with proper opening and closing tags. No explanations, no markdown, just clean HTML ready for web display.`;

  const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
  let lastError = null;

  // Validate API key
  if (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY.includes('your_api_key_here')) {
    console.warn('Google AI API key not found or invalid, using HTML fallback enhancement');
    return createHTMLEnhancement(originalDescription);
  }

  // Try models in order of preference with rate limiting
  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}`);

      // Add delay to respect rate limits
      if (modelName === "gemini-2.0-flash") {
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else if (modelName === "gemini-2.0-flash-lite") {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = response.text();

      if (!enhancedText || enhancedText.trim().length < 50) {
        console.warn(`Model ${modelName} returned empty or too short result`);
        continue;
      }

      // Clean up the response by removing any code block markers
      let cleanHTML = enhancedText;

      // Remove ```html and ``` markers if present
      if (cleanHTML.includes('```html')) {
        cleanHTML = cleanHTML.replace(/```html\s*/g, '');
      }
      if (cleanHTML.includes('```')) {
        cleanHTML = cleanHTML.replace(/```\s*$/g, '');
      }

      // Remove any other common AI response wrappers
      cleanHTML = cleanHTML.replace(/^Here's the HTML job description:\s*/i, '');
      cleanHTML = cleanHTML.replace(/^HTML:\s*/i, '');

      // Verify it's HTML and contains no markdown
      const hasHTML = cleanHTML.includes('<h2>') || cleanHTML.includes('<ul>') || cleanHTML.includes('<p>');
      const hasMarkdown = cleanHTML.includes('###') || cleanHTML.includes('**') || cleanHTML.includes('* ');

      if (hasHTML && !hasMarkdown && cleanHTML.trim().length > 50) {
        console.log(`✅ Successfully enhanced with model: ${modelName}`);
        return cleanHTML.trim();
      } else {
        console.warn(`Model ${modelName} returned invalid format (markdown detected or too short)`);
        console.warn(`HTML detected: ${hasHTML}, Markdown detected: ${hasMarkdown}, Length: ${cleanHTML.trim().length}`);
        continue;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Model ${modelName} failed:`, errorMessage);
      lastError = error instanceof Error ? error : new Error(errorMessage);
      continue;
    }
  }

  // All models failed - use HTML fallback enhancement
  console.error('All AI models failed, using HTML fallback enhancement');
  if (lastError instanceof Error) {
    if (lastError.message.includes('API key') || lastError.message.includes('403')) {
      console.error('Google AI API key issue - using HTML fallback enhancement');
    }
  }

  return createHTMLEnhancement(originalDescription);
}