'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Briefcase,
  MapPin,
  Target,
  FileText,
  Settings,
  Save,
  Upload,
  X,
  Plus,
  Trash2,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

interface Profile {
  firstName: string;
  lastName: string;
  headline: string;
  location: string;
  bio: string;
  website: string;
  phone: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

interface Skill {
  id: string;
  name: string;
  level: string;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<Profile>({
    firstName: '',
    lastName: '',
    headline: '',
    location: '',
    bio: '',
    website: '',
    phone: ''
  });

  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  // Form states
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const [newEducation, setNewEducation] = useState<Partial<Education>>({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false
  });

  const [newSkill, setNewSkill] = useState({ name: '', level: 'intermediate' });

  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();

        // Set profile data
        if (data.profile) {
          setProfile({
            firstName: data.profile.firstName || '',
            lastName: data.profile.lastName || '',
            headline: data.profile.headline || '',
            location: data.profile.location || '',
            bio: data.profile.bio || '',
            website: data.profile.website || '',
            phone: data.profile.phone || ''
          });
        }

        // Set other data (mock for now)
        setExperience([
          {
            id: '1',
            company: 'Tech Company',
            position: 'Software Developer',
            startDate: '2022-01',
            endDate: '2023-12',
            current: false,
            description: 'Developed web applications using React and Node.js'
          }
        ]);

        setEducation([
          {
            id: '1',
            institution: 'University Name',
            degree: 'Bachelor\'s Degree',
            field: 'Computer Science',
            startDate: '2018-09',
            endDate: '2022-05',
            current: false
          }
        ]);

        setSkills([
          { id: '1', name: 'JavaScript', level: 'expert' },
          { id: '2', name: 'React', level: 'advanced' },
          { id: '3', name: 'Node.js', level: 'intermediate' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile,
          experience,
          education,
          skills
        }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    if (newExperience.company && newExperience.position) {
      const exp: Experience = {
        id: Date.now().toString(),
        company: newExperience.company || '',
        position: newExperience.position || '',
        startDate: newExperience.startDate || '',
        endDate: newExperience.endDate || '',
        current: newExperience.current || false,
        description: newExperience.description || ''
      };
      setExperience([...experience, exp]);
      setNewExperience({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      });
      setShowExperienceForm(false);
    }
  };

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      const edu: Education = {
        id: Date.now().toString(),
        institution: newEducation.institution || '',
        degree: newEducation.degree || '',
        field: newEducation.field || '',
        startDate: newEducation.startDate || '',
        endDate: newEducation.endDate || '',
        current: newEducation.current || false
      };
      setEducation([...education, edu]);
      setNewEducation({
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false
      });
      setShowEducationForm(false);
    }
  };

  const addSkill = () => {
    if (newSkill.name) {
      const skill: Skill = {
        id: Date.now().toString(),
        name: newSkill.name,
        level: newSkill.level
      };
      setSkills([...skills, skill]);
      setNewSkill({ name: '', level: 'intermediate' });
      setShowSkillForm(false);
    }
  };

  const removeExperience = (id: string) => {
    setExperience(experience.filter(exp => exp.id !== id));
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
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
              <Link href="/dashboard" className="text-muted-foreground hover:text-neon-blue transition-colors">
                ← Back to Dashboard
              </Link>
              <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Profile Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Optimize your profile for better job matches
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-neon-green">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Saved</span>
                </div>
              )}
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg font-semibold hover:from-neon-blue/80 hover:to-neon-purple/80 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-neon-blue" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Professional Headline</label>
              <input
                type="text"
                placeholder="e.g. Senior Software Developer"
                value={profile.headline}
                onChange={(e) => setProfile({...profile, headline: e.target.value})}
                className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                placeholder="City, Country"
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-muted/50 border border-border/50 rounded-lg opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <input
                type="url"
                placeholder="https://yourwebsite.com"
                value={profile.website}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              rows={4}
              placeholder="Tell us about yourself..."
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 resize-none"
            />
          </div>
        </motion.div>

        {/* Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-neon-blue" />
              Experience
            </h2>
            <button
              onClick={() => setShowExperienceForm(!showExperienceForm)}
              className="px-4 py-2 bg-neon-blue/10 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Experience
            </button>
          </div>

          {showExperienceForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-background/50 border border-border/50 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Company"
                  value={newExperience.company || ''}
                  onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                  className="px-4 py-2 bg-background border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={newExperience.position || ''}
                  onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                  className="px-4 py-2 bg-background border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
                />
                <input
                  type="month"
                  value={newExperience.startDate || ''}
                  onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}
                  className="px-4 py-2 bg-background border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
                />
                <input
                  type="month"
                  value={newExperience.endDate || ''}
                  onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}
                  disabled={newExperience.current}
                  className="px-4 py-2 bg-background border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 disabled:opacity-50"
                />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="currentExp"
                  checked={newExperience.current || false}
                  onChange={(e) => setNewExperience({...newExperience, current: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="currentExp" className="text-sm">I currently work here</label>
              </div>
              <textarea
                placeholder="Job description..."
                value={newExperience.description || ''}
                onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 resize-none mb-4"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={addExperience}
                  className="px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/80 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowExperienceForm(false)}
                  className="px-4 py-2 bg-muted/50 text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="p-4 bg-background/50 border border-border/50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    <p className="text-xs text-muted-foreground">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </p>
                    {exp.description && (
                      <p className="text-sm mt-2">{exp.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-neon-blue" />
              Skills
            </h2>
            <button
              onClick={() => setShowSkillForm(!showSkillForm)}
              className="px-4 py-2 bg-neon-blue/10 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Skill
            </button>
          </div>

          {showSkillForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-background/50 border border-border/50 rounded-lg"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Skill name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                  className="flex-1 px-4 py-2 bg-background border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
                />
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}
                  className="px-4 py-2 bg-background border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/80 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowSkillForm(false)}
                  className="px-4 py-2 bg-muted/50 text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="px-3 py-1 bg-neon-blue/10 text-neon-blue rounded-full text-sm flex items-center gap-2"
              >
                {skill.name}
                <button
                  onClick={() => removeSkill(skill.id)}
                  className="hover:text-neon-pink transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}