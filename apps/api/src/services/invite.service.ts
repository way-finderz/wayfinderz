import crypto from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { inviteCodes, inviteUses } from "@/db/schema";
import { createTRPCError, type ErrorCode, ErrorCodes } from "@/lib/error-codes";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomBytes = crypto.randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(randomBytes[i]! % chars.length);
  }

  return code;
}

export interface InviteCodeResult {
  id: string;
  code: string;
  createdById: string | null;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface ValidateInviteResult {
  valid: boolean;
  errorCode?: ErrorCode;
  message?: string;
}

type InviteCode = typeof inviteCodes.$inferSelect;

/**
 * Validate an invite code's state (deleted, active, expired)
 */
function validateInviteState(invite: InviteCode, now: Date): ValidateInviteResult {
  if (invite.deletedAt) {
    return { valid: false, errorCode: ErrorCodes.INVITE_USED, message: "Invite code has already been used" };
  }
  if (!invite.isActive) {
    return { valid: false, errorCode: ErrorCodes.INVITE_INACTIVE, message: "Invite code has been deactivated" };
  }
  if (invite.expiresAt && invite.expiresAt < now) {
    return { valid: false, errorCode: ErrorCodes.INVITE_EXPIRED, message: "Invite code has expired" };
  }

  return { valid: true };
}

const errorCodeToTRPCCode: Record<string, "BAD_REQUEST" | "NOT_FOUND"> = {
  [ErrorCodes.INVITE_INACTIVE]: "BAD_REQUEST",
  [ErrorCodes.INVITE_USED]: "BAD_REQUEST",
  [ErrorCodes.INVITE_EXPIRED]: "BAD_REQUEST",
  [ErrorCodes.INVITE_NOT_FOUND]: "NOT_FOUND",
};

function throwIfInvalid(result: ValidateInviteResult): void {
  if (!result.valid && result.errorCode && result.message) {
    throw createTRPCError(
      errorCodeToTRPCCode[result.errorCode] ?? "BAD_REQUEST",
      result.message,
      result.errorCode
    );
  }
}

export async function validateInviteCode(code: string): Promise<ValidateInviteResult> {
  const now = new Date();

  const inviteCode = await db.query.inviteCodes.findFirst({
    where: eq(inviteCodes.code, code.toUpperCase()),
  });

  if (!inviteCode) {
    return {
      valid: false,
      errorCode: ErrorCodes.INVITE_NOT_FOUND,
      message: "Invite code not found",
    };
  }

  return validateInviteState(inviteCode, now);
}

export async function createInviteCode(
  createdById: string,
  expiresAt?: Date
): Promise<InviteCodeResult> {
  const code = generateInviteCode();

  const [result] = await db
    .insert(inviteCodes)
    .values({
      code,
      createdById,
      expiresAt: expiresAt ?? null,
    })
    .returning();

  if (!result) {
    throw createTRPCError(
      "INTERNAL_SERVER_ERROR",
      "Failed to create invite code",
      ErrorCodes.DATABASE_ERROR
    );
  }

  return result;
}

export async function listInviteCodes(
  createdById?: string
): Promise<InviteCodeResult[]> {
  if (createdById) {
    return db.query.inviteCodes.findMany({
      where: eq(inviteCodes.createdById, createdById),
      orderBy: (codes, { desc }) => [desc(codes.createdAt)],
    });
  }

  return db.query.inviteCodes.findMany({
    orderBy: (codes, { desc }) => [desc(codes.createdAt)],
  });
}

/**
 * Mark an invite code as used, atomically validating and consuming it.
 * Uses a transaction to prevent race conditions.
 * Creates an audit record in invite_uses and soft-deletes the code.
 */
export async function markInviteUsed(code: string, usedById: string): Promise<void> {
  return db.transaction(async (tx) => {
    const now = new Date();
    const upperCode = code.toUpperCase();

    const inviteCode = await tx.query.inviteCodes.findFirst({
      where: eq(inviteCodes.code, upperCode),
    });

    if (!inviteCode) {
      throw createTRPCError(
        "NOT_FOUND",
        "Invite code not found",
        ErrorCodes.INVITE_NOT_FOUND
      );
    }

    throwIfInvalid(validateInviteState(inviteCode, now));

    // Create audit record
    await tx.insert(inviteUses).values({
      inviteCodeId: inviteCode.id,
      usedById,
    });

    // Soft delete the invite code
    await tx
      .update(inviteCodes)
      .set({ deletedAt: now })
      .where(eq(inviteCodes.id, inviteCode.id));
  });
}

export async function deactivateInviteCode(id: string): Promise<void> {
  const result = await db
    .update(inviteCodes)
    .set({ isActive: false })
    .where(eq(inviteCodes.id, id))
    .returning({ id: inviteCodes.id });

  if (result.length === 0) {
    throw createTRPCError(
      "NOT_FOUND",
      "Invite code not found",
      ErrorCodes.INVITE_NOT_FOUND
    );
  }
}
