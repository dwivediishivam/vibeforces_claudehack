"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { mockLeaderboard } from "@/lib/data/mock";
import { launchContest } from "@shared/seed-data";

export default function AdminContestDetailPage() {
  const params = useParams<{ id: string }>();
  const contest = params.id === launchContest.id ? launchContest : launchContest;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
          Contest Detail
        </div>
        <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
          {contest.title}
        </h1>
      </div>

      <Card className="surface-card rounded-2xl p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
              Schedule
            </div>
            <div className="mt-2 text-[#f1f5f9]">April 18, 2026 · 8:00 PM IST</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
              Duration
            </div>
            <div className="mt-2 text-[#f1f5f9]">{contest.duration_minutes} minutes</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
              Countdown
            </div>
            <CountdownTimer
              targetDate={contest.scheduled_at}
              className="mt-2 font-mono-ui text-xl text-[#a78bfa]"
            />
          </div>
        </div>
      </Card>

      <LeaderboardTable entries={mockLeaderboard.slice(0, 10)} />
    </div>
  );
}
