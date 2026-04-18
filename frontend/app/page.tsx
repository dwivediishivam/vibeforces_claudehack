import Link from "next/link";
import {
  ArrowRight,
  Bug,
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
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

const featureCards = [
  {
    icon: Mic,
    title: "Spec-to-Prompt",
    description:
      "Listen once, capture the real requirement, and write prompts that survive ambiguity.",
  },
  {
    icon: Zap,
    title: "Token Golf",
    description:
      "Drive GPT-4.1 to the right output using fewer tokens than everyone else.",
  },
  {
    icon: Bug,
    title: "Bug Fix",
    description:
      "Generic prompts score zero. Precision about the real bug is the skill being tested.",
  },
  {
    icon: GitBranch,
    title: "Architecture Pick",
    description:
      "Rank trade-offs the way pragmatic engineers do when deadlines and scope are real.",
  },
  {
    icon: Palette,
    title: "UI Reproduction",
    description:
      "See a screenshot, write one prompt, and let the model take one shot at the rebuild.",
  },
  {
    icon: Trophy,
    title: "Contests",
    description:
      "Compete live, climb the board, and benchmark your prompt instincts against other builders.",
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
                "bg-[#7c3aed] hover:bg-[#6d28d9]",
              )}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-24 lg:px-8">
          <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-72 max-w-3xl rounded-full bg-[#7c3aed]/20 blur-[120px]" />
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#334155] px-4 py-1.5 text-xs font-mono-ui text-[#94a3b8]">
                <Sparkles className="size-3.5 text-[#a78bfa]" />
                <span>
                  <span className="text-[#a78bfa]">Live Platform</span>
                  {nextContest
                    ? ` — Next arena: ${nextContest.title}`
                    : " — Challenge catalog is ready"}
                </span>
              </div>
              <h1 className="hero-gradient mt-8 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
                VibeForces
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-xl font-semibold text-[#f1f5f9]">
                LeetCode for Vibecoders.
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#94a3b8]">
                Training, Testing and Ranking Devs in 2026.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link
                  href="/learner/challenges"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-[#7c3aed] px-8 hover:bg-[#6d28d9]",
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
            </div>

            <div className="mt-16 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
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
                      className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4"
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
                      Challenge previews will appear here once the backend catalog is reachable.
                    </div>
                  ) : null}
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10">
              <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
                Challenge Modes
              </div>
              <h2 className="mt-3 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
                Five ways to prove you can guide AI under pressure.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((feature, index) => (
                <Card
                  key={feature.title}
                  className="surface-card rounded-3xl p-8 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#334155]"
                >
                  <div
                    className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl"
                    style={{
                      background:
                        [
                          "#1e1b4b",
                          "#1a2e05",
                          "#2a1a05",
                          "#1b1b3a",
                          "#051d20",
                          "#200515",
                        ][index],
                    }}
                  >
                    <feature.icon className="size-5 text-[#f8fafc]" />
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

        <section className="px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Card className="surface-card rounded-3xl p-8">
              <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
                Suggest a Challenge Idea
              </div>
              <h2 className="mt-3 text-2xl font-bold font-mono-ui text-[#f1f5f9]">
                Have a challenge idea?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                Suggest a prompt-engineering, debugging, or UI-reproduction
                scenario that should exist on the platform.
              </p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <Input
                  placeholder="Describe your challenge..."
                  className="h-12 border-[#1e293b] bg-[#0a0f1e]"
                />
                <Button className="h-12 bg-[#7c3aed] px-6 hover:bg-[#6d28d9]">
                  Submit Idea
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1e293b] px-4 py-8 text-center text-sm text-[#64748b]">
        © 2026 VibeForces. Built for the vibes.
      </footer>
    </div>
  );
}
