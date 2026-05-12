import { QueryClient } from "@tanstack/react-query";

/**
 * Single QueryClient instance for the app.
 * Defaults are tuned for a mobile + Realtime setup:
 *   - shorter staleTime so list views feel fresh
 *   - retries off for mutations (we surface errors explicitly)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
