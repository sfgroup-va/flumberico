/**
 * Google Indexing API Integration
 * 
 * This module handles automatic indexing of job postings to Google Search
 * using the Google Indexing API for faster discovery and indexing.
 * 
 * @see https://developers.google.com/search/apis/indexing-api/v3/quickstart
 */

import { google } from 'googleapis';
import path from 'path';

// Type for indexing actions
type IndexingAction = 'URL_UPDATED' | 'URL_DELETED';

interface IndexingResult {
    success: boolean;
    url?: string;
    action?: IndexingAction;
    error?: string;
    metadata?: any;
}

/**
 * Google Indexing API Client
 */
class GoogleIndexingAPI {
    private static instance: GoogleIndexingAPI;
    private jwtClient: any;
    private initialized: boolean = false;

    private constructor() { }

    /**
     * Get singleton instance
     */
    static getInstance(): GoogleIndexingAPI {
        if (!GoogleIndexingAPI.instance) {
            GoogleIndexingAPI.instance = new GoogleIndexingAPI();
        }
        return GoogleIndexingAPI.instance;
    }

    /**
     * Initialize the Google API client with service account credentials
     */
    private async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            // Path to the service account JSON file
            const keyFilePath = path.join(process.cwd(), 'flumberico-c130ab94c72b.json');

            // Create JWT client
            this.jwtClient = new google.auth.JWT({
                keyFile: keyFilePath,
                scopes: ['https://www.googleapis.com/auth/indexing'],
            });

            // Authorize the client
            await this.jwtClient.authorize();

            this.initialized = true;
            console.log('✅ Google Indexing API initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Google Indexing API:', error);
            throw error;
        }
    }

    /**
     * Submit a URL to Google for indexing
     * 
     * @param url - The full URL to be indexed
     * @param action - The type of action (URL_UPDATED or URL_DELETED)
     * @returns Result of the indexing request
     */
    async submitUrl(url: string, action: IndexingAction = 'URL_UPDATED'): Promise<IndexingResult> {
        try {
            // Ensure client is initialized
            await this.initialize();

            // Create the indexing service
            const indexing = google.indexing({
                version: 'v3',
                auth: this.jwtClient,
            });

            // Submit the URL
            const response = await indexing.urlNotifications.publish({
                requestBody: {
                    url: url,
                    type: action,
                },
            });

            console.log(`✅ Successfully submitted to Google Indexing API:`, {
                url,
                action,
                status: response.status,
            });

            return {
                success: true,
                url,
                action,
                metadata: response.data,
            };
        } catch (error: any) {
            console.error(`❌ Failed to submit URL to Google Indexing API:`, {
                url,
                action,
                error: error.message,
            });

            return {
                success: false,
                url,
                action,
                error: error.message,
            };
        }
    }

    /**
     * Get the status of a URL in Google's index
     * 
     * @param url - The URL to check
     * @returns Metadata about the URL's indexing status
     */
    async getUrlStatus(url: string): Promise<IndexingResult> {
        try {
            await this.initialize();

            const indexing = google.indexing({
                version: 'v3',
                auth: this.jwtClient,
            });

            const response = await indexing.urlNotifications.getMetadata({
                url: url,
            });

            return {
                success: true,
                url,
                metadata: response.data,
            };
        } catch (error: any) {
            console.error(`❌ Failed to get URL status:`, {
                url,
                error: error.message,
            });

            return {
                success: false,
                url,
                error: error.message,
            };
        }
    }

    /**
     * Submit multiple URLs in batch (up to 100 URLs)
     * 
     * @param urls - Array of URLs with their actions
     * @returns Array of results for each URL
     */
    async submitBatch(urls: Array<{ url: string; action: IndexingAction }>): Promise<IndexingResult[]> {
        const results: IndexingResult[] = [];

        // Google Indexing API supports batch requests, but for simplicity
        // we'll process them sequentially with a small delay
        for (const { url, action } of urls) {
            const result = await this.submitUrl(url, action);
            results.push(result);

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return results;
    }
}

// Export singleton instance
export const googleIndexing = GoogleIndexingAPI.getInstance();

/**
 * Helper function to submit a job URL for indexing
 * 
 * @param jobSlug - The job slug
 * @param action - The indexing action (default: URL_UPDATED)
 */
export async function indexJobUrl(jobSlug: string, action: IndexingAction = 'URL_UPDATED') {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flumberico.com';
    const jobUrl = `${baseUrl}/jobs/${jobSlug}`;

    return await googleIndexing.submitUrl(jobUrl, action);
}

/**
 * Helper function to remove a job URL from Google's index
 * 
 * @param jobSlug - The job slug
 */
export async function removeJobFromIndex(jobSlug: string) {
    return await indexJobUrl(jobSlug, 'URL_DELETED');
}

/**
 * Helper function to check job URL indexing status
 * 
 * @param jobSlug - The job slug
 */
export async function checkJobIndexStatus(jobSlug: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flumberico.com';
    const jobUrl = `${baseUrl}/jobs/${jobSlug}`;

    return await googleIndexing.getUrlStatus(jobUrl);
}
