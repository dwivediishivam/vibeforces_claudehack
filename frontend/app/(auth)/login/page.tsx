"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await auth.signIn(email, password);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error("Supabase auth is not configured for this environment.");
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        toast.success("Welcome back.");
        router.push(
          profile?.role === "recruiter"
            ? "/recruiter/dashboard"
            : profile?.role === "admin"
              ? "/admin/dashboard"
              : "/learner/dashboard",
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign in right now.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="surface-card rounded-[24px] p-8">
      <h1 className="text-2xl font-bold font-mono-ui text-[#f1f5f9]">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-[#94a3b8]">Sign in to your account</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 border-[#1e293b] bg-[#0a0f1e]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 border-[#1e293b] bg-[#0a0f1e]"
          />
        </div>
        <div className="text-right">
          <Link href="#" className="text-xs text-[#a78bfa]">
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
        >
          {submitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[#94a3b8]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#a78bfa]">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
