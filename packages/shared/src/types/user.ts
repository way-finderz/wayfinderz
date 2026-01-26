/** Valid user roles in the system */
export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/**
 * User entity type.
 * Uses plain strings for IDs for backwards compatibility with database types.
 * For strict ID type checking, use the branded types from "./branded".
 */
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/** Minimal session info for tRPC context */
export interface SessionCore {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}
