'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, FileText, Briefcase, Calendar, Send, Sparkles } from 'lucide-react';

interface QuickApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName: string;
  jobId: number;
}

export default function QuickApplyModal({ isOpen, onClose, jobTitle, companyName, jobId }: QuickApplyModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    experience: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    noticePeriod: '',
    salaryExpectation: '',
    location: '',
    willingToRelocate: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          coverLetter: formData.coverLetter,
          experience: formData.experience,
          linkedinUrl: formData.linkedinUrl,
          githubUrl: formData.githubUrl,
          portfolioUrl: formData.portfolioUrl,
          noticePeriod: formData.noticePeriod,
          salaryExpectation: formData.salaryExpectation,
          location: formData.location,
          willingToRelocate: formData.willingToRelocate,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          coverLetter: '',
          experience: '',
          linkedinUrl: '',
          githubUrl: '',
          portfolioUrl: '',
          noticePeriod: '',
          salaryExpectation: '',
          location: '',
          willingToRelocate: false,
        });

        // Close modal after success
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
        }, 2000);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Failed to submit application');
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrorMessage('Network error. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-background border border-border/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Quick Apply
                </h2>
                <p className="text-muted-foreground">
                  {jobTitle} at {companyName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-background/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {submitStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
                  <p className="text-muted-foreground">
                    Your application has been sent successfully. We'll be in touch soon!
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Error Message */}
                  {errorMessage && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
                      {errorMessage}
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5"
                          placeholder="New York, NY"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Professional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Experience</label>
                        <select
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5"
                        >
                          <option value="">Select Experience</option>
                          <option value="0-1">0-1 years</option>
                          <option value="1-3">1-3 years</option>
                          <option value="3-5">3-5 years</option>
                          <option value="5-10">5-10 years</option>
                          <option value="10+">10+ years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Notice Period</label>
                        <select
                          name="noticePeriod"
                          value={formData.noticePeriod}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5"
                        >
                          <option value="">Select Notice Period</option>
                          <option value="Immediate">Immediate</option>
                          <option value="2 weeks">2 weeks</option>
                          <option value="1 month">1 month</option>
                          <option value="2 months">2 months</option>
                          <option value="3+ months">3+ months</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Salary Expectation</label>
                        <input
                          type="text"
                          name="salaryExpectation"
                          value={formData.salaryExpectation}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5"
                          placeholder="$80,000 - $100,000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Online Presence */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Online Presence (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                        <input
                          type="url"
                          name="linkedinUrl"
                          value={formData.linkedinUrl}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">GitHub URL</label>
                        <input
                          type="url"
                          name="githubUrl"
                          value={formData.githubUrl}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5"
                          placeholder="https://github.com/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Portfolio URL</label>
                        <input
                          type="url"
                          name="portfolioUrl"
                          value={formData.portfolioUrl}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5"
                          placeholder="https://portfolio.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Cover Letter (Optional)
                    </h3>
                    <textarea
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5 resize-none"
                      placeholder="Tell us why you're interested in this position..."
                    />
                  </div>

                  {/* Willing to Relocate */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="willingToRelocate"
                      id="willingToRelocate"
                      checked={formData.willingToRelocate}
                      onChange={handleChange}
                      className="w-4 h-4 text-neon-blue bg-background border border-border/50 rounded focus:ring-neon-blue/50"
                    />
                    <label htmlFor="willingToRelocate" className="text-sm">
                      Willing to relocate for this position
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2 border border-border/50 rounded-lg hover:bg-background/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg font-medium hover:from-neon-blue/80 hover:to-neon-purple/80 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}