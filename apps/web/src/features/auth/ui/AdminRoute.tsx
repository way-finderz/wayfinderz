"use client";

import { useRouter } from "next/navigation";
import { type ReactNode,useEffect } from "react";

import type { User } from "@/shared/types/auth";
import { AppLayout } from "@/widgets/app-layout";

import { useSession } from "../api/auth-client";

interface AdminRouteProps {
  children: ReactNode;
}

function isAdmin(user: unknown): user is User & { role: "admin" } {
  return (
    typeof user === "object" &&
    user !== null &&
    "role" in user &&
    (user as User).role === "admin"
  );
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push("/");
      } else if (!isAdmin(session.user)) {
        router.push("/dashboard");
      }
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-lg text-gray-500">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!session?.user || !isAdmin(session.user)) {
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}
