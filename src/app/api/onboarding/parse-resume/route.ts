import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseResumeWithAI } from '@/lib/resume-parser';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { resumeText } = body;

        if (!resumeText || typeof resumeText !== 'string') {
            return NextResponse.json(
                { error: 'Resume text is required' },
                { status: 400 }
            );
        }

        console.log('📄 Parsing resume text for user:', session.user.email);
        console.log('Text length:', resumeText.length);

        // Parse with AI (server-side, has access to API key)
        const parsed = await parseResumeWithAI(resumeText);

        console.log('✅ Parsing complete');

        return NextResponse.json({
            success: true,
            parsed
        });

    } catch (error) {
        console.error('Error in parse-resume API:', error);
        return NextResponse.json(
            {
                error: 'Failed to parse resume',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
