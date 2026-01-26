"use client";

import dynamic from "next/dynamic";

import { PageLoadingSkeleton } from "@/shared/ui";

const AdminInvitesPage = dynamic(
  () => import("@/views/admin-invites").then((mod) => mod.AdminInvitesPage),
  { ssr: false, loading: () => <PageLoadingSkeleton /> }
);

export default function AdminInvitesRoute() {
  return <AdminInvitesPage />;
}
