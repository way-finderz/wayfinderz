import { createAuthClient } from "better-auth/react";

import { env } from "@/shared/config";

export const authClient = createAuthClient({
  baseURL: env.API_URL,
});

const { signIn, signUp, signOut, useSession: originalUseSession } = authClient;

export const useSession = () => {
  const result = originalUseSession();

  return result;
};

export { signIn, signOut, signUp };
