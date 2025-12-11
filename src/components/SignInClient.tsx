'use client';

import Image from "next/image";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SignInClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        // Check if authentication was successful
        const session = await getSession();
        if (session) {
          if (session.user?.role === "admin") {
            router.push("/admin");
          } else {
            // Check if user has completed onboarding
            router.push(callbackUrl);
          }
        } else {
          setError("Authentication failed. Please try again.");
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      {/* Enhanced background effects with modern gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-purple-500/8" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-400/6 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-400/6 via-transparent to-transparent" />
      <div className="fixed top-20 right-4 w-2 h-2 bg-neon-blue rounded-full animate-float opacity-60" />
      <div className="fixed top-40 left-4 w-3 h-3 bg-neon-purple rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }} />
      <div className="fixed bottom-40 right-12 w-2 h-2 bg-neon-pink rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
      >
        {/* Logo/Back Link */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-neon-blue transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Flumberico
          </Link>
        </div>

        {/* Sign In Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-8"
        >
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="relative w-12 h-12 hover:scale-110 transition-transform duration-300">
                <Image
                  src="/Favicon Flumberico.png"
                  alt="Flumberico Favicon"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Flumberico
              </span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to activate your AI Hunter
            </p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-200"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-background/50 border border-border/50 rounded-lg focus:border-neon-blue/50 focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full futuristic-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Sign In to Flumberico
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-neon-blue hover:text-neon-purple transition-colors font-medium"
              >
                Sign up for free
              </Link>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-muted-foreground hover:text-neon-blue transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Success Rate Badge */}
          <div className="mt-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg text-center">
            <p className="text-xs text-neon-green">
              <Sparkles className="inline w-3 h-3 mr-1" />
              83% of our users get interviews within 30 days
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}