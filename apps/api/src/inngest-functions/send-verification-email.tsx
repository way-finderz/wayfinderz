import { VerificationEmail } from "@/emails/verification-email";
import { env } from "@/env";
import { isEmailRecordingEnabled, recordEmail } from "@/lib/email-recorder";
import { inngest, VERIFICATION_EMAIL_EVENT } from "@/lib/inngest";
import { logger } from "@/lib/logger";
import { resend } from "@/lib/resend";

export const sendVerificationEmail = inngest.createFunction(
  { id: "send-verification-email", retries: 3 },
  { event: VERIFICATION_EMAIL_EVENT },
  async ({ event }) => {
    const { to, userName, verifyUrl } = event.data;
    const subject = "Verify your email for Way Finderz";

    logger.info("Sending verification email", { to, userName });

    // In e2e test mode, record the email instead of sending
    if (isEmailRecordingEnabled()) {
      const recorded = recordEmail({
        from: env.EMAIL_FROM,
        to,
        subject,
        templateName: "VerificationEmail",
        templateProps: { userName, verifyUrl },
      });
      logger.info("Verification email recorded (e2e mode)", { to, emailId: recorded.id });

      return { emailId: recorded.id, recorded: true };
    }

    const result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      react: <VerificationEmail userName={userName} verifyUrl={verifyUrl} />,
    });

    if (result.error) {
      throw new Error(`${result.error.name}: ${result.error.message}`);
    }

    logger.info("Verification email sent", { to, emailId: result.data?.id });

    return { emailId: result.data?.id };
  }
);
