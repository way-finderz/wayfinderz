import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";

import { env } from "@/shared/config/env";

import type { AppRouter } from "./router-types";

// React hooks client
export const trpc = createTRPCReact<AppRouter>();

// Vanilla client for imperative calls (zustand stores, event handlers)
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.API_URL}/api/trpc`,
      fetch(url: URL | RequestInfo, options?: RequestInit) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
