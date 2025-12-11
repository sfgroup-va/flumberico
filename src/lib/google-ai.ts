import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function enhanceJobDescription(
  originalDescription: string,
  jobTitle: string = '',
  company: string = '',
  location: string = '',
  salary: string = '',
  jobType: string = ''
): Promise<string> {
  // Fallback enhancement if AI fails
  function createFallbackEnhancement(description: string): string {
    // Clean and format the description with consistent structure
    const cleanDescription = description
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .trim();

    const sections: string[] = [];

    // Enhanced HTML About the Role section
    sections.push(`<h2>About the Role</h2>`);

    // Create compelling opening
    if (jobTitle) {
      sections.push(`<p>${company || 'Our innovative company'} is looking for a highly skilled and experienced ${jobTitle} to join our growing team. This position is ideal for professionals who are passionate about making a meaningful impact in a dynamic, fast-paced environment.</p>`);

      sections.push(`<p>You will work directly with <em>cross-functional teams</em> to drive innovation and deliver exceptional results. If you are excited about solving complex challenges and contributing to a company that values creativity and collaboration, this role is for you.</p>`);
    } else {
      sections.push(`<p>We are seeking a talented professional to join our innovative team. This role offers the opportunity to make a significant impact while working with cutting-edge technologies and methodologies.</p>`);
      sections.push(`<p>Join us in building solutions that matter and be part of a <em>culture</em> that values innovation, growth, and excellence.</p>`);
    }

    // Enhanced Key Responsibilities section
    sections.push(`\n### Key Responsibilities`);

    const defaultResponsibilities = [
      `Drive innovation and excellence in daily operations and strategic initiatives`,
      `Collaborate effectively with cross-functional teams to achieve project goals`,
      `Contribute to the development and implementation of best practices and methodologies`,
      `Analyze data and insights to inform decision-making and continuous improvement`,
      `Communicate effectively with stakeholders at all levels of the organization`,
      `Stay current with industry trends and emerging technologies relevant to the role`
    ];

    // Try to extract actual responsibilities from the description
    const responsibilitiesMatch = cleanDescription.match(/(?:responsibilities|duties|what you'll do)[\s:]*([^]+?)(?=(?:requirements|qualifications|skills|must have|benefits|what we offer|$))/i);
    let responsibilities: string[] = [];

    if (responsibilitiesMatch) {
      responsibilities = responsibilitiesMatch[1]
        .split(/[,;\n]/)
        .map(item => item.trim())
        .filter(item => item.length > 10 && !item.match(/^(?:requirements|qualifications|skills|benefits)/i))
        .slice(0, 6); // Limit to 6 responsibilities
    }

    // Use extracted responsibilities or defaults
    const finalResponsibilities = responsibilities.length > 0 ? responsibilities : defaultResponsibilities;
    finalResponsibilities.forEach(resp => {
      sections.push(`• ${resp.charAt(0).toUpperCase() + resp.slice(1).replace(/[.]+$/, '')}`);
    });

    // Enhanced Requirements & Qualifications section
    sections.push(`\n### Requirements & Qualifications`);

    const defaultRequirements = [
      `${Math.floor(Math.random() * 3) + 3}+ years of relevant experience in a similar role`,
      `Strong problem-solving skills and attention to detail`,
      `Excellent communication and collaboration abilities`,
      `Proven track record of delivering high-quality results`,
      `Ability to adapt to changing priorities and work independently`,
      `Passion for continuous learning and professional development`
    ];

    // Try to extract actual requirements from the description
    const requirementsMatch = cleanDescription.match(/(?:requirements|qualifications|skills|must have|what you'll need)[\s:]*([^]+?)(?=(?:benefits|what we offer|nice to have|plus|$))/i);
    let requirements: string[] = [];

    if (requirementsMatch) {
      requirements = requirementsMatch[1]
        .split(/[,;\n]/)
        .map(item => item.trim())
        .filter(item => item.length > 10 && !item.match(/^(?:benefits|what we offer|nice to have)/i))
        .slice(0, 6); // Limit to 6 requirements
    }

    // Use extracted requirements or enhanced defaults
    const finalRequirements = requirements.length > 0 ? requirements : defaultRequirements;
    finalRequirements.forEach(req => {
      sections.push(`• ${req.charAt(0).toUpperCase() + req.slice(1).replace(/[.]+$/, '')}`);
    });

    // Enhanced What We Offer section
    sections.push(`\n### What We Offer`);

    const benefits = [
      `${salary || 'Competitive salary'} with performance-based bonuses`,
      `Comprehensive health, dental, and vision insurance plans`,
      `Flexible work arrangements with remote/hybrid options`,
      `Professional development budget and learning opportunities`,
      `Collaborative and inclusive work environment`,
      `Modern office setup with cutting-edge tools and technology`
    ];

    benefits.forEach(benefit => {
      sections.push(`• ${benefit}`);
    });

    // Enhanced Why Join section
    sections.push(`\n### Why Join ${company || 'Our Company'}`);
    sections.push(`${company || 'Our company'} is a fast-growing organization dedicated to innovation and excellence. Here, your ideas matter, and your contributions will have a real impact on our success and growth.`);

    sections.push(`\nYou'll join a talented and supportive team where creativity, collaboration, and continuous improvement drive everything we do. This is your opportunity to build something meaningful while advancing your career in a dynamic environment.`);

    return sections.join('\n').trim();
  }

  function isHeaderLine(line: string): boolean {
    const lowerLine = line.toLowerCase().trim();
    const headerKeywords = [
      'about', 'job description', 'requirements', 'responsibilities',
      'qualifications', 'benefits', 'skills', 'experience', 'education',
      'what we offer', 'position', 'role', 'location', 'salary', 'company'
    ];
    return headerKeywords.some(keyword => lowerLine.includes(keyword)) ||
           lowerLine.endsWith(':') ||
           line.length < 50 && !line.includes('.');
  }

  function normalizeAIResponse(text: string): string {
    return text
      // Fix inconsistent headers
      .replace(/^#{1,2}\s*/gm, '### ')
      // Remove excessive formatting
      .replace(/\*\*(.*?)\*\*/g, (match, content) => {
        // Only bold important terms
        const importantTerms = ['required', 'essential', 'must have', 'key', 'critical'];
        return importantTerms.some(term => content.toLowerCase().includes(term)) ? match : content;
      })
      // Fix excessive italics
      .replace(/\*(.*?)\*/g, (match, content) => {
        const cultureWords = ['culture', 'team', 'grow', 'opportunity', 'support'];
        return cultureWords.some(word => content.toLowerCase().includes(word)) ? match : content;
      })
      // Normalize bullet points
      .replace(/^[-*]\s*/gm, '• ')
      // Fix spacing issues
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
  let lastError = null;

  // Validate API key
  if (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY.includes('your_api_key_here')) {
    console.warn('Google AI API key not found or invalid, using fallback enhancement');
    return createFallbackEnhancement(originalDescription);
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

      // Create comprehensive job context
    const jobContext = `
Job Title: ${jobTitle || 'Senior Professional'}
Company: ${company || 'Innovative Tech Company'}
Location: ${location || 'Remote/Hybrid'}
Salary: ${salary || 'Competitive'}
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
  <li><strong>Competitive monthly salary</strong> + yearly performance bonuses</li>
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
3. **Professional Content**: Each section should be substantive and detailed
4. **Specific Details**: Include concrete information about the role and company
5. **Modern Language**: Use inclusive, professional, engaging language
6. **Real Company Feel**: Make it sound like an actual professional job posting
7. **Complete Information**: Include salary, benefits, location details if available

Requirements:
- Use <h2> for main section headers
- Use <ul> and <li> for all bulleted lists
- Use <strong> for important terms like years of experience, key skills
- Use <em> for company culture mentions like team, culture, growth
- Use <p> for all paragraph text
- Make each bullet point detailed and action-oriented
- Include specific numbers, technologies, and expectations where appropriate

Return ONLY the HTML content with proper opening and closing tags. No explanations, no markdown, just clean HTML ready for web display.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = response.text();

      if (!enhancedText || enhancedText.trim().length < 50) {
        console.warn(`Model ${modelName} returned empty or too short result`);
        continue;
      }

      console.log(`✅ Successfully enhanced with model: ${modelName}`);
      return normalizeAIResponse(enhancedText.trim());

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Model ${modelName} failed:`, errorMessage);
      lastError = error instanceof Error ? error : new Error(errorMessage);
      continue;
    }
  }

  // All models failed - use fallback enhancement
  console.error('All AI models failed, using fallback enhancement');
  if (lastError instanceof Error) {
    if (lastError.message.includes('API key') || lastError.message.includes('403')) {
      console.error('Google AI API key issue - using fallback enhancement');
    }
  }

  return createFallbackEnhancement(originalDescription);
}