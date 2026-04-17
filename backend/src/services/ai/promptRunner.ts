import type { PromptExecutionResult } from "../../types";
import { EXECUTION_MODEL, runPrompt } from "./openai";

export async function executeSpecToPrompt(params: {
  promptMode: "single" | "plan_act";
  userPrompts: string[];
}): Promise<PromptExecutionResult> {
  if (params.promptMode === "single") {
    const result = await runPrompt({
      model: EXECUTION_MODEL,
      responseFormat: "json_object",
      systemPrompt: `You are an AI coding assistant. The user will describe what they want built.
Generate the code based on their description.

IMPORTANT: You MUST respond in this EXACT JSON format:
{
  "code": "<complete working code>",
  "language": "<programming language>",
  "explanation": "<1-2 sentence explanation>"
}

Do not include anything outside this JSON.`,
      userPrompt: params.userPrompts[0] ?? "",
      maxTokens: 3000,
    });

    return {
      responses: [{ content: result.content, tokens: result.outputTokens }],
      totalTokens: result.inputTokens + result.outputTokens,
    };
  }

  const planResult = await runPrompt({
    model: EXECUTION_MODEL,
    responseFormat: "json_object",
    systemPrompt: `You are an AI coding assistant in PLANNING mode.
The user will describe what they want. Create a detailed plan, not code.

IMPORTANT: You MUST respond in this EXACT JSON format:
{
  "plan": "<detailed step-by-step plan with numbered steps>",
  "approach": "<high-level approach in 1-2 sentences>",
  "key_decisions": "<architectural or design decisions>"
}`,
    userPrompt: params.userPrompts[0] ?? "",
    maxTokens: 1400,
  });

  const actResult = await runPrompt({
    model: EXECUTION_MODEL,
    responseFormat: "json_object",
    systemPrompt: `You are an AI coding assistant in EXECUTION mode.
You previously created this plan:
${planResult.content}

Now implement the code based on the user's execution prompt.

IMPORTANT: You MUST respond in this EXACT JSON format:
{
  "code": "<complete working code>",
  "language": "<programming language>",
  "explanation": "<1-2 sentence explanation>"
}`,
    userPrompt: params.userPrompts[1] ?? "",
    maxTokens: 3200,
  });

  return {
    responses: [
      { content: planResult.content, tokens: planResult.outputTokens },
      { content: actResult.content, tokens: actResult.outputTokens },
    ],
    totalTokens:
      planResult.inputTokens +
      planResult.outputTokens +
      actResult.inputTokens +
      actResult.outputTokens,
  };
}

export async function executeTokenGolfPrompt(prompt: string) {
  const result = await runPrompt({
    model: EXECUTION_MODEL,
    responseFormat: "json_object",
    systemPrompt: `You are an AI coding assistant. Generate exactly what the user asks for.
Be precise and follow their instructions exactly.

IMPORTANT: You MUST respond in this EXACT JSON format:
{
  "code": "<the generated code>",
  "language": "<programming language>"
}

Do not include anything outside this JSON.`,
    userPrompt: prompt,
    maxTokens: 2200,
  });

  return {
    content: result.content,
    totalTokens: result.inputTokens + result.outputTokens,
  };
}

export async function executeUIReproductionPrompt(prompt: string) {
  const result = await runPrompt({
    model: EXECUTION_MODEL,
    systemPrompt: `You are a UI developer. Generate a single HTML file with inline CSS
that reproduces the UI described by the user.

IMPORTANT: You MUST respond with ONLY the complete HTML code.
- Include all CSS inline in a <style> tag
- The HTML must be self-contained
- Use modern CSS and match the described layout as closely as possible
- Start with <!DOCTYPE html> and end with </html>`,
    userPrompt: prompt,
    maxTokens: 3000,
  });

  return {
    html: result.content,
    totalTokens: result.inputTokens + result.outputTokens,
  };
}
