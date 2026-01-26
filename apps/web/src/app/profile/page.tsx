"use client";

import dynamic from "next/dynamic";

import { PageLoadingSkeleton } from "@/shared/ui";

const ProfilePage = dynamic(
  () => import("@/views/profile").then((mod) => mod.ProfilePage),
  { ssr: false, loading: () => <PageLoadingSkeleton /> }
);

export default function ProfileRoute() {
  return <ProfilePage />;
}
