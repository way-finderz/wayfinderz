import { env } from "@/env";
import { logger } from "@/lib/logger";

import {
  getPasswordResetEmailTemplate,
  getVerificationEmailTemplate,
} from "./email-templates";
import { type EmailJobMessage, sendToEmailQueue } from "./sqs.service";

export interface QueueEmailParams {
  type: "verification" | "password-reset";
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function queueEmail(params: QueueEmailParams): Promise<void> {
  if (env.MOCK_EMAILS) {
    logger.info("MOCK EMAIL - Would send email", {
      type: params.type,
      to: params.to,
      subject: params.subject,
      textPreview: params.text.substring(0, 200),
    });

    return;
  }

  const message: EmailJobMessage = {
    type: params.type,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  };

  await sendToEmailQueue(message);
}

export async function queueVerificationEmail(params: {
  to: string;
  userName?: string;
  verifyUrl: string;
}): Promise<void> {
  const template = getVerificationEmailTemplate({
    userName: params.userName,
    verifyUrl: params.verifyUrl,
  });

  await queueEmail({
    type: "verification",
    to: params.to,
    ...template,
  });
}

export async function queuePasswordResetEmail(params: {
  to: string;
  userName?: string;
  resetUrl: string;
}): Promise<void> {
  const template = getPasswordResetEmailTemplate({
    userName: params.userName,
    resetUrl: params.resetUrl,
  });

  await queueEmail({
    type: "password-reset",
    to: params.to,
    ...template,
  });
}
