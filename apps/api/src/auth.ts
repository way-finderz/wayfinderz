import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/env";
import { queuePasswordResetEmail, queueVerificationEmail } from "@/services/email.service";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.FRONTEND_URL],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      // Block password reset for unverified emails to prevent email enumeration
      if (!user.emailVerified) {
        throw new Error("Please verify your email before resetting your password");
      }
      // Replace the callback URL to point to the frontend
      const resetUrl = url.replace(
        /callbackURL=[^&]*/,
        `callbackURL=${encodeURIComponent(`${env.FRONTEND_URL}/reset-password`)}`
      );
      await queuePasswordResetEmail({
        to: user.email,
        userName: user.name,
        resetUrl,
      });
    },
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // Replace the callback URL to point to the frontend
      const verifyUrl = url.replace(
        /callbackURL=[^&]*/,
        `callbackURL=${encodeURIComponent(`${env.FRONTEND_URL}/verify-email`)}`
      );
      await queueVerificationEmail({
        to: user.email,
        userName: user.name,
        verifyUrl,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24 * 5, // 5 days to match warning period
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh after 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },

  plugins: [admin()],

  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});

export type Auth = typeof auth;
