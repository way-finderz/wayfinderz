import { trpcClient } from "@/trpc";

export async function validateInviteCode(code: string) {
  return trpcClient.invites.validate.mutate({ code });
}

export async function markInviteUsed(code: string) {
  await trpcClient.invites.use.mutate({ code });
}

export async function createInviteCode(options?: { expiresAt?: string }) {
  return trpcClient.invites.create.mutate(options ?? {});
}

export async function listInviteCodes() {
  return trpcClient.invites.list.query();
}

export async function deactivateInviteCode(id: string) {
  await trpcClient.invites.deactivate.mutate({ id });
}
