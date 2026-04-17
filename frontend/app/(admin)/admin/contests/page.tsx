import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { launchContest } from "@shared/seed-data";
import { cn } from "@/lib/utils";

export default function AdminContestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
            Contest Management
          </div>
          <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
            Manage public arenas
          </h1>
        </div>
        <Link
          href="/admin/contests/create"
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-[#7c3aed] hover:bg-[#6d28d9]",
          )}
        >
          Create Contest
        </Link>
      </div>
      <Link href={`/admin/contests/${launchContest.id}`}>
        <Card className="surface-card rounded-2xl p-6 transition hover:border-[#334155]">
          <div className="font-mono-ui text-lg text-[#f1f5f9]">{launchContest.title}</div>
          <div className="mt-2 text-sm text-[#94a3b8]">
            Scheduled for April 18, 2026 at 8:00 PM IST · {launchContest.duration_minutes} minutes
          </div>
        </Card>
      </Link>
    </div>
  );
}
