import {
  challengeLibrary,
  challengeSummaryCards,
  mockLeaderboard,
  mockRecruiterCandidates,
  mockContestBanner,
} from "@/lib/data/mock";
import { launchContest, sampleRecruiterTests } from "@shared/seed-data";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3001/api/v1";

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

  const response = await fetch(`${API_BASE}${pathname}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  return parseJson<T>(response);
}

export const apiClient = {
  async getChallenges(filters?: Record<string, string>) {
    try {
      const search = new URLSearchParams(filters).toString();
      return await request<{ challenges: typeof challengeLibrary }>(
        `/challenges${search ? `?${search}` : ""}`,
      );
    } catch {
      return { challenges: challengeLibrary.map((challenge) => ({ ...challenge })) };
    }
  },
  async getChallenge(id: string) {
    try {
      return await request<{ challenge: (typeof challengeLibrary)[number] }>(
        `/challenges/${id}`,
      );
    } catch {
      return {
        challenge:
          challengeLibrary.find((challenge) => challenge.id === id) ??
          challengeLibrary[0],
      };
    }
  },
  async getPracticeLeaderboard() {
    try {
      return await request<{ leaderboard: typeof mockLeaderboard }>(
        "/leaderboard/practice",
      );
    } catch {
      return { leaderboard: mockLeaderboard };
    }
  },
  async getContests() {
    try {
      return await request<{ contests: typeof launchContest[] }>("/contests");
    } catch {
      return { contests: [launchContest] };
    }
  },
  async getContest(id: string) {
    try {
      return await request<{
        contest: typeof launchContest;
        challenges: typeof challengeSummaryCards;
      }>(`/contests/${id}`);
    } catch {
      return {
        contest: launchContest,
        challenges: challengeSummaryCards.filter((challenge) =>
          launchContest.challenge_ids.includes(challenge.id),
        ),
      };
    }
  },
  async getContestLeaderboard(id: string) {
    try {
      return await request<{ leaderboard: typeof mockLeaderboard }>(
        `/contests/${id}/leaderboard`,
      );
    } catch {
      return { leaderboard: mockLeaderboard.slice(0, 5) };
    }
  },
  async getRecruiterTests(token?: string | null) {
    try {
      return await request<{ tests: typeof sampleRecruiterTests }>(
        "/tests",
        { token },
      );
    } catch {
      return { tests: sampleRecruiterTests };
    }
  },
  async getRecruiterTest(id: string, token?: string | null) {
    try {
      return await request<{
        test: (typeof sampleRecruiterTests)[number];
        attempts: typeof mockRecruiterCandidates;
      }>(`/tests/${id}`, { token });
    } catch {
      return {
        test:
          sampleRecruiterTests.find((test) => test.id === id) ??
          sampleRecruiterTests[0],
        attempts: mockRecruiterCandidates,
      };
    }
  },
  async getTestByCode(code: string) {
    try {
      return await request<{
        test: (typeof sampleRecruiterTests)[number];
        challenges: typeof challengeSummaryCards;
      }>(`/tests/take/${code}`);
    } catch {
      const test =
        sampleRecruiterTests.find((item) => item.share_code === code) ??
        sampleRecruiterTests[0];
      return {
        test,
        challenges: challengeSummaryCards.filter((challenge) =>
          test.challenge_ids.includes(challenge.id),
        ),
      };
    }
  },
  async createSubmission(payload: unknown, token?: string | null) {
    return request("/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },
  async getMySubmissions(token?: string | null) {
    return request("/submissions/my", { token });
  },
  async createTest(payload: unknown, token?: string | null) {
    return request("/tests", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },
  async startTest(id: string, token?: string | null) {
    return request(`/tests/${id}/start`, { method: "POST", token });
  },
  async completeTest(
    id: string,
    payload: unknown,
    token?: string | null,
  ) {
    return request(`/tests/${id}/complete`, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },
  async getAdminStats(token?: string | null) {
    try {
      return await request<{
        stats: {
          total_users: number;
          total_submissions: number;
          active_contests: number;
        };
      }>("/admin/stats", { token });
    } catch {
      return {
        stats: {
          total_users: mockLeaderboard.length + 2,
          total_submissions: 248,
          active_contests: 1,
        },
      };
    }
  },
  async joinContest(id: string, token?: string | null) {
    return request(`/contests/${id}/join`, { method: "POST", token });
  },
  async createContest(payload: unknown, token?: string | null) {
    return request("/admin/contests", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },
  async updateContest(id: string, payload: unknown, token?: string | null) {
    return request(`/admin/contests/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    });
  },
  fallback: {
    contestBanner: mockContestBanner,
  },
};
