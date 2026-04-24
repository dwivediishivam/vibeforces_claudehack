import type { Request } from "express";
import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/http";
import {
  getChallengeSummary,
  maxTimeAllowedForChallenge,
} from "../utils/challenges";
import type { ChallengeRow } from "../types";
import { ensureJsonObject } from "../utils/json";
import {
  executeSpecToPrompt,
  executeTokenGolfPrompt,
  executeUIReproductionPrompt,
} from "../services/ai/promptRunner";
import {
  judgeBugFix,
  judgeSpecToPrompt,
  judgeTokenGolf,
  judgeUIReproduction,
} from "../services/ai/judge";
import {
  computeCombinedScore,
  computeTimeScore,
  computeTokenScore,
  percentileScore,
  scoreArchitectureRanking,
} from "../services/scoring";
import { htmlToBase64Screenshot, htmlToBase64ScreenshotSafe, fetchUrlToBase64 } from "../services/screenshot";
import { env } from "../config/env";
import { normalizeProvider } from "../services/ai/dispatch";
import { estimateTokens } from "../services/ai/openai";
import { applyRatingChange } from "../services/rating";

const router = Router();

const promptSchema = z.object({
  prompt: z.string().min(1),
  token_count: z.number().int().nonnegative().optional(),
});

const submissionSchema = z.object({
  challenge_id: z.string().uuid(),
  prompts: z.array(promptSchema).default([]),
  user_ranking: z.array(z.enum(["A", "B", "C"])).length(3).optional(),
  context_type: z.enum(["practice", "contest", "test"]).default("practice"),
  context_id: z.string().uuid().nullable().optional(),
  time_taken_seconds: z.number().int().nonnegative().default(0),
  model: z.enum(["openai", "anthropic", "claude", "gpt"]).optional(),
});

router.use(requireAuth);

router.get(
  "/my",
  asyncHandler(async (req: Request, res) => {
    const { data, error } = await supabaseAdmin
      .from("submissions")
      .select(
        "*, challenges!submissions_challenge_id_fkey(id, code, title, category, difficulty, rating, description)",
      )
      .eq("user_id", req.auth!.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ submissions: data ?? [] });
  }),
);

router.get(
  "/by-challenge/:id",
  asyncHandler(async (req: Request, res) => {
    const { data, error } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .eq("user_id", req.auth!.userId)
      .eq("challenge_id", String(req.params.id))
      .eq("context_type", "practice")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ submissions: data ?? [] });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req: Request, res) => {
    const { data, error } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .eq("id", String(req.params.id))
      .eq("user_id", req.auth!.userId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Submission not found." });
      return;
    }

    res.json({ submission: data });
  }),
);

