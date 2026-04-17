"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { challengeLibrary } from "@/lib/data/mock";
import { launchContest } from "@shared/seed-data";
import { ChallengeWorkbench } from "@/components/challenges/challenge-workbench";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { mockLeaderboard } from "@/lib/data/mock";

export default function ContestArenaPage() {
  const params = useParams<{ id: string }>();
  const contest = params.id === launchContest.id ? launchContest : launchContest;
  const challenges = useMemo(
    () =>
      challengeLibrary.filter((challenge) =>
        contest.challenge_ids.includes(challenge.id),
      ),
    [contest.challenge_ids],
  );
  const [activeChallengeId, setActiveChallengeId] = useState(challenges[0]?.id);
  const activeChallenge =
    challenges.find((challenge) => challenge.id === activeChallengeId) ??
    challenges[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="size-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs uppercase tracking-[2px] text-[#f87171]">
              Live
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
            {contest.title}
          </h1>
        </div>
        <div className="rounded-2xl border border-[#1e293b] bg-[#111827] px-5 py-4">
          <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
            Time Left
          </div>
          <CountdownTimer
            targetDate={contest.scheduled_at}
            className="mt-2 text-2xl font-mono-ui text-[#f1f5f9]"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {challenges.map((challenge, index) => (
              <button
                key={challenge.id}
                type="button"
                onClick={() => setActiveChallengeId(challenge.id)}
                className={`inline-flex size-14 items-center justify-center rounded-2xl border font-mono-ui ${
                  activeChallengeId === challenge.id
                    ? "border-[#7c3aed] bg-[#7c3aed] text-white"
                    : "border-[#1e293b] bg-[#0a0f1e] text-[#94a3b8]"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          {activeChallenge ? (
            <ChallengeWorkbench
              challenge={activeChallenge}
              contextType="contest"
              contextId={contest.id}
              showProctoring
            />
          ) : null}
        </div>
        <div className="space-y-4">
          <div className="surface-card rounded-2xl p-4">
            <div className="text-sm font-mono-ui text-[#f1f5f9]">Live Leaderboard</div>
          </div>
          <LeaderboardTable entries={mockLeaderboard.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}
