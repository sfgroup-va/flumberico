"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { JobFilterValues } from "@/lib/validation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import JobListItem from "./JobListItem";
import JobListingSchema from "./JobListingSchema";
import type { Job } from "@prisma/client";

interface JobResultsProps {
  filterValues: JobFilterValues;
  page?: number;
}

interface JobWithCompany extends Job {
  companyName: string;
}

export default function JobResults({
  filterValues,
  page = 1,
}: JobResultsProps) {
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const jobsPerPage = 6;

  useEffect(() => {
    fetchJobs();
  }, [filterValues, page]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterValues.q) params.append("q", filterValues.q);
      if (filterValues.type) params.append("type", filterValues.type);
      if (filterValues.location) params.append("location", filterValues.location);
      if (filterValues.remote) params.append("remote", "true");
      params.append("page", page.toString());

      const response = await fetch(`/api/jobs?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data.jobs);
      setTotalResults(data.totalResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grow flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-neon-blue" />
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grow flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md">
          <p className="text-destructive text-lg mb-4">
            Error loading jobs: {error}
          </p>
          <button
            onClick={fetchJobs}
            className="futuristic-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grow space-y-4">
      {/* Job Listing Schema Markup */}
      {jobs.length > 0 && (
        <JobListingSchema
          jobs={jobs}
          pageUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/?${new URLSearchParams({
            ...(filterValues.q && { q: filterValues.q }),
            ...(filterValues.type && { type: filterValues.type }),
            ...(filterValues.location && { location: filterValues.location }),
            ...(filterValues.remote && { remote: "true" }),
            page: page.toString(),
          }).toString()}`}
          organizationName="AI Job Board"
        />
      )}

      {jobs.map((job) => (
        <JobListItem key={job.id} job={job} />
      ))}
      {jobs.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground text-lg">
            No jobs found. Try adjusting your search filters.
          </p>
        </div>
      )}
      {jobs.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(totalResults / jobsPerPage)}
          filterValues={filterValues}
        />
      )}
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  filterValues: JobFilterValues;
}

function Pagination({
  currentPage,
  totalPages,
  filterValues: { q, type, location, remote },
}: PaginationProps) {
  function generatePageLink(page: number) {
    const searchParams = new URLSearchParams({
      ...(q && { q }),
      ...(type && { type }),
      ...(location && { location }),
      ...(remote && { remote: "true" }),
      page: page.toString(),
    });

    return `/?${searchParams.toString()}`;
  }

  return (
    <div className="flex justify-between items-center glass-card p-4">
      <Link
        href={generatePageLink(currentPage - 1)}
        className={cn(
          "flex items-center gap-2 font-semibold px-4 py-2 rounded-lg transition-all duration-200",
          "bg-background/50 hover:bg-neon-blue/10 hover:text-neon-blue hover:border-neon-blue/50 border border-transparent",
          currentPage <= 1 && "invisible opacity-50 cursor-not-allowed",
        )}
      >
        <ArrowLeft size={16} />
        Previous
      </Link>
      <span className="font-semibold text-foreground">
        <span className="text-neon-blue">{currentPage}</span> / {totalPages}
      </span>
      <Link
        href={generatePageLink(currentPage + 1)}
        className={cn(
          "flex items-center gap-2 font-semibold px-4 py-2 rounded-lg transition-all duration-200",
          "bg-background/50 hover:bg-neon-blue/10 hover:text-neon-blue hover:border-neon-blue/50 border border-transparent",
          currentPage >= totalPages && "invisible opacity-50 cursor-not-allowed",
        )}
      >
        Next
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}