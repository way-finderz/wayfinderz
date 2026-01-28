import { env } from "@/env";
import { inngest, PASSWORD_RESET_EMAIL_EVENT, VERIFICATION_EMAIL_EVENT } from "@/lib/inngest";
import { logger } from "@/lib/logger";

export async function queueVerificationEmail(params: {
  to: string;
  userName?: string;
  verifyUrl: string;
}): Promise<void> {
  if (env.MOCK_EMAILS) {
    logger.info("MOCK EMAIL - verification", {
      to: params.to,
      userName: params.userName,
      verifyUrl: params.verifyUrl,
    });

    return;
  }

  await inngest.send({
    name: VERIFICATION_EMAIL_EVENT,
    data: params,
  });
}

export async function queuePasswordResetEmail(params: {
  to: string;
  userName?: string;
  resetUrl: string;
}): Promise<void> {
  if (env.MOCK_EMAILS) {
    logger.info("MOCK EMAIL - password reset", {
      to: params.to,
      userName: params.userName,
      resetUrl: params.resetUrl,
    });

    return;
  }

  await inngest.send({
    name: PASSWORD_RESET_EMAIL_EVENT,
    data: params,
  });
}
