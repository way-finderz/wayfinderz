/**
 * Invite code entity types.
 * Uses plain strings for IDs for backwards compatibility with database types.
 * For strict ID type checking, use the branded types from "./branded".
 */

export interface InviteCode {
  id: string;
  code: string;
  createdById: string | null;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface InviteUse {
  id: string;
  inviteCodeId: string;
  usedById: string;
  usedAt: Date;
}

export interface CreateInviteCodeRequest {
  expiresAt?: string;
}

export interface ValidateInviteCodeRequest {
  code: string;
}

export interface ValidateInviteCodeResponse {
  valid: boolean;
  message: string;
}
