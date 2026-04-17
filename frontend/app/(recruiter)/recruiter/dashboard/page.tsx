import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/common/stat-card";
import { mockRecruiterStats } from "@/lib/data/mock";
import { sampleRecruiterTests } from "@shared/seed-data";
import { cn } from "@/lib/utils";

export default function RecruiterDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
            Recruiter Dashboard
          </div>
          <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
            Assess vibe coders with role-ready test packs
          </h1>
        </div>
        <Link
          href="/recruiter/create-test"
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-[#7c3aed] hover:bg-[#6d28d9]",
          )}
        >
          + Create Test
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Tests Created" value={String(mockRecruiterStats.testsCreated)} change="+1 this week" />
        <StatCard label="Candidates Tested" value={String(mockRecruiterStats.candidatesTested)} change="+4 this week" accent="green" />
        <StatCard label="Avg Score" value={mockRecruiterStats.avgScore.toFixed(1)} change="+0.3" accent="amber" />
      </div>

      <Card className="surface-card rounded-2xl p-6">
        <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
          Your Tests
        </div>
        <div className="mt-4 space-y-3">
          {sampleRecruiterTests.map((test) => (
            <Link
              key={test.id}
              href={`/recruiter/tests/${test.id}`}
              className="flex items-center justify-between rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4 transition hover:border-[#334155]"
            >
              <div>
                <div className="font-mono-ui text-[#f1f5f9]">{test.title}</div>
                <div className="mt-1 text-sm text-[#94a3b8]">
                  {test.challenge_ids.length} challenges · {test.time_limit_minutes} min
                </div>
              </div>
              <div className="text-xs font-mono-ui uppercase tracking-[2px] text-[#a78bfa]">
                Open
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
