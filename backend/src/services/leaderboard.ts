import { supabaseAdmin } from "../config/supabase";

export async function getPracticeLeaderboard() {
  const { data, error } = await supabaseAdmin
    .from("practice_leaderboard")
    .select("*")
    .order("total_score", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export async function getContestLeaderboard(contestId: string) {
  const { data, error } = await supabaseAdmin
    .from("contest_participants")
    .select(
      "id, total_score, total_time_seconds, rank, user_id, profiles!contest_participants_user_id_fkey(username, display_name, avatar_url)",
    )
    .eq("contest_id", contestId)
    .order("total_score", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((entry: any, index) => ({
    rank: index + 1,
    user_id: entry.user_id,
    username: entry.profiles?.username ?? "unknown",
    display_name: entry.profiles?.display_name ?? "Unknown",
    avatar_url: entry.profiles?.avatar_url ?? null,
    total_score: entry.total_score ?? 0,
    avg_accuracy: null,
    avg_token_efficiency: null,
    avg_time_seconds: entry.total_time_seconds ?? 0,
    avg_combined_score: entry.total_score ?? 0,
    challenges_solved: null,
  }));
}
