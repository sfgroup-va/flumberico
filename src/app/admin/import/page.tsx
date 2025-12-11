'use client';

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import {
  Upload,
  FileSpreadsheet,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Download,
  Info
} from "lucide-react";
import Link from "next/link";

interface CSVRow {
  title: string;
  type: string;
  locationType: string;
  location?: string;
  description: string;
  salary: string;
  companyName: string;
  applicationEmail?: string;
  applicationUrl?: string;
  companyLogoUrl?: string;
}

export default function AdminImport() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === "text/csv") {
      setFile(uploadedFile);
      setUploadResult(null);

      // Parse and preview the CSV
      Papa.parse(uploadedFile, {
        header: true,
        complete: (results) => {
          const validRows = results.data.filter((row: any) =>
            row.title && row.companyName && row.description
          ).slice(0, 5) as CSVRow[]; // Show first 5 valid rows as preview
          setPreview(validRows);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
        }
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await fetch('/api/admin/import-jobs', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult(result);
        setFile(null);
        setPreview([]);
      } else {
        setUploadResult({
          success: 0,
          failed: 0,
          errors: [result.error || 'Upload failed']
        });
      }
    } catch (error) {
      setUploadResult({
        success: 0,
        failed: 0,
        errors: ['Network error. Please try again.']
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
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
              <Link
                href="/admin"
                className="flex items-center gap-2 text-muted-foreground hover:text-neon-blue transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Import Jobs with AI
                </h1>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file and let Gemini AI enhance your job descriptions
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-start gap-4">
            <Info className="w-5 h-5 text-neon-blue mt-0.5 flex-shrink-0" />
            <div className="space-y-3">
              <h3 className="font-semibold text-neon-blue">CSV Format Requirements</h3>
              <p className="text-sm text-muted-foreground">
                Your CSV file should include the following columns (required fields marked with *):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-neon-green">*</span> <code>title</code> - Job title
                </div>
                <div>
                  <span className="text-neon-green">*</span> <code>companyName</code> - Company name
                </div>
                <div>
                  <span className="text-neon-green">*</span> <code>description</code> - Original job description
                </div>
                <div><code>type</code> - Full-time, Part-time, Contract</div>
                <div><code>locationType</code> - Remote, On-site, Hybrid</div>
                <div><code>location</code> - City, State/Country</div>
                <div><code>salary</code> - Annual salary (number)</div>
                <div><code>applicationEmail</code> - Application email</div>
                <div><code>applicationUrl</code> - Application URL</div>
                <div><code>companyLogoUrl</code> - Company logo URL</div>
              </div>
              <div className="pt-3">
                <a
                  href="/sample-jobs.csv"
                  download
                  className="inline-flex items-center gap-2 text-neon-blue hover:text-neon-purple transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Sample CSV
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div
            {...getRootProps()}
            className={`glass-card p-12 border-2 border-dashed cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-neon-blue bg-neon-blue/5'
                : 'border-border/50 hover:border-neon-blue/50 hover:bg-neon-blue/5'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-center space-y-4">
              {file ? (
                <>
                  <CheckCircle className="w-16 h-16 text-neon-green mx-auto" />
                  <div>
                    <p className="font-semibold text-neon-green">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-16 h-16 text-neon-blue mx-auto" />
                  <div>
                    <p className="font-semibold">
                      {isDragActive ? 'Drop your CSV file here' : 'Select or drop your CSV file'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Maximum file size: 10MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Preview */}
        {preview.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-purple" />
              Preview (First 5 rows)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Company</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, index) => (
                    <tr key={index} className="border-b border-border/30">
                      <td className="p-2 font-medium">{row.title}</td>
                      <td className="p-2">{row.companyName}</td>
                      <td className="p-2">{row.type || '-'}</td>
                      <td className="p-2">{row.location || row.locationType || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Upload Button */}
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="futuristic-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Import & Enhance with AI
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground mt-3">
              This may take a few moments as each job description is processed by Google Gemini AI
            </p>
          </motion.div>
        )}

        {/* Results */}
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold mb-4">Import Results</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                <p className="text-2xl font-bold text-neon-green">{uploadResult.success}</p>
                <p className="text-sm text-neon-green">Successfully Imported</p>
              </div>
              <div className="text-center p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-2xl font-bold text-destructive">{uploadResult.failed}</p>
                <p className="text-sm text-destructive">Failed</p>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Errors
                </h4>
                <div className="space-y-1">
                  {uploadResult.errors.map((error, index) => (
                    <p key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {uploadResult.success > 0 && (
              <div className="mt-4 p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
                <p className="text-sm text-neon-blue">
                  <Sparkles className="inline w-3 h-3 mr-1" />
                  All {uploadResult.success} jobs have been enhanced with AI and are ready for review.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}