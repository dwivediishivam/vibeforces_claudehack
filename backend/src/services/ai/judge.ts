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
    systemPrompt: `You are a judge evaluating a vibe coder's prompt-writing ability.
You will receive the expected behavior, a rubric, the user's prompts, and the AI outputs.

Respond in this EXACT JSON format:
{
  "accuracy_score": <number 0-10>,
  "prompt_clarity_score": <number 0-10>,
  "completeness_score": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<2-3 sentences>",
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
    systemPrompt: `You are verifying whether AI-generated code matches a target specification.
${params.verificationPrompt}

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
    systemPrompt: `You are judging how precisely a vibe coder identified a bug.
The most important signal is specificity.

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
        content: `You are judging visual similarity between two UI screenshots.
Compare the first image (target) with the second image (reproduction).

Respond in this EXACT JSON format:
{
  "visual_similarity_percentage": <number 0-100>,
  "layout_match": <number 0-10>,
  "color_match": <number 0-10>,
  "typography_match": <number 0-10>,
  "component_match": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<2-3 sentences>"
}

${params.rubric}`,
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
