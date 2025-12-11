'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Target,
  Briefcase,
  MapPin,
  DollarSign,
  Settings,
  Save,
  Sparkles,
  TrendingUp,
  Users,
  Building,
  X,
  Plus,
  CheckCircle
} from "lucide-react";
import { QueueManager } from "@/lib/queue";

interface JobPreference {
  jobTitles: string[];
  locations: string[];
  companySizes: string[];
  industries: string[];
  salaryMin?: number;
  salaryMax?: number;
  remoteOnly: boolean;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  excludeCompanies: string[];
}

export default function JobPreferences() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [preferences, setPreferences] = useState<JobPreference>({
    jobTitles: [],
    locations: [],
    companySizes: [],
    industries: [],
    salaryMin: undefined,
    salaryMax: undefined,
    remoteOnly: true,
    mustHaveSkills: [],
    niceToHaveSkills: [],
    excludeCompanies: []
  });

  // Input states for adding new items
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newMustHaveSkill, setNewMustHaveSkill] = useState('');
  const [newNiceToHaveSkill, setNewNiceToHaveSkill] = useState('');
  const [newExcludeCompany, setNewExcludeCompany] = useState('');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    // Load user preferences
    if (status === "authenticated") {
      loadPreferences();
    }
  }, [status]);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleScanNow = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/user/scan-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Scan initiated:', data);
      }
    } catch (error) {
      console.error('Error initiating scan:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const addArrayItem = (array: string[], setArray: (items: string[]) => void, value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      setArray([...array, value.trim()]);
      setValue('');
    }
  };

  const removeArrayItem = (array: string[], setArray: (items: string[]) => void, index: number) => {
    setArray(array.filter((_, i) => i !== index));
  };

  const companySizeOptions = [
    'Startup (1-10)',
    'Small (11-50)',
    'Medium (51-200)',
    'Large (201-1000)',
    'Enterprise (1000+)'
  ];

  const industryOptions = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Consulting',
    'Media',
    'Government',
    'Non-profit'
  ];

  const suggestedSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'SQL', 'MongoDB'
  ];

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Job Matching Preferences
                </h1>
                <p className="text-sm text-muted-foreground">
                  Fine-tune your AI Hunter for better matches
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleScanNow}
                disabled={isScanning}
                className="px-4 py-2 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Scan Now
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="futuristic-button flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg text-neon-green flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Preferences saved successfully!
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Preferences */}
          <div className="space-y-8">
            {/* Job Titles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-neon-blue" />
                Desired Job Titles
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Senior Frontend Developer"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem(preferences.jobTitles, (items) => setPreferences({...preferences, jobTitles: items}), newJobTitle, setNewJobTitle)}
                    className="flex-1 px-3 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none focus:ring-2 focus:ring-neon-blue/20"
                  />
                  <button
                    onClick={() => addArrayItem(preferences.jobTitles, (items) => setPreferences({...preferences, jobTitles: items}), newJobTitle, setNewJobTitle)}
                    className="p-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 rounded-lg hover:bg-neon-blue/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferences.jobTitles.map((title, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-neon-blue/10 text-neon-blue rounded-full text-sm flex items-center gap-1"
                    >
                      {title}
                      <button
                        onClick={() => removeArrayItem(preferences.jobTitles, (items) => setPreferences({...preferences, jobTitles: items}), index)}
                        className="hover:text-neon-pink"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Locations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-neon-green" />
                Preferred Locations
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Remote, New York, San Francisco"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem(preferences.locations, (items) => setPreferences({...preferences, locations: items}), newLocation, setNewLocation)}
                    className="flex-1 px-3 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-green/50 focus:outline-none focus:ring-2 focus:ring-neon-green/20"
                  />
                  <button
                    onClick={() => addArrayItem(preferences.locations, (items) => setPreferences({...preferences, locations: items}), newLocation, setNewLocation)}
                    className="p-2 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferences.locations.map((location, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-neon-green/10 text-neon-green rounded-full text-sm flex items-center gap-1"
                    >
                      {location}
                      <button
                        onClick={() => removeArrayItem(preferences.locations, (items) => setPreferences({...preferences, locations: items}), index)}
                        className="hover:text-neon-pink"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Salary Range */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-neon-pink" />
                Salary Range
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Minimum</label>
                  <input
                    type="number"
                    placeholder="80000"
                    value={preferences.salaryMin || ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, salaryMin: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="w-full mt-1 px-3 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-pink/50 focus:outline-none focus:ring-2 focus:ring-neon-pink/20"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Maximum</label>
                  <input
                    type="number"
                    placeholder="150000"
                    value={preferences.salaryMax || ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, salaryMax: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="w-full mt-1 px-3 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-pink/50 focus:outline-none focus:ring-2 focus:ring-neon-pink/20"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Skills & Companies */}
          <div className="space-y-8">
            {/* Must-Have Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-neon-purple" />
                Must-Have Skills
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., React, TypeScript"
                    value={newMustHaveSkill}
                    onChange={(e) => setNewMustHaveSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem(preferences.mustHaveSkills, (items) => setPreferences({...preferences, mustHaveSkills: items}), newMustHaveSkill, setNewMustHaveSkill)}
                    className="flex-1 px-3 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-neon-purple/50 focus:outline-none focus:ring-2 focus:ring-neon-purple/20"
                  />
                  <button
                    onClick={() => addArrayItem(preferences.mustHaveSkills, (items) => setPreferences({...preferences, mustHaveSkills: items}), newMustHaveSkill, setNewMustHaveSkill)}
                    className="p-2 bg-neon-purple/10 text-neon-purple border border-neon-purple/30 rounded-lg hover:bg-neon-purple/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferences.mustHaveSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-neon-purple/10 text-neon-purple rounded-full text-sm flex items-center gap-1"
                    >
                      {skill}
                      <button
                        onClick={() => removeArrayItem(preferences.mustHaveSkills, (items) => setPreferences({...preferences, mustHaveSkills: items}), index)}
                        className="hover:text-neon-pink"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Suggested skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.filter(skill => !preferences.mustHaveSkills.includes(skill)).slice(0, 5).map((skill) => (
                      <button
                        key={skill}
                        onClick={() => addArrayItem(preferences.mustHaveSkills, (items) => setPreferences({...preferences, mustHaveSkills: items}), skill, () => {})}
                        className="px-2 py-1 bg-background/50 border border-border/50 rounded text-xs hover:border-neon-purple/50 hover:text-neon-purple transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Exclude Companies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-destructive" />
                Exclude Companies
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Competitor Corp"
                    value={newExcludeCompany}
                    onChange={(e) => setNewExcludeCompany(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem(preferences.excludeCompanies, (items) => setPreferences({...preferences, excludeCompanies: items}), newExcludeCompany, setNewExcludeCompany)}
                    className="flex-1 px-3 py-2 bg-background/50 border border-border/50 rounded-lg focus:border-destructive/50 focus:outline-none focus:ring-2 focus:ring-destructive/20"
                  />
                  <button
                    onClick={() => addArrayItem(preferences.excludeCompanies, (items) => setPreferences({...preferences, excludeCompanies: items}), newExcludeCompany, setNewExcludeCompany)}
                    className="p-2 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferences.excludeCompanies.map((company, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm flex items-center gap-1"
                    >
                      {company}
                      <button
                        onClick={() => removeArrayItem(preferences.excludeCompanies, (items) => setPreferences({...preferences, excludeCompanies: items}), index)}
                        className="hover:text-neon-pink"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Remote Preference */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Work Preference</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.remoteOnly}
                    onChange={(e) => setPreferences(prev => ({ ...prev, remoteOnly: e.target.checked }))}
                    className="w-4 h-4 text-neon-blue bg-background border-border rounded focus:ring-neon-blue"
                  />
                  <span className="text-sm">Remote positions only</span>
                </label>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-neon-blue" />
            Pro Tips for Better Matches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
              <h4 className="font-medium text-neon-blue mb-2">Be Specific</h4>
              <p className="text-sm text-muted-foreground">
                Use exact job titles like "Senior Frontend Developer" instead of general terms like "Developer"
              </p>
            </div>
            <div className="p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
              <h4 className="font-medium text-neon-green mb-2">Balance Requirements</h4>
              <p className="text-sm text-muted-foreground">
                Focus on 3-5 must-have skills to avoid missing opportunities with slight variations
              </p>
            </div>
            <div className="p-4 bg-neon-purple/10 border border-neon-purple/30 rounded-lg">
              <h4 className="font-medium text-neon-purple mb-2">Regular Updates</h4>
              <p className="text-sm text-muted-foreground">
                Update your preferences as your skills and career goals evolve for better matching
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}