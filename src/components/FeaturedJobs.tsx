"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Clock, DollarSign, Building } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatSalary, relativeDate } from "@/lib/utils";
import { Job } from "@prisma/client";

interface FeaturedJobsProps {
  className?: string;
}

export default function FeaturedJobs({ className = "" }: FeaturedJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);

  // Company emoji mapping for professional appearance
  const getCompanyEmoji = (companyName: string): string => {
    const name = companyName.toLowerCase();
    if (name.includes('tech') || name.includes('software') || name.includes('dev')) return '💻';
    if (name.includes('design') || name.includes('creative')) return '🎨';
    if (name.includes('data') || name.includes('analytics')) return '📊';
    if (name.includes('cloud') || name.includes('infra')) return '☁️';
    if (name.includes('finance') || name.includes('bank')) return '🏦';
    if (name.includes('health') || name.includes('medical')) return '🏥';
    if (name.includes('retail') || name.includes('shop')) return '🛍️';
    if (name.includes('media') || name.includes('content')) return '📺';
    if (name.includes('education') || name.includes('learn')) return '🎓';
    if (name.includes('consult') || name.includes('advisory')) return '💼';
    return '🏢'; // Default company emoji
  };


  // Extract skills from job data
  const extractSkills = (job: Job): string[] => {
    // Prioritize AI-extracted skills
    if (job.aiExtractedSkills && job.aiExtractedSkills.length > 0) {
      return job.aiExtractedSkills.slice(0, 4); // Show max 4 skills
    }

    // Fallback to parsing description
    const commonSkills = [
      'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Java', 'AWS',
      'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'GraphQL', 'REST API',
      'CI/CD', 'Git', 'Agile', 'Scrum', 'DevOps', 'Microservices', 'AWS', 'Azure',
      'GCP', 'Figma', 'UI/UX', 'Product Management', 'Data Analysis', 'Machine Learning',
      'TensorFlow', 'PyTorch', 'SQL', 'NoSQL', 'Redis', 'ElasticSearch', 'Kafka'
    ];

    const description = (job.aiEnhancedDescription || job.description || '').toLowerCase();
    const foundSkills = commonSkills.filter(skill =>
      description.includes(skill.toLowerCase())
    );

    return foundSkills.slice(0, 4);
  };

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching featured jobs from /api/jobs...');

      // Fetch latest approved jobs
      const response = await fetch('/api/jobs?approved=true&page=1');
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Received data:', {
        jobCount: data.jobs?.length,
        totalResults: data.totalResults
      });

      // Take the first 6 jobs for featured section
      const featuredJobs = data.jobs.slice(0, 6);

      setJobs(featuredJobs);
      setTotalJobs(data.totalResults || 0);
    } catch (error) {
      console.error('❌ Error fetching featured jobs:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Fallback to empty array if error
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`py-16 px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Latest Opportunities
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover AI-enhanced job descriptions that match your skills perfectly
            </p>
          </div>

          {/* Loading skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-600 rounded w-32"></div>
                      <div className="h-4 bg-gray-600 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-5 bg-gray-600 rounded w-12 mb-1"></div>
                    <div className="h-3 bg-gray-600 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-600 rounded w-48"></div>
                  <div className="h-6 bg-gray-600 rounded w-36"></div>
                  <div className="flex gap-2">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-6 bg-gray-600 rounded-full w-16"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0 && !loading) {
    return (
      <div className={`py-16 px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Jobs Available Yet</h3>
            <p className="text-gray-400 mb-6">We're working on adding the latest AI-enhanced job opportunities.</p>
            <Link
              href="/auth/signup"
              className="futuristic-button inline-flex items-center gap-2"
            >
              Get Notified When Jobs Are Available
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-white/5 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Latest Opportunities
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover AI-enhanced job descriptions that match your skills perfectly
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 px-4">
            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm font-medium">
              ✨ AI-Optimized Descriptions
            </span>
            <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-xs sm:text-sm font-medium">
              🎯 Perfect Match Algorithm
            </span>
            <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-xs sm:text-sm font-medium">
              🚀 Apply with One Click
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => {
            const skills = extractSkills(job);
            const companyEmoji = getCompanyEmoji(job.companyName);
            const salary = formatSalary(job.salaryMin, job.salaryMax, job.salary);

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group hover:scale-[1.02] hover:border-blue-500/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {job.companyLogoUrl ? (
                      <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex items-center justify-center p-1">
                        <Image
                          src={job.companyLogoUrl}
                          alt={`${job.companyName} logo`}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-2xl">
                        {companyEmoji}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{job.companyName}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4" />
                    {job.location || "Remote"} • {job.locationType}
                  </div>

                  {salary && (
                    <div className="text-lg font-semibold text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      {salary.replace('$', '')}
                    </div>
                  )}

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {relativeDate(job.createdAt)}
                    </span>
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 text-white font-medium"
          >
            View All {totalJobs.toLocaleString()} Jobs
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}