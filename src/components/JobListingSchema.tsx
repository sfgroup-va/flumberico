import { Job } from "@prisma/client";

interface JobListingSchemaProps {
  jobs: Job[];
  pageUrl?: string;
  organizationName?: string;
}

export default function JobListingSchema({
  jobs,
  pageUrl = "https://flumberico.com/jobs",
  organizationName = "Flumberico"
}: JobListingSchemaProps) {
  // Convert jobs to JobPosting schema format
  const jobPostings = jobs.map((job) => {
    const stripHtml = (html: string): string => {
      return html.replace(/<[^>]*>/g, '');
    };

    const employmentType = job.type?.toLowerCase().includes("full") ? "FULL_TIME" :
      job.type?.toLowerCase().includes("part") ? "PART_TIME" :
        job.type?.toLowerCase().includes("contract") ? "CONTRACTOR" :
          job.type?.toLowerCase().includes("intern") ? "INTERN" :
            "FULL_TIME";

    return {
      "@type": "JobPosting",
      "title": job.title,
      "description": stripHtml(job.aiEnhancedDescription || job.description || ""),
      "identifier": {
        "@type": "PropertyValue",
        "name": job.companyName,
        "value": job.slug
      },
      "datePosted": new Date(job.createdAt).toISOString(),
      "validThrough": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      "employmentType": employmentType,
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.companyName,
        "logo": job.companyLogoUrl || undefined,
        "address": job.locationType?.toLowerCase() !== "remote" ? {
          "@type": "PostalAddress",
          "addressLocality": job.location?.split(',')[0] || "",
          "addressCountry": "US"
        } : undefined
      },
      "jobLocation": job.locationType?.toLowerCase() === "remote" ? {
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
      } : undefined,
      "baseSalary": job.salaryMin || job.salaryMax ? {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": {
          "@type": "QuantitativeValue",
          "minValue": job.salaryMin || undefined,
          "maxValue": job.salaryMax || undefined,
          "unitText": "YEAR"
        }
      } : undefined,
      "jobBenefits": [
        "Health insurance",
        "Dental insurance",
        "Vision insurance",
        "Retirement plan",
        "Paid time off"
      ]
    };
  });

  const schema = {
    "@context": "https://schema.org/",
    "@type": "ItemList",
    "name": `${organizationName} - Job Listings`,
    "description": `Latest job opportunities from ${organizationName}`,
    "url": pageUrl,
    "numberOfItems": jobPostings.length,
    "itemListElement": jobPostings.map((job, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": job
    }))
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