import Link from "next/link";
import {
  ArrowRight,
  Bug,
  Flame,
  GitBranch,
  Mic,
  Palette,
  Sparkles,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { CodeAnimation } from "@/components/landing/code-animation";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

const challengeModes = [
  {
    icon: Mic,
    title: "Spec-to-Prompt",
    tint: "bg-[#7c3aed]/10 text-[#a78bfa]",
    description:
      "A stakeholder rambles through a feature idea. You listen once and distill it into a prompt that survives ambiguity.",
  },
  {
    icon: Zap,
    title: "Token Golf",
    tint: "bg-[#eab308]/10 text-[#fbbf24]",
    description:
      "Land the correct output in the fewest tokens. Precision over padding — every word has to earn its place.",
  },
  {
    icon: Bug,
    title: "Bug Fix",
    tint: "bg-[#ef4444]/10 text-[#f87171]",
    description:
      "Generic prompts score zero. Identify the real defect and direct the model to fix exactly that — nothing more.",
  },
  {
    icon: GitBranch,
    title: "Architecture Pick",
    tint: "bg-[#3b82f6]/10 text-[#60a5fa]",
    description:
      "Rank trade-offs the way pragmatic engineers do — when deadlines, scope, and cost are all real constraints.",
  },
  {
    icon: Palette,
    title: "UI Reproduction",
    tint: "bg-[#22c55e]/10 text-[#4ade80]",
    description:
      "One screenshot. One prompt. One shot. Rebuild the interface without iterating — the way real handoffs happen.",
  },
];

const steps = [
  {
    n: "01",
    title: "Pick a challenge",
    body: "Choose a mode and difficulty. Each challenge is a real task an AI engineer handles on the job.",
  },
  {
    n: "02",
    title: "Write your prompt",
    body: "You write the prompt. A frontier model runs it. The solution is exactly what your prompt produced — no hand-edits.",
  },
  {
    n: "03",
    title: "Get ranked",
    body: "An LLM-as-judge grades accuracy. Token usage and time roll into a single rating on the global leaderboard.",
  },
];

export default async function HomePage() {
  const contests = await apiClient
    .getContests()
    .then((response) => response.contests)
    .catch(() => []);
  const nextContest =
    [...contests]
      .filter((contest) => contest.status !== "completed")
      .sort(
        (left, right) =>
          new Date(left.scheduled_at).getTime() - new Date(right.scheduled_at).getTime(),
      )[0] ?? null;

  return (
    <div className="min-h-screen bg-[#030712]">
      <header className="sticky top-0 z-50 border-b border-[#1e293b]/60 bg-[#030712]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-[#cbd5e1] hover:text-white",
              )}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-[#7c3aed] shadow-[0_0_24px_rgba(124,58,237,0.35)] hover:bg-[#6d28d9]",
              )}
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-x-0 -top-24 mx-auto h-[32rem] max-w-4xl rounded-full bg-[#7c3aed]/18 blur-[160px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.08),transparent_65%)]" />
          </div>
          <div className="absolute inset-0 -z-10 opacity-70">
            <CodeAnimation />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-28 text-center lg:px-8 lg:pt-36">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#334155]/70 bg-[#0a0f1e]/70 px-4 py-1.5 text-xs font-mono-ui text-[#94a3b8] backdrop-blur-md">
              <Sparkles className="size-3.5 text-[#a78bfa]" />
              <span>
                <span className="text-[#a78bfa]">Season 1</span>
                {nextContest ? ` — next arena: ${nextContest.title}` : " — launch catalog is live"}
              </span>
            </div>

            <h1 className="hero-gradient mt-8 text-6xl font-extrabold tracking-tight md:text-8xl">
              VibeForces
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-xl font-semibold text-[#f1f5f9] md:text-2xl">
              LeetCode for Vibecoders.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#94a3b8]">
              The skill that ships software today is directing AI — not typing
              it. Practice, rank, and prove that skill, judged by AI on real
              prompt-engineering tasks.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-[#7c3aed] px-8 shadow-[0_0_40px_rgba(124,58,237,0.35)] hover:bg-[#6d28d9]",
                )}
              >
                Start practicing
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href="/learner/challenges"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-[#334155] bg-transparent px-8 text-white hover:bg-[#111827]",
                )}
              >
                Browse challenges
              </Link>
            </div>
          </div>
        </section>

        {/* CHALLENGE MODES */}
        <section className="px-4 py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-xs uppercase tracking-[3px] text-[#64748b]">
                Challenge modes
              </div>
              <h2 className="mt-4 text-3xl font-bold font-mono-ui text-[#f1f5f9] md:text-4xl">
                Five ways to prove you can guide AI under pressure.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#94a3b8]">
                Each mode targets a distinct skill recruiters care about — from
                listening, to precision, to judgment.
              </p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {challengeModes.map((mode) => (
                <div
                  key={mode.title}
                  className="group relative rounded-2xl border border-[#1e293b] bg-[#0a0f1e]/60 p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#334155] hover:bg-[#0a0f1e]"
                >
                  <div
                    className={cn(
                      "mb-6 inline-flex size-11 items-center justify-center rounded-xl",
                      mode.tint,
                    )}
                  >
                    <mode.icon className="size-5" />
                  </div>
                  <h3 className="font-mono-ui text-lg font-semibold text-[#f1f5f9]">
                    {mode.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                    {mode.description}
                  </p>
                </div>
              ))}
              <div className="relative flex flex-col justify-center rounded-2xl border border-dashed border-[#1e293b] bg-transparent p-7">
                <div className="text-xs uppercase tracking-[3px] text-[#64748b]">
                  More soon
                </div>
                <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                  System design, multi-service prompting, and live pair-with-AI
                  rounds are already on the roadmap.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SCOPE */}
        <section className="px-4 py-12 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#166534]/50 bg-[#052e16]/30 p-6">
                <div className="flex items-center gap-2 font-mono-ui text-sm text-[#4ade80]">
                  <span className="size-1.5 rounded-full bg-[#4ade80]" />
                  Currently: SDE-1 &amp; SDE-2 challenges
                </div>
                <p className="mt-3 text-sm leading-6 text-[#bbf7d0]/80">
                  A launch catalog across prompt precision, debugging,
                  architecture judgment, and UI reproduction.
                </p>
              </div>
              <div className="rounded-2xl border border-[#92400e]/50 bg-[#1c1917]/40 p-6">
                <div className="flex items-center gap-2 font-mono-ui text-sm text-[#fbbf24]">
                  <span className="size-1.5 rounded-full bg-[#fbbf24]" />
                  Coming soon: SDE-3, Senior &amp; Staff
                </div>
                <p className="mt-3 text-sm leading-6 text-[#fde68a]/80">
                  System design, multi-service prompts, and higher-order vibe
                  coding interviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-4 py-28 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-xs uppercase tracking-[3px] text-[#64748b]">
                How it works
              </div>
              <h2 className="mt-4 text-3xl font-bold font-mono-ui text-[#f1f5f9] md:text-4xl">
                Three steps. One rating.
              </h2>
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.n} className="relative">
                  <div className="font-mono-ui text-xs text-[#a78bfa]">
                    {step.n}
                  </div>
                  <div className="mt-3 h-px w-10 bg-gradient-to-r from-[#7c3aed] to-transparent" />
                  <h3 className="mt-5 text-lg font-mono-ui font-semibold text-[#f1f5f9]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOR RECRUITERS */}
        <section className="px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-3xl border border-[#1e293b] bg-gradient-to-br from-[#0a0f1e] via-[#0a0f1e] to-[#111827] p-10 md:p-14">
              <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                <div>
                  <div className="text-xs uppercase tracking-[3px] text-[#64748b]">
                    For recruiters
                  </div>
                  <h2 className="mt-3 text-2xl font-bold font-mono-ui text-[#f1f5f9] md:text-3xl">
                    Hire developers who can actually ship in 2026.
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#94a3b8] md:text-base">
                    LeetCode measured whether a candidate could hand-write
                    algorithms. That is not the job anymore. Send candidates a
                    VibeForces test and see, in one sitting, whether they can
                    direct AI to correct, efficient output under real
                    constraints — with a full rubric you can review.
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:items-end">
                  <Link
                    href="/signup"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "bg-[#7c3aed] px-8 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:bg-[#6d28d9]",
                    )}
                  >
                    Create a test
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm font-mono-ui text-[#94a3b8] hover:text-[#a78bfa]"
                  >
                    Already have an account? Log in →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTEST BANNER */}
        {nextContest ? (
          <section className="px-4 pb-20 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <Card className="relative overflow-hidden rounded-3xl border border-[#7c3aed]/30 bg-gradient-to-r from-[#7c3aed]/10 via-[#0a0f1e] to-[#7c3aed]/10 p-10">
                <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#7c3aed]/20 blur-3xl" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#f97316]/15">
                      <Flame className="size-5 text-[#fb923c]" />
                    </div>
                    <h3 className="mt-4 text-2xl font-mono-ui font-bold text-[#f1f5f9] md:text-3xl">
                      {nextContest.title}
                    </h3>
                    <p className="mt-2 font-mono-ui text-sm text-[#94a3b8]">
                      {new Date(nextContest.scheduled_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {" · "}
                      {nextContest.duration_minutes} min
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-4 md:items-end">
                    <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
                      Starts in
                    </div>
                    <CountdownTimer
                      targetDate={nextContest.scheduled_at}
                      className="font-mono-ui text-3xl font-bold text-[#a78bfa] md:text-4xl"
                    />
                    <Link
                      href="/learner/contests"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "bg-[#7c3aed] px-8 shadow-[0_0_40px_rgba(124,58,237,0.35)] hover:bg-[#6d28d9]",
                      )}
                    >
                      Join contest
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        ) : null}

        {/* FINAL CTA */}
        <section className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold font-mono-ui text-[#f1f5f9] md:text-5xl">
              Ready to train your instincts?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[#94a3b8]">
              Free to start. Pick a challenge, write a prompt, get a rating.
              Your first attempt takes under ten minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-[#7c3aed] px-8 shadow-[0_0_40px_rgba(124,58,237,0.35)] hover:bg-[#6d28d9]",
                )}
              >
                Sign up — it's free
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-[#334155] bg-transparent px-8 text-white hover:bg-[#111827]",
                )}
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1e293b] px-4 py-10 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo />
            <p className="mt-2 text-xs text-[#64748b]">LeetCode for Vibecoders</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 font-mono-ui text-sm text-[#94a3b8]">
            <Link href="/learner/challenges" className="hover:text-[#f1f5f9]">
              Challenges
            </Link>
            <Link href="/learner/leaderboard" className="hover:text-[#f1f5f9]">
              Leaderboard
            </Link>
            <Link href="/learner/contests" className="hover:text-[#f1f5f9]">
              Contests
            </Link>
            <Link href="/login" className="hover:text-[#f1f5f9]">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-[#f1f5f9]">
              Sign up
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-[#1e293b] pt-6 text-center text-xs text-[#64748b]">
          © 2026 VibeForces. Built for the vibes.
        </div>
      </footer>
    </div>
  );
}
