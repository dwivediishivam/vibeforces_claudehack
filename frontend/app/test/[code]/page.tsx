"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { sampleRecruiterTests } from "@shared/seed-data";
import { challengeLibrary } from "@/lib/data/mock";
import { ChallengeWorkbench } from "@/components/challenges/challenge-workbench";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { ProctoringBanner } from "@/components/common/proctoring-banner";

export default function TakeTestPage() {
  const params = useParams<{ code: string }>();
  const test =
    sampleRecruiterTests.find((item) => item.share_code === params.code) ??
    sampleRecruiterTests[0];
  const challenges = useMemo(
    () =>
      challengeLibrary.filter((challenge) =>
        test.challenge_ids.includes(challenge.id),
      ),
    [test.challenge_ids],
  );
  const [activeChallengeId, setActiveChallengeId] = useState(challenges[0]?.id);
  const activeChallenge =
    challenges.find((challenge) => challenge.id === activeChallengeId) ??
    challenges[0];

  return (
    <div className="min-h-screen px-4 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="surface-card rounded-2xl p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
                Recruiter Test
              </div>
              <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
                {test.title}
              </h1>
              <p className="mt-2 text-sm text-[#94a3b8]">
                {test.challenge_ids.length} challenges · {test.time_limit_minutes} minute timer
              </p>
            </div>
            <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] px-5 py-4">
              <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
                Time Remaining
              </div>
              <CountdownTimer
                targetDate={new Date(Date.now() + test.time_limit_minutes * 60_000).toISOString()}
                className="mt-2 text-2xl font-mono-ui text-[#f1f5f9]"
              />
            </div>
          </div>
        </div>

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
            contextType="test"
            contextId={test.id}
            showProctoring
          />
        ) : null}

        <ProctoringBanner />
      </div>
    </div>
  );
}
