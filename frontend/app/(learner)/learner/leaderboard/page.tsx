import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { apiClient } from "@/lib/api";

export default async function LeaderboardPage() {
  const { leaderboard } = await apiClient.getPracticeLeaderboard();
  const entries = leaderboard.map((entry) => ({
    ...entry,
    isCurrentUser: entry.rank === 7,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
            Leaderboard
          </div>
          <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
            Top vibecoders ranked by combined score
          </h1>
        </div>
        <Tabs defaultValue="all-time">
          <TabsList className="border border-[#1e293b] bg-[#111827]">
            <TabsTrigger value="all-time">All Time</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <LeaderboardTable entries={entries} />
    </div>
  );
}
