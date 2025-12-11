'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import companyLogoPlaceholder from "@/assets/company-logo-placeholder.png";
import { formatSalary, relativeDate } from "@/lib/utils";
import { Job } from "@prisma/client";
import { Banknote, Briefcase, Clock, Globe2, MapPin, ArrowRight, Sparkles, Heart, ExternalLink, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Badge from "./Badge";
import QuickApplyModal from "./QuickApplyModal";

interface JobListItemProps {
  job: Job;
}

export default function JobListItem({
  job: {
    id,
    slug,
    title,
    companyName,
    type,
    locationType,
    location,
    salary,
    salaryMin,
    salaryMax,
    companyLogoUrl,
    createdAt,
    aiEnhancedDescription, // Use AI-enhanced description
  },
}: JobListItemProps) {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickApplyModalOpen, setIsQuickApplyModalOpen] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Check if job is already saved when component mounts
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/save-job/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobId: id }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.isSaved);
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSavedStatus();
  }, [id, session?.user?.id]);

  const handleSaveJob = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaving || !session?.user?.id) {
      if (!session?.user?.id) {
        alert('Please sign in to save jobs');
        return;
      }
      return;
    }

    setIsSaving(true);
    try {
      const action = isSaved ? 'unsave' : 'save';
      const response = await fetch('/api/user/save-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId: id, action }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsSaved(!isSaved);

        // Show success feedback
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);

        // Show limit reached message if applicable
        if (data.limitReached) {
          setTimeout(() => {
            alert(data.message || 'Save limit reached');
          }, 2100);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user?.id) {
      alert('Please sign in to apply for jobs');
      return;
    }

    // Open quick apply modal
    setIsQuickApplyModalOpen(true);
  };

  // Strip HTML tags from aiEnhancedDescription for plain text display
  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  };

  const truncatedDescription = aiEnhancedDescription
    ? `${stripHtml(aiEnhancedDescription).substring(0, 150)}...`
    : "AI-enhanced description available soon.";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0, 217, 255, 0.2)" }}
      transition={{ duration: 0.3 }}
      className="glass-card group relative overflow-hidden border border-border/50 hover:border-neon-blue/50"
    >

      {/* Enhanced gradient overlay with modern design */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-transparent to-purple-500/8 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-pink-400/5 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-600 ease-out" />

      <div className="relative p-6">
        <div className="flex gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-border/50 hover:scale-110 transition-transform duration-300">
              <Image
                src={companyLogoUrl || companyLogoPlaceholder}
                alt={`${companyName} logo`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Job Content */}
          <div className="flex-grow space-y-3">
            <div>
              <Link href={`/jobs/${slug}`} className="group/link">
                <h2 className="text-xl font-semibold text-foreground group-hover/link:text-neon-blue transition-colors duration-200">
                  {title}
                </h2>
              </Link>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                {companyName}
                <span className="w-1 h-1 bg-muted-foreground/50 rounded-full"></span>
                <span className="text-neon-green">{relativeDate(createdAt)}</span>
              </p>
            </div>

            {/* AI-Enhanced Description */}
            {aiEnhancedDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {truncatedDescription}
              </p>
            )}

            {/* Job Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-4 h-4 text-neon-blue" />
                <span>{type}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-neon-green" />
                <span>{locationType}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe2 className="w-4 h-4 text-neon-purple" />
                <span>{location || "Worldwide"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Banknote className="w-4 h-4 text-neon-pink" />
                <span>{formatSalary(salaryMin, salaryMax, salary)}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-border/30">
            <div className="flex justify-end">
              {/* View Details Button */}
              <Link
                href={`/jobs/${slug}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Apply Modal */}
      <QuickApplyModal
        isOpen={isQuickApplyModalOpen}
        onClose={() => setIsQuickApplyModalOpen(false)}
        jobTitle={title}
        companyName={companyName}
        jobId={id}
      />
    </motion.article>
  );
}