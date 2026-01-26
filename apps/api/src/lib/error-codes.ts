import { TRPCError } from "@trpc/server";

/**
 * Application error codes for machine-readable error handling
 */
export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: "UNAUTHORIZED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

  // Authorization errors
  FORBIDDEN: "FORBIDDEN",
  ADMIN_REQUIRED: "ADMIN_REQUIRED",

  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  JOURNEY_NOT_FOUND: "JOURNEY_NOT_FOUND",
  CITY_NOT_FOUND: "CITY_NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",

  // Invite code errors
  INVITE_INVALID: "INVITE_INVALID",
  INVITE_EXPIRED: "INVITE_EXPIRED",
  INVITE_USED: "INVITE_USED",
  INVITE_INACTIVE: "INVITE_INACTIVE",
  INVITE_NOT_FOUND: "INVITE_NOT_FOUND",

  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // Server errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",

  // Game errors
  GAME_DATA_NOT_INITIALIZED: "GAME_DATA_NOT_INITIALIZED",
  PROGRESS_UPDATE_FAILED: "PROGRESS_UPDATE_FAILED",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export function createTRPCError(
  code: TRPCError["code"],
  message: string,
  errorCode: ErrorCode
): TRPCError {
  return new TRPCError({
    code,
    message,
    cause: { errorCode },
  });
}

export function hasErrorCode(
  error: unknown
): error is { cause: { errorCode: ErrorCode } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "cause" in error &&
    typeof (error as { cause?: unknown }).cause === "object" &&
    (error as { cause?: { errorCode?: unknown } }).cause !== null &&
    "errorCode" in ((error as { cause: object }).cause)
  );
}

export function getErrorCode(error: unknown): ErrorCode {
  if (hasErrorCode(error)) {
    return error.cause.errorCode;
  }

  return ErrorCodes.INTERNAL_ERROR;
}
