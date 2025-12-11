'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  CreditCard,
  LogOut
} from "lucide-react";
import Link from "next/link";

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    applications: boolean;
    interviews: boolean;
    offers: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    dataSharing: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'system';
    currency: string;
  };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      marketing: false,
      applications: true,
      interviews: true,
      offers: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      dataSharing: false
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      theme: 'system',
      currency: 'USD'
    }
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSettings();
    }
  }, [status]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        alert('Password changed successfully');
      } else {
        alert('Current password is incorrect');
      }
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const deleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/user/delete-account', {
          method: 'DELETE',
        });

        if (response.ok) {
          router.push('/auth/signin');
        } else {
          alert('Error deleting account');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
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

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'account', label: 'Account', icon: User },
  ];

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
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
            {saveSuccess && (
              <div className="flex items-center gap-2 text-neon-green">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Settings saved</span>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <nav className="glass-card p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg mb-2 flex items-center gap-3 transition-all duration-200 ${activeTab === tab.id
                        ? 'bg-neon-blue/10 text-neon-blue border-l-4 border-neon-blue'
                        : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold mb-6">General Settings</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Language</label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, language: e.target.value }
                        })}
                        className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
                      >
                        <option value="en">English</option>
                        <option value="id">Bahasa Indonesia</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Timezone</label>
                      <select
                        value={settings.preferences.timezone}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, timezone: e.target.value }
                        })}
                        className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Asia/Jakarta">WIB (Jakarta)</option>
                        <option value="Asia/Singapore">SGT (Singapore)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Theme</label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'light', label: 'Light', icon: '☀️' },
                          { value: 'dark', label: 'Dark', icon: '🌙' },
                          { value: 'system', label: 'System', icon: '💻' }
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => setSettings({
                              ...settings,
                              preferences: { ...settings.preferences, theme: theme.value as any }
                            })}
                            className={`p-4 border rounded-lg text-center transition-all ${settings.preferences.theme === theme.value
                                ? 'border-neon-blue bg-neon-blue/10'
                                : 'border-border/50 hover:border-neon-blue/50'
                              }`}
                          >
                            <div className="text-2xl mb-1">{theme.icon}</div>
                            <div className="text-sm font-medium">{theme.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Currency</label>
                      <select
                        value={settings.preferences.currency}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, currency: e.target.value }
                        })}
                        className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="IDR">IDR (Rp)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background/50 border border-border/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-neon-blue" />
                        <div>
                          <h3 className="font-medium">Email Notifications</h3>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, email: !settings.notifications.email }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors ${settings.notifications.email ? 'bg-neon-blue' : 'bg-muted'
                          }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-background/50 border border-border/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-neon-purple" />
                        <div>
                          <h3 className="font-medium">Push Notifications</h3>
                          <p className="text-sm text-muted-foreground">Receive push notifications</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, push: !settings.notifications.push }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors ${settings.notifications.push ? 'bg-neon-blue' : 'bg-muted'
                          }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.notifications.push ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium ml-2">Notification Types</h3>

                      {[
                        { key: 'applications', label: 'Job Application Updates', icon: '📄' },
                        { key: 'interviews', label: 'Interview Invitations', icon: '📅' },
                        { key: 'offers', label: 'Job Offers', icon: '🎉' },
                        { key: 'marketing', label: 'Marketing Emails', icon: '📢' }
                      ].map((type) => (
                        <div key={type.key} className="flex items-center justify-between p-3 bg-background/30 border border-border/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{type.icon}</span>
                            <span className="text-sm">{type.label}</span>
                          </div>
                          <button
                            onClick={() => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, [type.key]: !settings.notifications[type.key as keyof typeof settings.notifications] }
                            })}
                            className={`w-10 h-5 rounded-full transition-colors ${settings.notifications[type.key as keyof typeof settings.notifications] ? 'bg-neon-blue' : 'bg-muted'
                              }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.notifications[type.key as keyof typeof settings.notifications] ? 'translate-x-5' : 'translate-x-0.5'
                              }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold mb-6">Privacy Settings</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                      <select
                        value={settings.privacy.profileVisibility}
                        onChange={(e) => setSettings({
                          ...settings,
                          privacy: { ...settings.privacy, profileVisibility: e.target.value as any }
                        })}
                        className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
                      >
                        <option value="public">Public - Anyone can view your profile</option>
                        <option value="private">Private - Only recruiters can view your profile</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Information Sharing</h3>

                      {[
                        { key: 'showEmail', label: 'Show email address', icon: Mail },
                        { key: 'showPhone', label: 'Show phone number', icon: Smartphone },
                        { key: 'dataSharing', label: 'Share usage data for analytics', icon: Eye }
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.key} className="flex items-center justify-between p-3 bg-background/50 border border-border/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{item.label}</span>
                            </div>
                            <button
                              onClick={() => setSettings({
                                ...settings,
                                privacy: { ...settings.privacy, [item.key]: !settings.privacy[item.key as keyof typeof settings.privacy] }
                              })}
                              className={`w-10 h-5 rounded-full transition-colors ${settings.privacy[item.key as keyof typeof settings.privacy] ? 'bg-neon-blue' : 'bg-muted'
                                }`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.privacy[item.key as keyof typeof settings.privacy] ? 'translate-x-5' : 'translate-x-0.5'
                                }`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Privacy Notice</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your data is encrypted and securely stored. We never sell your personal information to third parties.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

                  <div className="space-y-6">
                    {/* Change Password */}
                    <div>
                      <h3 className="font-medium mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50 pr-10"
                            />
                            <button
                              onClick={() => setShowPasswords(!showPasswords)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">New Password</label>
                          <input
                            type={showPasswords ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                          <input
                            type={showPasswords ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-neon-blue/50"
                          />
                        </div>

                        <button
                          onClick={changePassword}
                          className="px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/80 transition-colors"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>

                    {/* Subscription */}
                    <div>
                      <h3 className="font-medium mb-4">Subscription</h3>
                      <Link
                        href="/upgrade"
                        className="p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg flex items-center justify-between hover:bg-neon-blue/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-neon-blue" />
                          <div>
                            <h4 className="font-medium">Manage Subscription</h4>
                            <p className="text-sm text-muted-foreground">Upgrade, downgrade or cancel your plan</p>
                          </div>
                        </div>
                        <div className="text-neon-blue">
                          →
                        </div>
                      </Link>
                    </div>

                    {/* Danger Zone */}
                    <div>
                      <h3 className="font-medium mb-4 text-destructive">Danger Zone</h3>
                      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-destructive">Delete Account</h4>
                            <p className="text-sm text-muted-foreground">
                              Permanently delete your account and all data
                            </p>
                          </div>
                          <button
                            onClick={deleteAccount}
                            className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/80 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="futuristic-button flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : null}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}