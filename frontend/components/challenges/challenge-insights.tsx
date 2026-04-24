"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

type LeaderboardRow = {
  rank: number;
  user_id: string;
  username: string;
  display_name: string;
  combined_score: number;
  accuracy_score: number;
  token_score: number;
  time_taken_seconds: number;
};

type SubmissionRow = {
  id: string;
  created_at: string;
  combined_score: number;
  accuracy_score: number;
  token_score: number;
  time_taken_seconds: number;
  prompts?: Array<{ prompt: string; token_count: number }>;
  ai_responses?: Array<{ response: string; token_count: number }>;
  judge_feedback?: Record<string, unknown>;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ChallengeInsights({
  challengeId,
  refreshKey = 0,
}: {
  challengeId: string;
  refreshKey?: number;
}) {
  const auth = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      apiClient.getChallengeLeaderboard(challengeId).catch(() => ({ leaderboard: [] })),
      auth.session?.access_token
        ? apiClient
            .getChallengeSubmissions(challengeId, auth.session.access_token)
            .catch(() => ({ submissions: [] }))
        : Promise.resolve({ submissions: [] }),
    ]).then(([lb, subs]) => {
      if (cancelled) return;
      setLeaderboard(lb.leaderboard as LeaderboardRow[]);
      setSubmissions((subs.submissions ?? []) as SubmissionRow[]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [auth.session?.access_token, challengeId, refreshKey]);

  const currentUserId = auth.session?.user.id;
  const myBestScore = submissions.length
    ? Math.max(...submissions.map((s) => Number(s.combined_score) || 0))
    : null;
  const peerScores = leaderboard
    .filter((row) => row.user_id !== currentUserId)
    .map((row) => row.combined_score);
  const myPercentile =
    myBestScore !== null && peerScores.length > 0
      ? Math.round(
          ((peerScores.filter((s) => s < myBestScore).length +
            peerScores.filter((s) => s === myBestScore).length * 0.5) /
            peerScores.length) *
            100,
        )
      : null;

  return (
    <Card className="surface-card rounded-2xl p-6">
      {myPercentile !== null ? (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#7c3aed]/30 bg-[#7c3aed]/5 px-4 py-3 text-sm">
          <div className="text-[#cbd5e1]">
            Your best on this challenge:{" "}
            <span className="font-mono-ui text-[#a78bfa]">
              {myBestScore?.toFixed(1)}
            </span>
          </div>
          <div className="text-xs font-mono-ui text-[#94a3b8]">
            Beats <span className="text-[#a78bfa]">{myPercentile}%</span> of solvers
          </div>
        </div>
      ) : null}
      <Tabs defaultValue="leaderboard">
        <TabsList className="border border-[#1e293b] bg-[#111827]">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="my">My submissions ({submissions.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard" className="mt-4">
          {loading ? (
            <div className="py-8 text-center text-sm text-[#64748b]">Loading…</div>
          ) : leaderboard.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#64748b]">
              No solves yet. Be the first.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-[40px_1fr_70px_70px_70px_80px] gap-3 px-3 py-2 text-[11px] uppercase tracking-[1.5px] text-[#64748b]">
                <div>#</div>
                <div>User</div>
                <div className="text-right">Score</div>
                <div className="text-right">Acc</div>
                <div className="text-right">Tok</div>
                <div className="text-right">Time</div>
              </div>
              {leaderboard.slice(0, 25).map((row) => (
                <div
                  key={row.user_id}
                  className={`grid grid-cols-[40px_1fr_70px_70px_70px_80px] gap-3 rounded-lg px-3 py-2 text-sm ${
                    row.user_id === currentUserId
                      ? "bg-[#7c3aed]/10 text-[#e9d5ff]"
                      : "text-[#cbd5e1]"
                  }`}
                >
                  <div className="font-mono-ui text-[#64748b]">{row.rank}</div>
                  <div className="truncate">{row.display_name}</div>
                  <div className="text-right font-mono-ui text-[#a78bfa]">
                    {row.combined_score.toFixed(1)}
                  </div>
                  <div className="text-right font-mono-ui">{row.accuracy_score.toFixed(1)}</div>
                  <div className="text-right font-mono-ui">{Math.round(row.token_score)}</div>
                  <div className="text-right font-mono-ui">{formatTime(row.time_taken_seconds)}</div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-4">
          {!auth.session ? (
            <div className="py-8 text-center text-sm text-[#64748b]">
              Sign in to see your submissions.
            </div>
          ) : loading ? (
            <div className="py-8 text-center text-sm text-[#64748b]">Loading…</div>
          ) : submissions.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#64748b]">
              No prior submissions on this challenge.
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map((sub) => {
                const isOpen = expanded === sub.id;
                const promptText = (sub.prompts ?? [])
                  .map((p) => p.prompt)
                  .join("\n\n---\n\n");
                const aiText = (sub.ai_responses ?? [])
                  .map((r) => r.response)
                  .join("\n\n---\n\n");
                const feedback = (sub.judge_feedback as any)?.feedback ?? "";
                return (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-[#1e293b] bg-[#0a0f1e]"
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : sub.id)}
                      className="grid w-full grid-cols-[1fr_70px_70px_70px_80px] items-center gap-3 px-4 py-3 text-left text-sm text-[#cbd5e1] hover:bg-[#111827]"
                    >
                      <div className="text-xs text-[#64748b]">
                        {new Date(sub.created_at).toLocaleString()}
                      </div>
                      <div className="text-right font-mono-ui text-[#a78bfa]">
                        {Number(sub.combined_score).toFixed(1)}
                      </div>
                      <div className="text-right font-mono-ui">
                        {Number(sub.accuracy_score).toFixed(1)}
                      </div>
                      <div className="text-right font-mono-ui">
                        {Math.round(Number(sub.token_score))}
                      </div>
                      <div className="text-right font-mono-ui">
                        {formatTime(Number(sub.time_taken_seconds))}
                      </div>
                    </button>
                    {isOpen ? (
                      <div className="space-y-3 border-t border-[#1e293b] p-4 text-sm">
                        {promptText ? (
                          <div>
                            <div className="mb-1 text-xs uppercase tracking-[1.5px] text-[#64748b]">
                              Your prompt
                            </div>
                            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[#030712] p-3 font-mono-ui text-xs text-[#cbd5e1]">
                              {promptText}
                            </pre>
                          </div>
                        ) : null}
                        {aiText ? (
                          <div>
                            <div className="mb-1 text-xs uppercase tracking-[1.5px] text-[#64748b]">
                              AI output
                            </div>
                            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[#030712] p-3 font-mono-ui text-xs text-[#94a3b8]">
                              {aiText}
                            </pre>
                          </div>
                        ) : null}
                        {feedback ? (
                          <div className="text-xs italic text-[#94a3b8]">
                            {String(feedback)}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
