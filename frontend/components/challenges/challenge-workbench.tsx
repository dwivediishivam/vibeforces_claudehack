"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { ChallengeRecord } from "@shared/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { DifficultyBadge } from "@/components/common/difficulty-badge";
import { RatingBadge } from "@/components/common/rating-badge";
import { ModelBadge } from "@/components/common/model-badge";
import { VoicePlayer } from "@/components/challenges/voice-player";
import { PromptEditor } from "@/components/challenges/prompt-editor";
import { AIResponseDisplay } from "@/components/challenges/ai-response-display";
import { CodeDisplay } from "@/components/challenges/code-display";
import { ArchitectureOptions } from "@/components/challenges/architecture-options";
import { ScreenshotViewer } from "@/components/challenges/screenshot-viewer";
import { ScoreDisplay } from "@/components/challenges/score-display";
import { ProctoringBanner } from "@/components/common/proctoring-banner";

type SubmissionView = {
  accuracy: number;
  tokenScore: number;
  timeLabel: string;
  combinedScore: number;
  feedback: string;
  aiResponses: string[];
};

export function ChallengeWorkbench({
  challenge,
  contextType = "practice",
  contextId,
  showProctoring = false,
  disabled = false,
  lockedReason,
  onSubmissionComplete,
}: {
  challenge: ChallengeRecord;
  contextType?: "practice" | "contest" | "test";
  contextId?: string;
  showProctoring?: boolean;
  disabled?: boolean;
  lockedReason?: string;
  onSubmissionComplete?: (submission: Record<string, unknown>) => void;
}) {
  const auth = useAuth();
  const [singlePrompt, setSinglePrompt] = useState("");
  const [planPrompt, setPlanPrompt] = useState("");
  const [actPrompt, setActPrompt] = useState("");
  const [ranking, setRanking] = useState<Record<string, string>>({});
  const [submission, setSubmission] = useState<SubmissionView | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("plan");
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const promptMode =
    challenge.category === "spec_to_prompt"
      ? ((challenge.challenge_data as any).prompt_mode as "single" | "plan_act")
      : "single";

  const preparedPrompts = useMemo(() => {
    if (challenge.category === "architecture_pick") return [];
    if (promptMode === "plan_act") {
      return [planPrompt, actPrompt].filter(Boolean);
    }
    return [singlePrompt].filter(Boolean);
  }, [actPrompt, challenge.category, planPrompt, promptMode, singlePrompt]);

  useEffect(() => {
    setStartedAt(Date.now());
    setSubmission(null);
  }, [challenge.id, contextId, contextType]);

  async function submitToApi() {
    const token = auth.session?.access_token;
    const prompts =
      challenge.category === "architecture_pick"
        ? []
        : preparedPrompts.map((prompt) => ({
          prompt,
        }));

    if (!token) {
      throw new Error("Sign in is required to submit and score a challenge.");
    }

    const response = (await apiClient.createSubmission(
      {
        challenge_id: challenge.id,
        prompts,
        user_ranking:
          challenge.category === "architecture_pick"
            ? Object.entries(ranking)
                .sort((left, right) => Number(left[1]) - Number(right[1]))
                .map(([option]) => option)
            : undefined,
        context_type: contextType,
        context_id: contextId,
        time_taken_seconds: Math.max(
          1,
          Math.round((Date.now() - startedAt) / 1000),
        ),
      },
      token,
    )) as any;

    const entry = response.submission as any;
    onSubmissionComplete?.(entry);
    setSubmission({
      accuracy: Number(entry.accuracy_score ?? 0),
      tokenScore: Number(entry.token_score ?? 0),
      timeLabel: `${Math.floor((entry.time_taken_seconds ?? 0) / 60)}:${String(
        (entry.time_taken_seconds ?? 0) % 60,
      ).padStart(2, "0")}`,
      combinedScore: Number(entry.combined_score ?? 0),
      feedback:
        String(entry.judge_feedback?.feedback ?? "Submission evaluated successfully."),
      aiResponses: (entry.ai_responses ?? []).map((item: any) =>
        String(item.response ?? ""),
      ),
    });
  }

  const data = challenge.challenge_data as any;

  async function handleSubmit() {
    if (disabled) {
      toast.error(lockedReason ?? "This challenge is currently locked.");
      return;
    }

    if (
      challenge.category === "architecture_pick" &&
      Object.keys(ranking).length !== 3
    ) {
      toast.error("Rank all three options before submitting.");
      return;
    }

    if (challenge.category !== "architecture_pick" && preparedPrompts.length === 0) {
      toast.error("Write a prompt before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await submitToApi();
      toast.success("Score ready.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/learner/challenges"
            className="inline-flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#f1f5f9]"
          >
            <ArrowLeft className="size-4" />
            Back to Challenges
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold font-mono-ui text-[#f1f5f9]">
              {challenge.title}
            </h1>
            <DifficultyBadge difficulty={challenge.difficulty} />
            <RatingBadge rating={challenge.rating} />
          </div>
          <p className="mt-3 max-w-3xl text-sm text-[#94a3b8]">
            {challenge.description}
          </p>
        </div>
        <ModelBadge />
      </div>

      {challenge.category === "spec_to_prompt" ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Card className="surface-card rounded-2xl p-6">
              <div className="mb-4 font-mono-ui text-lg text-[#f1f5f9]">
                Voice Note
              </div>
              <VoicePlayer
                src={String(data.voice_note_url)}
                playsAllowed={promptMode === "plan_act" ? 2 : 1}
              />
            </Card>
            {Array.isArray(data.supplementary_images) &&
            data.supplementary_images.length > 0 ? (
              <div className="space-y-4">
                {data.supplementary_images.map((src: string) => (
                  <ScreenshotViewer key={src} src={String(src)} alt={challenge.title} />
                ))}
              </div>
            ) : null}
          </div>
          <div className="space-y-6">
            {promptMode === "plan_act" ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="border border-[#1e293b] bg-[#111827]">
                  <TabsTrigger value="plan">Plan</TabsTrigger>
                  <TabsTrigger value="act" disabled={!planPrompt.trim()}>
                    Act
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="plan" className="mt-4">
                  <PromptEditor
                    label="Write Your Plan Prompt"
                    initialValue={planPrompt}
                    submitLabel="Lock Plan"
                    disabled={disabled}
                    onSubmit={(value) => {
                      setPlanPrompt(value);
                      setActiveTab("act");
                    }}
                    placeholder="Outline the execution plan first. This unlocks the Act tab."
                  />
                </TabsContent>
                <TabsContent value="act" className="mt-4">
                  <PromptEditor
                    label="Write Your Act Prompt"
                    initialValue={actPrompt}
                    submitLabel={submitting ? "Evaluating..." : "Submit Final Prompt"}
                    disabled={disabled}
                    onSubmit={(value) => {
                      setActPrompt(value);
                      void handleSubmit();
                    }}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <PromptEditor
                label="Write Your Prompt"
                initialValue={singlePrompt}
                submitLabel={submitting ? "Evaluating..." : "Submit Prompt"}
                disabled={disabled}
                onSubmit={(value) => {
                  setSinglePrompt(value);
                  void handleSubmit();
                }}
              />
            )}

            {submission?.aiResponses[0] ? (
              <AIResponseDisplay content={submission.aiResponses.join("\n\n")} />
            ) : null}
            {submission ? (
              <ScoreDisplay
                accuracy={submission.accuracy}
                tokenScore={submission.tokenScore}
                timeLabel={submission.timeLabel}
                combinedScore={submission.combinedScore}
                feedback={submission.feedback}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {challenge.category === "token_golf" ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="surface-card rounded-2xl p-6">
            <div className="mb-4 font-mono-ui text-lg text-[#f1f5f9]">
              Target Output
            </div>
            <CodeDisplay code={String(data.target_output)} language="python" />
            <div className="mt-4 text-sm text-[#94a3b8]">
              {String(data.target_description)}
            </div>
          </Card>
          <div className="space-y-6">
            <PromptEditor
              label="Write Your Prompt"
              initialValue={singlePrompt}
              submitLabel={submitting ? "Evaluating..." : "Submit"}
              placeholder={`Max Tokens: ${String(data.max_tokens_allowed)}`}
              disabled={disabled}
              onSubmit={(value) => {
                setSinglePrompt(value);
                void handleSubmit();
              }}
            />
            {submission?.aiResponses[0] ? (
              <AIResponseDisplay title="Generated Output" content={submission.aiResponses[0]} language="python" />
            ) : null}
            {submission ? (
              <ScoreDisplay
                accuracy={submission.accuracy}
                tokenScore={submission.tokenScore}
                timeLabel={submission.timeLabel}
                combinedScore={submission.combinedScore}
                feedback={submission.feedback}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {challenge.category === "bug_fix" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="surface-card rounded-2xl p-6">
            <div className="mb-4 font-mono-ui text-lg text-[#f1f5f9]">
              Broken Code
            </div>
            <CodeDisplay
              code={String(data.code)}
              language={String(data.language)}
              minHeight={360}
            />
            <div className="mt-4 text-sm text-[#94a3b8]">
              {String(data.task)}
            </div>
          </Card>
          <div className="space-y-6">
            <PromptEditor
              label="Describe the Fix"
              initialValue={singlePrompt}
              submitLabel={submitting ? "Evaluating..." : "Submit Fix"}
              placeholder='Be specific. "Fix this" scores zero. Tell the AI exactly what is wrong and where.'
              disabled={disabled}
              onSubmit={(value) => {
                setSinglePrompt(value);
                void handleSubmit();
              }}
            />
            <div className="rounded-xl bg-[#1e293b] px-3 py-2 text-xs font-mono-ui text-[#94a3b8]">
              Precision matters most here. Time and token efficiency are scored live.
            </div>
            {submission ? (
              <ScoreDisplay
                accuracy={submission.accuracy}
                tokenScore={submission.tokenScore}
                timeLabel={submission.timeLabel}
                combinedScore={submission.combinedScore}
                feedback={submission.feedback}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {challenge.category === "architecture_pick" ? (
        <div className="space-y-6">
          <Card className="surface-card rounded-2xl p-6">
            <div className="font-mono-ui text-lg text-[#f1f5f9]">Scenario</div>
            <p className="mt-4 text-sm leading-7 text-[#94a3b8]">
              {String(data.scenario)}
            </p>
          </Card>
          <ArchitectureOptions
            options={data.options as any}
            ranking={ranking}
            onRankChange={(optionId, rank) =>
              setRanking((current) => ({ ...current, [optionId]: rank }))
            }
          />
          <div className="flex justify-end">
            <Button
              className="bg-[#7c3aed] hover:bg-[#6d28d9]"
              disabled={submitting || disabled}
              onClick={() => void handleSubmit()}
            >
              {submitting ? "Evaluating..." : "Submit Ranking"}
            </Button>
          </div>
          {submission ? (
            <ScoreDisplay
              accuracy={submission.accuracy}
              tokenScore={100}
              timeLabel={submission.timeLabel}
              combinedScore={submission.combinedScore}
              feedback={submission.feedback}
            />
          ) : null}
        </div>
      ) : null}

      {challenge.category === "ui_reproduction" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <ScreenshotViewer
              src={String(data.target_screenshot_url)}
              alt={challenge.title}
            />
            <Card className="surface-subtle rounded-2xl p-4 text-sm text-[#94a3b8]">
              {String(data.description)}
            </Card>
          </div>
          <div className="space-y-6">
            <PromptEditor
              label="Write Your Prompt"
              initialValue={singlePrompt}
              submitLabel={submitting ? "Evaluating..." : "Submit Prompt"}
              disabled={disabled}
              onSubmit={(value) => {
                setSinglePrompt(value);
                void handleSubmit();
              }}
            />
            {submission?.aiResponses[0] ? (
              <AIResponseDisplay title="Generated HTML" content={submission.aiResponses[0]} language="html" />
            ) : null}
            {submission ? (
              <ScoreDisplay
                accuracy={submission.accuracy}
                tokenScore={submission.tokenScore}
                timeLabel={submission.timeLabel}
                combinedScore={submission.combinedScore}
                feedback={submission.feedback}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {showProctoring ? <ProctoringBanner /> : null}
      {disabled && lockedReason ? (
        <Card className="rounded-2xl border border-[#7c3aed]/25 bg-[#7c3aed]/10 p-4 text-sm text-[#ddd6fe]">
          {lockedReason}
        </Card>
      ) : null}
    </div>
  );
}
