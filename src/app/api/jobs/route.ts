import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { JobFilterValues } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    console.log('📥 Jobs API called');
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const q = searchParams.get("q") || undefined;
    const type = searchParams.get("type") || undefined;
    const location = searchParams.get("location") || undefined;
    const remote = searchParams.get("remote") === "true";
    const approved = searchParams.get("approved") !== "false"; // Default to true
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50"); // Allow customizable limit, default 50

    console.log('🔍 Query params:', { q, type, location, remote, approved, page, limit });

    const jobsPerPage = limit === -1 ? 100000 : Math.min(limit, 10000); // Allow up to 10000 per page, or -1 for "all" (capped safely)
    const skip = (page - 1) * jobsPerPage;

    // Build search string for PostgreSQL full-text search
    const searchString = q
      ?.split(" ")
      .filter((word) => word.length > 0)
      .join(" & ");

    // Build search filters
    const searchFilter = searchString
      ? {
        OR: [
          { title: { search: searchString } },
          { companyName: { search: searchString } },
          { type: { search: searchString } },
          { locationType: { search: searchString } },
          { location: { search: searchString } },
        ],
      }
      : {};

    // Build complete where clause
    const where = {
      AND: [
        searchFilter,
        type ? { type } : {},
        location ? { location } : {},
        remote ? { locationType: "Remote" } : {},
        { approved },
      ],
    };

    console.log('🔎 Querying database with filters:', JSON.stringify(where, null, 2));

    // Test database connection first
    await prisma.$connect();
    console.log('✅ Database connected');

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

    console.log(`✅ Found ${totalResults} jobs, returning ${jobs.length} for page ${page}`);

    return NextResponse.json({
      jobs,
      totalResults,
      currentPage: page,
      totalPages: Math.ceil(totalResults / jobsPerPage),
    });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Failed to fetch jobs",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}