import type { ChallengeCategory } from "../types";

const WEIGHTS: Record<
  ChallengeCategory,
  { accuracy: number; token: number; time: number }
> = {
  spec_to_prompt: { accuracy: 0.6, token: 0.2, time: 0.2 },
  token_golf: { accuracy: 0.4, token: 0.4, time: 0.2 },
  bug_fix: { accuracy: 0.7, token: 0.1, time: 0.2 },
  architecture_pick: { accuracy: 1, token: 0, time: 0 },
  ui_reproduction: { accuracy: 0.5, token: 0.3, time: 0.2 },
};

export function normalizeAccuracy(rawScore: number) {
  return Math.max(0, Math.min(100, rawScore * 10));
}

export function computeTokenScore(
  tokensUsed: number,
  maxTokensAllowed: number | undefined,
) {
  if (!maxTokensAllowed || maxTokensAllowed <= 0) return 100;
  return Math.max(0, 100 - (tokensUsed / maxTokensAllowed) * 100);
}

export function computeTimeScore(
  timeTakenSeconds: number,
  maxTimeAllowedSeconds: number,
) {
  if (!maxTimeAllowedSeconds || maxTimeAllowedSeconds <= 0) return 100;
  return Math.max(0, 100 - (timeTakenSeconds / maxTimeAllowedSeconds) * 100);
}

export function computeCombinedScore(params: {
  category: ChallengeCategory;
  accuracyRaw: number;
  tokenScore: number;
  timeScore: number;
}) {
  const weights = WEIGHTS[params.category];
  const accuracy = normalizeAccuracy(params.accuracyRaw);

  return Number(
    (
      accuracy * weights.accuracy +
      params.tokenScore * weights.token +
      params.timeScore * weights.time
    ).toFixed(2),
  );
}

export function scoreArchitectureRanking(
  ranking: string[],
  correctRanking: string[],
) {
  if (ranking.join(",") === correctRanking.join(",")) return 10;

  let points = 0;
  ranking.forEach((entry, index) => {
    if (entry === correctRanking[index]) points += 3.5;
  });

  const pairwiseMatches =
    Number(ranking.indexOf(correctRanking[0]) < ranking.indexOf(correctRanking[1])) +
    Number(ranking.indexOf(correctRanking[0]) < ranking.indexOf(correctRanking[2])) +
    Number(ranking.indexOf(correctRanking[1]) < ranking.indexOf(correctRanking[2]));

  points += pairwiseMatches * 0.5;

  return Math.max(0, Math.min(10, Number(points.toFixed(2))));
}
