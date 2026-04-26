"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { UserRole } from "@shared/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  display_name: string;
  role: UserRole;
  avatar_url?: string | null;
  rating?: number | null;
  rating_peak?: number | null;
  rating_solves?: number | null;
};

type SignupInput = {
  email: string;
  password: string;
  username: string;
  displayName: string;
  role: Exclude<UserRole, "admin">;
};

type SignupResult = {
  email: string;
  requiresEmailConfirmation: boolean;
  role: Exclude<UserRole, "admin">;
};

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignupInput) => Promise<SignupResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(userId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, role, avatar_url, rating, rating_peak, rating_solves",
    )
    .eq("id", userId)
    .single();

  return data as Profile | null;
}

async function waitForProfile(userId: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const profile = await loadProfile(userId);
    if (profile) return profile;
    await new Promise((resolve) => window.setTimeout(resolve, 250));
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;
    let mounted = true;

    let initialProfileResolved = false;

    async function resolveInitialProfile(userId: string) {
      // First load only: retry briefly to handle the signup race where
      // handle_new_user hasn't yet inserted the profile row. If still
      // missing after retries, the session is unusable — sign out.
      const profile = await waitForProfile(userId);
      if (profile) return profile;
      await client.auth.signOut();
      return null;
    }

    async function initialize() {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (!mounted) return;
      setSession(session);
      if (session?.user) {
        const next = await resolveInitialProfile(session.user.id);
        if (!mounted) return;
        setProfile(next);
        initialProfileResolved = true;
      } else {
        setProfile(null);
      }
      setLoading(false);
    }

    initialize();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, nextSession) => {
      // INITIAL_SESSION is already handled by initialize() — skip the
      // duplicate concurrent profile load.
      if (event === "INITIAL_SESSION") return;

      setSession(nextSession);

      if (!nextSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // For TOKEN_REFRESHED / SIGNED_IN / USER_UPDATED events on an
      // already-authenticated session, do a single non-retrying fetch
      // and keep the previous profile if it transiently misses. Never
      // wipe profile to null and never auto-signOut here — that's what
      // caused the multi-tab "Restoring your session" flash.
      const next = await loadProfile(nextSession.user.id);
      if (!mounted) return;
      if (next) {
        setProfile(next);
        initialProfileResolved = true;
      } else if (!initialProfileResolved) {
        // First-ever profile load failed (e.g. fresh SIGNED_IN after
        // signup). Fall back to the retrying path.
        const retried = await resolveInitialProfile(nextSession.user.id);
        if (!mounted) return;
        setProfile(retried);
        if (retried) initialProfileResolved = true;
      }
      setLoading(false);
    });

    let refreshTimer: number | null = null;
    let refreshing = false;

    async function refreshFromStorage() {
      if (refreshing) return;
      refreshing = true;
      try {
        const {
          data: { session: latest },
        } = await client.auth.getSession();
        if (!mounted) return;
        setSession(latest);
        if (latest?.user) {
          const next = await loadProfile(latest.user.id);
          if (!mounted) return;
          if (next) setProfile(next);
        } else {
          setProfile(null);
        }
      } finally {
        refreshing = false;
      }
    }

    function scheduleRefresh() {
      if (refreshTimer !== null) return;
      refreshTimer = window.setTimeout(() => {
        refreshTimer = null;
        void refreshFromStorage();
      }, 150);
    }

    function onVisibility() {
      if (document.visibilityState === "visible") scheduleRefresh();
    }
    function onFocus() {
      scheduleRefresh();
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      async signIn(email, password) {
        if (!supabase) {
          throw new Error("Supabase auth is not configured for this environment.");
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user && !data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          throw new Error("Please verify your email before signing in.");
        }
      },
      async signUp(input) {
        if (!supabase) {
          throw new Error("Supabase auth is not configured for this environment.");
        }
        const emailRedirectTo =
          typeof window === "undefined"
            ? undefined
            : `${window.location.origin.replace(/\/$/, "")}/login`;
        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            emailRedirectTo,
            data: {
              username: input.username,
              display_name: input.displayName,
              role: input.role,
            },
          },
        });
        if (error) throw error;

        if (data.session?.user) {
          await supabase.auth.signOut();
          setSession(null);
          setProfile(null);
          setLoading(false);
        }

        return {
          email: input.email,
          requiresEmailConfirmation: true,
          role: input.role,
        };
      },
      async signOut() {
        if (!supabase) {
          throw new Error("Supabase auth is not configured for this environment.");
        }
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [loading, profile, session, supabase],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuthContext must be used within AuthProvider.");
  return value;
}
