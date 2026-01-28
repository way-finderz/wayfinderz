import { createAuthClient } from "better-auth/react";
import { useEffect, useRef } from "react";

import { env } from "@/shared/config";
import { logger } from "@/shared/lib";

export const authClient = createAuthClient({
  baseURL: env.API_URL,
});

const { signIn, signUp, signOut, useSession: originalUseSession } = authClient;

export const useSession = () => {
  const result = originalUseSession();
  const prevState = useRef<{ isPending: boolean; hasUser: boolean } | null>(null);

  const currentState = {
    isPending: result.isPending,
    hasUser: !!result.data?.user,
  };

  useEffect(() => {
    const prev = prevState.current;
    const curr = currentState;

    if (!prev || prev.isPending !== curr.isPending || prev.hasUser !== curr.hasUser) {
      logger.debug("useSession", "State changed", {
        isPending: result.isPending,
        hasSession: !!result.data,
        hasUser: !!result.data?.user,
        userId: result.data?.user?.id,
        userName: result.data?.user?.name,
        error: result.error?.message,
      });

      if (result.error) {
        logger.error("useSession", "Session error", result.error);
      }

      if (!result.isPending && !result.data?.user) {
        logger.info("useSession", "No authenticated user");
      }

      if (!result.isPending && result.data?.user) {
        logger.info("useSession", "User authenticated", {
          userId: result.data.user.id,
          userName: result.data.user.name,
        });
      }
    }

    prevState.current = curr;
  }, [result.isPending, result.data, result.error, currentState]);

  return result;
};

export { signIn, signOut, signUp };
