import { sendPasswordResetEmail } from "./send-password-reset-email";
import { sendVerificationEmail } from "./send-verification-email";

export { sendPasswordResetEmail } from "./send-password-reset-email";
export { sendVerificationEmail } from "./send-verification-email";

export const inngestFunctions = [
  sendVerificationEmail,
  sendPasswordResetEmail,
];
