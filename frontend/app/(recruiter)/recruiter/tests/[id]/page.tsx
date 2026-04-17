"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sampleRecruiterTests } from "@shared/seed-data";
import { challengeSummaryCards, mockRecruiterCandidates } from "@/lib/data/mock";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { RecruiterTestRecord } from "@shared/types";

export default function RecruiterTestDetailPage() {
  const auth = useAuth();
  const params = useParams<{ id: string }>();
  const fallbackTest =
    sampleRecruiterTests.find((item) => item.id === params.id) ??
    sampleRecruiterTests[0];
  const [test, setTest] = useState<RecruiterTestRecord>(fallbackTest);
  const [attempts, setAttempts] = useState<any[]>(mockRecruiterCandidates);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .getRecruiterTest(params.id, auth.session?.access_token)
      .then((response) => {
        if (cancelled) return;
        setTest(response.test);
        setAttempts(response.attempts);
      })
      .catch(() => {
        if (!cancelled) {
          setTest(fallbackTest);
          setAttempts(mockRecruiterCandidates);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth.session?.access_token, fallbackTest, params.id]);

  const challenges = useMemo(
    () =>
      challengeSummaryCards.filter((challenge) =>
        test.challenge_ids.includes(challenge.id),
      ),
    [test.challenge_ids],
  );

  const appUrl =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      : window.location.origin;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
          Test Results
        </div>
        <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
          {test.title}
        </h1>
      </div>

      <Card className="surface-card rounded-2xl p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-sm text-[#94a3b8]">Share Link</div>
            <div className="mt-2 font-mono-ui text-[#a78bfa]">
              {appUrl.replace(/\/$/, "")}/test/{test.share_code}
            </div>
          </div>
          <Button
            className="bg-[#7c3aed] hover:bg-[#6d28d9]"
            onClick={async () => {
              await navigator.clipboard.writeText(
                `${appUrl.replace(/\/$/, "")}/test/${test.share_code}`,
              );
            }}
          >
            Copy Link
          </Button>
        </div>
      </Card>

      <Card className="surface-card rounded-2xl p-6">
        <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
          Candidates
        </div>
        <div className="mt-4 space-y-3">
          {attempts.map((candidate) => (
            <div
              key={candidate.id ?? candidate.name}
              className="grid gap-3 rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4 md:grid-cols-5"
            >
              <div className="font-mono-ui text-[#f1f5f9]">
                {candidate.profiles?.display_name ?? candidate.name}
              </div>
              <div className="text-sm text-[#94a3b8]">
                Score {candidate.total_score ?? candidate.score ?? "—"}
              </div>
              <div className="text-sm text-[#94a3b8]">
                Accuracy {candidate.accuracy ?? "Scored live"}
              </div>
              <div className="text-sm text-[#94a3b8]">
                Time {candidate.time ?? "Tracked"}
              </div>
              <div className="text-sm text-[#a78bfa]">
                {candidate.status ?? "Completed"}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="surface-card rounded-2xl p-6">
        <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
          Challenge Mix
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4">
              <div className="text-xs font-mono-ui uppercase text-[#64748b]">
                {challenge.code}
              </div>
              <div className="mt-2 font-mono-ui text-[#f1f5f9]">{challenge.title}</div>
              <div className="mt-2 text-sm text-[#94a3b8]">{challenge.description}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
