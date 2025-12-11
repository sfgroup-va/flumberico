import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { indexJobUrl } from "@/lib/google-indexing";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const q = searchParams.get("q") || undefined;
    const status = searchParams.get("status") || "all"; // all, approved, pending
    const type = searchParams.get("type") || undefined;
    const page = parseInt(searchParams.get("page") || "1");

    const jobsPerPage = 100;
    const skip = (page - 1) * jobsPerPage;

    // Build search filters using proper Prisma syntax
    const searchConditions = q ? [
      { title: { contains: q, mode: 'insensitive' as const } },
      { companyName: { contains: q, mode: 'insensitive' as const } },
      { type: { contains: q, mode: 'insensitive' as const } },
      { location: { contains: q, mode: 'insensitive' as const } },
    ] : [];

    // Build status filter
    const statusFilter = status === "all"
      ? {}
      : status === "approved"
        ? { approved: true }
        : { approved: false };

    // Build complete where clause
    const where = {
      AND: [
        searchConditions.length > 0 ? { OR: searchConditions } : {},
        statusFilter,
        type ? { type } : {},
      ],
    };

    // Execute queries in parallel
    const [jobs, totalResults] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: jobsPerPage,
        skip,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      totalResults,
      currentPage: page,
      totalPages: Math.ceil(totalResults / jobsPerPage),
      filters: { q, status, type },
    });

  } catch (error) {
    console.error("Error fetching admin jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    // Validate required fields
    const { title, type, locationType, location, salary, companyName } = body;

    if (!title || !type || !locationType || !salary || !companyName) {
      return NextResponse.json(
        { error: "Missing required fields: title, type, locationType, salary, companyName" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + "-" + Date.now();

    // Create job
    const job = await prisma.job.create({
      data: {
        slug,
        title,
        type,
        locationType,
        location,
        description: body.description || "",
        salary,
        companyName,
        applicationEmail: body.applicationEmail,
        applicationUrl: body.applicationUrl,
        companyLogoUrl: body.companyLogoUrl,
        approved: body.approved || false,
      },
    });

    // Submit to Google Indexing API (async, don't wait for response)
    // Only index if the job is approved
    if (job.approved) {
      indexJobUrl(job.slug, 'URL_UPDATED')
        .then((result) => {
          if (result.success) {
            console.log(`✅ Job indexed successfully: ${job.slug}`);
          } else {
            console.error(`⚠️ Failed to index job: ${job.slug}`, result.error);
          }
        })
        .catch((error) => {
          console.error(`❌ Error indexing job: ${job.slug}`, error);
        });
    }

    return NextResponse.json({
      success: true,
      job,
      message: "Job created successfully"
    });

  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

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
    const { id, approved } = body;

    if (!id || typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: id, approved" },
        { status: 400 }
      );
    }

    // Update job
    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: { approved },
    });

    // Submit to Google Indexing API based on approval status
    if (approved) {
      // Job approved - submit for indexing
      indexJobUrl(job.slug, 'URL_UPDATED')
        .then((result) => {
          if (result.success) {
            console.log(`✅ Job indexed after approval: ${job.slug}`);
          } else {
            console.error(`⚠️ Failed to index approved job: ${job.slug}`, result.error);
          }
        })
        .catch((error) => {
          console.error(`❌ Error indexing approved job: ${job.slug}`, error);
        });
    } else {
      // Job unapproved - remove from index
      indexJobUrl(job.slug, 'URL_DELETED')
        .then((result) => {
          if (result.success) {
            console.log(`✅ Job removed from index: ${job.slug}`);
          } else {
            console.error(`⚠️ Failed to remove job from index: ${job.slug}`, result.error);
          }
        })
        .catch((error) => {
          console.error(`❌ Error removing job from index: ${job.slug}`, error);
        });
    }

    return NextResponse.json({
      success: true,
      job,
      message: `Job ${approved ? 'approved' : 'unapproved'} successfully`
    });

  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}