"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/common/stat-card";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState } from "@/components/common/empty-state";

export default function AdminDashboardPage() {
  const auth = useAuth();
  const [stats, setStats] = useState({
    total_users: 0,
    total_submissions: 0,
    active_contests: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .getAdminStats(auth.session?.access_token)
      .then((response) => {
        if (!cancelled) {
          setStats(response.stats);
          setError(null);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Admin stats could not be loaded.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth.session?.access_token]);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
          Admin Dashboard
        </div>
        <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
          Platform overview
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Users" value={String(stats.total_users)} />
        <StatCard label="Submissions" value={String(stats.total_submissions)} accent="green" />
        <StatCard label="Active Contests" value={String(stats.active_contests)} accent="amber" />
      </div>
      {error ? (
        <EmptyState
          icon={<ShieldCheck className="size-12" />}
          title="Admin stats unavailable"
          description={error}
        />
      ) : null}
      <Card className="surface-card rounded-2xl p-6">
        <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
          Quick Links
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 text-sm text-[#94a3b8]">
            Create contests, review launch scheduling, and monitor leaderboard readiness.
          </div>
          <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 text-sm text-[#94a3b8]">
            Supabase seed assets, voice notes, and UI screenshots are prepared for the launch pack.
          </div>
        </div>
      </Card>
    </div>
  );
}
