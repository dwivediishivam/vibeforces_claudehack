"use client";

import { useEffect, useMemo, useState } from "react";
import { categoryLabels } from "@/lib/data/mock";
import type { ChallengeRecord, ContestRecord } from "@shared/types";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/common/stat-card";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

type SubmissionRow = {
  id: string;
  combined_score?: number | null;
  challenge_id: string;
  created_at?: string;
  challenges?: {
    title: string;
    category: keyof typeof categoryLabels;
  };
};

export default function LearnerDashboardPage() {
  const auth = useAuth();
  const [contestBanner, setContestBanner] = useState<ContestRecord | null>(null);
  const [challengeSnapshot, setChallengeSnapshot] = useState<ChallengeRecord[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiClient.getContests(),
      apiClient.getChallenges(),
      apiClient.getPracticeLeaderboard(),
    ])
      .then(([contestsResponse, challengesResponse, leaderboardResponse]) => {
        if (cancelled) return;

        setContestBanner(
          contestsResponse.contests.find((contest) => contest.status !== "completed") ??
            null,
        );
        setChallengeSnapshot(challengesResponse.challenges.slice(0, 4));

        const currentUserEntry = leaderboardResponse.leaderboard.find(
          (entry) => entry.user_id === auth.session?.user.id,
        );
        setRank(currentUserEntry?.rank ?? null);
      })
      .catch(() => {});

    if (auth.session?.access_token) {
      apiClient
        .getMySubmissions(auth.session.access_token)
        .then((response) => {
          if (!cancelled) {
            setSubmissions((response.submissions ?? []) as SubmissionRow[]);
          }
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [auth.session?.access_token, auth.session?.user.id]);

  const derived = useMemo(() => {
    const totalScore = submissions.reduce(
      (sum, submission) => sum + Number(submission.combined_score ?? 0),
      0,
    );
    const solvedSet = new Set(submissions.map((submission) => submission.challenge_id));
    const categoryProgress = {
      spec_to_prompt: 0,
      token_golf: 0,
      bug_fix: 0,
      architecture_pick: 0,
      ui_reproduction: 0,
    } as Record<keyof typeof categoryLabels, number>;

    for (const submission of submissions) {
      const category = submission.challenges?.category;
      if (category && category in categoryProgress) {
        categoryProgress[category] += 1;
      }
    }

    return {
      totalScore,
      solved: solvedSet.size,
      rank,
      recentSubmissions: submissions.slice(0, 3).map((submission) => ({
        id: submission.id,
        title: submission.challenges?.title ?? "Challenge",
        category: submission.challenges?.category ?? "spec_to_prompt",
        score: Number(submission.combined_score ?? 0),
        timeAgo: submission.created_at
          ? new Date(submission.created_at).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "Recently",
      })),
      categoryProgress,
    };
  }, [rank, submissions]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div>
          <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
            Dashboard
          </div>
          <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
            Welcome back, {auth.displayName}
          </h1>
          <p className="mt-2 text-sm text-[#94a3b8]">Your vibe coding journey</p>
        </div>
        {contestBanner ? (
          <Card className="rounded-2xl border border-[#7c3aed]/20 bg-gradient-to-r from-[#7c3aed]/10 to-transparent p-5">
            <div className="text-xs uppercase tracking-[2px] text-[#c4b5fd]">
              Contest Banner
            </div>
            <div className="mt-3 font-mono-ui text-lg text-[#f1f5f9]">
              {contestBanner.title}
            </div>
            <CountdownTimer
              targetDate={contestBanner.scheduled_at}
              className="mt-2 text-2xl font-mono-ui text-[#a78bfa]"
            />
          </Card>
        ) : (
          <Card className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 text-sm text-[#94a3b8]">
            No active contest is scheduled right now.
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Score" value={derived.totalScore.toLocaleString()} />
        <StatCard label="Solved" value={`${derived.solved}/30`} accent="green" />
        <StatCard
          label="Rank"
          value={derived.rank ? `#${derived.rank}` : "—"}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="surface-card rounded-2xl p-6">
          <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
            Recent Submissions
          </div>
          <div className="mt-4 space-y-3">
            {derived.recentSubmissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#334155] bg-[#0a0f1e] p-6 text-sm text-[#64748b]">
                No submissions yet. Start with an easy challenge to populate your dashboard.
              </div>
            ) : (
              derived.recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4"
                >
                  <div>
                    <div className="text-sm font-mono-ui text-[#f1f5f9]">
                      {categoryLabels[submission.category as keyof typeof categoryLabels]} — {submission.title}
                    </div>
                    <div className="mt-1 text-sm text-[#94a3b8]">{submission.timeAgo}</div>
                  </div>
                  <div className="rounded-full border border-[#166534] bg-[#052e16] px-3 py-1 text-xs font-mono-ui text-[#4ade80]">
                    {submission.score.toFixed(1)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="surface-card rounded-2xl p-6">
          <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
            Category Progress
          </div>
          <div className="mt-4 space-y-5">
            {Object.entries(derived.categoryProgress).map(([category, solved]) => (
              <div key={category}>
                <div className="mb-2 flex items-center justify-between text-sm text-[#cbd5e1]">
                  <span>{categoryLabels[category as keyof typeof categoryLabels]}</span>
                  <span className="font-mono-ui text-xs text-[#64748b]">{solved}/6</span>
                </div>
                <Progress
                  value={(solved / 6) * 100}
                  className="h-2 bg-[#1e293b]"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="surface-card rounded-2xl p-6">
        <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
          Challenge Snapshot
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {challengeSnapshot.map((challenge) => (
            <div key={challenge.id} className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4">
              <div className="text-xs font-mono-ui uppercase text-[#64748b]">{challenge.code}</div>
              <div className="mt-2 font-mono-ui text-[#f1f5f9]">{challenge.title}</div>
              <div className="mt-2 text-sm text-[#94a3b8]">{challenge.description}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
