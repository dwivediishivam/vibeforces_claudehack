import Link from "next/link";
import {
  ArrowRight,
  Bug,
  Flame,
  GitBranch,
  Mic,
  Palette,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/layout/logo";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

const featureCards = [
  {
    icon: Mic,
    title: "Spec-to-Prompt",
    tint: "bg-[#7c3aed]/10 text-[#a78bfa]",
    description:
      "Listen once, capture the real requirement, and write prompts that survive ambiguity.",
  },
  {
    icon: Zap,
    title: "Token Golf",
    tint: "bg-[#eab308]/10 text-[#fbbf24]",
    description:
      "Drive GPT-4.1 to the right output using fewer tokens than everyone else.",
  },
  {
    icon: Bug,
    title: "Bug Fix",
    tint: "bg-[#ef4444]/10 text-[#f87171]",
    description:
      "Generic prompts score zero. Precision about the real bug is the skill being tested.",
  },
  {
    icon: GitBranch,
    title: "Architecture Pick",
    tint: "bg-[#3b82f6]/10 text-[#60a5fa]",
    description:
      "Rank trade-offs the way pragmatic engineers do when deadlines and scope are real.",
  },
  {
    icon: Palette,
    title: "UI Reproduction",
    tint: "bg-[#22c55e]/10 text-[#4ade80]",
    description:
      "See a screenshot, write one prompt, and let the model take one shot at the rebuild.",
  },
  {
    icon: Trophy,
    title: "Contests",
    tint: "bg-[#f97316]/10 text-[#fb923c]",
    description:
      "Compete live, climb the board, and benchmark your prompt instincts against other builders.",
  },
];

const steps = [
  {
    n: "1",
    title: "Pick a Challenge",
    body: "Browse 30 curated challenges across 5 categories and 3 difficulty tiers.",
  },
  {
    n: "2",
    title: "Write Your Prompt",
    body: "Craft precise prompts — GPT-4.1 is your execution engine, judged by GPT-5.4-mini.",
  },
  {
    n: "3",
    title: "Get Ranked",
    body: "Accuracy, token efficiency, and time roll up into your global rating.",
  },
];

export default async function HomePage() {
  const [challenges, contests] = await Promise.all([
    apiClient.getChallenges().then((response) => response.challenges).catch(() => []),
    apiClient.getContests().then((response) => response.contests).catch(() => []),
  ]);
  const previewChallenges = challenges.slice(0, 3);
  const nextContest =
    [...contests]
      .filter((contest) => contest.status !== "completed")
      .sort(
        (left, right) =>
          new Date(left.scheduled_at).getTime() - new Date(right.scheduled_at).getTime(),
      )[0] ?? null;

  const stats = [
    { value: challenges.length > 0 ? `${challenges.length}` : "30", label: "Challenges" },
    { value: "5", label: "Categories" },
    { value: "3", label: "Difficulty Tiers" },
    { value: contests.length > 0 ? `${contests.length}` : "1", label: "Contests" },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[#1e293b] bg-[#030712]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "border border-transparent hover:border-[#1e293b]",
              )}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-[#7c3aed] shadow-[0_0_24px_rgba(124,58,237,0.35)] hover:bg-[#6d28d9]",
              )}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden px-4 pb-24 pt-28 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[28rem] max-w-4xl rounded-full bg-[#7c3aed]/25 blur-[140px]" />
          <div className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.18)_0%,transparent_70%)]" />
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#334155] bg-[#0a0f1e]/60 px-4 py-1.5 text-xs font-mono-ui text-[#94a3b8] backdrop-blur-md">
                <Sparkles className="size-3.5 text-[#a78bfa]" />
                <span>
                  <span className="text-[#a78bfa]">Season 1</span>
                  {nextContest
                    ? ` — Next arena: ${nextContest.title}`
                    : " — Launch catalog is live"}
                </span>
              </div>
              <h1 className="hero-gradient mt-8 text-6xl font-extrabold leading-[1.02] tracking-tight md:text-8xl">
                VibeForces
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-2xl font-semibold text-[#f1f5f9] md:text-3xl">
                LeetCode for Vibecoders.
              </p>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#94a3b8] md:text-lg">
                The competitive platform where vibe coders train, rank, and prove
                they can ship — with prompts, not syntax.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link
                  href="/learner/challenges"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-[#7c3aed] px-8 shadow-[0_0_40px_rgba(124,58,237,0.35)] hover:bg-[#6d28d9]",
                  )}
                >
                  Start Practicing
                  <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  href="/learner/challenges"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "border-[#334155] bg-transparent px-8 text-white hover:bg-[#111827]",
                  )}
                >
                  View Challenges
                </Link>
              </div>

              {/* Stats bar */}
              <div className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-16">
                {stats.map((stat, i) => (
                  <div key={stat.label} className="flex items-center gap-x-12 md:gap-x-16">
                    <div className="text-center">
                      <div className="text-3xl font-mono-ui font-bold text-[#f1f5f9]">
                        {stat.value}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[2px] text-[#64748b]">
                        {stat.label}
                      </div>
                    </div>
                    {i < stats.length - 1 ? (
                      <div className="hidden h-8 w-px bg-[#1e293b] md:block" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-20 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <Card className="surface-card rounded-3xl p-6 lg:p-8">
                <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
                  Scope
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#166534] bg-[#052e16]/60 p-5">
                    <div className="font-mono-ui text-sm text-[#4ade80]">
                      ● Currently: SD-1 &amp; SD-2 Level Challenges
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#bbf7d0]">
                      30 launch questions across prompt precision, debugging,
                      architecture judgment, and UI reproduction.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#92400e] bg-[#1c1917] p-5">
                    <div className="font-mono-ui text-sm text-[#fbbf24]">
                      ● Coming Soon: SD-3, Senior &amp; Staff
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#fde68a]">
                      System design, multi-service prompts, and higher-order vibe
                      coding interviews are already on the roadmap.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="surface-card rounded-3xl p-6">
                <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
                  Preview
                </div>
                <div className="mt-5 space-y-4">
                  {previewChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4 transition-all hover:border-[#334155]"
                    >
                      <div className="text-xs font-mono-ui uppercase text-[#64748b]">
                        {challenge.code}
                      </div>
                      <div className="mt-2 font-mono-ui text-[#f1f5f9]">
                        {challenge.title}
                      </div>
                      <div className="mt-2 text-sm text-[#94a3b8]">
                        {challenge.description}
                      </div>
                    </div>
                  ))}
                  {previewChallenges.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#334155] bg-[#0a0f1e] p-4 text-sm text-[#94a3b8]">
                      Challenge previews will appear once the backend catalog is reachable.
                    </div>
                  ) : null}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
                Challenge Modes
              </div>
              <h2 className="mt-3 text-3xl font-bold font-mono-ui text-[#f1f5f9] md:text-4xl">
                Five ways to prove you can guide AI under pressure.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-[#94a3b8]">
                Master every dimension of vibe coding — from listening to shipping.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((feature) => (
                <Card
                  key={feature.title}
                  className="surface-card group rounded-3xl p-8 transition-all duration-200 hover:-translate-y-1 hover:border-[#334155] hover:shadow-[0_0_40px_rgba(124,58,237,0.08)]"
                >
                  <div
                    className={cn(
                      "mb-5 inline-flex size-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
                      feature.tint,
                    )}
                  >
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="font-mono-ui text-xl font-semibold text-[#f1f5f9]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
                Workflow
              </div>
              <h2 className="mt-3 text-3xl font-bold font-mono-ui text-[#f1f5f9] md:text-4xl">
                How It Works
              </h2>
            </div>
            <div className="grid gap-10 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.n} className="text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/10 text-lg font-mono-ui font-bold text-[#a78bfa] shadow-[0_0_24px_rgba(124,58,237,0.15)]">
                    {step.n}
                  </div>
                  <h3 className="mt-5 text-lg font-mono-ui font-semibold text-[#f1f5f9]">
                    {step.title}
                  </h3>
                  <p className="mx-auto mt-2 max-w-[240px] text-sm leading-relaxed text-[#94a3b8]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTEST BANNER */}
        {nextContest ? (
          <section className="px-4 py-16 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <Card className="relative overflow-hidden rounded-3xl border border-[#7c3aed]/30 bg-gradient-to-r from-[#7c3aed]/15 via-[#111827] to-[#7c3aed]/15 p-10">
                <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#7c3aed]/20 blur-3xl" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#f97316]/15">
                      <Flame className="size-6 text-[#fb923c]" />
                    </div>
                    <h3 className="mt-4 text-2xl font-mono-ui font-bold text-[#f1f5f9] md:text-3xl">
                      {nextContest.title}
                    </h3>
                    <p className="mt-2 font-mono-ui text-sm text-[#94a3b8]">
                      {new Date(nextContest.scheduled_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      · {nextContest.duration_minutes} min ·{" "}
                      {nextContest.challenge_ids.length} challenges
                    </p>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-[#94a3b8]">
                      {nextContest.description}
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
                      Join Contest
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        ) : null}

        {/* SUGGEST */}
        <section className="px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Card className="surface-card rounded-3xl p-8 md:p-10">
              <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
                Community
              </div>
              <h2 className="mt-3 text-2xl font-bold font-mono-ui text-[#f1f5f9] md:text-3xl">
                Have a challenge idea?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                Help us build the future of vibe coding tests. Suggest a
                prompt-engineering, debugging, or UI-reproduction scenario.
              </p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <Input
                  placeholder="Describe your challenge..."
                  className="h-12 border-[#1e293b] bg-[#0a0f1e] focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                />
                <Button className="h-12 bg-[#7c3aed] px-6 hover:bg-[#6d28d9]">
                  Submit Idea
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1e293b] px-4 py-12 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
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
            <Link href="/signup" className="hover:text-[#f1f5f9]">
              Sign Up
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-[#1e293b] pt-6 text-center text-xs text-[#64748b]">
          © 2026 VibeForces. Built for the vibes.
        </div>
      </footer>
    </div>
  );
}
