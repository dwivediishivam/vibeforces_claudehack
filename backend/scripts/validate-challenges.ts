import fs from "node:fs";
import path from "node:path";
import { challengeLibrary } from "../../shared/challenge-library";
import type { ChallengeDifficulty, ChallengeRecord } from "../../shared/types";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "frontend/public");

function assert(condition: unknown, message: string, errors: string[]) {
  if (!condition) {
    errors.push(message);
  }
}

function fileExistsFromPublic(relativePath: string) {
  return fs.existsSync(path.join(publicDir, relativePath.replace(/^\/+/, "")));
}

function validateRating(
  challenge: ChallengeRecord,
  difficulty: ChallengeDifficulty,
  errors: string[],
) {
  const ranges = {
    easy: [800, 1200],
    medium: [1200, 1600],
    hard: [1600, 2500],
  } as const;

  const [min, max] = ranges[difficulty];
  assert(
    challenge.rating >= min && challenge.rating <= max,
    `${challenge.code}: rating ${challenge.rating} is outside ${difficulty} range ${min}-${max}.`,
    errors,
  );
}

function validateChallenge(challenge: ChallengeRecord, errors: string[]) {
  assert(Boolean(challenge.id), `${challenge.code}: missing id.`, errors);
  assert(Boolean(challenge.code), `${challenge.id}: missing code.`, errors);
  assert(Boolean(challenge.title), `${challenge.code}: missing title.`, errors);
  assert(Boolean(challenge.description), `${challenge.code}: missing description.`, errors);
  validateRating(challenge, challenge.difficulty, errors);

  switch (challenge.category) {
    case "spec_to_prompt":
      assert(
        Boolean(challenge.challenge_data.voice_note_script),
        `${challenge.code}: missing voice_note_script.`,
        errors,
      );
      assert(
        Boolean(challenge.challenge_data.voice_note_url),
        `${challenge.code}: missing voice_note_url.`,
        errors,
      );
      assert(
        fileExistsFromPublic(challenge.challenge_data.voice_note_url),
        `${challenge.code}: voice note asset missing at ${challenge.challenge_data.voice_note_url}.`,
        errors,
      );
      if (challenge.difficulty === "easy") {
        assert(
          challenge.challenge_data.prompt_mode === "single",
          `${challenge.code}: easy spec challenge must use single prompt mode.`,
          errors,
        );
      } else {
        assert(
          challenge.challenge_data.prompt_mode === "plan_act",
          `${challenge.code}: medium/hard spec challenge must use plan_act mode.`,
          errors,
        );
        assert(
          challenge.challenge_data.supplementary_images.length > 0,
          `${challenge.code}: medium/hard spec challenge must include supplementary images.`,
          errors,
        );
      }
      for (const image of challenge.challenge_data.supplementary_images) {
        assert(
          fileExistsFromPublic(image),
          `${challenge.code}: supplementary image missing at ${image}.`,
          errors,
        );
      }
      break;
    case "token_golf":
      assert(
        Boolean(challenge.challenge_data.target_description),
        `${challenge.code}: missing target_description.`,
        errors,
      );
      assert(
        Boolean(challenge.challenge_data.target_output),
        `${challenge.code}: missing target_output.`,
        errors,
      );
      assert(
        Boolean(challenge.challenge_data.verification_prompt),
        `${challenge.code}: missing verification_prompt.`,
        errors,
      );
      assert(
        Number(challenge.challenge_data.max_tokens_allowed) > 0,
        `${challenge.code}: max_tokens_allowed must be positive.`,
        errors,
      );
      break;
    case "bug_fix":
      for (const key of [
        "code",
        "language",
        "task",
        "bug_description",
        "bug_location",
        "expected_fix",
        "rubric",
      ]) {
        assert(
          Boolean(challenge.challenge_data[key]),
          `${challenge.code}: missing ${key}.`,
          errors,
        );
      }
      break;
    case "architecture_pick":
      assert(
        challenge.challenge_data.options.length === 3,
        `${challenge.code}: architecture challenge must have exactly 3 options.`,
        errors,
      );
      assert(
        challenge.challenge_data.correct_ranking.length === 3,
        `${challenge.code}: correct_ranking must have exactly 3 entries.`,
        errors,
      );
      break;
    case "ui_reproduction":
      assert(
        Boolean(challenge.challenge_data.target_screenshot_url),
        `${challenge.code}: missing target_screenshot_url.`,
        errors,
      );
      assert(
        fileExistsFromPublic(challenge.challenge_data.target_screenshot_url),
        `${challenge.code}: target screenshot missing at ${challenge.challenge_data.target_screenshot_url}.`,
        errors,
      );
      assert(
        challenge.challenge_data.target_html_css.includes("<!DOCTYPE html>") &&
          challenge.challenge_data.target_html_css.includes("</html>"),
        `${challenge.code}: target_html_css should be a complete HTML document.`,
        errors,
      );
      break;
    default:
      errors.push(`${challenge.code}: unsupported category.`);
  }
}

function main() {
  const errors: string[] = [];

  assert(challengeLibrary.length === 30, `Expected 30 challenges, found ${challengeLibrary.length}.`, errors);

  const ids = new Set<string>();
  const codes = new Set<string>();
  const distribution = new Map<string, number>();

  for (const challenge of challengeLibrary) {
    assert(!ids.has(challenge.id), `Duplicate challenge id ${challenge.id}.`, errors);
    assert(!codes.has(challenge.code), `Duplicate challenge code ${challenge.code}.`, errors);
    ids.add(challenge.id);
    codes.add(challenge.code);
    validateChallenge(challenge, errors);

    const key = `${challenge.category}:${challenge.difficulty}`;
    distribution.set(key, (distribution.get(key) ?? 0) + 1);
  }

  for (const category of [
    "spec_to_prompt",
    "token_golf",
    "bug_fix",
    "architecture_pick",
    "ui_reproduction",
  ]) {
    for (const difficulty of ["easy", "medium", "hard"]) {
      const count = distribution.get(`${category}:${difficulty}`) ?? 0;
      assert(
        count === 2,
        `Expected 2 ${difficulty} challenges in ${category}, found ${count}.`,
        errors,
      );
    }
  }

  if (errors.length > 0) {
    process.stderr.write(`Challenge validation failed with ${errors.length} issue(s):\n`);
    for (const error of errors) {
      process.stderr.write(`- ${error}\n`);
    }
    process.exit(1);
  }

  process.stdout.write("Challenge validation passed for all 30 challenges.\n");
}

main();
