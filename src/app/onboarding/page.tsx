'use client';

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Target,
  Rocket
} from "lucide-react";
import Link from "next/link";
// API routes will handle AI parsing server-side

interface ParsedData {
  skills: string[];
  experience: any[];
  education: any[];
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  achievements?: string[];
  summary: string;
  totalExperience: number;
}

export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Debug logging
  console.log('Onboarding - Auth Status:', status);
  console.log('Onboarding - Session:', session);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [optimizedSummary, setOptimizedSummary] = useState("");
  const [error, setError] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCVText, setManualCVText] = useState("");
  const [jobPreferences, setJobPreferences] = useState({
    jobTitles: [] as string[],
    locations: [] as string[],
    jobType: "full-time",
    remotePreference: "remote",
    salaryRange: "80000-120000"
  });

  useEffect(() => {
    if (status === "loading") return; // Don't redirect while loading

    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    // Optional: If user already completed onboarding, redirect to dashboard
    if (status === "authenticated" && session?.user) {
      // You could add a check here to see if onboarding is completed
      // For now, allow access to onboarding page
    }
  }, [status, router, session]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && (uploadedFile.type === "application/pdf" || uploadedFile.type === "application/msword" || uploadedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      setFile(uploadedFile);
      setError("");
    } else {
      setError("Please upload a PDF or Word document");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleResumeUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('resumeFile', file);

      const response = await fetch('/api/onboarding/upload-resume', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        throw new Error(errorData.error || 'Failed to upload resume');
      }

      const data = await response.json();
      console.log('Upload successful, extracted text length:', data.extractedText?.length);

      // Check if PDF text extraction failed
      if (data.warning === 'no_text_extracted') {
        setError(data.message);
        setShowManualInput(true);
        setIsUploading(false);
        return;
      }

      // Process with AI via API route (server-side)
      setIsProcessing(true);
      console.log('Starting AI parsing via API...');

      const parseResponse = await fetch('/api/onboarding/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: data.extractedText })
      });

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        throw new Error(errorData.error || 'Failed to parse resume');
      }

      const parseData = await parseResponse.json();
      const parsed = parseData.parsed;
      console.log('AI parsing complete:', parsed);
      setParsedData(parsed);

      // Generate optimized summary via API
      console.log('Generating optimized summary via API...');
      const optimizeResponse = await fetch('/api/onboarding/optimize-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: parsed.summary, parsedResume: parsed })
      });

      if (!optimizeResponse.ok) {
        const errorData = await optimizeResponse.json();
        throw new Error(errorData.error || 'Failed to optimize summary');
      }

      const optimizeData = await optimizeResponse.json();
      const optimized = optimizeData.optimizedSummary;
      console.log('Optimized summary:', optimized);
      setOptimizedSummary(optimized);

      setStep(2);
    } catch (error) {
      console.error('Error in handleResumeUpload:', error);
      setError("Failed to process resume. Please try again.");
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleManualTextSubmit = async () => {
    if (!manualCVText.trim()) {
      setError("Please enter your CV text");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");

      console.log('Processing manual CV text via API...');

      const parseResponse = await fetch('/api/onboarding/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: manualCVText })
      });

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        throw new Error(errorData.error || 'Failed to parse resume');
      }

      const parseData = await parseResponse.json();
      const parsed = parseData.parsed;
      console.log('AI parsing complete:', parsed);
      setParsedData(parsed);

      const optimizeResponse = await fetch('/api/onboarding/optimize-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: parsed.summary, parsedResume: parsed })
      });

      if (!optimizeResponse.ok) {
        const errorData = await optimizeResponse.json();
        throw new Error(errorData.error || 'Failed to optimize summary');
      }

      const optimizeData = await optimizeResponse.json();
      const optimized = optimizeData.optimizedSummary;
      console.log('Optimized summary:', optimized);
      setOptimizedSummary(optimized);

      setStep(2);
    } catch (error) {
      console.error('Error processing manual text:', error);
      setError("Failed to process CV text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJobPreferencesSubmit = async () => {
    try {
      const response = await fetch('/api/onboarding/save-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData: parsedData,
          optimizedSummary,
          preferences: jobPreferences
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      setStep(3);
    } catch (error) {
      setError("Failed to save preferences. Please try again.");
    }
  };

  const handleActivation = async () => {
    router.push('/dashboard');
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  // Step 1: DNA Upload
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
        {/* Progress Bar */}
        <div className="w-full bg-border/30 h-1">
          <div className="bg-gradient-to-r from-neon-blue to-neon-purple h-1 w-1/3 transition-all duration-500" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-4 py-12"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-4">
              Upload Your Professional DNA
            </h1>
            <p className="text-xl text-muted-foreground">
              Let our AI analyze your resume to build your perfect job hunting profile
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div
                {...getRootProps()}
                className={`glass-card p-12 border-2 border-dashed cursor-pointer transition-all duration-300 ${isDragActive
                  ? 'border-neon-blue bg-neon-blue/5'
                  : 'border-border/50 hover:border-neon-blue/50 hover:bg-neon-blue/5'
                  }`}
              >
                <input {...getInputProps()} />
                <div className="text-center space-y-4">
                  {file ? (
                    <>
                      <FileText className="w-16 h-16 text-neon-green mx-auto" />
                      <div>
                        <p className="font-semibold text-neon-green">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-16 h-16 text-neon-blue mx-auto" />
                      <div>
                        <p className="font-semibold">
                          {isDragActive ? 'Drop your resume here' : 'Select or drop your resume'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PDF, DOC, or DOCX (Max 10MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <button
                    onClick={handleResumeUpload}
                    disabled={isUploading || isProcessing}
                    className="w-full futuristic-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        AI is analyzing your resume...
                      </>
                    ) : isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Analyze with AI
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  <div className="whitespace-pre-line">{error}</div>
                </motion.div>
              )}

              {showManualInput && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-neon-blue" />
                      Paste Your CV Text
                    </h3>
                    <textarea
                      value={manualCVText}
                      onChange={(e) => setManualCVText(e.target.value)}
                      placeholder="Paste your CV content here... Include your name, contact info, skills, experience, and education."
                      className="w-full h-64 p-4 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue focus:outline-none resize-none"
                    />
                    <button
                      onClick={handleManualTextSubmit}
                      disabled={isProcessing || !manualCVText.trim()}
                      className="w-full mt-4 futuristic-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          AI is analyzing your text...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Analyze Text with AI
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Info Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-neon-purple" />
                  <h3 className="font-semibold">What We Extract</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Technical skills and competencies</li>
                  <li>• Work experience and achievements</li>
                  <li>• Educational background</li>
                  <li>• Professional certifications</li>
                  <li>• Career progression timeline</li>
                </ul>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-neon-blue" />
                  <h3 className="font-semibold">AI Analysis</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our AI will analyze your resume to identify key strengths, calculate years of experience, and generate an optimized professional summary that appeals to recruiters and ATS systems.
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Rocket className="w-6 h-6 text-neon-green" />
                  <h3 className="font-semibold">Next Steps</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  After analysis, you'll review your extracted information and set job preferences to activate your AI Hunter.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 2: Review & Optimize
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
        {/* Progress Bar */}
        <div className="w-full bg-border/30 h-1">
          <div className="bg-gradient-to-r from-neon-blue to-neon-purple h-1 w-2/3 transition-all duration-500" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto px-4 py-12"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-4">
              Review Your Professional Profile
            </h1>
            <p className="text-xl text-muted-foreground">
              Here's what our AI extracted from your resume
            </p>
          </div>

          {parsedData && (
            <div className="space-y-8">
              {/* AI-Optimized Summary - Full Width */}
              <div className="glass-card p-8 border-2 border-neon-purple/30">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-neon-purple" />
                  Professional Summary
                </h3>
                <p className="text-base text-foreground leading-relaxed">
                  {optimizedSummary}
                </p>
                <div className="mt-4 p-3 bg-neon-purple/10 border border-neon-purple/30 rounded-lg">
                  <p className="text-sm text-neon-purple">
                    ✨ AI-Optimized for ATS systems and recruiter appeal
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Key Skills */}
                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-neon-green" />
                    Key Skills ({parsedData.skills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-neon-blue/10 text-neon-blue text-xs rounded-full border border-neon-blue/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-neon-pink" />
                    Experience ({parsedData.totalExperience} years)
                  </h3>
                  <div className="space-y-4">
                    {parsedData.experience.slice(0, 3).map((exp, index) => (
                      <div key={index} className="border-l-2 border-neon-pink/30 pl-4">
                        <p className="font-medium text-sm">{exp.title}</p>
                        <p className="text-xs text-muted-foreground mb-1">{exp.company} • {exp.duration}</p>
                        <p className="text-xs text-muted-foreground/80">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                {parsedData.certifications && parsedData.certifications.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-neon-green" />
                      Certifications ({parsedData.certifications.length})
                    </h3>
                    <div className="space-y-3">
                      {parsedData.certifications.map((cert, index) => (
                        <div key={index} className="border-l-2 border-neon-green/30 pl-4">
                          <p className="font-medium text-sm">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuer} • {cert.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {parsedData.languages && parsedData.languages.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-neon-blue" />
                      Languages ({parsedData.languages.length})
                    </h3>
                    <div className="space-y-2">
                      {parsedData.languages.map((lang, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{lang.language}</span>
                          <span className="text-xs text-muted-foreground">{lang.proficiency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {parsedData.achievements && parsedData.achievements.length > 0 && (
                  <div className="glass-card p-6 lg:col-span-2">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-neon-purple" />
                      Key Achievements ({parsedData.achievements.length})
                    </h3>
                    <ul className="space-y-2">
                      {parsedData.achievements.map((achievement, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-neon-purple mt-1">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Job Preferences */}
                <div className="glass-card p-6 lg:col-span-2">
                  <h3 className="font-semibold mb-4">Job Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Desired Job Titles</label>
                      <input
                        type="text"
                        placeholder="e.g., Senior Frontend Developer, Product Manager"
                        className="w-full mt-1 px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm"
                        onChange={(e) => setJobPreferences(prev => ({
                          ...prev,
                          jobTitles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Preferred Locations</label>
                      <input
                        type="text"
                        placeholder="e.g., Remote, New York, San Francisco"
                        className="w-full mt-1 px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm"
                        onChange={(e) => setJobPreferences(prev => ({
                          ...prev,
                          locations: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleJobPreferencesSubmit}
              className="futuristic-button flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Save & Continue
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 3: Activation
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-4">
              Your AI Hunter is Ready!
            </h1>

            <p className="text-muted-foreground mb-8">
              Your professional DNA has been analyzed and your profile is optimized. Your AI Hunter is now ready to find opportunities while you sleep.
            </p>

            <div className="space-y-4 mb-8">
              <div className="text-left p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
                <h3 className="font-semibold text-neon-blue mb-2">What's Next?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• View your Command Center dashboard</li>
                  <li>• Monitor your Application Pulse</li>
                  <li>• Upgrade to Pro for automated applications</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleActivation}
              className="w-full futuristic-button flex items-center justify-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              Go to Command Center
            </button>

            <div className="mt-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
              <p className="text-xs text-neon-green">
                <Sparkles className="inline w-3 h-3 mr-1" />
                83% success rate - Your AI Hunter starts working immediately!
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return null;
}