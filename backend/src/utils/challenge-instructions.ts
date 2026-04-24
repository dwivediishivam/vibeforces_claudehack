// Per-challenge learner-facing instructions.
// Surfaced on the challenge workbench above the prompt area.
// Each entry should explain the task, what is judged, and one concrete tip.

export const challengeInstructions: Record<string, string> = {
  // --- SPEC TO PROMPT ---
  "SP-E1": `Listen to the voice note once. You're being asked to write a Python function that returns FizzBuzz-style output, but with custom labels ("Vibe", "Code", "VibeCode"). Your prompt has to spell out the range, all three substitution rules, and the exact return type — a list of strings. Judging looks at the AI's output, not your prompt's wording, so be unambiguous. Tip: state "return a list" explicitly so the model doesn't print to stdout.`,

  "SP-E2": `Listen once. You need to prompt for a Python script that reads "employees.csv", computes per-department average salary, and prints results sorted highest-to-lowest. Missing the filename, the sort direction, or the grouping column will tank accuracy. Tip: name the columns explicitly and say "descending by average salary" — vague phrasing is the #1 reason this challenge scores low.`,

  "SP-M1": `Two-stage prompt. In the Plan, outline the API surface — endpoints, methods, validation, filters. In the Act, ask for the implementation. The judge scores the AI's final code against the spec in the voice note, so your Plan should be detailed enough that the Act can succeed in one shot. Tip: list every required endpoint and the exact validation rules in the Plan; treat Act as "now implement what we agreed."`,

  "SP-M2": `Plan then Act. The voice note describes a Markdown→HTML converter with specific parsing rules (headings, bold, italic, links, code blocks). Your Plan should enumerate every supported syntax; your Act prompts for the code. Tip: parsing order matters — handle code blocks before inline formatting, otherwise backticks get re-interpreted.`,

  "SP-H1": `Hardest tier. Voice note plus diagrams describe a real-time chat server with rooms, presence, and message history. Plan must cover: socket events, room lifecycle, persistence, and edge cases. Act asks for working code. Tip: don't try to fit every feature into one Act prompt — list them in priority order so the model nails the core path even if it skimps on extras.`,

  "SP-H2": `Plan + Act. The spec is a parallel task scheduler with dependencies — DAG resolution, concurrent execution, failure handling. Plan should explicitly call out the data structures (adjacency, in-degree, ready-queue) and the concurrency primitive. Tip: state "use asyncio" or "use threads" — leaving the runtime ambiguous gives wildly different solutions.`,

  // --- TOKEN GOLF ---
  "TG-E1": `Reach the described output using the fewest tokens you can. The reference implementation is hidden — judging is functional: does the AI's code produce the same behavior on representative inputs? A two-character solution that works equals a verbose one. Tip: don't restate the problem; jump straight to "Write Python that reverses a string iteratively, return the result."`,

  "TG-E2": `Token-efficient palindrome check in JavaScript. Functional equivalence wins — a one-line solution scores 100 if its output matches. Tip: name the function and the input type; the model often defaults to lowercase comparison only if you say so.`,

  "TG-M1": `BST insert + search in a single class. Token budget is tight. Tip: ask for "minimal class with insert(value) and search(value), iterative not recursive" — recursion costs more tokens to express but rarely changes correctness scoring.`,

  "TG-M2": `Debounce utility in JavaScript. The reference preserves cancel and "this" context; the judge tests both. Tip: explicitly mention "preserve this context" and "expose .cancel()" — those two phrases are usually the difference between 70 and 100 on accuracy.`,

  "TG-H1": `LRU cache, O(1) get and put. The judge runs functional tests, not a string match. A Map-based one-liner that handles eviction order correctly will score full marks. Tip: in JS, Map preserves insertion order — re-insert on access to bump recency. State that and you save tokens.`,

  "TG-H2": `Event emitter with chainable on/off/emit/once. Functional equivalence: judge fires events and checks listener calls. Tip: ask for "return this from on/off/emit for chaining; once auto-removes after first call" in a single sentence — fewer tokens than describing each method separately.`,

  // --- BUG FIX ---
  "BF-E1": `Off-by-one in a Python binary search. Generic prompts ("fix the bug", "review the code") score zero. You must (a) point at the specific line or condition, (b) name the actual cause, (c) describe the correct fix. Tip: read the loop boundary — the bug is in how the search space narrows on each iteration.`,

  "BF-E2": `Loop condition bug in JavaScript Fibonacci. Identify what makes the function return the wrong value for small inputs. Tip: don't rewrite the function — just say "the loop condition / starting index is wrong because X, change it to Y."`,

  "BF-M1": `Async race condition in a batch cache helper. Returned promises end up unresolved. The judge gives you points for naming the actual cause (concurrent insertions before resolution), not for proposing a rewrite. Tip: focus on what happens when two callers request the same uncached key simultaneously.`,

  "BF-M2": `React state mutation prevents re-renders. The bug is one line. Tip: state "the array is being mutated in place — replace with a new reference" and you nail the rubric. Don't suggest switching to useReducer.`,

  "BF-H1": `Memory leak in a reconnecting event-listener wrapper. Two leaks coexist — one in reconnect, one in cleanup. Tip: walk the lifecycle — addEventListener calls without matching removeEventListener on every reconnect. Mention both leak sites; partial credit if you only catch one.`,

  "BF-H2": `Two-resource deadlock in a promise chain. Two callers acquire resources in opposite orders. Tip: name the resources, the acquisition order, and propose a single global ordering as the fix. Saying "use a mutex" is too vague.`,

  // --- ARCHITECTURE PICK ---
  "AP-E1": `Rank three database choices for a simple blog. There IS a correct ordering — pragmatic constraints (time-to-ship, hosting cost, schema flexibility) drive it. Tip: think "what does a small team actually need on day one?" not "what scales to a million users?"`,

  "AP-E2": `Rank three approaches for a CRUD admin panel. Tip: weigh maintenance and team familiarity, not raw feature count. The flashiest option is rarely the right pick.`,

  "AP-M1": `API design trade-offs — REST vs GraphQL vs RPC for a moderate app. Tip: client diversity and team experience matter more than theoretical fit. If your team has never touched GraphQL, ranking it first is usually wrong.`,

  "AP-M2": `Caching strategy for a read-heavy service. Three options trade off staleness, complexity, and cost. Tip: start from the read/write ratio and the staleness tolerance — those two numbers decide the ranking.`,

  "AP-H1": `Service boundaries for scaling a monolith. Three decomposition strategies. Tip: rank by reversibility — the option that lets you back out easily wins over the "ideal" decomposition that locks you in.`,

  "AP-H2": `Multi-region strategy. Three architectures with different consistency/availability trade-offs. Tip: the "best" is whichever matches the actual product's tolerance for staleness; don't default to strong consistency unless the use case demands it.`,

  // --- UI REPRODUCTION ---
  "UR-E1": `One screenshot, one prompt, one shot. Reproduce the component (button or card) in HTML/CSS. Judge compares the rendered screenshots, not your prompt. Tip: describe layout, color family, and spacing in concrete terms ("rounded-lg, dark gray bg, 16px padding"). Vague phrasing like "modern button" produces inconsistent output.`,

  "UR-E2": `Reproduce a small form. Tip: count the fields, mention the label position, and state alignment. The judge is forgiving on exact pixel match but harsh on missing components.`,

  "UR-M1": `Reproduce a navigation bar with logo, links, and CTA. Tip: spell out the order of items left-to-right and which one is the primary CTA — model defaults often reverse them.`,

  "UR-M2": `Reproduce a card grid section. Tip: state the grid count and gap explicitly ("3 columns on desktop, 16px gap"). Layout precision matters more than typography here.`,

  "UR-H1": `Full landing-page hero section. Tip: lead with structure (header / hero / CTA / features), then go top-down through colors and copy. A flat description tends to drop the visual hierarchy.`,

  "UR-H2": `Full dashboard layout — sidebar, header, content grid, stats cards. Tip: describe the layout as a 3-region grid first, then fill in each region. The judge weights layout match heavily; getting the regions right rescues weak styling.`,
};

export function instructionsFor(code: string): string | null {
  return challengeInstructions[code] ?? null;
}
