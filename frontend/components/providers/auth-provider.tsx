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
    .select("id, username, display_name, role, avatar_url")
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

    async function initialize() {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (!mounted) return;
      setSession(session);
      setProfile(session?.user ? await loadProfile(session.user.id) : null);
      setLoading(false);
    }

    initialize();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setProfile(nextSession?.user ? await loadProfile(nextSession.user.id) : null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
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
          setSession(data.session);
          setProfile(await waitForProfile(data.session.user.id));
          setLoading(false);
        }

        return {
          email: input.email,
          requiresEmailConfirmation: !data.session,
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
