'use client';

import { Mail, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ShareJobButtonsProps {
  jobTitle: string;
  companyName: string;
}

export default function ShareJobButtons({ jobTitle, companyName }: ShareJobButtonsProps) {
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const handleShareViaEmail = () => {
    const jobUrl = window.location.href;
    const subject = `Check out this ${jobTitle} position at ${companyName}`;
    const body = `Hi,\n\nI thought you might be interested in this ${jobTitle} position at ${companyName}.\n\n${jobUrl}\n\nBest regards`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleCopyLink = async () => {
    const jobUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(jobUrl);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = jobUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2000);
      } catch (error) {
        console.error('Fallback copy failed:', error);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleShareViaEmail}
      >
        <Mail className="w-4 h-4 mr-2" />
        Share via Email
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleCopyLink}
      >
        {copiedSuccess ? (
          <CheckCircle className="w-4 h-4 mr-2 text-neon-green" />
        ) : (
          <ExternalLink className="w-4 h-4 mr-2" />
        )}
        {copiedSuccess ? 'Link Copied!' : 'Copy Link'}
      </Button>
    </div>
  );
}