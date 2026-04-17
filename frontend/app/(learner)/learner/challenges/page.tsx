"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { challengeSummaryCards, categoryLabels } from "@/lib/data/mock";
import { DifficultyBadge } from "@/components/common/difficulty-badge";
import { RatingBadge } from "@/components/common/rating-badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ChallengesPage() {
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return challengeSummaryCards.filter((challenge) => {
      const matchesCategory =
        category === "all" || challenge.category === category;
      const matchesDifficulty =
        difficulty === "all" || challenge.difficulty === difficulty;
      const matchesSearch =
        challenge.title.toLowerCase().includes(search.toLowerCase()) ||
        challenge.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [category, difficulty, search]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[2px] text-[#64748b]">
          Challenges
        </div>
        <h1 className="mt-2 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
          30 challenges across 5 categories
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="surface-card rounded-2xl p-4">
          <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
            Category
          </div>
          <div className="mt-3 space-y-1">
            <button
              className={cn(
                "w-full rounded-xl border-l-[3px] px-3 py-2 text-left font-mono-ui text-sm",
                category === "all"
                  ? "border-[#7c3aed] bg-[#7c3aed]/10 text-[#a78bfa]"
                  : "border-transparent text-[#94a3b8] hover:bg-[#1e293b]",
              )}
              onClick={() => setCategory("all")}
            >
              All
            </button>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <button
                key={value}
                className={cn(
                  "w-full rounded-xl border-l-[3px] px-3 py-2 text-left font-mono-ui text-sm",
                  category === value
                    ? "border-[#7c3aed] bg-[#7c3aed]/10 text-[#a78bfa]"
                    : "border-transparent text-[#94a3b8] hover:bg-[#1e293b]",
                )}
                onClick={() => setCategory(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 text-xs uppercase tracking-[2px] text-[#64748b]">
            Difficulty
          </div>
          <div className="mt-3 space-y-2">
            {["all", "easy", "medium", "hard"].map((value) => (
              <button
                key={value}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-left text-sm font-mono-ui",
                  difficulty === value
                    ? "border-[#7c3aed] bg-[#7c3aed]/10 text-[#a78bfa]"
                    : "border-[#1e293b] bg-[#0a0f1e] text-[#94a3b8]",
                )}
                onClick={() => setDifficulty(value)}
              >
                {value === "all" ? "All" : value}
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search challenges..."
              className="h-12 rounded-2xl border-[#1e293b] bg-[#0a0f1e] pl-11"
            />
          </div>
          {filtered.map((challenge) => (
            <Link
              key={challenge.id}
              href={`/learner/challenges/${challenge.id}`}
              className="surface-card flex items-center justify-between rounded-2xl p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#334155]"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs font-mono-ui uppercase tracking-[2px] text-[#64748b]">
                    {categoryLabels[challenge.category]}
                  </div>
                  <DifficultyBadge difficulty={challenge.difficulty} />
                </div>
                <div>
                  <div className="font-mono-ui text-lg font-semibold text-[#f1f5f9]">
                    {challenge.title}
                  </div>
                  <div className="mt-2 text-sm text-[#94a3b8]">
                    {challenge.description}
                  </div>
                </div>
              </div>
              <div className="ml-6 flex items-center gap-3">
                <RatingBadge rating={challenge.rating} />
                <ChevronRight className="size-5 text-[#64748b]" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
