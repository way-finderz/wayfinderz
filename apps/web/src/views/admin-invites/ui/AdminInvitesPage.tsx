"use client";

import { useState } from "react";

import { AdminGate } from "@/features/auth";
import {
  CreateInviteCard,
  InviteCodesTable,
  useCreateInviteCode,
  useDeactivateInviteCode,
  useInviteCodes,
} from "@/features/invite-codes";

export function AdminInvitesPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [clipboardError, setClipboardError] = useState<string | null>(null);

  const { data: inviteCodes = [], isLoading, error: queryError } = useInviteCodes();
  const createMutation = useCreateInviteCode();
  const deactivateMutation = useDeactivateInviteCode();

  const error =
    queryError?.message ||
    createMutation.error?.message ||
    deactivateMutation.error?.message ||
    clipboardError;

  const handleCreate = () => {
    createMutation.mutate({});
  };

  const handleDeactivate = (id: string) => {
    deactivateMutation.mutate({ id });
  };

  const copyToClipboard = async (code: string) => {
    setClipboardError(null);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      setClipboardError("Failed to copy to clipboard. Please copy manually.");
    }
  };

  return (
    <AdminGate>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Invite Codes</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <CreateInviteCard
          isCreating={createMutation.isPending}
          onCreateCode={handleCreate}
        />

        <InviteCodesTable
          inviteCodes={inviteCodes}
          isLoading={isLoading}
          copiedCode={copiedCode}
          onCopyCode={copyToClipboard}
          onDeactivate={handleDeactivate}
        />
      </div>
    </AdminGate>
  );
}
