import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { indexJobUrl } from "@/lib/google-indexing";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: Request,
  { params }: PageProps
) {
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

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    // Find job by slug
    const job = await prisma.job.findUnique({
      where: { slug },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(job);

  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: PageProps
) {
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

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { title, type, locationType, companyName } = body;

    if (!title || !type || !locationType || !companyName) {
      return NextResponse.json(
        { error: "Missing required fields: title, type, locationType, companyName" },
        { status: 400 }
      );
    }

    // Find existing job
    const existingJob = await prisma.job.findUnique({
      where: { slug },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Generate new slug if title changed
    let newSlug = slug;
    if (title !== existingJob.title) {
      newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") + "-" + Date.now();
    }

    // Update job
    const updatedJob = await prisma.job.update({
      where: { slug },
      data: {
        slug: newSlug,
        title,
        type,
        locationType,
        location: body.location || null,
        description: body.description || null,
        salary: body.salary || null,
        companyName,
        applicationEmail: body.applicationEmail || null,
        applicationUrl: body.applicationUrl || null,
        companyLogoUrl: body.companyLogoUrl || null,
        approved: body.approved || false,
      },
    });

    // Handle Google Indexing
    if (updatedJob.approved) {
      // If slug changed, remove old URL first
      if (slug !== newSlug) {
        // Remove old URL
        const oldUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/jobs/${slug}`;
        // We use the helper manually here because the slug helper assumes the current slug
        // logic is handled inside
        // But for clarity, we can just fire and forget the removal of the old slug
        indexJobUrl(slug, 'URL_DELETED').catch(e => console.error('Failed to remove old slug index', e));
      }

      // Update new URL (or same URL if slug didn't change)
      indexJobUrl(updatedJob.slug, 'URL_UPDATED')
        .then(res => res.success ? console.log(`✅ Indexed updated job: ${updatedJob.slug}`) : console.error(`⚠️ Indexing failed for updated job: ${updatedJob.slug}`, res.error))
        .catch(e => console.error(`❌ Error indexing updated job: ${updatedJob.slug}`, e));

    } else {
      // If job is not approved (hidden), remove from index
      indexJobUrl(updatedJob.slug, 'URL_DELETED')
        .then(res => res.success ? console.log(`✅ Removed unapproved job from index: ${updatedJob.slug}`) : console.error(`⚠️ Failed to remove unapproved job: ${updatedJob.slug}`, res.error))
        .catch(e => console.error(`❌ Error removing unapproved job: ${updatedJob.slug}`, e));
    }

    return NextResponse.json({
      success: true,
      job: updatedJob,
      slug: newSlug,
      message: "Job updated successfully"
    });

  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: PageProps
) {
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

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    // Find job first to ensure it exists
    const job = await prisma.job.findUnique({
      where: { slug },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Delete job
    await prisma.job.delete({
      where: { slug },
    });

    // Remove from Google Index
    indexJobUrl(slug, 'URL_DELETED')
      .then(res => res.success ? console.log(`✅ Removed deleted job from index: ${slug}`) : console.error(`⚠️ Failed to remove deleted job: ${slug}`, res.error))
      .catch(e => console.error(`❌ Error removing deleted job: ${slug}`, e));

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}