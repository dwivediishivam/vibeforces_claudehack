"use client";

import { useParams } from "next/navigation";
import { challengeLibrary } from "@/lib/data/mock";
import { ChallengeWorkbench } from "@/components/challenges/challenge-workbench";
import { EmptyState } from "@/components/common/empty-state";
import { Swords } from "lucide-react";

export default function ChallengeDetailPage() {
  const params = useParams<{ id: string }>();
  const challenge = challengeLibrary.find((item) => item.id === params.id);

  if (!challenge) {
    return (
      <EmptyState
        icon={<Swords className="size-12" />}
        title="Challenge not found"
        description="The selected challenge could not be loaded."
      />
    );
  }

  return <ChallengeWorkbench challenge={challenge} />;
}
