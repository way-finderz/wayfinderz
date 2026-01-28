"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { signOut, useSession } from "@/features/auth";
import { useGameStore } from "@/features/game";
import { cn, logger } from "@/shared/lib";
import type { User } from "@/shared/types/auth";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  logger.debug("AppLayout", "Render", {
    pathname,
    mounted,
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
  });

  useEffect(() => {
    setMounted(true);
    logger.debug("AppLayout", "Mounted", { pathname });

    return () => {
      logger.debug("AppLayout", "Unmounted");
    };
  }, [pathname]);

  const resetGame = useGameStore((state) => state.resetGame);

  const handleSignOut = async () => {
    await signOut();
    resetGame();
    queryClient.clear();
    router.push("/");
  };

  const isActive = (path: string) => {
    const normalizedPathname = pathname?.replace(/\/$/, "") || "";
    const normalizedPath = path.replace(/\/$/, "");

    return normalizedPathname === normalizedPath;
  };

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)}>
      <header className="bg-[#6F2AEC]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-black text-white">
            Way Finderz
          </Link>

          <nav className="flex items-center gap-6">
            {!mounted ? (
              // Render placeholder during SSR/hydration to prevent mismatch
              // This matches the server-rendered unauthenticated state
              <div className="flex items-center gap-4">
                <div className="animate-pulse rounded h-4 w-20 bg-white/20" aria-hidden="true" />
                <div className="animate-pulse rounded h-4 w-20 bg-white/20" aria-hidden="true" />
              </div>
            ) : session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    "pb-0.5 border-b-2 transition-colors",
                    isActive("/dashboard")
                      ? "text-white font-medium border-white"
                      : "text-white/80 hover:text-white border-transparent"
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={cn(
                    "pb-0.5 border-b-2 transition-colors",
                    isActive("/profile")
                      ? "text-white font-medium border-white"
                      : "text-white/80 hover:text-white border-transparent"
                  )}
                >
                  Profile
                </Link>
                {(session.user as User).role === "admin" && (
                  <Link
                    href="/admin/invites"
                    className={cn(
                      "pb-0.5 border-b-2 transition-colors",
                      isActive("/admin/invites")
                        ? "text-white font-medium border-white"
                        : "text-white/80 hover:text-white border-transparent"
                    )}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/" className="text-white/80 hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm bg-white text-[#6F2AEC] rounded-lg hover:bg-white/90 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
