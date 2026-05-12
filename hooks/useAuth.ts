import { useEffect } from "react";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

/**
 * Wires Supabase auth into the global store.
 * Mount once at the root layout.
 */
export function useAuthBootstrap() {
  const setSession = useAuthStore((s) => s.setSession);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [setSession, setLoading]);
}

export function useAuth() {
  return useAuthStore((s) => ({
    session: s.session,
    user: s.user,
    isLoading: s.isLoading,
    isSignedIn: Boolean(s.session),
  }));
}
