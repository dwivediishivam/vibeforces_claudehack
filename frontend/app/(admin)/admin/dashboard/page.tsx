import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/common/stat-card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
          Admin Dashboard
        </div>
        <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
          Platform overview
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Users" value="17" change="+15 seeded" />
        <StatCard label="Submissions" value="248" change="+248 seeded" accent="green" />
        <StatCard label="Active Contests" value="1" change="Launch contest" accent="amber" />
      </div>
      <Card className="surface-card rounded-2xl p-6">
        <div className="text-lg font-semibold font-mono-ui text-[#f1f5f9]">
          Quick Links
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 text-sm text-[#94a3b8]">
            Create contests, review launch scheduling, and monitor leaderboard readiness.
          </div>
          <div className="rounded-2xl border border-[#1e293b] bg-[#0a0f1e] p-5 text-sm text-[#94a3b8]">
            Supabase seed assets, voice notes, and UI screenshots are prepared for the launch pack.
          </div>
        </div>
      </Card>
    </div>
  );
}
