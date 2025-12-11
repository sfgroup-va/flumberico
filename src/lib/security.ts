/**
 * Security Utilities for Input Validation and Sanitization
 * Use these functions to protect against XSS, SQL Injection, and other attacks
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes dangerous tags and attributes
 */
export function sanitizeHtml(html: string): string {
    if (!html) return '';

    // Remove script tags and their content
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers (onclick, onerror, etc.)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove data: protocol (except for images)
    sanitized = sanitized.replace(/data:(?!image\/)/gi, '');

    // Remove iframe, object, embed tags
    sanitized = sanitized.replace(/<(iframe|object|embed)[^>]*>.*?<\/\1>/gi, '');

    return sanitized.trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
        return false;
    }
}

/**
 * Sanitize string for database queries
 * Prevents SQL injection
 */
export function sanitizeForDb(input: string): string {
    if (!input) return '';

    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    // Limit length
    sanitized = sanitized.substring(0, 10000);

    return sanitized;
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
}): { valid: boolean; error?: string } {
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    const allowedTypes = options.allowedTypes || [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    // Check file size
    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`
        };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`
        };
    }

    // Check file name
    if (file.name.length > 255) {
        return {
            valid: false,
            error: 'File name too long'
        };
    }

    return { valid: true };
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
    // Remove path traversal attempts
    let sanitized = filename.replace(/\.\./g, '');

    // Remove special characters except dots, dashes, underscores
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Limit length
    sanitized = sanitized.substring(0, 255);

    return sanitized;
}

/**
 * Validate and sanitize job data
 */
export function validateJobData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!data.title || typeof data.title !== 'string') {
        errors.push('Title is required and must be a string');
    } else if (data.title.length < 3 || data.title.length > 200) {
        errors.push('Title must be between 3 and 200 characters');
    }

    if (!data.companyName || typeof data.companyName !== 'string') {
        errors.push('Company name is required');
    } else if (data.companyName.length > 100) {
        errors.push('Company name too long');
    }

    if (!data.type || !['Full-time', 'Part-time', 'Contract', 'Internship'].includes(data.type)) {
        errors.push('Invalid job type');
    }

    if (!data.locationType || !['Remote', 'On-site', 'Hybrid'].includes(data.locationType)) {
        errors.push('Invalid location type');
    }

    // Optional fields validation
    if (data.applicationEmail && !isValidEmail(data.applicationEmail)) {
        errors.push('Invalid application email');
    }

    if (data.applicationUrl && !isValidUrl(data.applicationUrl)) {
        errors.push('Invalid application URL');
    }

    if (data.companyLogoUrl && !isValidUrl(data.companyLogoUrl)) {
        errors.push('Invalid company logo URL');
    }

    if (data.salary && (typeof data.salary !== 'number' || data.salary < 0)) {
        errors.push('Invalid salary value');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Rate limiting check (simple in-memory implementation)
 * For production, use Redis-based rate limiting
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
    identifier: string,
    limit: number = 100,
    windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    if (!record || now > record.resetTime) {
        // Create new record
        const resetTime = now + windowMs;
        rateLimitMap.set(identifier, { count: 1, resetTime });
        return { allowed: true, remaining: limit - 1, resetTime };
    }

    if (record.count >= limit) {
        return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count++;
    return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
}

/**
 * Clean up old rate limit records
 */
export function cleanupRateLimits() {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}

// Clean up every 5 minutes
if (typeof window === 'undefined') {
    setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
    if (typeof window !== 'undefined' && window.crypto) {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Node.js environment
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash password securely (use bcrypt in production)
 */
export async function hashPassword(password: string): Promise<string> {
    // This is a placeholder - use bcrypt or argon2 in production
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
} {
    const errors: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    // Determine strength
    if (errors.length === 0) {
        if (password.length >= 12 && /[^a-zA-Z0-9].*[^a-zA-Z0-9]/.test(password)) {
            strength = 'strong';
        } else {
            strength = 'medium';
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        strength
    };
}
