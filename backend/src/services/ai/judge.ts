import type { JudgeResult } from "../../types";
import { openai, JUDGE_MODEL, runPrompt } from "./openai";
import { safeJsonParse } from "../../utils/json";

export async function judgeSpecToPrompt(params: {
  expectedBehavior: string;
  rubric: string;
  userPrompts: string[];
  aiOutputs: string[];
}) {
  const result = await runPrompt({
    model: JUDGE_MODEL,
    responseFormat: "json_object",
    systemPrompt: `You are grading a prompt-engineering exercise. The primary signal is whether the AI OUTPUT matches the expected behavior. Prompt wording matters only insofar as it produced a correct output.

Calibration anchors for overall_score (0-10):
- 10: AI output fully satisfies the expected behavior and rubric.
- 8-9: AI output satisfies the core behavior; 1-2 minor rubric items missing.
- 6-7: AI output covers the main path but misses meaningful requirements.
- 4-5: AI output is partially relevant but misses the core ask.
- 1-3: AI output is off-target or empty.
- 0: No attempt or gibberish.

Be fair. A correct-enough output from a short prompt scores higher than a verbose prompt with a weak output. Do not penalize prompt style if the output is good.

Respond in this EXACT JSON format:
{
  "accuracy_score": <number 0-10>,
  "prompt_clarity_score": <number 0-10>,
  "completeness_score": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<2-3 sentences focused on what the OUTPUT got right or missed>",
  "breakdown": {
    "what_worked": "<brief>",
    "what_could_improve": "<brief>"
  }
}`,
    userPrompt: `## Expected Behavior
${params.expectedBehavior}

## Rubric
${params.rubric}

## User Prompts
${params.userPrompts.map((prompt, index) => `Prompt ${index + 1}: ${prompt}`).join("\n")}

## AI Outputs
${params.aiOutputs.map((output, index) => `Output ${index + 1}: ${output}`).join("\n")}`,
    maxTokens: 900,
  });

  return safeJsonParse<JudgeResult>(result.content, {
    accuracy_score: 0,
    overall_score: 0,
    feedback: "Judge response was not parseable.",
  });
}

export async function judgeTokenGolf(params: {
  targetOutput: string;
  actualOutput: string;
  verificationPrompt: string;
}) {
  const result = await runPrompt({
    model: JUDGE_MODEL,
    responseFormat: "json_object",
    systemPrompt: `You are verifying whether AI-generated code matches a target specification. Judge on functional equivalence, not surface-level text similarity.
${params.verificationPrompt}

Calibration for correctness_percentage:
- 100: Output is functionally equivalent to the target on all inputs.
- 80-95: Output solves the task; minor edge-case or formatting mismatch.
- 50-79: Output solves the common cases but misses a clear requirement.
- 20-49: Output attempts the task but is broken for most inputs.
- 0-19: Off-target, empty, or non-code.

Do not punish stylistic differences (variable names, spacing). Reward any correct approach.

Respond in this EXACT JSON format:
{
  "correctness_percentage": <number 0-100>,
  "is_correct": <boolean>,
  "differences": "<brief>",
  "feedback": "<1-2 sentences>"
}`,
    userPrompt: `## Target Output
${params.targetOutput}

## Actual Output
${params.actualOutput}`,
    maxTokens: 600,
  });

  return safeJsonParse<JudgeResult>(result.content, {
    correctness_percentage: 0,
    overall_score: 0,
    feedback: "Judge response was not parseable.",
  });
}

export async function judgeBugFix(params: {
  actualBug: string;
  bugLocation: string;
  expectedFix: string;
  userPrompt: string;
  rubric: string;
}) {
  const result = await runPrompt({
    model: JUDGE_MODEL,
    responseFormat: "json_object",
    systemPrompt: `You are judging how precisely a user's prompt pinpointed a bug.

Scoring is a sum: 4 points for locating the bug (line, function, or specific code), 4 points for naming the real cause, 2 points for describing the correct fix direction. Partial credit is fine. Paraphrasing the rubric counts as long as the core idea is correct.

Do NOT penalize a user for being terse or for using different wording than the rubric. Reward any prompt that, if sent to an AI, would have produced the expected fix.

- 10: Located, diagnosed, and directed the fix.
- 7-9: Correctly identified the real bug; fix direction may be fuzzy.
- 4-6: Found the right area but wrong cause, or right cause but wrong area.
- 1-3: Generic "fix the bug" prompt with no specific insight.
- 0: No attempt.

Respond in this EXACT JSON format:
{
  "precision_score": <number 0-10>,
  "identification_accuracy": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<2-3 sentences>",
  "user_identified_location": <boolean>,
  "user_identified_cause": <boolean>,
  "user_described_fix_direction": <boolean>
}`,
    userPrompt: `## Actual Bug
${params.actualBug}

## Bug Location
${params.bugLocation}

## Expected Fix
${params.expectedFix}

## Rubric
${params.rubric}

## User Prompt
${params.userPrompt}`,
    maxTokens: 800,
  });

  return safeJsonParse<JudgeResult>(result.content, {
    precision_score: 0,
    overall_score: 0,
    feedback: "Judge response was not parseable.",
  });
}

export async function judgeUIReproduction(params: {
  targetScreenshotBase64: string;
  generatedScreenshotBase64: string;
  rubric: string;
}) {
  if (!openai) {
    throw new Error("OpenAI is not configured.");
  }

  const response = await openai.chat.completions.create({
    model: JUDGE_MODEL,
    messages: [
      {
        role: "system",
        content: `You are judging visual similarity between two UI screenshots: the first is the TARGET, the second is the USER'S REPRODUCTION.

Score holistically. A recognizable reproduction of the same UI — same component structure, approximate colors, approximate layout — should score high even if pixel-level details differ. Web rendering is never pixel-perfect, and the judge should not punish expected variance.

Calibration for overall_score (0-10):
- 10: Same components, same layout, same color family, same typography hierarchy.
- 8-9: Same layout and components, minor color/spacing/typography differences.
- 6-7: Right general structure; some components missing or wrong styling.
- 4-5: Partial structure; clearly the same idea but major differences.
- 1-3: Attempt visible but mostly wrong.
- 0: Blank / unrelated.

visual_similarity_percentage must be consistent with overall_score (i.e. overall_score * 10 ± 5).

${params.rubric}

Respond in this EXACT JSON format:
{
  "visual_similarity_percentage": <number 0-100>,
  "layout_match": <number 0-10>,
  "color_match": <number 0-10>,
  "typography_match": <number 0-10>,
  "component_match": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<2-3 sentences>"
}`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Target UI" },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${params.targetScreenshotBase64}`,
            },
          },
          { type: "text", text: "Generated UI" },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${params.generatedScreenshotBase64}`,
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 900,
  });

  return safeJsonParse<JudgeResult>(
    response.choices[0]?.message?.content ?? "",
    {
      visual_similarity_percentage: 0,
      overall_score: 0,
      feedback: "Judge response was not parseable.",
    },
  );
}
