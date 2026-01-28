"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useEffect, useState } from "react";

import { env } from "@/shared/config/env";
import { logger } from "@/shared/lib";

import { trpc } from "./client";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  logger.debug("TRPCProvider", "Render", { apiUrl: env.API_URL });

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 3,
            // Exponential backoff: 1s, 2s, 4s (max 30s)
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${env.API_URL}/api/trpc`,
          fetch(url: URL | RequestInfo, options?: RequestInit) {
            logger.debug("TRPCProvider", "Fetch request", {
              url: typeof url === "string" ? url : url.toString(),
            });

            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    })
  );

  useEffect(() => {
    logger.info("TRPCProvider", "Mounted", { apiUrl: env.API_URL });

    return () => {
      logger.debug("TRPCProvider", "Unmounted");
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </trpc.Provider>
    </QueryClientProvider>
  );
}
