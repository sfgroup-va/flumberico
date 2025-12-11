import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Browse Jobs | Flumberico',
    description: 'Search and browse AI-powered job listings on Flumberico',
};

/**
 * Jobs listing page
 * Redirects to /search which contains the main job browsing interface
 * This provides a user-friendly URL while maintaining a single source of truth
 */
export default function JobsPage() {
    redirect('/search');
}
