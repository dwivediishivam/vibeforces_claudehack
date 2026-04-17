import { mockContestBanner, mockDashboard } from "@/lib/data/mock";
import { challengeSummaryCards, categoryLabels } from "@/lib/data/mock";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/common/stat-card";
import { CountdownTimer } from "@/components/common/countdown-timer";

export default function LearnerDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div>
          <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
            Dashboard
          </div>
          <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
            Welcome back, Jane
          </h1>
          <p className="mt-2 text-sm text-[#94a3b8]">Your vibe coding journey</p>
        </div>
        <Card className="rounded-2xl border border-[#7c3aed]/20 bg-gradient-to-r from-[#7c3aed]/10 to-transparent p-5">
          <div className="text-xs uppercase tracking-[2px] text-[#c4b5fd]">
            Contest Banner
          </div>
          <div className="mt-3 font-mono-ui text-lg text-[#f1f5f9]">
            {mockContestBanner.title}
          </div>
          <CountdownTimer
            targetDate={mockContestBanner.scheduled_at}
            className="mt-2 text-2xl font-mono-ui text-[#a78bfa]"
          />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Score" value={mockDashboard.totalScore.toLocaleString()} change={mockDashboard.scoreChange} />
        <StatCard label="Solved" value={`${mockDashboard.solved}/30`} change={mockDashboard.solvedChange} accent="green" />
        <StatCard label="Rank" value={`#${mockDashboard.rank}`} change={mockDashboard.rankChange} accent="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="surface-card rounded-2xl p-6">
          <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
            Recent Submissions
          </div>
          <div className="mt-4 space-y-3">
            {mockDashboard.recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4"
              >
                <div>
                  <div className="text-sm font-mono-ui text-[#f1f5f9]">
                    {categoryLabels[submission.category as keyof typeof categoryLabels]} — {submission.title}
                  </div>
                  <div className="mt-1 text-sm text-[#94a3b8]">{submission.timeAgo}</div>
                </div>
                <div className="rounded-full border border-[#166534] bg-[#052e16] px-3 py-1 text-xs font-mono-ui text-[#4ade80]">
                  {submission.score.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="surface-card rounded-2xl p-6">
          <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
            Category Progress
          </div>
          <div className="mt-4 space-y-5">
            {Object.entries(mockDashboard.categoryProgress).map(([category, solved]) => (
              <div key={category}>
                <div className="mb-2 flex items-center justify-between text-sm text-[#cbd5e1]">
                  <span>{categoryLabels[category as keyof typeof categoryLabels]}</span>
                  <span className="font-mono-ui text-xs text-[#64748b]">{solved}/6</span>
                </div>
                <Progress
                  value={(solved / 6) * 100}
                  className="h-2 bg-[#1e293b]"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="surface-card rounded-2xl p-6">
        <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
          Challenge Snapshot
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {challengeSummaryCards.slice(0, 4).map((challenge) => (
            <div key={challenge.id} className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-4">
              <div className="text-xs font-mono-ui uppercase text-[#64748b]">{challenge.code}</div>
              <div className="mt-2 font-mono-ui text-[#f1f5f9]">{challenge.title}</div>
              <div className="mt-2 text-sm text-[#94a3b8]">{challenge.description}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
