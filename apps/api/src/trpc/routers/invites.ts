import {
  createInviteInputSchema,
  deactivateInviteInputSchema,
  useInviteInputSchema,
  validateInviteInputSchema,
} from "@way-finderz/shared";

import * as inviteService from "../../services/invite.service";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../index";

export const invitesRouter = router({
  validate: publicProcedure
    .input(validateInviteInputSchema)
    .mutation(async ({ input }) => {
      const result = await inviteService.validateInviteCode(input.code);

      return {
        valid: result.valid,
        message: result.valid
          ? "Invite code is valid"
          : result.message || "Invalid or expired invite code",
        errorCode: result.errorCode,
      };
    }),

  use: protectedProcedure
    .input(useInviteInputSchema)
    .mutation(async ({ input, ctx }) => {
      await inviteService.markInviteUsed(input.code, ctx.user.id);

      return { message: "Invite code marked as used" };
    }),

  create: adminProcedure
    .input(createInviteInputSchema)
    .mutation(async ({ input, ctx }) => {
      const inviteCode = await inviteService.createInviteCode(
        ctx.user.id,
        input.expiresAt ? new Date(input.expiresAt) : undefined
      );

      return inviteCode;
    }),

  list: adminProcedure.query(async () => {
    const inviteCodes = await inviteService.listInviteCodes();

    return inviteCodes;
  }),

  deactivate: adminProcedure
    .input(deactivateInviteInputSchema)
    .mutation(async ({ input }) => {
      await inviteService.deactivateInviteCode(input.id);

      return { message: "Invite code deactivated" };
    }),
});
