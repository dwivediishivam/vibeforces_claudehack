import { apiClient } from "@/lib/api";
import { ChallengeWorkbench } from "@/components/challenges/challenge-workbench";
import { EmptyState } from "@/components/common/empty-state";
import { Swords } from "lucide-react";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { challenge } = await apiClient.getChallenge(id);

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
