"use client";

import { useEffect, useMemo } from "react";

import {
  AuthGate,
  EmailVerificationBlocked,
  EmailVerificationWarning,
  useEmailVerification,
  useSession,
} from "@/features/auth";
import {
  JourneyGrid,
  useJourneys,
  useUserProgress,
} from "@/features/game";
import { logger } from "@/shared/lib";
import { WelcomeHeader } from "@/shared/ui";

const WARNING_DAYS = 5;

function isVerificationExpired(createdAt: string | Date): boolean {
  const created = new Date(createdAt);
  const deadline = new Date(
    created.getTime() + WARNING_DAYS * 24 * 60 * 60 * 1000
  );

  return new Date() > deadline;
}

function LoadingState() {
  return (
    <div data-testid="dashboard-loading" className="bg-white border rounded-lg p-8 text-center">
      <div className="text-4xl mb-4 animate-pulse">🗺️</div>
      <p className="text-gray-600">Loading journeys...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div data-testid="dashboard-empty" className="bg-white border rounded-lg p-8 text-center">
      <div className="text-6xl mb-4">🗺️</div>
      <h2 className="text-xl font-semibold mb-2">No Journeys Available</h2>
      <p className="text-gray-600">
        Check back soon for new language learning adventures!
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div data-testid="dashboard-error" className="bg-white border border-red-200 rounded-lg p-8 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold mb-2 text-red-700">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-[#6F2AEC] text-white rounded-lg hover:bg-[#5c23c7] transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

function DashboardContent() {
  const { data: session } = useSession();
  const { sendVerificationEmail } = useEmailVerification();

  const {
    data: journeys = [],
    isLoading: journeysLoading,
    error: journeysError,
    refetch: refetchJourneys,
  } = useJourneys();

  const {
    data: progressList = [],
    isLoading: progressLoading,
    refetch: refetchProgress,
  } = useUserProgress();

  const loading = journeysLoading || progressLoading;
  const error = journeysError ? "Failed to load journeys. Please try again." : null;

  logger.debug("DashboardContent", "Render", {
    hasSession: !!session,
    userId: session?.user?.id,
    journeysLoading,
    progressLoading,
    journeysCount: journeys.length,
    progressCount: progressList.length,
    hasError: !!journeysError,
  });

  useEffect(() => {
    logger.debug("DashboardContent", "Data updated", {
      journeysCount: journeys.length,
      progressCount: progressList.length,
      loading,
      error,
    });
  }, [journeys.length, progressList.length, loading, error]);

  const progressMap = useMemo(
    () => new Map(progressList.map((p) => [p.journeyId, p])),
    [progressList]
  );

  const handleRetry = () => {
    refetchJourneys();
    refetchProgress();
  };

  const user = session?.user;
  const isEmailVerified = user?.emailVerified;
  const userCreatedAt = user?.createdAt;

  const isBlocked =
    !isEmailVerified && userCreatedAt && isVerificationExpired(userCreatedAt);

  const handleResendEmail = async () => {
    if (user?.email) {
      await sendVerificationEmail(user.email);
    }
  };

  if (isBlocked && user?.email) {
    return (
      <EmailVerificationBlocked
        userEmail={user.email}
        onResendEmail={handleResendEmail}
      />
    );
  }

  return (
    <>
      {!isEmailVerified && userCreatedAt && (
        <EmailVerificationWarning
          userCreatedAt={userCreatedAt}
          onResendEmail={handleResendEmail}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <WelcomeHeader userName={session?.user?.name} />

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : journeys.length === 0 ? (
          <EmptyState />
        ) : (
          <JourneyGrid journeys={journeys} progressMap={progressMap} />
        )}
      </div>
    </>
  );
}

export function DashboardPage() {
  return (
    <AuthGate>
      <DashboardContent />
    </AuthGate>
  );
}
