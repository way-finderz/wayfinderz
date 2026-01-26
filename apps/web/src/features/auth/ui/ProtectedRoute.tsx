"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { PageLoadingSkeleton } from "@/shared/ui";
import { AppLayout } from "@/widgets/app-layout";

import { useSession } from "../api/auth-client";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user) {
    return (
      <AppLayout>
        <PageLoadingSkeleton withHeader={false} />
      </AppLayout>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
