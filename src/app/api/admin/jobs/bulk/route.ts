import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { jobIds, approved } = body;

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid jobIds array" },
        { status: 400 }
      );
    }

    if (typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "Missing or invalid approved field" },
        { status: 400 }
      );
    }

    // Update multiple jobs
    const result = await prisma.job.updateMany({
      where: {
        id: {
          in: jobIds.map(id => parseInt(id))
        }
      },
      data: {
        approved
      }
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      message: `${result.count} job(s) ${approved ? 'approved' : 'unapproved'} successfully`
    });

  } catch (error) {
    console.error("Error bulk updating jobs:", error);
    return NextResponse.json(
      { error: "Failed to update jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('🔵 POST /api/admin/jobs/bulk - Request received');

    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('🔐 Session:', session ? { user: session.user?.email, role: session.user?.role } : 'No session');

    // Development mode bypass
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.log('🔧 Development mode:', isDevelopment);

    if (!isDevelopment) {
      if (!session?.user) {
        console.log('❌ Unauthorized - No session');
        return NextResponse.json(
          { error: "Unauthorized. Please sign in." },
          { status: 401 }
        );
      }

      // Check if user is admin
      if (session.user.role !== "admin") {
        console.log('❌ Forbidden - User role:', session.user.role);
        return NextResponse.json(
          { error: "Forbidden. Admin access required." },
          { status: 403 }
        );
      }
    } else {
      console.log('⚠️ DEVELOPMENT MODE: Bypassing authentication');
    }

    const body = await request.json();
    console.log('📦 Request body:', body);
    const { jobIds, action } = body;

    // Handle Delete Action
    if (action === 'delete') {
      if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
        console.log('❌ Invalid jobIds:', jobIds);
        return NextResponse.json(
          { error: "Missing or invalid jobIds array" },
          { status: 400 }
        );
      }

      console.log(`🗑️ Deleting jobs: ${jobIds.join(', ')}`);

      // Delete multiple jobs
      const result = await prisma.job.deleteMany({
        where: {
          id: {
            in: jobIds.map(id => Number(id))
          }
        }
      });

      console.log(`✅ Deleted ${result.count} job(s)`);

      return NextResponse.json({
        success: true,
        deletedCount: result.count,
        message: `${result.count} job(s) deleted successfully`
      });
    }

    console.log('❌ Invalid action:', action);
    return NextResponse.json(
      { error: "Invalid action specified" },
      { status: 400 }
    );

  } catch (error) {
    console.error("❌ Error bulk processing jobs:", error);
    return NextResponse.json(
      { error: "Failed to process jobs" },
      { status: 500 }
    );
  }
}