'use client';

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import {
    Sparkles,
    User,
    ArrowRight,
    Menu,
    X,
    Rocket,
    Target,
    LogOut,
    Settings,
    ChevronDown
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isResourcesOpen, setIsResourcesOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const resourcesMenuRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle click outside to close resources menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resourcesMenuRef.current && !resourcesMenuRef.current.contains(event.target as Node)) {
                setIsResourcesOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle escape key to close mobile menu
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isMobileMenuOpen]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    // Prevent hydration mismatch by not rendering session-dependent content until mounted
    if (!mounted) {
        return (
            <header className="glass-card border-b border-border/50 sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center gap-3 group"
                        >
                            <div className="relative w-8 h-8 group-hover:scale-110 transition-transform duration-300">
                                <Image
                                    src="/Favicon Flumberico.png"
                                    alt="Flumberico Favicon"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent transform group-hover:scale-110 transition-transform duration-300">
                                Flumberico
                            </span>
                        </Link>

                        {/* Placeholder for nav items to maintain layout */}
                        <div className="hidden md:flex items-center gap-6">
                            <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
                        </div>

                        {/* Placeholder for auth buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded" />
                            <div className="w-24 h-8 bg-gray-200 animate-pulse rounded" />
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden w-10 h-10" />
                    </div>
                </nav>
            </header>
        );
    }

    return (
        <>
            <header className="glass-card border-b border-border/50 sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo - Mobile Optimized */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 sm:gap-3 group"
                        >
                            <div className="relative w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-300">
                                <Image
                                    src="/Favicon Flumberico.png"
                                    alt="Flumberico Favicon"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent transform group-hover:scale-110 transition-transform duration-300">
                                Flumberico
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                href="/"
                                className="text-foreground hover:text-neon-blue transition-colors"
                            >
                                Find Jobs
                            </Link>

                            {/* Resources Dropdown */}
                            <Link
                                href="/how-it-works"
                                className="text-foreground hover:text-neon-blue transition-colors"
                            >
                                How It Works
                            </Link>
                            <Link
                                href="/pricing"
                                className="text-foreground hover:text-neon-blue transition-colors"
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/about"
                                className="text-foreground hover:text-neon-blue transition-colors"
                            >
                                About Us
                            </Link>
                            <Link
                                href="/contact"
                                className="text-foreground hover:text-neon-blue transition-colors"
                            >
                                Contact
                            </Link>

                            {session?.user?.role === "admin" && (
                                <Link
                                    href="/admin"
                                    className="text-foreground hover:text-neon-blue transition-colors"
                                >
                                    Admin
                                </Link>
                            )}
                        </div>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            {status === "loading" ? (
                                <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                            ) : session ? (
                                <div className="flex items-center gap-4">
                                    {session.user?.role !== "admin" && (
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-2 px-4 py-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 rounded-lg hover:bg-neon-blue/20 transition-all duration-200"
                                        >
                                            <Target className="w-4 h-4" />
                                            Command Center
                                        </Link>
                                    )}
                                    <div className="relative group">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-background/50 border border-border/50 rounded-lg hover:border-neon-blue/50 transition-all duration-200">
                                            <User className="w-4 h-4" />
                                            <span className="text-sm">{session.user?.name}</span>
                                        </button>

                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 mt-2 w-48 glass-card border border-border/50 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                            <div className="p-2">
                                                {session.user?.role !== "admin" && (
                                                    <Link
                                                        href="/profile"
                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-neon-blue/10 rounded transition-colors w-full"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                        Profile Settings
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => signOut()}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors w-full"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/auth/signin"
                                        className="px-4 py-2 text-foreground hover:text-neon-blue transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth/signup"
                                        className="futuristic-button flex items-center gap-2"
                                    >
                                        <Rocket className="w-4 h-4" />
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button - Touch Friendly */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-3 text-foreground hover:text-neon-blue transition-colors hover:bg-neon-blue/10 rounded-lg active:scale-95 transform transition-all duration-150"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Mobile Menu Panel */}
                    <motion.div
                        ref={mobileMenuRef}
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, { offset, velocity }) => {
                            if (offset.x > 100 || velocity.x > 500) {
                                setIsMobileMenuOpen(false);
                            }
                        }}
                        className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background/95 backdrop-blur-lg border-l border-border/50 z-50 md:hidden overflow-y-auto"
                    >
                        <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border/50 p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-foreground">Menu</h2>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-foreground hover:text-neon-blue hover:bg-neon-blue/10 rounded-lg transition-colors"
                                    aria-label="Close mobile menu"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Navigation Items */}
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Navigation</h3>
                                <Link
                                    href="/"
                                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-neon-blue/10 rounded-lg transition-colors text-base"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Sparkles className="w-5 h-5 text-neon-blue" />
                                    Find Jobs
                                </Link>

                                {/* Resources Section */}
                                <div className="pt-2">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3 px-4">Resources</h4>
                                    <div className="space-y-1">
                                        <Link
                                            href="/how-it-works"
                                            className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-neon-blue/10 rounded-lg transition-colors text-base"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Target className="w-4 h-4 text-muted-foreground" />
                                            How It Works
                                        </Link>
                                        <Link
                                            href="/pricing"
                                            className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-neon-blue/10 rounded-lg transition-colors text-base"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            💰 Pricing
                                        </Link>
                                        <Link
                                            href="/about"
                                            className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-neon-blue/10 rounded-lg transition-colors text-base"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            ℹ️ About Us
                                        </Link>
                                        <Link
                                            href="/contact"
                                            className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-neon-blue/10 rounded-lg transition-colors text-base"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            📞 Contact
                                        </Link>
                                    </div>
                                </div>

                                {session?.user?.role === "admin" && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-neon-blue/10 rounded-lg transition-colors text-base"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        ⚙️ Admin
                                    </Link>
                                )}
                            </div>

                            {/* Authentication Section */}
                            <div className="border-t border-border/30 pt-6">
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Account</h3>

                                {status === "loading" ? (
                                    <div className="flex justify-center py-4">
                                        <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : session ? (
                                    <div className="space-y-3">
                                        {/* User Info */}
                                        <div className="px-4 py-3 bg-neon-blue/10 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{session.user?.name}</p>
                                                    <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {session.user?.role !== "admin" && (
                                            <>
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-3 px-4 py-3 bg-neon-blue text-white rounded-lg transition-colors text-base font-medium"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <Target className="w-5 h-5" />
                                                    Command Center
                                                </Link>
                                                <Link
                                                    href="/profile"
                                                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-neon-blue/10 rounded-lg transition-colors text-base"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <Settings className="w-5 h-5" />
                                                    Profile Settings
                                                </Link>
                                            </>
                                        )}

                                        <button
                                            onClick={() => {
                                                signOut();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-base w-full"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Link
                                            href="/auth/signin"
                                            className="flex items-center justify-center gap-2 px-4 py-3 text-foreground hover:text-neon-blue border border-border/50 rounded-lg transition-colors text-base font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/auth/signup"
                                            className="futuristic-button flex items-center justify-center gap-2 text-base font-medium py-3"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Rocket className="w-5 h-5" />
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </>
    );
}