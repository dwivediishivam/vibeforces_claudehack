import Link from "next/link";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CountdownTimer } from "@/components/common/countdown-timer";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContestsPage() {
  const { contests } = await apiClient.getContests();
  const upcoming = contests.filter((contest) => contest.status !== "completed");

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
          Contests
        </div>
        <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
          Upcoming and live arenas
        </h1>
      </div>
      <div className="space-y-5">
        <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
          Upcoming
        </div>
        {upcoming.map((contest) => (
          <Card
            key={contest.id}
            className="surface-card rounded-2xl border-l-4 border-l-[#7c3aed] p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3 font-mono-ui text-xl text-[#f1f5f9]">
                  <Flame className="size-5 text-[#a78bfa]" />
                  {contest.title}
                </div>
                <p className="mt-3 text-sm text-[#94a3b8]">
                  {new Date(contest.scheduled_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  · {contest.duration_minutes} min
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 lg:items-end">
                <CountdownTimer
                  targetDate={contest.scheduled_at}
                  className="font-mono-ui text-2xl text-[#a78bfa]"
                />
                <Link
                  href={`/learner/contests/${contest.id}`}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "bg-[#7c3aed] hover:bg-[#6d28d9]",
                  )}
                >
                  Register
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
