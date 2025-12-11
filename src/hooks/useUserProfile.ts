import { useState, useEffect } from 'react';

export interface UserProfile {
  desiredJobTitles: string[];
  skills: string[];
  experienceYears?: number;
  location?: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  [key: string]: any;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch user profile if authenticated
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
        } else if (response.status === 401) {
          // User is not authenticated - this is expected
          setProfile(null);
        } else {
          console.error('Profile API error:', response.status);
          setProfile(null);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading };
}