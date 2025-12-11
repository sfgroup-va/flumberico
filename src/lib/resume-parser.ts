
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export interface ParsedResume {
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  achievements?: string[];
  summary: string;
  totalExperience: number; // in years
}

export async function parseResumeWithAI(resumeText: string): Promise<ParsedResume> {
  try {
    console.log('========================================');
    console.log('📄 RESUME PARSING STARTED');
    console.log('========================================');
    console.log('Resume text length:', resumeText.length);
    console.log('Resume preview (first 500 chars):', resumeText.substring(0, 500));
    console.log('----------------------------------------');

    // Try AI-powered parsing first
    try {
      // Validate API key
      if (!process.env.GOOGLE_AI_API_KEY) {
        console.warn('⚠️ Google AI API key not found, using basic parsing');
        throw new Error('No API key');
      }

      console.log('🤖 Starting AI-powered parsing with Gemini...');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = createResumeParsingPrompt(resumeText);

      console.log('📤 Sending request to Gemini API...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResult = response.text();

      console.log('📥 Received AI response');
      console.log('AI response length:', aiResult.length);
      console.log('AI response preview:', aiResult.substring(0, 300));
      console.log('----------------------------------------');

      // Parse the AI response
      const parsed = parseAIResumeResponse(aiResult);
      if (parsed) {
        console.log('✅ AI PARSING SUCCESSFUL!');
        console.log('Extracted data:');
        console.log('- Skills:', parsed.skills.length, 'items');
        console.log('- Experience:', parsed.experience.length, 'entries');
        console.log('- Education:', parsed.education.length, 'entries');
        console.log('- Total Experience:', parsed.totalExperience, 'years');
        console.log('- Summary length:', parsed.summary.length, 'chars');
        console.log('========================================');
        return parsed;
      } else {
        console.warn('⚠️ AI response could not be parsed, trying fallback...');
      }
    } catch (aiError) {
      console.error('❌ AI parsing failed:', aiError);
      console.error('Error details:', aiError instanceof Error ? aiError.message : 'Unknown error');
      console.log('🔄 Falling back to basic extraction...');
    }

    // Fallback to basic parsing
    console.log('📊 Using enhanced basic extraction...');
    const skills = extractSkills(resumeText);
    const experience = extractExperience(resumeText);
    const education = extractEducation(resumeText);
    const totalExperience = calculateTotalExperience(experience);
    const summary = generateBasicSummary(resumeText, skills, totalExperience);

    console.log('✅ BASIC PARSING COMPLETED');
    console.log('Extracted data:');
    console.log('- Skills:', skills.length, 'items:', skills.slice(0, 10).join(', '));
    console.log('- Experience:', experience.length, 'entries');
    console.log('- Education:', education.length, 'entries');
    console.log('- Total Experience:', totalExperience, 'years');
    console.log('========================================');

    return {
      skills,
      experience,
      education,
      summary,
      totalExperience
    };

  } catch (error) {
    console.error('❌ CRITICAL ERROR in parseResumeWithAI:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return {
      skills: [],
      experience: [],
      education: [],
      summary: "Error processing resume. Please try again or contact support.",
      totalExperience: 0
    };
  }
}

/**
 * Create AI prompt for resume parsing with SEO optimization
 */
export async function optimizeProfessionalSummary(
  originalSummary: string,
  parsedResume: ParsedResume
): Promise<string> {
  try {
    // Use AI to generate an optimized summary
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.warn('Google AI API key not found, using basic optimization');
      const skillsText = parsedResume.skills.slice(0, 5).join(', ');
      return `Experienced professional with ${parsedResume.totalExperience} years of experience in ${skillsText}. Proven track record of success in ${parsedResume.experience[0]?.title || 'relevant roles'}. Dedicated to delivering high-quality results and continuous improvement.`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build context from parsed resume
    const topSkills = parsedResume.skills.slice(0, 8).join(', ');
    const experienceContext = parsedResume.experience.map(exp =>
      `${exp.title} at ${exp.company} (${exp.duration})`
    ).join('; ');

    const prompt = `You are an expert career coach and ATS optimization specialist. Write ONE professional summary for a resume.

CANDIDATE INFORMATION:
- Skills: ${topSkills}
- Experience: ${parsedResume.totalExperience} years
- Work History: ${experienceContext}
- Education: ${parsedResume.education.map(e => `${e.degree} from ${e.institution}`).join('; ')}
${parsedResume.achievements && parsedResume.achievements.length > 0 ? `- Key Achievements: ${parsedResume.achievements.slice(0, 3).join('; ')}` : ''}

REQUIREMENTS:
1. Write EXACTLY ONE professional summary (not multiple options)
2. Length: 3-4 sentences maximum
3. Use strong action verbs (developed, architected, led, implemented, designed)
4. Highlight quantifiable achievements when possible
5. Include top technical skills naturally
6. Make it ATS-friendly with relevant keywords
7. Focus on the candidate's actual experience level (${parsedResume.totalExperience} years)
8. Write in ENGLISH only, regardless of original language
9. DO NOT include any headers, labels, or formatting - just the summary text
10. DO NOT say "Here are options" or provide multiple versions
11. Make it compelling and professional

OUTPUT FORMAT:
Return ONLY the summary text itself, nothing else. No markdown, no headers, no options.

Professional Summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let summary = response.text().trim();

    // Clean up the response - remove any markdown, headers, or multiple options
    summary = summary
      .replace(/\*\*.*?\*\*/g, '') // Remove bold markdown
      .replace(/^#+\s+.*$/gm, '') // Remove headers
      .replace(/^>+\s+/gm, '') // Remove blockquotes
      .replace(/^\*\s+/gm, '') // Remove bullet points
      .replace(/Option \d+.*?:/gi, '') // Remove "Option 1:", etc
      .replace(/\(Focus on.*?\)/gi, '') // Remove focus descriptions
      .split('\n\n')[0] // Take only first paragraph
      .trim();

    // If still too long or contains multiple paragraphs, take first 3-4 sentences
    const sentences = summary.split(/[.!?]+\s+/);
    if (sentences.length > 4) {
      summary = sentences.slice(0, 4).join('. ') + '.';
    }

    return summary;
  } catch (error) {
    console.error('Error optimizing summary:', error);
    return originalSummary;
  }
}

/**
 * Create AI prompt for resume parsing with comprehensive extraction
 */
function createResumeParsingPrompt(resumeText: string): string {
  return `You are an expert resume analyzer and career coach with deep knowledge of the tech industry and recruitment. Parse this resume and extract ALL relevant information for optimal job matching.

RESUME TEXT:
${resumeText}

CRITICAL EXTRACTION REQUIREMENTS:

1. **ALL TECHNICAL SKILLS** - EXTRACT EVERY SINGLE SKILL MENTIONED:
   - Programming Languages: Java, Python, C++, JavaScript, TypeScript, PHP, Ruby, etc.
   - Web Technologies: HTML, CSS, React, Vue, Angular, Node.js, etc.
   - Databases: MySQL, PostgreSQL, MongoDB, Redis, etc.
   - Tools & Software: Git, Visual Studio Code, MySQL Workbench, Jupyter Notebook, Docker, etc.
   - Libraries & Frameworks: Pandas, NumPy, React, Laravel, CodeIgniter, etc.
   - Other Skills: AI, Machine Learning, SEO, SEM, Digital Marketing, etc.
   - DO NOT SKIP ANY SKILL - Include ALL skills mentioned in the resume
   - Look in sections: KEAHLIAN, SKILLS, Hard Skills, Software Skills, Technical Skills

2. **ALL PROFESSIONAL EXPERIENCE** - EXTRACT EVERY SINGLE POSITION:
   - CRITICAL: Each job/internship/organization role MUST be a SEPARATE entry
   - For Indonesian resumes, look for sections: PENGALAMAN KERJA, RIWAYAT ORGANISASI, PENGALAMAN
   - For English resumes, look for: EXPERIENCE, WORK HISTORY, PROFESSIONAL EXPERIENCE
   - Extract:
     * EXACT job title (e.g., "Magang Pengembangan Aplikasi Web" → "Web Application Development Intern")
     * EXACT company/organization name (e.g., "PT Ipsum Lorem", "Komunitas Developer Bandung")
     * EXACT duration (e.g., "Juli 2023 - September 2023" → "July 2023 - September 2023")
     * DETAILED description of responsibilities and achievements
   - DO NOT combine multiple positions into one entry
   - DO NOT skip any position, even if it's an internship or volunteer work
   - Translate Indonesian job titles to professional English equivalents

3. **EDUCATION** - Extract ALL educational qualifications:
   - Degree (translate: "S1 Informatika" → "Bachelor of Informatics/Computer Science")
   - Institution name (keep original or translate if needed)
   - Year/Duration (e.g., "Oktober 2020 - Juli 2024" → "2020-2024")
   - GPA if mentioned
   - Major courses if mentioned

4. **CERTIFICATIONS** - Extract any certifications, licenses, or credentials

5. **LANGUAGES** - Extract spoken/written languages with proficiency levels
   - Example: "Bahasa Indonesia - Native" → {"language": "Indonesian", "proficiency": "Native"}

6. **ACHIEVEMENTS** - Extract ALL awards, honors, competitions:
   - Look for sections: PENGHARGAAN, AWARDS, ACHIEVEMENTS
   - Example: "Juara 1 Hackathon Nasional" → "1st Place National Hackathon"
   - Include the issuing organization and year

7. **PROFESSIONAL SUMMARY** - Generate a comprehensive summary (4-5 sentences) that:
   - Accurately reflects the candidate's experience level (student, fresh graduate, junior, mid-level, senior)
   - Mentions specific skills and technologies
   - Highlights key achievements and awards
   - Uses professional English terminology

INDONESIAN RESUME TRANSLATION GUIDE:
- "Magang" → "Intern" or "Internship"
- "Pengembangan Aplikasi Web" → "Web Application Development"
- "Anggota" → "Member"
- "Komunitas" → "Community"
- "Juara" → "Winner" or "Champion"
- "S1" → "Bachelor's Degree"
- "Universitas" → "University"
- Translate all Indonesian text to professional English

RESPOND IN THIS EXACT JSON FORMAT:
{
  "skills": ["Java", "Python", "C++", "HTML", "CSS", "JavaScript", "React", "MySQL", "PostgreSQL", "Pandas", "NumPy", "Git", "Visual Studio Code", "MySQL Workbench", "Jupyter Notebook"],
  "experience": [
    {
      "title": "Web Application Development Intern",
      "company": "PT Ipsum Lorem",
      "duration": "July 2023 - September 2023",
      "description": "Built web applications using HTML, CSS, and JavaScript. Collaborated with development team to create responsive and efficient applications."
    },
    {
      "title": "Developer Community Member",
      "company": "Komunitas Developer Bandung",
      "duration": "November 2021 - July 2024",
      "description": "Participated in various open-source projects and hackathons focused on web and mobile application development."
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Informatics",
      "institution": "Universitas Pendidikan Indonesia",
      "year": "2020-2024"
    }
  ],
  "certifications": [],
  "languages": [
    {
      "language": "Indonesian",
      "proficiency": "Native"
    },
    {
      "language": "English",
      "proficiency": "Fluent"
    }
  ],
  "achievements": [
    "1st Place National Hackathon - Universitas Pendidikan Indonesia (2023)",
    "2nd Place Mobile Application Development Competition - PT Teknologi Indonesia (2022)"
  ],
  "summary": "Recent Computer Science graduate with hands-on experience in web application development and strong foundation in software engineering principles. Proficient in Java, Python, C++, and modern web technologies including HTML, CSS, JavaScript, and React. Demonstrated technical excellence through competitive achievements, including 1st place in National Hackathon and 2nd place in Mobile App Development Competition. Experienced in database management with MySQL and PostgreSQL, and skilled in data analysis using Pandas and NumPy. Active contributor to open-source projects and passionate about building innovative technology solutions.",
  "totalExperience": 1
}

CRITICAL REMINDERS:
- Extract EVERY skill mentioned - do not skip any
- Create SEPARATE experience entries for each position - do not combine
- Translate all Indonesian text to professional English
- Be thorough and accurate - this data is used for job matching
- If a section is not found, use empty array []
- Total experience should reflect actual work experience (internships count as 0.5-1 year each)`;
}

/**
 * Parse AI response for resume data
 */
function parseAIResumeResponse(aiResponse: string): ParsedResume | null {
  try {
    console.log('🔍 Parsing AI response...');
    console.log('Response length:', aiResponse.length);

    // Clean the response and extract JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('❌ No JSON found in AI response');
      console.log('AI response preview:', aiResponse.substring(0, 500));
      return null;
    }

    console.log('✅ JSON found in response');
    const parsed = JSON.parse(jsonMatch[0]);

    console.log('📊 Parsed data preview:');
    console.log('- Skills count:', parsed.skills?.length || 0);
    console.log('- Experience count:', parsed.experience?.length || 0);
    console.log('- Education count:', parsed.education?.length || 0);
    console.log('- Achievements count:', parsed.achievements?.length || 0);

    // Validate and structure the response
    const result = {
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages : [],
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      summary: parsed.summary || "Professional with diverse experience",
      totalExperience: typeof parsed.totalExperience === 'number' ? parsed.totalExperience : 0
    };

    console.log('✅ AI parsing successful!');
    console.log('Final skills:', result.skills.slice(0, 10).join(', '), '...');

    return result;
  } catch (error) {
    console.error('❌ Error parsing AI resume response:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown');
    return null;
  }
}

// Helper functions for basic resume parsing
function extractSkills(text: string): string[] {
  const commonSkills = [
    // Programming Languages
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'PHP',
    'Ruby', 'Ruby on Rails', 'JSP', 'Servlets', 'Perl', 'Go', 'Rust', 'Swift', 'Kotlin',
    // Web Technologies
    'HTML', 'HTML5', 'CSS', 'CSS3', 'AJAX', 'jQuery', 'Bootstrap', 'Tailwind',
    // Databases
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Microsoft SQL Server', 'Redis', 'SQLite', 'Oracle',
    // Data Science & ML Libraries (SPECIFIC - not generic "AI")
    'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'OpenCV',
    // Development Tools (SPECIFIC)
    'Git', 'GitHub', 'GitLab', 'Visual Studio Code', 'VS Code', 'IntelliJ', 'Eclipse',
    'MySQL Workbench', 'Jupyter Notebook', 'Postman', 'Docker', 'Kubernetes',
    // Web Services & APIs
    'REST API', 'RESTful Services', 'GraphQL', 'SOAP', 'Web Services',
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'GCP', 'Jenkins', 'CI/CD', 'Terraform',
    // Frameworks & Libraries
    'Laravel', 'CodeIgniter', 'Django', 'Flask', 'Spring', 'Express', 'Next.js',
    // Operating Systems
    'Linux', 'Ubuntu', 'Windows', 'macOS', 'Unix',
    // Methodologies
    'Agile', 'Scrum', 'Kanban', 'DevOps', 'Microservices', 'MVC',
    // Design Tools
    'Figma', 'Photoshop', 'Adobe Photoshop', 'Illustrator', 'Adobe Illustrator',
    // Other Specific Skills
    'Machine Learning', 'Data Science', 'Computer Vision', 'NLP',
    'Wordpress', 'Premiere', 'After Effects'
    // REMOVED: Generic terms like "AI", "Software", "SEM", "Computer", "Hardware" 
    // that cause false positives
  ];

  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();

  commonSkills.forEach(skill => {
    // More strict matching to avoid false positives
    const skillLower = skill.toLowerCase();

    // Check for whole word match or with common separators
    const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      // Avoid duplicates (e.g., "Visual Studio Code" and "VS Code")
      if (!foundSkills.some(existing => existing.toLowerCase() === skillLower)) {
        foundSkills.push(skill);
      }
    }
  });

  return foundSkills.slice(0, 40); // Return max 40 skills
}

function extractExperience(text: string): Array<{ title: string, company: string, duration: string, description: string }> {
  const experience: Array<{ title: string, company: string, duration: string, description: string }> = [];

  // Try to extract from Indonesian CV format
  // Look for PENGALAMAN KERJA and RIWAYAT ORGANISASI sections
  const workExpMatch = text.match(/PENGALAMAN KERJA([\s\S]*?)(?=RIWAYAT ORGANISASI|KEAHLIAN|PENGHARGAAN|BAHASA|$)/i);
  const orgExpMatch = text.match(/RIWAYAT ORGANISASI([\s\S]*?)(?=KEAHLIAN|PENGHARGAAN|BAHASA|HOBI|$)/i);

  // Extract from PENGALAMAN KERJA
  if (workExpMatch && workExpMatch[1]) {
    const section = workExpMatch[1];
    const lines = section.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length >= 3) {
      // Indonesian format: Title, Company + Duration, Description
      const title = lines[0].replace(/Magang/i, 'Intern').replace(/Pengembangan Aplikasi Web/i, 'Web Application Development');
      const companyLine = lines[1];
      const company = companyLine.split(/Juli|Agustus|September|Oktober|November|Desember|Januari|Februari|Maret|April|Mei|Juni|\d{4}/i)[0].trim();
      const duration = extractDuration(companyLine);
      const description = lines.slice(2).join(' ');

      experience.push({
        title: title || 'Professional',
        company: company || 'Company',
        duration,
        description: description || 'Professional experience in the field.'
      });
    }
  }

  // Extract from RIWAYAT ORGANISASI
  if (orgExpMatch && orgExpMatch[1]) {
    const section = orgExpMatch[1];
    const lines = section.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length >= 3) {
      const title = lines[0].replace(/Anggota/i, 'Member').replace(/Komunitas/i, 'Community');
      const companyLine = lines[1];
      const company = companyLine.split(/November|Desember|Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|\d{4}/i)[0].trim();
      const duration = extractDuration(companyLine);
      const description = lines.slice(2).join(' ');

      experience.push({
        title: title || 'Member',
        company: company || 'Organization',
        duration,
        description: description || 'Active participation in community activities.'
      });
    }
  }

  // Fallback: if no experience found, try generic extraction
  if (experience.length === 0) {
    const title = extractJobTitle(text);
    const company = extractCompany(text);
    const duration = extractDuration(text);

    if (title && company) {
      return [{
        title,
        company,
        duration,
        description: 'Professional experience in the field.'
      }];
    }
  }

  return experience;
}

function extractEducation(text: string): Array<{ degree: string, institution: string, year: string }> {
  const education: Array<{ degree: string, institution: string, year: string }> = [];

  // Look for education patterns
  const educationKeywords = ['University', 'College', 'Institute', 'School', 'Academy', 'Universitas', 'SMK', 'SMA', 'Sekolah'];
  const degreeKeywords = ['Bachelor', 'Master', 'PhD', 'Doctorate', 'Associate', 'Diploma', 'S.Kom', 'Sarjana', 'Ijazah', 'Magister'];
  const lines = text.split('\n');

  lines.forEach(line => {
    const trimmedLine = line.trim();

    if (educationKeywords.some(keyword => trimmedLine.toLowerCase().includes(keyword.toLowerCase()))) {
      const yearMatch = trimmedLine.match(/\b(19|20)\d{2}\b/);
      const degree = degreeKeywords.find(keyword => trimmedLine.toLowerCase().includes(keyword.toLowerCase())) || 'Degree';

      education.push({
        degree: degree,
        institution: trimmedLine,
        year: yearMatch ? yearMatch[0] : ''
      });
    }
  });

  return education.slice(0, 3);
}

function extractJobTitle(text: string): string {
  const titles = [
    'Software Developer', 'Software Engineer', 'Full Stack Developer', 'Frontend Developer',
    'Backend Developer', 'Web Developer', 'Mobile Developer', 'Data Scientist', 'Product Manager',
    'Social Media Management', 'SEO Specialist', 'Network Engineer', 'Web Designer', 'Technician',
    'Pemilik', 'Owner', 'Founder', 'Co-Founder', 'CEO', 'CTO', 'Manager', 'Staff', 'Admin'
  ];

  const lowerText = text.toLowerCase();
  for (const title of titles) {
    if (lowerText.includes(title.toLowerCase())) {
      return title;
    }
  }

  return 'Professional';
}

function extractCompany(text: string): string {
  // Basic fallback - just return a generic string if AI fails
  // We don't want to hallucinate specific companies
  return 'Company';
}

function extractDuration(text: string): string {
  // Added Indonesian month abbreviations and 'sekarang'
  const yearPattern = /\b(19|20)\d{2}(\s*[-–]\s*(19|20)\d{2}|present|now|current|ongoing|sekarang|kini)\b/i;
  const match = text.match(yearPattern);

  if (match) {
    return match[0];
  }
  return 'Present';
}

function calculateTotalExperience(experience: Array<{ duration: string }>): number {
  // Try to extract years from text patterns
  const text = experience.map(e => e.duration).join(' ');

  // Look for patterns like "10 years", "ten years", "over X years"
  const yearPatterns = [
    /(\d+)\+?\s*years?/i,
    /(ten|eleven|twelve|thirteen|fourteen|fifteen|twenty)\s*years?/i,
    /over\s*(\d+|ten|twenty|thirty)\s*years?/i
  ];

  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match) {
      const yearStr = match[1].toLowerCase();
      const yearMap: { [key: string]: number } = {
        'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
        'fifteen': 15, 'twenty': 20, 'thirty': 30
      };
      return yearMap[yearStr] || parseInt(yearStr) || 10;
    }
  }

  // Fallback: count experience entries
  return Math.max(experience.length, 1);
}

function generateBasicSummary(text: string, skills: string[], totalExperience: number): string {
  const skillsText = skills.slice(0, 8).join(', ');
  const lowerText = text.toLowerCase();

  // Check for specific expertise areas
  const hasWebDev = lowerText.includes('web') || lowerText.includes('html') || lowerText.includes('css');
  const hasBackend = lowerText.includes('server') || lowerText.includes('database') || lowerText.includes('api');
  const hasSEO = lowerText.includes('seo') || lowerText.includes('search engine');

  let summary = `Experienced professional with ${totalExperience}+ years in software development`;

  if (hasWebDev) {
    summary += ', specializing in web application development and modern web technologies';
  }

  if (skills.length > 0) {
    summary += `. Proficient in ${skillsText}`;
  }

  if (hasSEO) {
    summary += '. Proven expertise in SEO/SEM and online business strategy';
  }

  summary += '. Strong technical background with excellent problem-solving abilities and commitment to delivering high-quality solutions.';

  return summary;
}