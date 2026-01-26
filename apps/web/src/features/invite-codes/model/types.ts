export interface InviteCode {
  id: string;
  code: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface ValidateInviteCodeResponse {
  valid: boolean;
  message?: string;
}

export type CreateInviteCodeResponse = InviteCode;
