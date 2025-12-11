import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { optimizeProfessionalSummary } from '@/lib/resume-parser';

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
        const { summary, parsedResume } = body;

        if (!summary || !parsedResume) {
            return NextResponse.json(
                { error: 'Summary and parsed resume data are required' },
                { status: 400 }
            );
        }

        console.log('✨ Optimizing professional summary for user:', session.user.email);

        // Optimize with AI (server-side)
        const optimized = await optimizeProfessionalSummary(summary, parsedResume);

        console.log('✅ Summary optimization complete');

        return NextResponse.json({
            success: true,
            optimizedSummary: optimized
        });

    } catch (error) {
        console.error('Error in optimize-summary API:', error);
        return NextResponse.json(
            {
                error: 'Failed to optimize summary',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
