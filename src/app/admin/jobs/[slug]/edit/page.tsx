"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save,
  Eye,
  Briefcase,
  MapPin,
  DollarSign,
  Mail,
  ExternalLink,
  CheckCircle,
  Clock
} from "lucide-react";
import Link from "next/link";

interface JobFormData {
  title: string;
  type: string;
  locationType: string;
  location: string;
  description: string;
  salary: string;
  companyName: string;
  applicationEmail: string;
  applicationUrl: string;
  companyLogoUrl: string;
  approved: boolean;
}

export default function EditJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(false);

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    type: "Full-time",
    locationType: "Remote",
    location: "",
    description: "",
    salary: "",
    companyName: "",
    applicationEmail: "",
    applicationUrl: "",
    companyLogoUrl: "",
    approved: false,
  });

  const [originalSlug, setOriginalSlug] = useState("");

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Freelance",
    "Temporary"
  ];

  const locationTypes = [
    "Remote",
    "Hybrid",
    "On-site"
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin" && slug) {
      fetchJob();
    }
  }, [status, session, slug]);

  const fetchJob = async () => {
    try {
      setFetching(true);
      const response = await fetch(`/api/admin/jobs/${slug}`);

      if (!response.ok) {
        throw new Error("Job not found");
      }

      const job = await response.json();
      setOriginalSlug(job.slug);
      setFormData({
        title: job.title,
        type: job.type,
        locationType: job.locationType,
        location: job.location || "",
        description: job.description || "",
        salary: job.salary?.toString() || "",
        companyName: job.companyName,
        applicationEmail: job.applicationEmail || "",
        applicationUrl: job.applicationUrl || "",
        companyLogoUrl: job.companyLogoUrl || "",
        approved: job.approved,
      });
    } catch (error) {
      console.error("Error fetching job:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch job");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaving(true);

    try {
      const jobData = {
        ...formData,
        salary: parseInt(formData.salary) || null,
        applicationEmail: formData.applicationEmail || null,
        applicationUrl: formData.applicationUrl || null,
        companyLogoUrl: formData.companyLogoUrl || null,
      };

      const response = await fetch(`/api/admin/jobs/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update job");
      }

      const result = await response.json();
      setSuccess(true);

      // Update the slug if it changed
      if (result.slug !== slug) {
        router.replace(`/admin/jobs/${result.slug}`);
      }

    } catch (error) {
      console.error("Error updating job:", error);
      setError(error instanceof Error ? error.message : "Failed to update job");
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof JobFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (status === "loading" || fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "admin")) {
    return null; // Will redirect
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/admin/jobs" className="futuristic-button">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-b border-border/50"
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-purple to-neon-pink rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                  Edit Job
                </h1>
                <p className="text-sm text-muted-foreground">
                  Update job posting information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-2 px-4 py-2 bg-background/50 border border-border/50 rounded-lg hover:border-neon-blue/50 hover:bg-neon-blue/10 transition-all duration-200"
              >
                <Eye className="w-4 h-4" />
                {preview ? "Edit" : "Preview"}
              </button>
              <Link
                href="/admin/jobs"
                className="text-muted-foreground hover:text-neon-blue transition-colors"
              >
                Back to Jobs
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center"
          >
            <div className="w-16 h-16 bg-neon-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Save className="w-8 h-8 text-neon-green" />
            </div>
            <h2 className="text-2xl font-bold text-neon-green mb-4">Job Updated Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your job posting has been updated.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/admin/jobs"
                className="futuristic-button"
              >
                View All Jobs
              </Link>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-3 bg-background/50 border border-border/50 rounded-lg hover:border-neon-blue/50 hover:bg-neon-blue/10 transition-all duration-200"
              >
                Continue Editing
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Form */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-card p-6"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                      {error}
                    </div>
                  )}

                  {/* Job Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Job Details</h3>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-200"
                        placeholder="e.g., Senior Frontend Developer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Job Type *
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => handleInputChange("type", e.target.value)}
                          required
                          className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none"
                        >
                          {jobTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Location Type *
                        </label>
                        <select
                          value={formData.locationType}
                          onChange={(e) => handleInputChange("locationType", e.target.value)}
                          required
                          className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none"
                        >
                          {locationTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-200"
                        placeholder="e.g., New York, NY or Remote"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Job Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-200"
                        placeholder="Describe the role, responsibilities, requirements, and what makes it attractive..."
                      />
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Company Information</h3>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-200"
                        placeholder="Company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Annual Salary ($)
                      </label>
                      <input
                        type="number"
                        value={formData.salary}
                        onChange={(e) => handleInputChange("salary", e.target.value)}
                        min="0"
                        className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-200"
                        placeholder="e.g., 75000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Company Logo URL
                      </label>
                      <input
                        type="url"
                        value={formData.companyLogoUrl}
                        onChange={(e) => handleInputChange("companyLogoUrl", e.target.value)}
                        className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-200"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  </div>

                  {/* Application Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Application Information</h3>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Application Email
                      </label>
                      <input
                        type="email"
                        value={formData.applicationEmail}
                        onChange={(e) => handleInputChange("applicationEmail", e.target.value)}
                        className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-200"
                        placeholder="jobs@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Application URL
                      </label>
                      <input
                        type="url"
                        value={formData.applicationUrl}
                        onChange={(e) => handleInputChange("applicationUrl", e.target.value)}
                        className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-200"
                        placeholder="https://company.com/careers/job-123"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Provide either an email or application URL (or both)
                    </p>
                  </div>

                  {/* Approval */}
                  <div className="flex items-center gap-3 p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
                    <input
                      type="checkbox"
                      id="approved"
                      checked={formData.approved}
                      onChange={(e) => handleInputChange("approved", e.target.checked)}
                      className="w-4 h-4 text-neon-blue bg-background border-border rounded focus:ring-neon-blue"
                    />
                    <label htmlFor="approved" className="text-sm text-foreground">
                      Approve this job (will appear on homepage)
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full futuristic-button flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Update Job
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Preview */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-card p-6 sticky top-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Preview</h3>

                <div className="space-y-4">
                  {/* Job Header */}
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2">
                      {formData.title || "Job Title"}
                    </h4>
                    <p className="text-muted-foreground mb-3">{formData.companyName || "Company Name"}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-neon-blue/10 border border-neon-blue/30 rounded text-xs text-neon-blue">
                        {formData.type}
                      </span>
                      <span className="px-2 py-1 bg-neon-purple/10 border border-neon-purple/30 rounded text-xs text-neon-purple">
                        {formData.locationType}
                      </span>
                      {(formData.location && formData.location !== "") && (
                        <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-400">
                          {formData.location}
                        </span>
                      )}
                    </div>

                    {formData.salary && (
                      <div className="flex items-center gap-2 text-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">
                          ${parseInt(formData.salary).toLocaleString()}/year
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {formData.description && (
                    <div>
                      <h5 className="font-medium text-foreground mb-2">Job Description</h5>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {formData.description.length > 300
                          ? formData.description.substring(0, 300) + "..."
                          : formData.description
                        }
                      </div>
                    </div>
                  )}

                  {/* Application Info */}
                  <div className="border-t border-border/50 pt-4">
                    <h5 className="font-medium text-foreground mb-2">How to Apply</h5>
                    <div className="space-y-2">
                      {formData.applicationEmail && (
                        <a
                          href={`mailto:${formData.applicationEmail}`}
                          className="flex items-center gap-2 text-sm text-neon-blue hover:underline"
                        >
                          <Mail className="w-4 h-4" />
                          {formData.applicationEmail}
                        </a>
                      )}
                      {formData.applicationUrl && (
                        <a
                          href={formData.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-neon-blue hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Apply Online
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="border-t border-border/50 pt-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      formData.approved
                        ? "bg-neon-green/10 border border-neon-green/30 text-neon-green"
                        : "bg-neon-pink/10 border border-neon-pink/30 text-neon-pink"
                    }`}>
                      {formData.approved ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Published
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          Pending approval
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}