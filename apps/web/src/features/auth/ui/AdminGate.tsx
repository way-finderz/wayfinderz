"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { logger } from "@/shared/lib";
import type { User } from "@/shared/types/auth";

import { useSession } from "../api/auth-client";

import { AuthGate } from "./AuthGate";

interface AdminGateProps {
  children: ReactNode;
}

function isAdmin(user: unknown): user is User & { role: "admin" } {
  const result =
    typeof user === "object" &&
    user !== null &&
    "role" in user &&
    (user as User).role === "admin";

  logger.debug("AdminGate", "isAdmin check", {
    user: user ? { id: (user as User).id, role: (user as User).role } : null,
    result,
  });

  return result;
}

function AccessDenied() {
  logger.info("AdminGate", "Rendering: AccessDenied");

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm overflow-hidden">
        <header className="bg-red-600 py-6 px-4">
          <h1 className="font-display text-2xl font-black text-white tracking-wide text-center">
            Access Denied
          </h1>
        </header>

        <div className="p-6 text-center">
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access this page.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-[#6F2AEC] text-white rounded-lg hover:bg-[#5c23c7] transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminContent({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  logger.debug("AdminContent", "Render", {
    hasSession: !!session,
    hasUser: !!session?.user,
    userRole: (session?.user as User)?.role,
  });

  if (!isAdmin(session?.user)) {
    logger.info("AdminContent", "Rendering: AccessDenied (not admin)");

    return <AccessDenied />;
  }

  logger.info("AdminContent", "Rendering: Children (admin verified)");

  return <>{children}</>;
}

export function AdminGate({ children }: AdminGateProps) {
  return (
    <AuthGate>
      <AdminContent>{children}</AdminContent>
    </AuthGate>
  );
}
