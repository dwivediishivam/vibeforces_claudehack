"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/top-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTransition } from "@/components/common/page-transition";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

function dashboardHref(role: string | null) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "recruiter") return "/recruiter/dashboard";
  return "/learner/dashboard";
}

export function AppShell({
  role,
  children,
}: {
  role: "learner" | "recruiter" | "admin";
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth.loading) return;

    if (!auth.session) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
      return;
    }

    if (auth.profile?.role && auth.profile.role !== role) {
      router.replace(dashboardHref(auth.profile.role));
    }
  }, [auth.loading, auth.profile?.role, auth.session, pathname, role, router]);

  const showRestoring = auth.loading || (!auth.session && auth.loading);
  const wrongRole = auth.profile && auth.profile.role !== role;

  if (showRestoring || !auth.session || !auth.profile || wrongRole) {
    const heading = wrongRole ? "Redirecting" : "Restoring your session";
    const subtext = wrongRole
      ? "Sending you to the right workspace."
      : "Checking your account and loading the correct workspace.";
    return (
      <div className="min-h-screen bg-background">
        <TopNav role={role} />
        <div className="flex pt-16">
          <Sidebar role={role} />
          <main className="min-w-0 flex-1 p-4 lg:p-8">
            <Card className="mx-auto mt-16 max-w-xl rounded-2xl border-[#1e293b] bg-[#0a0f1e] p-6 text-center">
              <div className="font-mono-ui text-lg text-[#f1f5f9]">
                {heading}
              </div>
              <p className="mt-2 text-sm text-[#94a3b8]">{subtext}</p>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav role={role} />
      <div className="flex pt-16">
        <Sidebar role={role} />
        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <PageTransition className="mx-auto max-w-7xl">{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
