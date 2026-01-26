import { trpc } from "@/trpc";

export function useInviteCodes() {
  return trpc.invites.list.useQuery();
}

export function useCreateInviteCode() {
  const utils = trpc.useUtils();

  return trpc.invites.create.useMutation({
    onSuccess: () => utils.invites.list.invalidate(),
  });
}

export function useDeactivateInviteCode() {
  const utils = trpc.useUtils();

  return trpc.invites.deactivate.useMutation({
    onSuccess: () => utils.invites.list.invalidate(),
  });
}
