"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminNavbar from "../AdminNavbar";

interface AdminWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AdminWrapper({ children, requireAuth = true }: AdminWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If authentication is required and user is not authenticated, show loading or redirect
  if (requireAuth && status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required and user is not authenticated, redirect to signin
  if (requireAuth && !session) {
    if (typeof window !== "undefined") {
      router.push("/auth/signin?callbackUrl=/admin");
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
}