"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminNavbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="px-3">
      <div className="m-auto flex h-10 max-w-5xl items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="font-semibold underline">
            Dashboard
          </Link>
          <Link href="/admin/jobs" className="text-muted-foreground hover:text-foreground underline">
            Jobs
          </Link>
          <Link href="/admin/subscriptions" className="text-muted-foreground hover:text-foreground underline">
            Subscriptions
          </Link>
        </div>
        <div className="space-x-2">
          <span className="font-semibold">
            {session?.user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="underline"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
