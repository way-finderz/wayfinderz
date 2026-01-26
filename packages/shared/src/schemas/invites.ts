import { z } from "zod";

/**
 * Branded ID schemas for type-safe ID validation.
 * See game.ts for documentation on the branding approach.
 */
export const inviteCodeIdSchema = z.string().uuid().brand<"InviteCodeId">();
export const inviteUseIdSchema = z.string().uuid().brand<"InviteUseId">();

// Branded ID type exports
export type InviteCodeId = z.infer<typeof inviteCodeIdSchema>;
export type InviteUseId = z.infer<typeof inviteUseIdSchema>;

// Invite code format: 8 uppercase alphanumeric chars (excluding ambiguous I, O, 0, 1)
const INVITE_CODE_REGEX = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/;

export const inviteCodeSchema = z
  .string()
  .length(8, "Invite code must be 8 characters")
  .transform((val) => val.toUpperCase())
  .refine((val) => INVITE_CODE_REGEX.test(val), {
    message: "Invalid invite code format",
  });

export const validateInviteInputSchema = z.object({
  code: inviteCodeSchema,
});

export const useInviteInputSchema = z.object({
  code: inviteCodeSchema,
});

export const createInviteInputSchema = z.object({
  expiresAt: z
    .string()
    .datetime()
    .refine((val) => new Date(val).getTime() > Date.now(), {
      message: "expiresAt must be a valid future date",
    })
    .optional(),
});

// Use branded type for input validation
export const deactivateInviteInputSchema = z.object({
  id: inviteCodeIdSchema,
});

// Response types - use plain uuid() for backwards compatibility
export const inviteCodeResponseSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  createdById: z.string().uuid().nullable(),
  isActive: z.boolean(),
  expiresAt: z.date().nullable(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const validateInviteResponseSchema = z.object({
  valid: z.boolean(),
  message: z.string(),
});

// Type exports
export type ValidateInviteInput = z.infer<typeof validateInviteInputSchema>;
export type UseInviteInput = z.infer<typeof useInviteInputSchema>;
export type CreateInviteInput = z.infer<typeof createInviteInputSchema>;
export type DeactivateInviteInput = z.infer<typeof deactivateInviteInputSchema>;
export type InviteCodeResponse = z.infer<typeof inviteCodeResponseSchema>;
export type ValidateInviteResponse = z.infer<typeof validateInviteResponseSchema>;
