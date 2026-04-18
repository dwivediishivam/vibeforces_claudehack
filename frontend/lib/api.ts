import type {
  ChallengeRecord,
  ContestRecord,
  LeaderboardEntry,
  RecruiterTestRecord,
} from "@shared/types";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
        "https://vibeforces-api.onrender.com/api/v1"
      : "/api/v1"
    : "http://localhost:3001/api/v1";

type SubmissionRecord = Record<string, unknown>;

type RecruiterAttemptRecord = {
  id: string;
  user_id: string;
  total_score: number | null;
  status: string;
  started_at?: string | null;
  completed_at?: string | null;
  avg_accuracy?: number | null;
  solved_count?: number;
  total_time_seconds?: number;
  profiles?: {
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

type RecruiterTestStats = {
  candidates_tested: number;
  completed_attempts: number;
  avg_score: number;
};

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function request<T>(
  pathname: string,
  init?: RequestInit & { token?: string | null },
) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (init?.token) headers.set("Authorization", `Bearer ${init.token}`);

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${pathname}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new Error(`Unable to reach the VibeForces API at ${API_BASE}.`);
  }

  return parseJson<T>(response);
}

export const apiClient = {
  getChallenges(filters?: Record<string, string>) {
    const search = new URLSearchParams(filters).toString();
    return request<{ challenges: ChallengeRecord[] }>(
      `/challenges${search ? `?${search}` : ""}`,
    );
  },
  getChallenge(id: string) {
    return request<{ challenge: ChallengeRecord }>(`/challenges/${id}`);
  },
  getPracticeLeaderboard() {
    return request<{ leaderboard: LeaderboardEntry[] }>("/leaderboard/practice");
  },
  getContests() {
    return request<{ contests: ContestRecord[] }>("/contests");
  },
  getContest(id: string) {
    return request<{
      contest: ContestRecord;
      challenges: ChallengeRecord[];
    }>(`/contests/${id}`);
  },
  getContestLeaderboard(id: string) {
    return request<{ leaderboard: LeaderboardEntry[] }>(
      `/contests/${id}/leaderboard`,
    );
  },
  getRecruiterTests(token?: string | null) {
    return request<{
      tests: RecruiterTestRecord[];
      stats: RecruiterTestStats;
    }>("/tests", { token });
  },
  getRecruiterTest(id: string, token?: string | null) {
    return request<{
      test: RecruiterTestRecord;
      attempts: RecruiterAttemptRecord[];
      challenges: ChallengeRecord[];
    }>(`/tests/${id}`, { token });
  },
  getTestByCode(code: string) {
    return request<{
      test: RecruiterTestRecord;
      challenges: ChallengeRecord[];
    }>(`/tests/take/${code}`);
  },
  createSubmission(payload: unknown, token?: string | null) {
    return request<{
      submission: SubmissionRecord;
      challenge: Record<string, unknown>;
    }>("/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },
  getMySubmissions(token?: string | null) {
    return request<{ submissions: SubmissionRecord[] }>("/submissions/my", {
      token,
    });
  },
  createTest(payload: unknown, token?: string | null) {
    return request<{ test: RecruiterTestRecord }>("/tests", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },
  startTest(id: string, token?: string | null) {
    return request<{ attempt: Record<string, unknown> }>(`/tests/${id}/start`, {
      method: "POST",
      token,
    });
  },
  completeTest(id: string, payload: unknown, token?: string | null) {
    return request<{ attempt: Record<string, unknown> }>(`/tests/${id}/complete`, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },
  getAdminStats(token?: string | null) {
    return request<{
      stats: {
        total_users: number;
        total_submissions: number;
        active_contests: number;
      };
    }>("/admin/stats", { token });
  },
  joinContest(id: string, token?: string | null) {
    return request<{ joined: boolean }>(`/contests/${id}/join`, {
      method: "POST",
      token,
    });
  },
  createContest(payload: unknown, token?: string | null) {
    return request<{ contest: ContestRecord }>("/admin/contests", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },
  updateContest(id: string, payload: unknown, token?: string | null) {
    return request<{ contest: ContestRecord }>(`/admin/contests/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    });
  },
};
