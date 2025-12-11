'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, Share2, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JobActionsProps {
  jobId: number;
  jobTitle: string;
  companyName: string;
}

export default function JobActions({ jobId, jobTitle, companyName }: JobActionsProps) {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
          body: JSON.stringify({ jobId }),
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
  }, [jobId, session?.user?.id]);

  const handleSaveJob = async () => {
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
        body: JSON.stringify({ jobId, action }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsSaved(!isSaved);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);

        // Show limit reached message if applicable
        if (data.limitReached) {
          alert(data.message || 'Save limit reached');
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

  const handleShareJob = async () => {
    const jobUrl = window.location.href;
    const shareText = `Check out this ${jobTitle} position at ${companyName}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${jobTitle} at ${companyName}`,
          text: shareText,
          url: jobUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(jobUrl);
        alert('Job link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Failed to copy link');
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSaveJob}
        disabled={isSaving || isLoading}
        className={`${isSaved ? 'bg-neon-green/10 border-neon-green/30 text-neon-green hover:bg-neon-green/20' : 'hover:bg-neon-blue/10 hover:border-neon-blue/30 hover:text-neon-blue'}`}
      >
        {isLoading ? (
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
        ) : isSaving ? (
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
        ) : showSaveSuccess ? (
          <CheckCircle className="w-4 h-4 mr-2" />
        ) : (
          <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
        )}
        {isLoading ? 'Loading...' : isSaved ? 'Saved' : 'Save'}
      </Button>

      <Button variant="outline" size="sm" onClick={handleShareJob}>
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </div>
  );
}