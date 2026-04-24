import { apiClient } from "@/lib/api";
import { ChallengeWorkbench } from "@/components/challenges/challenge-workbench";
import { EmptyState } from "@/components/common/empty-state";
import { Swords } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = await apiClient
    .getChallenge(id)
    .then((response) => response.challenge)
    .catch(() => null);

  if (!challenge) {
    return (
      <EmptyState
        icon={<Swords className="size-12" />}
        title="Challenge not found"
        description="The selected challenge could not be loaded right now."
      />
    );
  }

  return <ChallengeWorkbench challenge={challenge} />;
}
