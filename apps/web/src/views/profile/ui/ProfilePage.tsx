"use client";

import { useRouter } from "next/navigation";

import { ProfileCard, ProtectedRoute, signOut, useSession } from "@/features/auth";
import { useGameStore } from "@/features/game";

export function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const resetGame = useGameStore((state) => state.resetGame);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out failed:", err);
      // Still redirect and reset - user wants to leave
    }
    resetGame();
    router.push("/");
  };

  const user = session?.user;

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>

        <ProfileCard
          name={user?.name}
          email={user?.email}
          role={(user as { role?: string })?.role}
          createdAt={user?.createdAt}
          onSignOut={handleSignOut}
        />
      </div>
    </ProtectedRoute>
  );
}
