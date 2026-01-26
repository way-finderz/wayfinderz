"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import {
  VerificationFailedScreen,
  VerificationSuccessScreen,
} from "@/features/auth";
import { PageContainer } from "@/shared/ui";
import { AppLayout } from "@/widgets/app-layout";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const error = searchParams.get("error");

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <AppLayout>
      <PageContainer>
        {error ? (
          <VerificationFailedScreen errorMessage={decodeURIComponent(error)} />
        ) : (
          <VerificationSuccessScreen onGoToDashboard={handleGoToDashboard} />
        )}
      </PageContainer>
    </AppLayout>
  );
}

function LoadingFallback() {
  return (
    <AppLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    </AppLayout>
  );
}

export function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
