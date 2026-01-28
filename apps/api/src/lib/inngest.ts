import { EventSchemas, Inngest } from "inngest";

export const VERIFICATION_EMAIL_EVENT = "email/verification" as const;
export const PASSWORD_RESET_EMAIL_EVENT = "email/password-reset" as const;

export type VerificationEmailData = {
  to: string;
  userName?: string;
  verifyUrl: string;
};

export type PasswordResetEmailData = {
  to: string;
  userName?: string;
  resetUrl: string;
};

type Events = {
  [VERIFICATION_EMAIL_EVENT]: { data: VerificationEmailData };
  [PASSWORD_RESET_EMAIL_EVENT]: { data: PasswordResetEmailData };
};

export const inngest = new Inngest({
  id: "way-finderz",
  schemas: new EventSchemas().fromRecord<Events>(),
});
