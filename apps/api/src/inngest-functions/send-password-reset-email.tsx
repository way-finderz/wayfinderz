import { PasswordResetEmail } from "@/emails/password-reset-email";
import { env } from "@/env";
import { isEmailRecordingEnabled, recordEmail } from "@/lib/email-recorder";
import { inngest, PASSWORD_RESET_EMAIL_EVENT } from "@/lib/inngest";
import { logger } from "@/lib/logger";
import { resend } from "@/lib/resend";

export const sendPasswordResetEmail = inngest.createFunction(
  { id: "send-password-reset-email", retries: 3 },
  { event: PASSWORD_RESET_EMAIL_EVENT },
  async ({ event }) => {
    const { to, userName, resetUrl } = event.data;
    const subject = "Reset your password for Way Finderz";

    logger.info("Sending password reset email", { to, userName });

    // In e2e test mode, record the email instead of sending
    if (isEmailRecordingEnabled()) {
      const recorded = recordEmail({
        from: env.EMAIL_FROM,
        to,
        subject,
        templateName: "PasswordResetEmail",
        templateProps: { userName, resetUrl },
      });
      logger.info("Password reset email recorded (e2e mode)", { to, emailId: recorded.id });

      return { emailId: recorded.id, recorded: true };
    }

    const result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      react: <PasswordResetEmail userName={userName} resetUrl={resetUrl} />,
    });

    if (result.error) {
      throw new Error(`${result.error.name}: ${result.error.message}`);
    }

    logger.info("Password reset email sent", { to, emailId: result.data?.id });

    return { emailId: result.data?.id };
  }
);
