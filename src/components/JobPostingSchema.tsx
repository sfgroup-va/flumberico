import { Job } from "@prisma/client";

interface JobPostingSchemaProps {
  job: Job;
}

export default function JobPostingSchema({ job }: JobPostingSchemaProps) {
  // Strip HTML tags for description
  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  };

  const baseSalary = job.salaryMin || job.salaryMax ? {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": job.salaryMin || undefined,
      "maxValue": job.salaryMax || undefined,
      "unitText": "YEAR"
    }
  } : undefined;

  const employmentType = job.type?.toLowerCase().includes("full") ? "FULL_TIME" :
    job.type?.toLowerCase().includes("part") ? "PART_TIME" :
      job.type?.toLowerCase().includes("contract") ? "CONTRACTOR" :
        job.type?.toLowerCase().includes("intern") ? "INTERN" :
          "FULL_TIME";

  const workFromHome = job.locationType?.toLowerCase() === "remote" ? true : undefined;

  const jobLocation = job.locationType?.toLowerCase() === "remote" ? {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    }
  } : job.location ? {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": job.location.split(',')[0] || job.location,
      "addressCountry": "US"
    }
  } : undefined;

  const schema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": stripHtml(job.aiEnhancedDescription || job.description || ""),
    "identifier": {
      "@type": "PropertyValue",
      "name": job.companyName,
      "value": job.slug
    },
    "datePosted": job.createdAt.toISOString(),
    "validThrough": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
    "employmentType": employmentType,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.companyName,
      "logo": job.companyLogoUrl || undefined,
      "sameAs": undefined, // Can be added later if company website is available
      "address": job.locationType?.toLowerCase() !== "remote" ? {
        "@type": "PostalAddress",
        "addressLocality": job.location?.split(',')[0] || "",
        "addressCountry": "US"
      } : undefined
    },
    "jobLocation": jobLocation,
    "baseSalary": baseSalary,
    "jobBenefits": [
      "Health insurance",
      "Dental insurance",
      "Vision insurance",
      "Retirement plan",
      "Paid time off"
    ],
    "qualifications": "Requirements will be specified in the full job description",
    "responsibilities": "Responsibilities will be detailed in the full job description",
    "workHours": "Varies",
    "industry": "Technology",
    "occupationalCategory": "Computer and Information Technology Occupations"
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema, (key, value) =>
    value === undefined ? null : value
  ));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanSchema, null, 2)
      }}
    />
  );
}