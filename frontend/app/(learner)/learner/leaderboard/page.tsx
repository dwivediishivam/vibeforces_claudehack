"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import type { LeaderboardEntry } from "@shared/types";

export default function LeaderboardPage() {
  const auth = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .getPracticeLeaderboard()
      .then((response) => {
        if (cancelled) return;
        setEntries(
          response.leaderboard.map((entry) => ({
            ...entry,
            isCurrentUser: entry.user_id === auth.session?.user.id,
          })),
        );
        setError(null);
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Leaderboard could not be loaded.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth.session?.user.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
            Leaderboard
          </div>
          <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
            Top vibecoders ranked by combined score
          </h1>
        </div>
        <Tabs defaultValue="all-time">
          <TabsList className="border border-[#1e293b] bg-[#111827]">
            <TabsTrigger value="all-time">All Time</TabsTrigger>
            <TabsTrigger value="week" disabled>
              This Week
            </TabsTrigger>
            <TabsTrigger value="today" disabled>
              Today
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {error ? (
        <EmptyState
          icon={<Trophy className="size-12" />}
          title="Leaderboard unavailable"
          description={error}
        />
      ) : entries.length === 0 ? (
        <Card className="surface-card rounded-2xl p-10 text-center text-sm text-[#94a3b8]">
          Loading leaderboard...
        </Card>
      ) : (
        <LeaderboardTable entries={entries} />
      )}
    </div>
  );
}
