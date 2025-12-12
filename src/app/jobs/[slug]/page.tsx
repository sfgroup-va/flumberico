import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Clock, MapPin, DollarSign, Building, Users, Calendar, ArrowLeft, Mail, ExternalLink, Badge, Briefcase, GraduationCap, Award, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import JobApplicationForm from '@/components/JobApplicationForm';
import JobActions from '@/components/JobActions';
import ShareJobButtons from '@/components/ShareJobButtons';
import Image from 'next/image';
import { cache } from 'react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getJob = cache(async (slug: string) => {
  try {
    const job = await prisma.job.findUnique({
      where: { slug },
    });

    if (!job) {
      notFound();
    }


    return job;
  } catch (error) {
    console.error('Error fetching job:', error);
    notFound();
  }
});

export async function generateStaticParams() {
  const jobs = await prisma.job.findMany({
    where: { approved: true },
    select: { slug: true },
    take: 50, // Limit for static generation
  });

  return jobs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);

  const companyName = job.companyName || 'Unknown Company';
  const location = job.location || 'Remote';
  const salary = job.salary ? `Salary: ${job.salary}` : 'Competitive Salary';

  return {
    title: `${job.title} at ${companyName} | ${location}`,
    description: `Apply for ${job.title} position at ${companyName}. ${job.description?.substring(0, 160) || 'Great opportunity for qualified candidates.'} ${location}. ${salary}`,
    keywords: [
      job.title,
      companyName,
      location,
      job.type || 'full-time',
      'job',
      'career',
      'hiring',
      'employment',
      job.locationType || 'remote'
    ].filter(Boolean),
    authors: [{ name: companyName }],
    creator: companyName,
    publisher: 'Flumberico',
    metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://flumberico.com'),
    alternates: {
      canonical: `/jobs/${job.slug}`,
    },
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: `/jobs/${job.slug}`,
      title: `${job.title} at ${companyName}`,
      description: job.description?.substring(0, 160) || 'Great opportunity for qualified candidates.',
      siteName: 'Flumberico',
      images: [
        {
          url: job.companyLogoUrl || '/images/default-company-logo.png',
          width: 1200,
          height: 630,
          alt: `${companyName} Logo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${job.title} at ${companyName}`,
      description: job.description?.substring(0, 160) || 'Great opportunity for qualified candidates.',
      images: [job.companyLogoUrl || '/images/default-company-logo.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

function formatMoney(amount: number): string {
  if (!amount) return 'Competitive';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatSalary(salary: number | null | undefined): string {
  if (!salary) return 'Competitive';
  return `$${salary.toLocaleString()}`;
}

function formatEnhancedDescription(description: string): string {
  if (!description) return '<p>No description available.</p>';

  // Clean up HTML code block markers if present
  let cleanDescription = description;

  // Remove ```html and ``` markers if they exist
  if (cleanDescription.includes('```html')) {
    cleanDescription = cleanDescription.replace(/```html\s*/g, '');
  }
  if (cleanDescription.includes('```')) {
    cleanDescription = cleanDescription.replace(/```\s*$/g, '');
  }

  return cleanDescription.trim();
}

function JobDetailsCard({ job }: { job: any }) {
  const companyName = job.companyName || 'Unknown Company';
  const companyLogoUrl = job.companyLogoUrl;
  const postedAt = job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Recently';

  const applicationLink = job.applicationEmail
    ? `mailto:${job.applicationEmail}`
    : job.applicationUrl;

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'JobPosting',
            title: job.title,
            description: job.description,
            identifier: {
              '@type': 'PropertyValue',
              name: 'Job ID',
              value: job.id,
            },
            datePosted: job.createdAt?.toISOString(),
            employmentType: job.type || 'Full-time',
            hiringOrganization: {
              '@type': 'Organization',
              name: companyName,
              logo: companyLogoUrl,
            },
            jobLocation: {
              '@type': 'Place',
              address: {
                '@type': 'PostalAddress',
                addressLocality: job.location || 'Remote',
              },
            },
            baseSalary: job.salary ? {
              '@type': 'MonetaryAmount',
              currency: 'USD',
              value: {
                '@type': 'QuantitativeValue',
                value: job.salary,
              },
            } : undefined,
          }),
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
        {/* Breadcrumb */}
        <nav className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/search" className="hover:text-foreground transition-colors">
                  Jobs
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium truncate max-w-xs sm:max-w-none">
                {job.title}
              </li>
            </ol>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Back Button */}
              <Link
                href="/search"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Jobs
              </Link>

              {/* Job Header */}
              <div className="bg-card rounded-xl border border-border/50 p-8 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    {companyLogoUrl && (
                      <Image
                        src={companyLogoUrl}
                        alt={`${companyName} Logo`}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover border border-border/50"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 break-words">
                        {job.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          <span>{companyName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.type || 'Full-time'}</span>
                        </div>
                      </div>
                      <JobActions
                        jobId={job.id}
                        jobTitle={job.title}
                        companyName={companyName}
                      />
                    </div>
                  </div>


                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <DollarSign className="w-6 h-6 text-neon-green mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Salary</p>
                    <p className="font-semibold text-foreground">
                      {formatSalary(job.salary)}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Clock className="w-6 h-6 text-neon-blue mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Posted</p>
                    <p className="font-semibold text-foreground">{postedAt}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Calendar className="w-6 h-6 text-neon-purple mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Location Type</p>
                    <p className="font-semibold text-foreground capitalize">
                      {job.locationType || 'On-site'}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Users className="w-6 h-6 text-neon-pink mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Interest</p>
                    <p className="font-semibold text-foreground">Many</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-neon-blue/10 text-neon-blue rounded-full text-sm font-medium">
                    {job.type || 'Full-time'}
                  </span>
                  <span className="px-3 py-1 bg-neon-purple/10 text-neon-purple rounded-full text-sm font-medium">
                    {job.locationType || 'On-site'}
                  </span>
                  <span className="px-3 py-1 bg-neon-green/10 text-neon-green rounded-full text-sm font-medium">
                    {job.location || 'Remote'}
                  </span>
                </div>
              </div>

              {/* Job Description */}
              <div className="bg-card rounded-xl border border-border/50 p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Job Description</h2>
                <div
                  className="job-description-content text-muted-foreground leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:my-4 [&_li]:text-muted-foreground [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic"
                  dangerouslySetInnerHTML={{
                    __html: formatEnhancedDescription(job.aiEnhancedDescription || job.description || '<p>No description available.</p>')
                  }}
                />

                {/* SEO Backlink to Homepage */}
                <div className="mt-8 pt-6 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">
                    Find more job opportunities at{' '}
                    <Link
                      href="/"
                      className="text-neon-blue hover:text-neon-purple transition-colors font-medium underline decoration-neon-blue/30 hover:decoration-neon-purple/50"
                    >
                      Flumberico
                    </Link>
                    , your trusted job board platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Application CTA */}
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-foreground">Apply for this Position</h3>

                  {applicationLink ? (
                    <a
                      href={applicationLink}
                      className="futuristic-button w-full flex items-center justify-center gap-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Apply Now
                    </a>
                  ) : (
                    <JobApplicationForm
                      jobId={job.id}
                      jobTitle={job.title}
                      companyName={companyName}
                    />
                  )}

                  <div className="mt-4 p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
                    <div className="flex items-center gap-2 text-neon-blue">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Many people are interested in this job
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 text-foreground">Job Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-semibold text-foreground capitalize">
                        {job.type || 'Full-time'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-semibold text-foreground">
                        {job.location || 'Remote'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Location Type</span>
                      <span className="font-semibold text-foreground capitalize">
                        {job.locationType || 'On-site'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Salary</span>
                      <span className="font-semibold text-foreground">
                        {formatSalary(job.salary)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Share Job */}
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 text-foreground">Share this Job</h3>
                  <ShareJobButtons
                    jobTitle={job.title}
                    companyName={companyName}
                  />
                </div>

                {/* Safety Tips */}
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 text-foreground">Safety Tips</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Never pay for job applications</li>
                    <li>• Verify company legitimacy</li>
                    <li>• Protect personal information</li>
                    <li>• Report suspicious activity</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const job = await getJob(slug);

  return <JobDetailsCard job={job} />;
}