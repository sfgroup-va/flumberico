"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Briefcase,
  MapPin,
  DollarSign,
  Mail,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckSquare,
  Square,
  Upload
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: number;
  title: string;
  slug: string;
  type: string;
  locationType: string;
  location?: string;
  description?: string;
  salary: number;
  companyName: string;
  applicationEmail?: string;
  applicationUrl?: string;
  companyLogoUrl?: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JobsResponse {
  jobs: Job[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  filters: {
    q?: string;
    status?: string;
    type?: string;
  };
}

export default function AdminJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [stats, setStats] = useState({
    jobs: { total: 0, approved: 0, pending: 0 }
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    jobId: number | null;
    jobTitle: string;
  }>({ show: false, jobId: null, jobTitle: '' });

  const jobsPerPage = 100;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchJobs();
      fetchStats();
    }
  }, [status, session, currentPage, statusFilter, typeFilter]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchJobs = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      if (refresh) setRefreshing(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);
      params.append("page", currentPage.toString());

      const response = await fetch(`/api/admin/jobs?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data: JobsResponse = await response.json();
      setJobs(data.jobs);
      setTotalResults(data.totalResults);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handleApprove = async (jobId: number, approved: boolean) => {
    try {
      const response = await fetch("/api/admin/jobs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: jobId, approved }),
      });

      if (!response.ok) {
        throw new Error("Failed to update job");
      }

      // Refresh jobs list and stats
      fetchJobs();
      fetchStats();
    } catch (error) {
      console.error("Error updating job:", error);
      setError("Failed to update job");
    }
  };

  const handleDelete = async (jobId: number, jobTitle: string) => {
    console.log('🗑️ Delete button clicked for job:', { jobId, jobTitle });

    // Try to show confirmation dialog
    try {
      const confirmed = window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`);
      console.log('📋 Confirmation result:', confirmed);

      if (false && !confirmed) {
        console.log('❌ Delete cancelled by user');
        return;
      }
    } catch (error) {
      console.error('⚠️ window.confirm error:', error);
      // If confirm fails, ask user to proceed anyway
      console.log('⚠️ Confirmation dialog failed, proceeding with delete...');
    }

    console.log('✅ Delete confirmed, sending request...');

    try {
      const requestBody = {
        jobIds: [jobId],
        action: 'delete'
      };
      console.log('📤 Request body:', requestBody);

      const response = await fetch("/api/admin/jobs/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status, response.statusText);

      const responseData = await response.json();
      console.log('📥 Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to delete job");
      }

      console.log('✅ Job deleted successfully, updating UI...');

      // Immediately remove the job from local state for instant UI update
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      setTotalResults(prev => Math.max(0, prev - 1));

      // Refresh jobs list and stats
      fetchJobs(true);
      fetchStats();

      // Show success message
      alert(`Successfully deleted "${jobTitle}"`);

      console.log('✅ List refreshed');
    } catch (error) {
      console.error("❌ Error deleting job:", error);
      setError("Failed to delete job");
      alert("Failed to delete job. Please try again.");

      // Refresh to ensure UI is in sync with database
      await fetchJobs(true);
    }
  };

  const handleRefresh = () => {
    fetchJobs(true);
    fetchStats();
  };

  const handleSelectJob = (jobId: number) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedJobs.size === jobs.length) {
      setSelectedJobs(new Set());
      setShowBulkActions(false);
    } else {
      const allJobIds = new Set(jobs.map(job => job.id));
      setSelectedJobs(allJobIds);
      setShowBulkActions(true);
    }
  };

  const handleBulkDelete = async () => {
    console.log('handleBulkDelete called', selectedJobs);
    if (selectedJobs.size === 0) return;

    if (false && !window.confirm(`Are you sure you want to delete ${selectedJobs.size} job(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/jobs/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobIds: Array.from(selectedJobs),
          action: 'delete'
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete jobs");
      }

      const responseData = await response.json();

      console.log('✅ Bulk delete successful, updating UI...');

      // Immediately remove deleted jobs from local state for instant UI update
      const deletedIds = Array.from(selectedJobs);
      setJobs(prevJobs => prevJobs.filter(job => !deletedIds.includes(job.id)));
      setTotalResults(prev => Math.max(0, prev - deletedIds.length));

      setSelectedJobs(new Set());
      setShowBulkActions(false);

      // Refresh jobs list and stats in background
      fetchJobs(true);
      fetchStats();

      alert(`Successfully deleted ${responseData.deletedCount || selectedJobs.size} job(s)`);
    } catch (error) {
      console.error("Error deleting jobs:", error);
      setError("Failed to delete jobs");
      alert("Failed to delete jobs. Please try again.");
    }
  };

  const handleBulkApprove = async (approved: boolean) => {
    if (selectedJobs.size === 0) return;

    try {
      const response = await fetch("/api/admin/jobs/bulk", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobIds: Array.from(selectedJobs), approved }),
      });

      if (!response.ok) {
        throw new Error("Failed to update jobs");
      }

      setSelectedJobs(new Set());
      setShowBulkActions(false);
      fetchJobs();
      fetchStats();
    } catch (error) {
      console.error("Error updating jobs:", error);
      setError("Failed to update jobs");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "admin")) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Job Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage all job postings and applications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-background/50 border border-border/50 rounded-lg hover:border-neon-blue/50 hover:bg-neon-blue/10 transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-neon-blue transition-colors"
              >
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 hover-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold text-neon-blue">{stats.jobs.total}</p>
              </div>
              <FileText className="w-8 h-8 text-neon-blue opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-6 hover-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-neon-green">
                  {stats.jobs.approved}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-neon-green opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-6 hover-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-neon-pink">
                  {stats.jobs.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-neon-pink opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-6 hover-glow"
          >
            <div className="space-y-3">
              <Link
                href="/admin/jobs/new"
                className="futuristic-button w-full flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Job
              </Link>
              <Link
                href="/admin/import"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neon-purple/10 border border-neon-purple/30 rounded-lg hover:bg-neon-purple/20 transition-colors text-neon-purple"
              >
                <Upload className="w-5 h-5" />
                Bulk Import
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl glass-card p-4 border-l-4 border-neon-blue shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedJobs.size} job{selectedJobs.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkApprove(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neon-green/10 border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-colors text-sm text-neon-green"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Selected
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkApprove(false)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neon-pink/10 border border-neon-pink/30 rounded-lg hover:bg-neon-pink/20 transition-colors text-sm text-neon-pink"
                  >
                    <XCircle className="w-4 h-4" />
                    Unapprove Selected
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      console.log('Delete button clicked');
                      await handleBulkDelete();
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/30 rounded-lg hover:bg-destructive/20 transition-colors text-sm text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedJobs(new Set());
                  setShowBulkActions(false);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Clear Selection
              </button>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-neon-blue/10 border border-neon-blue/30 rounded-lg hover:bg-neon-blue/20 transition-colors duration-200"
              >
                Search
              </button>
            </form>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card p-6"
        >
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || typeFilter
                  ? "Try adjusting your filters or search terms"
                  : "Start by adding your first job posting"}
              </p>
              <Link href="/admin/jobs/new" className="futuristic-button inline-flex">
                <Plus className="w-5 h-5 mr-2" />
                Add New Job
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="py-3 px-4 text-sm font-medium text-muted-foreground">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center justify-center w-5 h-5 hover:bg-neon-blue/10 rounded transition-colors"
                        title={selectedJobs.size === jobs.length ? "Deselect all" : "Select all"}
                      >
                        {selectedJobs.size === jobs.length ? (
                          <CheckSquare className="w-4 h-4 text-neon-blue" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Job</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Salary</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className={`border-b border-border/30 transition-colors ${selectedJobs.has(job.id) ? 'bg-neon-blue/5' : 'hover:bg-background/50'}`}>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleSelectJob(job.id)}
                          className="flex items-center justify-center w-5 h-5 hover:bg-neon-blue/10 rounded transition-colors"
                          title={selectedJobs.has(job.id) ? "Deselect job" : "Select job"}
                        >
                          {selectedJobs.has(job.id) ? (
                            <CheckSquare className="w-4 h-4 text-neon-blue" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <h4 className="font-medium text-foreground mb-1">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.companyName}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-neon-blue/10 border border-neon-blue/30 rounded text-xs text-neon-blue">
                          {job.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {job.locationType}
                          {job.location && ` (${job.location})`}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          ${job.salary ? job.salary.toLocaleString() : 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${job.approved
                          ? "bg-neon-green/10 border border-neon-green/30 text-neon-green"
                          : "bg-neon-pink/10 border border-neon-pink/30 text-neon-pink"
                          }`}>
                          {job.approved ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Approved
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Pending
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-muted-foreground">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/jobs/${job.slug}`}
                            target="_blank"
                            className="p-1 hover:bg-neon-blue/10 rounded transition-colors"
                            title="View job"
                          >
                            <Eye className="w-4 h-4 text-neon-blue" />
                          </Link>
                          <Link
                            href={`/admin/jobs/${job.slug}/edit`}
                            className="p-1 hover:bg-neon-purple/10 rounded transition-colors"
                            title="Edit job"
                          >
                            <Edit className="w-4 h-4 text-neon-purple" />
                          </Link>
                          <button
                            onClick={() => handleApprove(job.id, !job.approved)}
                            className="p-1 hover:bg-neon-green/10 rounded transition-colors"
                            title={job.approved ? "Unapprove" : "Approve"}
                          >
                            {job.approved ? (
                              <XCircle className="w-4 h-4 text-neon-pink" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-neon-green" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(job.id, job.title)}
                            className="p-1 hover:bg-destructive/10 rounded transition-colors"
                            title="Delete job"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/30">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * jobsPerPage) + 1} to{" "}
                {Math.min(currentPage * jobsPerPage, totalResults)} of {totalResults} jobs
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 bg-background/50 border border-border/50 rounded-lg hover:border-neon-blue/50 hover:bg-neon-blue/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-neon-blue/10 border border-neon-blue/30 rounded text-sm text-neon-blue">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-background/50 border border-border/50 rounded-lg hover:border-neon-blue/50 hover:bg-neon-blue/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}