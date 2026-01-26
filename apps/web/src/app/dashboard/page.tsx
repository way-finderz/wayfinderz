"use client";

import dynamic from "next/dynamic";

import { PageLoadingSkeleton } from "@/shared/ui";

const DashboardPage = dynamic(
  () => import("@/views/dashboard").then((mod) => mod.DashboardPage),
  { ssr: false, loading: () => <PageLoadingSkeleton /> }
);

export default function DashboardRoute() {
  return <DashboardPage />;
}
