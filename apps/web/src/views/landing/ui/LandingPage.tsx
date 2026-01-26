"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/features/auth";
import { Divider } from "@/shared/ui";
import { LoginForm, QuickRegisterForm } from "@/widgets/auth-form";
import { Footer } from "@/widgets/footer";

export function LandingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  if (session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm overflow-hidden">
          <header className="bg-[#6F2AEC] py-6 px-4">
            <h1 className="font-display text-4xl font-black text-white tracking-wide text-center">
              Way Finderz
            </h1>
          </header>

          <div className="p-6 space-y-6">
            <LoginForm />

            <Divider text="OR" className="my-6" />

            <QuickRegisterForm />
          </div>
        </div>
      </main>

      <Footer version="0.1.0" />
    </div>
  );
}
