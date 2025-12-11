import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from './prisma';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export interface CoverLetterData {
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateLocation?: string;
  candidateSummary: string;
  candidateSkills: string[];
  candidateExperience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  jobRequirements: string[];
  salary?: number;
  location?: string;
}

export class CoverLetterGenerator {
  /**
   * Generate a personalized cover letter using AI
   */
  static async generateCoverLetter(data: CoverLetterData): Promise<string> {
    try {
      // Validate API key
      if (!process.env.GOOGLE_AI_API_KEY) {
        console.warn('Google AI API key not found, using fallback cover letter');
        return this.generateFallbackCoverLetter(data);
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = this.createCoverLetterPrompt(data);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const coverLetter = response.text();

      return this.formatCoverLetter(coverLetter, data);

    } catch (error) {
      console.error('Error generating cover letter:', error);
      return this.generateFallbackCoverLetter(data);
    }
  }

  /**
   * Create the AI prompt for cover letter generation
   */
  private static createCoverLetterPrompt(data: CoverLetterData): string {
    const {
      candidateName,
      candidateSummary,
      candidateSkills,
      candidateExperience,
      jobTitle,
      companyName,
      jobDescription,
      jobRequirements,
      salary,
      location
    } = data;

    return `You are an expert career coach and professional cover letter writer. Create a compelling, SEO-optimized cover letter that will help the applicant stand out and pass through applicant tracking systems (ATS).

CANDIDATE PROFILE:
Name: ${candidateName}
Professional Summary: ${candidateSummary}
Key Skills: ${candidateSkills.join(', ')}
Experience: ${candidateExperience.map(exp =>
      `${exp.title} at ${exp.company} (${exp.duration}): ${exp.description.substring(0, 150)}...`
    ).join('\n')}

JOB DETAILS:
Company: ${companyName}
Position: ${jobTitle}
Location: ${location || 'Remote'}
${salary ? `Salary: $${salary.toLocaleString()}` : ''}
Description: ${jobDescription}
Key Requirements: ${jobRequirements.join(', ')}

SEO & ATS OPTIMIZATION REQUIREMENTS:
1. Include 3-5 relevant keywords from the job description naturally
2. Use industry-specific terminology and action verbs
3. Structure for readability with clear paragraphs
4. Avoid overused phrases like "hard-working" or "team player"
5. Include quantifiable achievements when possible

CONTENT REQUIREMENTS:
1. Write a compelling, professional cover letter (350-450 words)
2. Create a strong opening that grabs attention immediately
3. Highlight 2-3 specific achievements that match job requirements
4. Demonstrate understanding of the company's mission and values
5. Show how the candidate's skills solve the company's problems
6. Include a powerful call to action with next steps
7. Use a confident, professional, and authentic tone
8. Incorporate storytelling elements to make it memorable
9. Address potential gaps or concerns proactively
10. Format professionally with proper spacing

MODERN COVER LETTER BEST PRACTICES:
- Start with a compelling achievement or insight
- Use the company name and specific role keywords
- Include measurable results and outcomes
- Show cultural fit and alignment with company values
- Demonstrate industry knowledge and trends awareness
- End with specific follow-up actions

The cover letter should be unique, compelling, and specifically tailored to this opportunity. Focus on creating value proposition narratives that connect the candidate's experience to the company's current needs and future goals.`;
  }

  /**
   * Format the AI-generated cover letter
   */
  private static formatCoverLetter(generatedText: string, data: CoverLetterData): string {
    const { candidateName, candidateEmail, candidatePhone, companyName, jobTitle } = data;

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Clean up the AI response
    let cleanText = generatedText.trim();

    // Remove any markdown formatting
    cleanText = cleanText.replace(/[#*`]/g, '');

    // Ensure proper formatting
    if (!cleanText.startsWith('Dear')) {
      cleanText = `Dear Hiring Manager,\n\n${cleanText}`;
    }

    if (!cleanText.includes('Sincerely') && !cleanText.includes('Best regards')) {
      cleanText = `${cleanText}\n\nSincerely,`;
    }

    if (!cleanText.includes(candidateName)) {
      cleanText = `${cleanText}\n\n${candidateName}`;
    }

    // Add contact information
    const contactInfo = [
      candidateEmail,
      candidatePhone,
      new Date().toLocaleDateString()
    ].filter(Boolean).join(' | ');

    // Final formatted letter
    return `${contactInfo}

${cleanText}

${candidateEmail}`;
  }

  /**
   * Generate a fallback cover letter if AI fails
   */
  private static generateFallbackCoverLetter(data: CoverLetterData): string {
    const {
      candidateName,
      candidateEmail,
      candidateSummary,
      candidateSkills,
      candidateExperience,
      jobTitle,
      companyName
    } = data;

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const relevantExperience = candidateExperience.slice(0, 2);
    const relevantSkills = candidateSkills.slice(0, 5);

    return `${candidateEmail} | ${currentDate}

Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With my background in ${candidateSummary.split(' ').slice(0, 5).join(' ')} and proven experience in delivering results, I am confident I possess the skills and qualifications you are seeking.

Throughout my career, I have developed expertise in ${relevantSkills.join(', ')}. In my most recent roles, I have:

${relevantExperience.map(exp =>
      `• ${exp.title} at ${exp.company}: ${exp.description.substring(0, 100)}...`
    ).join('\n')}

I am particularly drawn to ${companyName} because of your reputation for innovation and excellence in the industry. I believe my technical skills, combined with my passion for ${relevantExperience[0]?.title || 'this field'}, make me an ideal candidate for this role.

I would welcome the opportunity to discuss how my experience and skills can contribute to your team's success. Thank you for considering my application.

Sincerely,

${candidateName}

${candidateEmail}`;
  }

  /**
   * Generate a cover letter for a specific user and job
   */
  static async generateCoverLetterForApplication(
    userId: string,
    jobId: number
  ): Promise<string> {
    try {
      // Get user profile data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          resumeDNA: true
        }
      });

      if (!user || !user.profile || !user.resumeDNA) {
        throw new Error('User profile or resume data not found');
      }

      // Get job data
      const job = await prisma.job.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        throw new Error('Job not found');
      }

      // Prepare cover letter data
      const coverLetterData: CoverLetterData = {
        candidateName: user.name || 'Applicant',
        candidateEmail: user.email,
        candidatePhone: user.profile.phone || undefined,
        candidateLocation: user.profile.location || undefined,
        candidateSummary: user.profile.aiOptimizedSummary || user.profile.summary || '',
        candidateSkills: user.resumeDNA.skills,
        candidateExperience: (user.resumeDNA.parsedExperience as any) || [],
        jobTitle: job.title,
        companyName: job.companyName,
        jobDescription: job.aiEnhancedDescription || job.description || '',
        jobRequirements: [], // Extract from description in future enhancement
        salary: job.salary || undefined,
        location: job.location || undefined
      };

      return await this.generateCoverLetter(coverLetterData);

    } catch (error) {
      console.error('Error generating cover letter for application:', error);
      throw error;
    }
  }
}