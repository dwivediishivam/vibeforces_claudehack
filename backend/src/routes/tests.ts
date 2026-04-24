import type { Request } from "express";
import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/http";
import { sanitizeChallenge } from "../utils/challenges";
import type { ChallengeRow } from "../types";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("recruiter"),
  asyncHandler(async (req: Request, res) => {
    const body = z
      .object({
        title: z.string().min(3),
        description: z.string().optional().default(""),
        challenge_ids: z.array(z.string().uuid()).min(1),
        time_limit_minutes: z.number().int().positive().default(60),
        proctoring_enabled: z.boolean().default(false),
      })
      .parse(req.body);

    const { data, error } = await supabaseAdmin
      .from("recruiter_tests")
      .insert({
        ...body,
        recruiter_id: req.auth!.userId,
        proctoring_enabled: false,
      })
      .select("*")
      .single();

    if (error) throw error;

    res.status(201).json({ test: data });
  }),
);

router.get(
  "/",
  requireAuth,
  requireRole("recruiter", "admin"),
  asyncHandler(async (req: Request, res) => {
    let request = supabaseAdmin
      .from("recruiter_tests")
      .select("*")
      .order("created_at", { ascending: false });

    if (req.auth!.profile.role === "recruiter") {
      request = request.eq("recruiter_id", req.auth!.userId);
    }

    const { data, error } = await request;
    if (error) throw error;

    const tests = data ?? [];
    const testIds = tests.map((test) => test.id);

    let candidatesTested = 0;
    let completedAttempts = 0;
    let avgScore = 0;

    if (testIds.length > 0) {
      const { data: attempts, error: attemptsError } = await supabaseAdmin
        .from("test_attempts")
        .select("test_id, total_score, status")
        .in("test_id", testIds);

      if (attemptsError) throw attemptsError;

      const completed = (attempts ?? []).filter(
        (attempt) => attempt.status === "completed",
      );

      candidatesTested = attempts?.length ?? 0;
      completedAttempts = completed.length;
      avgScore =
        completed.length > 0
          ? Number(
              (
                completed.reduce(
                  (sum, attempt) => sum + Number(attempt.total_score ?? 0),
                  0,
                ) / completed.length
              ).toFixed(2),
            )
          : 0;
    }

    res.json({
      tests,
      stats: {
        candidates_tested: candidatesTested,
        completed_attempts: completedAttempts,
        avg_score: avgScore,
      },
    });
  }),
);

router.get(
  "/take/:share_code",
  asyncHandler(async (req, res) => {
    const { data: test, error } = await supabaseAdmin
      .from("recruiter_tests")
      .select("*")
      .eq("share_code", String(req.params.share_code))
      .single();

    if (error || !test) {
      res.status(404).json({ error: "Test not found." });
      return;
    }

    const { data: challenges, error: challengeError } = await supabaseAdmin
      .from("challenges")
      .select("*")
      .in("id", test.challenge_ids ?? []);

    if (challengeError) throw challengeError;

    res.json({
      test,
      challenges: (challenges ?? []).map((challenge) =>
        sanitizeChallenge(challenge as ChallengeRow),
      ),
    });
  }),
);

router.get(
  "/:id",
  requireAuth,
  requireRole("recruiter", "admin"),
  asyncHandler(async (req: Request, res) => {
    const { data: test, error } = await supabaseAdmin
      .from("recruiter_tests")
      .select("*")
      .eq("id", String(req.params.id))
      .single();

    if (error || !test) {
      res.status(404).json({ error: "Test not found." });
      return;
    }

    if (
      req.auth!.profile.role === "recruiter" &&
      test.recruiter_id !== req.auth!.userId
    ) {
      res.status(403).json({ error: "You do not own this test." });
      return;
    }

    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from("test_attempts")
      .select(
        "*, profiles!test_attempts_user_id_fkey(username, display_name, avatar_url)",
      )
      .eq("test_id", String(req.params.id))
      .order("total_score", { ascending: false });

    if (attemptsError) throw attemptsError;

    const { data: challenges, error: challengeError } = await supabaseAdmin
      .from("challenges")
      .select("*")
      .in("id", test.challenge_ids ?? []);

    if (challengeError) throw challengeError;

    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from("submissions")
      .select("user_id, accuracy_score, challenge_id, time_taken_seconds")
      .eq("context_type", "test")
      .eq("context_id", String(req.params.id))
      .eq("status", "completed");

    if (submissionsError) throw submissionsError;

    const submissionSummaryByUser = new Map<
      string,
      {
        avg_accuracy: number | null;
        solved_count: number;
        total_time_seconds: number;
      }
    >();

    for (const attempt of attempts ?? []) {
      const userSubmissions = (submissions ?? []).filter(
        (submission) => submission.user_id === attempt.user_id,
      );

      const solvedCount = new Set(
        userSubmissions.map((submission) => submission.challenge_id),
      ).size;
      const totalAccuracy = userSubmissions.reduce(
        (sum, submission) => sum + Number(submission.accuracy_score ?? 0),
        0,
      );
      const totalTimeSeconds = userSubmissions.reduce(
        (sum, submission) => sum + Number(submission.time_taken_seconds ?? 0),
        0,
      );

      submissionSummaryByUser.set(attempt.user_id, {
        avg_accuracy:
          userSubmissions.length > 0
            ? Number((totalAccuracy / userSubmissions.length).toFixed(2))
            : null,
        solved_count: solvedCount,
        total_time_seconds: totalTimeSeconds,
      });
    }

    res.json({
      test,
      attempts: (attempts ?? []).map((attempt) => ({
        ...attempt,
        ...submissionSummaryByUser.get(attempt.user_id),
      })),
      challenges: (challenges ?? []).map((challenge) =>
        sanitizeChallenge(challenge as ChallengeRow),
      ),
    });
  }),
);

router.post(
  "/:id/start",
  requireAuth,
  requireRole("learner"),
  asyncHandler(async (req: Request, res) => {
    const { data: existingAttempt, error: existingAttemptError } = await supabaseAdmin
      .from("test_attempts")
      .select("*")
      .eq("test_id", String(req.params.id))
      .eq("user_id", req.auth!.userId)
      .maybeSingle();

    if (existingAttemptError) throw existingAttemptError;

    if (
      existingAttempt &&
      ["completed", "timed_out"].includes(existingAttempt.status)
    ) {
      res.json({ attempt: existingAttempt });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("test_attempts")
      .upsert(
        {
          test_id: String(req.params.id),
          user_id: req.auth!.userId,
          status: "in_progress",
        },
        { onConflict: "test_id,user_id" },
      )
      .select("*")
      .single();

    if (error) throw error;

    res.json({ attempt: data });
  }),
);

router.post(
  "/:id/complete",
  requireAuth,
  requireRole("learner"),
  asyncHandler(async (req: Request, res) => {
    const body = z
      .object({
        total_score: z.number().default(0),
        status: z.enum(["completed", "timed_out"]).default("completed"),
      })
      .parse(req.body);

    const { data, error } = await supabaseAdmin
      .from("test_attempts")
      .update({
        total_score: body.total_score,
        status: body.status,
        completed_at: new Date().toISOString(),
      })
      .eq("test_id", String(req.params.id))
      .eq("user_id", req.auth!.userId)
      .select("*")
      .single();

    if (error) throw error;

    res.json({ attempt: data });
  }),
);

export default router;
