"use client";

import { type ReactNode, useEffect, useState } from "react";

import { logger } from "@/shared/lib";
import { PageLoadingSkeleton } from "@/shared/ui";
import { AppLayout } from "@/widgets/app-layout";

import { useSession } from "../api/auth-client";

import { AuthPrompt } from "./AuthPrompt";

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { data: session, isPending, error } = useSession();
  const [mounted, setMounted] = useState(false);

  logger.debug("AuthGate", "Render", {
    mounted,
    isPending,
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    error: error?.message,
  });

  useEffect(() => {
    logger.debug("AuthGate", "Mount effect running");
    setMounted(true);
    logger.info("AuthGate", "Mounted, setting mounted=true");

    return () => {
      logger.debug("AuthGate", "Unmounting");
    };
  }, []);

  // Log session changes
  useEffect(() => {
    logger.debug("AuthGate", "Session state changed", {
      isPending,
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userName: session?.user?.name,
      error: error?.message,
    });

    if (error) {
      logger.error("AuthGate", "Session error", error);
    }
  }, [session, isPending, error]);

  // Decision logging
  if (!mounted) {
    logger.debug("AuthGate", "Rendering: Loading (not mounted yet)");

    return (
      <AppLayout>
        <PageLoadingSkeleton withHeader={false} />
      </AppLayout>
    );
  }

  if (isPending) {
    logger.debug("AuthGate", "Rendering: Loading (session pending)");

    return (
      <AppLayout>
        <PageLoadingSkeleton withHeader={false} />
      </AppLayout>
    );
  }

  if (!session?.user) {
    logger.info("AuthGate", "Rendering: AuthPrompt (no user)", {
      redirectTo: typeof window !== "undefined" ? window.location.pathname : "unknown",
    });

    return (
      <AppLayout>
        <AuthPrompt redirectTo={window.location.pathname} />
      </AppLayout>
    );
  }

  logger.info("AuthGate", "Rendering: Children (authenticated)", {
    userId: session.user.id,
    userName: session.user.name,
  });

  return <AppLayout>{children}</AppLayout>;
}
