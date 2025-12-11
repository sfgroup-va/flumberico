import { formatSalary } from "@/lib/utils";
import { Job } from "@prisma/client";
import { Banknote, Briefcase, Globe2, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Markdown from "./Markdown";
import JobPostingSchema from "./JobPostingSchema";

interface JobPageProps {
  job: Job;
}

export default function JobPage({ job }: JobPageProps) {
  const {
    title,
    description,
    aiEnhancedDescription,
    companyName,
    applicationUrl,
    type,
    locationType,
    location,
    salary,
    salaryMin,
    salaryMax,
    companyLogoUrl,
  } = job;
  return (
    <>
      {/* Job Posting Schema Markup */}
      <JobPostingSchema job={job} />

      <section className="w-full grow space-y-5">
        <div className="flex items-center gap-3">
          {companyLogoUrl && (
            <Image
              src={companyLogoUrl}
              alt="Company logo"
              width={100}
              height={100}
              className="rounded-xl"
            />
          )}
          <div>
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              <p className="font-semibold">
                {applicationUrl ? (
                  <Link
                    href={new URL(applicationUrl).origin}
                    className="text-green-500 hover:underline"
                  >
                    {companyName}
                  </Link>
                ) : (
                  <span>{companyName}</span>
                )}
              </p>
            </div>
            <div className="text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Briefcase size={16} className="shrink-0" />
                {type}
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin size={16} className="shrink-0" />
                {locationType}
              </p>
              <p className="flex items-center gap-1.5">
                <Globe2 size={16} className="shrink-0" />
                {location || "Worldwide"}
              </p>
              <p className="flex items-center gap-1.5">
                <Banknote size={16} className="shrink-0" />
                {formatSalary(salaryMin, salaryMax, salary)}
              </p>
            </div>
          </div>
        </div>
        <div>
          {aiEnhancedDescription ? (
            <Markdown>{aiEnhancedDescription}</Markdown>
          ) : description ? (
            <Markdown>{description}</Markdown>
          ) : (
            <p className="text-muted-foreground">No job description available.</p>
          )}
        </div>
      </section>
    </>
  );
}
