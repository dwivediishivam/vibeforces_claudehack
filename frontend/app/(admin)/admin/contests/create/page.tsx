"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { challengeSummaryCards, categoryLabels } from "@/lib/data/mock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DifficultyBadge } from "@/components/common/difficulty-badge";

export default function CreateContestPage() {
  const [title, setTitle] = useState("VibeForces Launch Challenge");
  const [scheduledAt, setScheduledAt] = useState("2026-04-18T20:00");
  const [duration, setDuration] = useState("120");
  const [category, setCategory] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const available = useMemo(
    () =>
      challengeSummaryCards.filter(
        (challenge) => category === "all" || challenge.category === category,
      ),
    [category],
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
          Create Contest
        </div>
        <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
          Schedule a live arena
        </h1>
      </div>
      <Card className="surface-card rounded-2xl p-6">
        <div className="grid gap-4 xl:grid-cols-[1fr_220px_220px]">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-12 border-[#1e293b] bg-[#0a0f1e]"
          />
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            className="h-12 border-[#1e293b] bg-[#0a0f1e]"
          />
          <Select value={duration} onValueChange={(value) => value && setDuration(value)}>
            <SelectTrigger className="h-12 border-[#1e293b] bg-[#0a0f1e] font-mono-ui">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[#1e293b] bg-[#0a0f1e] text-[#f1f5f9]">
              {["60", "90", "120", "180"].map((value) => (
                <SelectItem key={value} value={value}>
                  {value} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div>
            <Select value={category} onValueChange={(value) => value && setCategory(value)}>
              <SelectTrigger className="border-[#1e293b] bg-[#0a0f1e]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#1e293b] bg-[#0a0f1e] text-[#f1f5f9]">
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-4 space-y-2">
              {available.map((challenge) => (
                <button
                  key={challenge.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-[#1e293b] bg-[#0a0f1e] px-3 py-3 text-left"
                  onClick={() =>
                    setSelectedIds((current) =>
                      current.includes(challenge.id)
                        ? current.filter((id) => id !== challenge.id)
                        : [...current, challenge.id],
                    )
                  }
                >
                  <div>
                    <div className="font-mono-ui text-sm text-[#f1f5f9]">
                      {challenge.title}
                    </div>
                    <div className="mt-1 text-xs text-[#64748b]">
                      {challenge.code}
                    </div>
                  </div>
                  <DifficultyBadge difficulty={challenge.difficulty} />
                </button>
              ))}
            </div>
          </div>
          <Card className="surface-subtle rounded-2xl p-4">
            <div className="text-sm font-mono-ui text-[#f1f5f9]">
              Selected ({selectedIds.length})
            </div>
            <div className="mt-3 space-y-2">
              {selectedIds.map((id) => {
                const challenge = challengeSummaryCards.find((item) => item.id === id)!;
                return (
                  <div
                    key={id}
                    className="rounded-xl border border-[#1e293b] bg-[#111827] px-3 py-3"
                  >
                    <div className="font-mono-ui text-sm text-[#f1f5f9]">
                      {challenge.title}
                    </div>
                    <div className="mt-1 text-xs text-[#64748b]">{challenge.code}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        <div className="mt-6">
          <Button
            className="bg-[#7c3aed] hover:bg-[#6d28d9]"
            onClick={() => toast.success("Contest draft created.")}
          >
            Create Contest
          </Button>
        </div>
      </Card>
    </div>
  );
}