router.post(
  "/",
  asyncHandler(async (req: Request, res) => {
    const body = submissionSchema.parse(req.body);

    const { data: challengeData, error: challengeError } = await supabaseAdmin
      .from("challenges")
      .select("*")
      .eq("id", body.challenge_id)
      .single();

    if (challengeError || !challengeData) {
      res.status(404).json({ error: "Challenge not found." });
      return;
    }

    const challenge = challengeData as ChallengeRow;
    const provider = normalizeProvider(body.model);
    const prompts = body.prompts.map((item) => ({
      prompt: item.prompt,
      token_count: item.token_count ?? estimateTokens(item.prompt),
    }));

    const timeScore = computeTimeScore(
      body.time_taken_seconds,
      maxTimeAllowedForChallenge(challenge),
    );

    let accuracyScore = 0;
    let tokenScore = 100;
    let combinedScore = 0;
    let judgeFeedback: Record<string, unknown> = {};
    let aiResponses: Array<{ response: string; token_count: number }> = [];
    let generatedScreenshotUrl: string | null = null;

    if (challenge.category === "spec_to_prompt") {
      const execution = await executeSpecToPrompt({
        promptMode: challenge.challenge_data.prompt_mode,
        userPrompts: prompts.map((item) => item.prompt),
        provider,
      });

      aiResponses = execution.responses.map((response) => ({
        response: response.content,
        token_count: response.tokens,
      }));

      judgeFeedback = await judgeSpecToPrompt({
        expectedBehavior: challenge.challenge_data.expected_behavior,
        rubric: challenge.challenge_data.rubric,
        userPrompts: prompts.map((item) => item.prompt),
        aiOutputs: execution.responses.map((response) => response.content),
        provider,
      });

      accuracyScore =
        Number(judgeFeedback.overall_score ?? judgeFeedback.accuracy_score ?? 0) ||
        0;
      tokenScore = computeTokenScore(
        execution.totalTokens,
        900,
      );
      combinedScore = computeCombinedScore({
        category: challenge.category,
        accuracyRaw: accuracyScore,
        tokenScore,
        timeScore,
      });
    } else if (challenge.category === "token_golf") {
      const execution = await executeTokenGolfPrompt(prompts[0]?.prompt ?? "", provider);
      const parsed = ensureJsonObject<Record<string, any>>(execution.content, {
        code: execution.content,
      });
      aiResponses = [
        {
          response: parsed.code ?? execution.content,
          token_count: execution.totalTokens,
        },
      ];
      judgeFeedback = await judgeTokenGolf({
        targetOutput: challenge.challenge_data.target_output,
        actualOutput: parsed.code ?? execution.content,
        verificationPrompt: challenge.challenge_data.verification_prompt,
        provider,
      });
      accuracyScore =
        Number(judgeFeedback.correctness_percentage ?? 0) / 10;
      tokenScore = computeTokenScore(
        execution.totalTokens,
        challenge.challenge_data.max_tokens_allowed,
      );
      combinedScore = computeCombinedScore({
        category: challenge.category,
        accuracyRaw: accuracyScore,
        tokenScore,
        timeScore,
      });
    } else if (challenge.category === "bug_fix") {
      judgeFeedback = await judgeBugFix({
        actualBug: challenge.challenge_data.bug_description,
        bugLocation: challenge.challenge_data.bug_location,
        expectedFix: challenge.challenge_data.expected_fix,
        userPrompt: prompts[0]?.prompt ?? "",
        rubric: challenge.challenge_data.rubric,
        provider,
      });
      accuracyScore =
        Number(judgeFeedback.overall_score ?? judgeFeedback.precision_score ?? 0) ||
        0;
      tokenScore = computeTokenScore(
        prompts.reduce((total, item) => total + item.token_count, 0),
        400,
      );
      combinedScore = computeCombinedScore({
        category: challenge.category,
        accuracyRaw: accuracyScore,
        tokenScore,
        timeScore,
      });
    } else if (challenge.category === "architecture_pick") {
      accuracyScore = scoreArchitectureRanking(
        body.user_ranking ?? [],
        challenge.challenge_data.correct_ranking,
      );
      judgeFeedback = {
        overall_score: accuracyScore,
        correct_ranking: challenge.challenge_data.correct_ranking,
        explanations: challenge.challenge_data.explanations,
      };
      tokenScore = 100;
      combinedScore = computeCombinedScore({
        category: challenge.category,
        accuracyRaw: accuracyScore,
        tokenScore,
        timeScore: 100,
      });
    } else if (challenge.category === "ui_reproduction") {
      const execution = await executeUIReproductionPrompt(prompts[0]?.prompt ?? "", provider);
      const targetPath = String(challenge.challenge_data.target_screenshot_url ?? "");
      const targetUrl = targetPath.startsWith("http")
        ? targetPath
        : `${env.FRONTEND_URL.replace(/\/$/, "")}${targetPath}`;

      const [generatedScreenshotBase64, targetScreenshotBase64] = await Promise.all([
        htmlToBase64ScreenshotSafe(execution.html),
        fetchUrlToBase64(targetUrl).catch(() =>
          htmlToBase64ScreenshotSafe(String(challenge.challenge_data.target_html_css ?? "")),
        ),
      ]);

      if (!generatedScreenshotBase64 || !targetScreenshotBase64) {
        res.status(502).json({
          error: "Could not render UI screenshots for evaluation. Please try again.",
        });
        return;
      }
      judgeFeedback = await judgeUIReproduction({
        provider,
        targetScreenshotBase64,
        generatedScreenshotBase64,
        rubric: challenge.challenge_data.rubric,
      });
      accuracyScore =
        Number(
          judgeFeedback.overall_score ??
            (Number(judgeFeedback.visual_similarity_percentage ?? 0) / 10),
        ) || 0;
      tokenScore = computeTokenScore(
        prompts.reduce((total, item) => total + item.token_count, 0),
        600,
      );
      combinedScore = computeCombinedScore({
        category: challenge.category,
        accuracyRaw: accuracyScore,
        tokenScore,
        timeScore,
      });
      aiResponses = [
        {
          response: execution.html,
          token_count: execution.totalTokens,
        },
      ];
      generatedScreenshotUrl = `data:image/png;base64,${generatedScreenshotBase64}`;
    }

    let tokenPercentile: number | null = null;
    if (challenge.category !== "architecture_pick") {
      const userTokens = prompts.reduce(
        (total, item) => total + item.token_count,
        0,
      );
      const { data: peerRows } = await supabaseAdmin
        .from("submissions")
        .select("prompts")
        .eq("challenge_id", body.challenge_id)
        .eq("context_type", "practice")
        .eq("status", "completed")
        .neq("user_id", req.auth!.userId)
        .limit(500);

      const peerTokens = (peerRows ?? [])
        .map((row: any) =>
          Array.isArray(row.prompts)
            ? row.prompts.reduce(
                (sum: number, p: any) => sum + Number(p?.token_count ?? 0),
                0,
              )
            : 0,
        )
        .filter((value: number) => value > 0);

      tokenPercentile = percentileScore(userTokens, peerTokens);
      if (tokenPercentile !== null) {
        tokenScore = Math.round(0.5 * tokenScore + 0.5 * tokenPercentile);
        combinedScore = computeCombinedScore({
          category: challenge.category,
          accuracyRaw: accuracyScore,
          tokenScore,
          timeScore,
        });
      }
    }
    if (tokenPercentile !== null) {
      judgeFeedback = {
        ...judgeFeedback,
        token_percentile: tokenPercentile,
      } as Record<string, unknown>;
    }

    let accuracyPercentile: number | null = null;
    let combinedPercentile: number | null = null;
    {
      const { data: peerScoreRows } = await supabaseAdmin
        .from("submissions")
        .select("accuracy_score, combined_score")
        .eq("challenge_id", body.challenge_id)
        .eq("context_type", "practice")
        .eq("status", "completed")
        .neq("user_id", req.auth!.userId)
        .limit(500);

      const peerAccuracy = (peerScoreRows ?? [])
        .map((row: any) => Number(row.accuracy_score ?? 0))
        .filter((value: number) => Number.isFinite(value));
      const peerCombined = (peerScoreRows ?? [])
        .map((row: any) => Number(row.combined_score ?? 0))
        .filter((value: number) => Number.isFinite(value));

      const pct = (value: number, peers: number[]) => {
        if (peers.length === 0) return null;
        const lower = peers.filter((p) => p < value).length;
        const equal = peers.filter((p) => p === value).length;
        return Math.round(((lower + equal * 0.5) / peers.length) * 100);
      };

      accuracyPercentile = pct(accuracyScore, peerAccuracy);
      combinedPercentile = pct(combinedScore, peerCombined);
    }
    judgeFeedback = {
      ...judgeFeedback,
      accuracy_percentile: accuracyPercentile,
      combined_percentile: combinedPercentile,
    } as Record<string, unknown>;

    const { data: submission, error: submissionError } = await supabaseAdmin
      .from("submissions")
      .insert({
        user_id: req.auth!.userId,
        challenge_id: body.challenge_id,
        context_type: body.context_type,
        context_id: body.context_id ?? null,
        prompts,
        ai_responses: aiResponses,
        user_ranking: body.user_ranking ?? null,
        generated_screenshot_url: generatedScreenshotUrl,
        accuracy_score: accuracyScore,
        token_score: tokenScore,
        time_taken_seconds: body.time_taken_seconds,
        combined_score: combinedScore,
        judge_feedback: judgeFeedback,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (submissionError) throw submissionError;

    let ratingChange: { before: number; after: number; delta: number } | null = null;
    if (body.context_type === "practice") {
      const { count: priorCount } = await supabaseAdmin
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", req.auth!.userId)
        .eq("challenge_id", body.challenge_id)
        .eq("context_type", "practice")
        .eq("status", "completed");

      const isFirstSolve = (priorCount ?? 0) <= 1;
      ratingChange = await applyRatingChange({
        userId: req.auth!.userId,
        challenge,
        submissionId: (submission as any).id,
        combinedScore,
        isFirstSolve,
      });
    }

    if (body.context_type === "contest" && body.context_id) {
      const { data: currentContestSubmissions } = await supabaseAdmin
        .from("submissions")
        .select("combined_score, time_taken_seconds")
        .eq("context_type", "contest")
        .eq("context_id", body.context_id)
        .eq("user_id", req.auth!.userId)
        .eq("status", "completed");

      const totalScore = (currentContestSubmissions ?? []).reduce(
        (sum, entry: any) => sum + Number(entry.combined_score ?? 0),
        0,
      );
      const totalTime = (currentContestSubmissions ?? []).reduce(
        (sum, entry: any) => sum + Number(entry.time_taken_seconds ?? 0),
        0,
      );

      await supabaseAdmin.from("contest_participants").upsert(
        {
          contest_id: body.context_id,
          user_id: req.auth!.userId,
          total_score: totalScore,
          total_time_seconds: totalTime,
        },
        { onConflict: "contest_id,user_id" },
      );
    }

    if (body.context_type === "test" && body.context_id) {
      const { data: currentTestSubmissions } = await supabaseAdmin
        .from("submissions")
        .select("combined_score")
        .eq("context_type", "test")
        .eq("context_id", body.context_id)
        .eq("user_id", req.auth!.userId)
        .eq("status", "completed");

      const totalScore = (currentTestSubmissions ?? []).reduce(
        (sum, entry: any) => sum + Number(entry.combined_score ?? 0),
        0,
      );

      await supabaseAdmin
        .from("test_attempts")
        .update({ total_score: totalScore })
        .eq("test_id", body.context_id)
        .eq("user_id", req.auth!.userId);
    }

    res.status(201).json({
      submission,
      challenge: getChallengeSummary(challenge),
      rating_change: ratingChange,
    });
  }),
);

export default router;
