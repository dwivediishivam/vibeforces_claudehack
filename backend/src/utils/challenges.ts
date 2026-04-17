import type { ChallengeRow } from "../types";

export function getChallengeSummary(challenge: ChallengeRow) {
  return {
    id: challenge.id,
    code: challenge.code,
    category: challenge.category,
    difficulty: challenge.difficulty,
    rating: challenge.rating,
    title: challenge.title,
    description: challenge.description,
  };
}

export function sanitizeChallenge(challenge: ChallengeRow) {
  const base = {
    ...getChallengeSummary(challenge),
    challenge_data: {} as Record<string, unknown>,
  };

  switch (challenge.category) {
    case "spec_to_prompt":
      base.challenge_data = {
        voice_note_url: challenge.challenge_data.voice_note_url,
        supplementary_images: challenge.challenge_data.supplementary_images ?? [],
        prompt_mode: challenge.challenge_data.prompt_mode,
      };
      break;
    case "token_golf":
      base.challenge_data = {
        target_description: challenge.challenge_data.target_description,
        target_output: challenge.challenge_data.target_output,
        max_tokens_allowed: challenge.challenge_data.max_tokens_allowed,
      };
      break;
    case "bug_fix":
      base.challenge_data = {
        code: challenge.challenge_data.code,
        language: challenge.challenge_data.language,
        task: challenge.challenge_data.task,
      };
      break;
    case "architecture_pick":
      base.challenge_data = {
        scenario: challenge.challenge_data.scenario,
        options: challenge.challenge_data.options,
      };
      break;
    case "ui_reproduction":
      base.challenge_data = {
        target_screenshot_url: challenge.challenge_data.target_screenshot_url,
        description: challenge.challenge_data.description,
      };
      break;
    default:
      base.challenge_data = {};
  }

  return base;
}

export function maxTimeAllowedForChallenge(challenge: ChallengeRow) {
  const byDifficulty = {
    easy: 10 * 60,
    medium: 20 * 60,
    hard: 30 * 60,
  } as const;

  return byDifficulty[challenge.difficulty] ?? 15 * 60;
}
