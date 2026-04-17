# VibeForces — Detailed Implementation Plan

## Table of Contents

1. [Tech Stack & Architecture](#1-tech-stack--architecture)
2. [Project Structure](#2-project-structure)
3. [Database Schema (Supabase)](#3-database-schema-supabase)
4. [Authentication System](#4-authentication-system)
5. [Backend API Design](#5-backend-api-design)
6. [AI Integration Layer](#6-ai-integration-layer)
7. [Challenge System — Detailed Design](#7-challenge-system--detailed-design)
8. [All 30 Challenge Definitions](#8-all-30-challenge-definitions)
9. [Scoring & Leaderboard System](#9-scoring--leaderboard-system)
10. [Contest System](#10-contest-system)
11. [Recruiter Test System](#11-recruiter-test-system)
12. [Frontend Pages & Components](#12-frontend-pages--components)
13. [UI/UX Specifications](#13-uiux-specifications)
14. [Screenshot Generation Pipeline](#14-screenshot-generation-pipeline)
15. [Voice Note Generation](#15-voice-note-generation)
16. [Sample Data & Seed Script](#16-sample-data--seed-script)
17. [Deployment Plan](#17-deployment-plan)
18. [Environment Variables Required](#18-environment-variables-required)
19. [Implementation Order (Build Phases)](#19-implementation-order-build-phases)

---

## 1. Tech Stack & Architecture

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4
- **Fonts**: JetBrains Mono (code/headings), Inter (body text)
- **UI Components**: shadcn/ui (minimalist, customizable)
- **State Management**: React Context + Zustand for global state
- **Auth Client**: Supabase JS client (`@supabase/supabase-js`)
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **AI SDK**: OpenAI Node SDK (`openai`)
- **Screenshot Engine**: Puppeteer (for UI reproduction challenge)
- **Deployment**: Render (Web Service)

### Database & Auth
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password, with role metadata)
- **File Storage**: Supabase Storage (voice notes, UI screenshots, generated screenshots)
- **Row-Level Security**: Enabled per role

### Communication
- Frontend calls Backend API (REST)
- Backend calls Supabase (DB operations)
- Backend calls OpenAI API (GPT-4.1, GPT-5.4-mini)
- Frontend calls Supabase directly for auth and real-time leaderboard subscriptions

```
┌─────────────┐     REST API      ┌──────────────┐     OpenAI API    ┌──────────┐
│   Next.js   │ ────────────────> │  Express.js  │ ───────────────> │  OpenAI  │
│  (Vercel)   │                   │  (Render)    │                   │ GPT-4.1  │
│             │                   │              │                   │ GPT-5.4m │
└──────┬──────┘                   └──────┬───────┘                   └──────────┘
       │                                 │
       │  Supabase JS                    │  Supabase JS (service role)
       │  (auth, realtime)               │  (DB writes, storage)
       │                                 │
       └────────────┬────────────────────┘
                    │
             ┌──────▼──────┐
             │  Supabase   │
             │  (Postgres) │
             │  (Storage)  │
             │  (Auth)     │
             └─────────────┘
```

---

## 2. Project Structure

```
vibeforces/
├── frontend/                    # Next.js app (deployed to Vercel)
│   ├── app/
│   │   ├── layout.tsx           # Root layout with fonts, providers
│   │   ├── page.tsx             # Landing/home page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx           # Unified login (role selector)
│   │   │   ├── signup/page.tsx          # Unified signup (role selector)
│   │   │   └── layout.tsx               # Auth layout
│   │   ├── (learner)/
│   │   │   ├── dashboard/page.tsx       # Learner dashboard
│   │   │   ├── challenges/page.tsx      # Browse challenges
│   │   │   ├── challenges/[id]/page.tsx # Solve a challenge
│   │   │   ├── leaderboard/page.tsx     # Practice leaderboard
│   │   │   ├── contests/page.tsx        # View upcoming/past contests
│   │   │   ├── contests/[id]/page.tsx   # Contest participation
│   │   │   ├── test/[code]/page.tsx     # Take a recruiter test
│   │   │   └── layout.tsx               # Learner layout (sidebar)
│   │   ├── (recruiter)/
│   │   │   ├── dashboard/page.tsx       # Recruiter dashboard
│   │   │   ├── create-test/page.tsx     # Create a test
│   │   │   ├── tests/page.tsx           # View all tests
│   │   │   ├── tests/[id]/page.tsx      # Test results & candidates
│   │   │   └── layout.tsx               # Recruiter layout
│   │   ├── (admin)/
│   │   │   ├── dashboard/page.tsx       # Admin dashboard
│   │   │   ├── contests/page.tsx        # Manage contests
│   │   │   ├── contests/create/page.tsx # Create a contest
│   │   │   ├── contests/[id]/page.tsx   # Contest details & leaderboard
│   │   │   └── layout.tsx               # Admin layout
│   │   └── api/                         # Next.js API routes (if needed for edge)
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/              # Navbar, Sidebar, Footer
│   │   ├── challenges/          # Challenge-specific components
│   │   │   ├── VoicePlayer.tsx          # One-listen voice note player
│   │   │   ├── PromptEditor.tsx         # Prompt input with token counter
│   │   │   ├── AIResponseDisplay.tsx    # Shows AI response
│   │   │   ├── CodeDisplay.tsx          # Syntax-highlighted code block
│   │   │   ├── ScreenshotViewer.tsx     # For UI reproduction
│   │   │   ├── ArchitectureOptions.tsx  # For architecture pick (3 options)
│   │   │   └── ScoreDisplay.tsx         # Shows score breakdown
│   │   ├── leaderboard/
│   │   │   └── LeaderboardTable.tsx     # Reusable leaderboard
│   │   └── common/
│   │       ├── Timer.tsx                # Countdown timer
│   │       ├── Badge.tsx                # Difficulty badges
│   │       └── ModelBadge.tsx           # "Currently using GPT-4.1" badge
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser Supabase client
│   │   │   └── server.ts        # Server-side Supabase client
│   │   ├── api.ts               # Backend API client (fetch wrapper)
│   │   └── utils.ts             # Shared utilities
│   ├── hooks/
│   │   ├── useAuth.ts           # Auth hook
│   │   └── useChallenge.ts      # Challenge state hook
│   ├── public/
│   │   ├── voice-notes/         # (or served from Supabase Storage)
│   │   └── screenshots/         # Target UI screenshots
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── package.json
│
├── backend/                     # Express.js API (deployed to Render)
│   ├── src/
│   │   ├── index.ts             # Express app entry
│   │   ├── config/
│   │   │   ├── env.ts           # Environment variables
│   │   │   └── supabase.ts      # Supabase service-role client
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT verification middleware
│   │   │   └── rateLimit.ts     # Rate limiting
│   │   ├── routes/
│   │   │   ├── challenges.ts    # Challenge CRUD & listing
│   │   │   ├── submissions.ts   # Submit answers, get scores
│   │   │   ├── contests.ts      # Contest management
│   │   │   ├── tests.ts         # Recruiter test management
│   │   │   ├── leaderboard.ts   # Leaderboard queries
│   │   │   └── admin.ts         # Admin-only routes
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── openai.ts            # OpenAI client wrapper
│   │   │   │   ├── promptRunner.ts      # Runs learner prompts via GPT-4.1
│   │   │   │   ├── judge.ts             # Judges submissions via GPT-5.4-mini
│   │   │   │   └── prompts/             # All system prompts (templated)
│   │   │   │       ├── specToPrompt.ts
│   │   │   │       ├── tokenGolf.ts
│   │   │   │       ├── bugFix.ts
│   │   │   │       ├── uiRepro.ts
│   │   │   │       └── judge.ts
│   │   │   ├── screenshot.ts    # Puppeteer screenshot service
│   │   │   ├── scoring.ts       # Score calculation logic
│   │   │   └── leaderboard.ts   # Leaderboard computation
│   │   └── types/
│   │       └── index.ts         # Shared types
│   ├── package.json
│   └── tsconfig.json
│
├── supabase/
│   ├── migrations/              # SQL migration files
│   │   ├── 001_create_users_profile.sql
│   │   ├── 002_create_challenges.sql
│   │   ├── 003_create_submissions.sql
│   │   ├── 004_create_contests.sql
│   │   ├── 005_create_tests.sql
│   │   ├── 006_create_leaderboard_views.sql
│   │   └── 007_seed_challenges.sql
│   └── seed/
│       ├── challenges.sql       # All 30 challenges
│       ├── sample_users.sql     # Fake users for leaderboard
│       └── sample_submissions.sql # Fake submissions for leaderboard
│
├── .env                         # Environment variables (not committed)
├── .env.example                 # Template
├── IDEA.md
├── PLAN.md
└── README.md
```

---

## 3. Database Schema (Supabase)

### Table: `profiles`
Extends Supabase auth.users with app-specific data.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('learner', 'recruiter', 'admin')),
  avatar_url TEXT,
  total_score NUMERIC DEFAULT 0,
  challenges_solved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can read all profiles, update only their own
-- Admins can read/update all
```

### Table: `challenges`
```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN (
    'spec_to_prompt', 'token_golf', 'bug_fix', 'architecture_pick', 'ui_reproduction'
  )),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  rating INTEGER NOT NULL CHECK (rating >= 800 AND rating <= 2500),
  title TEXT NOT NULL,
  description TEXT NOT NULL, -- Brief description shown in listing
  
  -- Category-specific data (JSONB for flexibility)
  challenge_data JSONB NOT NULL,
  /*
    spec_to_prompt: {
      voice_note_url: string,
      supplementary_images: string[], -- for medium/hard
      prompt_mode: "single" | "plan_act",
      expected_behavior: string, -- what the output should do (for judging)
      rubric: string -- detailed scoring rubric for GPT-5.4-mini
    }
    token_golf: {
      target_description: string,
      target_output: string, -- the exact code/output to achieve
      verification_prompt: string, -- prompt for GPT-5.4-mini to check correctness
      max_tokens_allowed: number
    }
    bug_fix: {
      code: string,
      language: string,
      bug_description: string, -- hidden, used for judging
      bug_location: string, -- hidden, line numbers / function name
      expected_fix: string, -- hidden, what the fix should be
      rubric: string -- for GPT-5.4-mini
    }
    architecture_pick: {
      scenario: string,
      options: [
        { id: "A", title: string, description: string },
        { id: "B", title: string, description: string },
        { id: "C", title: string, description: string }
      ],
      correct_ranking: ["A", "B", "C"], -- best to worst
      explanations: { A: string, B: string, C: string }
    }
    ui_reproduction: {
      target_screenshot_url: string,
      target_html_css: string, -- the original code (for reference)
      description: string, -- what the UI shows
      rubric: string -- for GPT-5.4-mini visual comparison
    }
  */
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_challenges_category ON challenges(category);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);
```

### Table: `submissions`
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  challenge_id UUID NOT NULL REFERENCES challenges(id),
  context_type TEXT NOT NULL CHECK (context_type IN ('practice', 'contest', 'test')),
  context_id UUID, -- contest_id or test_id (NULL for practice)
  
  -- What the user submitted
  prompts JSONB NOT NULL, -- array of { prompt: string, token_count: number }
  
  -- AI responses
  ai_responses JSONB, -- array of { response: string, token_count: number }
  
  -- For architecture_pick: user's ranking
  user_ranking JSONB, -- ["B", "A", "C"]
  
  -- For UI reproduction: generated screenshot
  generated_screenshot_url TEXT,
  
  -- Scoring
  accuracy_score NUMERIC, -- 0-10 or 0-100 depending on category
  token_score NUMERIC, -- Lower is better, normalized
  time_taken_seconds INTEGER,
  combined_score NUMERIC, -- Weighted composite
  
  judge_feedback JSONB, -- Raw GPT-5.4-mini response
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'judging', 'completed', 'error')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_challenge ON submissions(challenge_id);
CREATE INDEX idx_submissions_context ON submissions(context_type, context_id);
```

### Table: `contests`
```sql
CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id), -- admin
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  challenge_ids UUID[] NOT NULL, -- ordered list of challenge IDs
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  share_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `contest_participants`
```sql
CREATE TABLE contest_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES contests(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  total_score NUMERIC DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  rank INTEGER,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contest_id, user_id)
);
```

### Table: `recruiter_tests`
```sql
CREATE TABLE recruiter_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  challenge_ids UUID[] NOT NULL,
  time_limit_minutes INTEGER NOT NULL DEFAULT 60,
  share_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  is_active BOOLEAN DEFAULT TRUE,
  proctoring_enabled BOOLEAN DEFAULT FALSE, -- always false for now
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `test_attempts`
```sql
CREATE TABLE test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES recruiter_tests(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  total_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'timed_out')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(test_id, user_id)
);
```

### View: `practice_leaderboard`
```sql
CREATE VIEW practice_leaderboard AS
SELECT
  p.id AS user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  COUNT(DISTINCT s.challenge_id) AS challenges_solved,
  ROUND(AVG(s.accuracy_score), 2) AS avg_accuracy,
  ROUND(AVG(s.token_score), 2) AS avg_token_efficiency,
  ROUND(AVG(s.time_taken_seconds), 0) AS avg_time_seconds,
  ROUND(AVG(s.combined_score), 2) AS avg_combined_score,
  SUM(s.combined_score) AS total_score
FROM profiles p
JOIN submissions s ON s.user_id = p.id
WHERE s.context_type = 'practice' AND s.status = 'completed'
GROUP BY p.id, p.username, p.display_name, p.avatar_url
ORDER BY total_score DESC;
```

---

## 4. Authentication System

### Supabase Auth Configuration
- **Provider**: Email/Password (primary)
- **Role stored in**: `profiles.role` column
- **Signup flow**: User selects role (Learner / Recruiter) during signup. Admin accounts created manually or via invite-only.

### Auth Flow

```
1. User visits /signup
2. Selects role: "I'm a Learner" or "I'm a Recruiter"
3. Enters email, password, username, display name
4. Supabase creates auth.users entry
5. Trigger function creates profiles entry with selected role
6. Redirect to role-specific dashboard

Login:
1. User visits /login
2. Enters email + password
3. Supabase authenticates
4. Frontend reads profiles.role
5. Redirects to appropriate dashboard (/learner/dashboard, /recruiter/dashboard, /admin/dashboard)
```

### Supabase Trigger for Profile Creation
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'display_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'learner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Row-Level Security Policies
```sql
-- Profiles: everyone can read, users update own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Submissions: users see own, admins see all
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own submissions" ON submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recruiter tests: recruiters see own
ALTER TABLE recruiter_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters see own tests" ON recruiter_tests
  FOR ALL USING (
    auth.uid() = recruiter_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## 5. Backend API Design

### Base URL
`https://vibeforces-api.onrender.com/api/v1`

### Auth Middleware
Every request includes `Authorization: Bearer <supabase_jwt>`. Backend verifies JWT using Supabase JWT secret and extracts user ID + role.

### Endpoints

#### Challenges
```
GET    /challenges                     # List all (with filters: category, difficulty)
GET    /challenges/:id                 # Get single challenge (hides answer data)
```

#### Submissions
```
POST   /submissions                    # Create submission (starts the AI pipeline)
       Body: { challenge_id, prompts: [...], context_type, context_id? }
GET    /submissions/:id                # Get submission result
GET    /submissions/my                 # Get current user's submissions
```

#### Leaderboard
```
GET    /leaderboard/practice           # Global practice leaderboard
GET    /leaderboard/contest/:id        # Contest leaderboard (public)
```

#### Contests
```
GET    /contests                       # List all contests
GET    /contests/:id                   # Get contest details
POST   /contests                       # Create contest (admin only)
POST   /contests/:id/join              # Join a contest (learner)
GET    /contests/:id/leaderboard       # Contest leaderboard
```

#### Recruiter Tests
```
POST   /tests                          # Create test (recruiter only)
GET    /tests                          # List recruiter's tests
GET    /tests/:id                      # Test details + candidate results
GET    /tests/take/:share_code         # Get test by share code (for candidates)
POST   /tests/:id/start               # Start a test attempt (learner)
POST   /tests/:id/complete            # Complete a test attempt
```

#### Admin
```
GET    /admin/stats                    # Platform statistics
POST   /admin/contests                 # Create contest
PUT    /admin/contests/:id             # Update contest
```

---

## 6. AI Integration Layer

### OpenAI Client Setup
```typescript
// backend/src/services/ai/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Model constants
export const EXECUTION_MODEL = 'gpt-4.1-2025-04-14'; // For running learner prompts
export const JUDGE_MODEL = 'gpt-5.4-mini-2026-03-17'; // For scoring

// Wrapper that tracks token usage
export async function runPrompt(params: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: 'text' | 'json_object';
  maxTokens?: number;
}): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
  const response = await openai.chat.completions.create({
    model: params.model,
    messages: [
      { role: 'system', content: params.systemPrompt },
      { role: 'user', content: params.userPrompt }
    ],
    response_format: params.responseFormat === 'json_object'
      ? { type: 'json_object' }
      : undefined,
    max_tokens: params.maxTokens || 4096,
  });
  
  return {
    content: response.choices[0].message.content || '',
    inputTokens: response.usage?.prompt_tokens || 0,
    outputTokens: response.usage?.completion_tokens || 0,
  };
}
```

### Prompt Runner (GPT-4.1)
Runs the learner's prompts and returns AI output.

```typescript
// backend/src/services/ai/promptRunner.ts

export async function executeSpecToPrompt(params: {
  challengeData: SpecToPromptData;
  userPrompts: string[]; // 1 for single, 2 for plan+act
}): Promise<{ responses: AIResponse[]; totalTokens: number }> {
  const systemPrompt = `You are an AI assistant helping with a coding task.
You MUST respond in the following JSON format:
{
  "code": "the complete code solution",
  "explanation": "brief explanation of what you did"
}
Do not include anything outside this JSON.`;

  if (params.challengeData.prompt_mode === 'single') {
    const result = await runPrompt({
      model: EXECUTION_MODEL,
      systemPrompt,
      userPrompt: params.userPrompts[0],
      responseFormat: 'json_object',
    });
    return {
      responses: [{ content: result.content, tokens: result.outputTokens }],
      totalTokens: result.inputTokens + result.outputTokens,
    };
  }

  // Plan + Act mode
  const planResult = await runPrompt({
    model: EXECUTION_MODEL,
    systemPrompt: `You are an AI assistant. The user will give you a planning prompt.
Respond with a detailed plan in JSON format:
{
  "plan": "your detailed step-by-step plan",
  "approach": "high-level approach description"
}`,
    userPrompt: params.userPrompts[0],
    responseFormat: 'json_object',
  });

  const actResult = await runPrompt({
    model: EXECUTION_MODEL,
    systemPrompt: `You are an AI assistant. You previously created this plan:
${planResult.content}
Now execute based on the user's action prompt.
Respond in JSON format:
{
  "code": "the complete code solution",
  "explanation": "brief explanation"
}`,
    userPrompt: params.userPrompts[1],
    responseFormat: 'json_object',
  });

  return {
    responses: [
      { content: planResult.content, tokens: planResult.outputTokens },
      { content: actResult.content, tokens: actResult.outputTokens },
    ],
    totalTokens: planResult.inputTokens + planResult.outputTokens +
                 actResult.inputTokens + actResult.outputTokens,
  };
}
```

### Judge (GPT-5.4-mini)
Scores submissions. Every judge call returns structured JSON.

```typescript
// backend/src/services/ai/judge.ts

// ---- SPEC-TO-PROMPT JUDGING ----
export async function judgeSpecToPrompt(params: {
  expectedBehavior: string;
  rubric: string;
  userPrompts: string[];
  aiOutputs: string[];
}): Promise<JudgeResult> {
  const result = await runPrompt({
    model: JUDGE_MODEL,
    systemPrompt: `You are a judge evaluating a vibe coder's prompt-writing ability.
You will receive:
1. What the output SHOULD do (expected behavior)
2. A scoring rubric
3. The user's prompts
4. The AI's outputs from those prompts

Score the submission and respond in this EXACT JSON format:
{
  "accuracy_score": <number 0-10>,
  "prompt_clarity_score": <number 0-10>,
  "completeness_score": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<2-3 sentences of feedback>",
  "breakdown": {
    "what_worked": "<brief>",
    "what_could_improve": "<brief>"
  }
}

Be strict but fair. A score of 10 means the prompt was perfectly clear, 
the output fully matches the expected behavior, and nothing is missing.
A score of 0 means the prompt was completely unclear or the output is wrong.`,
    userPrompt: `## Expected Behavior
${params.expectedBehavior}

## Rubric
${params.rubric}

## User's Prompts
${params.userPrompts.map((p, i) => `Prompt ${i + 1}: ${p}`).join('\n')}

## AI Outputs
${params.aiOutputs.map((o, i) => `Output ${i + 1}: ${o}`).join('\n')}`,
    responseFormat: 'json_object',
  });

  return JSON.parse(result.content);
}

// ---- TOKEN GOLF JUDGING ----
export async function judgeTokenGolf(params: {
  targetOutput: string;
  actualOutput: string;
  verificationPrompt: string;
}): Promise<{ correctness_percentage: number; feedback: string }> {
  const result = await runPrompt({
    model: JUDGE_MODEL,
    systemPrompt: `You are verifying if an AI-generated output matches a target.
${params.verificationPrompt}

Respond in this EXACT JSON format:
{
  "correctness_percentage": <number 0-100>,
  "is_correct": <boolean>,
  "differences": "<brief description of any differences>",
  "feedback": "<1-2 sentences>"
}`,
    userPrompt: `## Target Output
${params.targetOutput}

## Actual Output
${params.actualOutput}`,
    responseFormat: 'json_object',
  });

  return JSON.parse(result.content);
}

// ---- BUG FIX JUDGING ----
export async function judgeBugFix(params: {
  actualBug: string;
  bugLocation: string;
  expectedFix: string;
  userPrompt: string;
}): Promise<JudgeResult> {
  const result = await runPrompt({
    model: JUDGE_MODEL,
    systemPrompt: `You are judging how well a vibe coder identified a bug in code.
The key skill: did they PRECISELY identify the bug, or did they just say "fix this"?

You will receive:
1. The actual bug and its location
2. The expected fix
3. The user's prompt to the AI

Score and respond in this EXACT JSON format:
{
  "precision_score": <number 0-10>,
  "identification_accuracy": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<2-3 sentences>",
  "user_identified_location": <boolean>,
  "user_identified_cause": <boolean>,
  "user_described_fix_direction": <boolean>
}

Scoring guide:
- "fix this" or "fix the code" = 0-1 points
- "there's a bug in the sorting function" = 3-4 points
- "the comparison on line X should be <= not <" = 8-10 points`,
    userPrompt: `## Actual Bug
${params.actualBug}

## Bug Location
${params.bugLocation}

## Expected Fix
${params.expectedFix}

## User's Prompt to AI
${params.userPrompt}`,
    responseFormat: 'json_object',
  });

  return JSON.parse(result.content);
}

// ---- UI REPRODUCTION JUDGING ----
export async function judgeUIReproduction(params: {
  targetScreenshotBase64: string;
  generatedScreenshotBase64: string;
  rubric: string;
}): Promise<JudgeResult> {
  const response = await openai.chat.completions.create({
    model: JUDGE_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are judging visual similarity between two UI screenshots.
Compare the target (first image) with the reproduction (second image).

Respond in this EXACT JSON format:
{
  "visual_similarity_percentage": <number 0-100>,
  "layout_match": <number 0-10>,
  "color_match": <number 0-10>,
  "typography_match": <number 0-10>,
  "component_match": <number 0-10>,
  "overall_score": <number 0-10>,
  "feedback": "<2-3 sentences describing differences>"
}

${params.rubric}`
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Target UI (to reproduce):' },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${params.targetScreenshotBase64}` } },
          { type: 'text', text: 'Generated reproduction:' },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${params.generatedScreenshotBase64}` } },
        ]
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1024,
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}
```

---

## 7. Challenge System — Detailed Design

### Submission Pipeline (Per Category)

#### Spec-to-Prompt Pipeline
```
1. User listens to voice note (one-time play enforced by frontend)
2. User writes prompt(s) in the editor
   - Easy: 1 prompt
   - Medium/Hard: Prompt 1 (Plan), see AI response, then Prompt 2 (Act)
3. Frontend sends prompts to backend POST /submissions
4. Backend runs prompts through GPT-4.1 (promptRunner)
5. Backend sends prompts + outputs to GPT-5.4-mini (judge)
6. Judge returns JSON score
7. Backend saves submission with scores
8. Frontend displays score breakdown
```

#### Token Golf Pipeline
```
1. User sees the target output they need to achieve
2. User writes a prompt (token counter visible)
3. Frontend sends prompt to backend
4. Backend runs through GPT-4.1
5. Backend sends target + actual to GPT-5.4-mini for correctness check
6. Backend records: correctness%, token count, time taken
7. Frontend displays results + leaderboard position
```

#### Bug Fix Pipeline
```
1. User sees broken code
2. User writes a prompt describing the fix (NOT running it through AI here —
   the prompt itself is what's judged)
3. Backend sends: actual bug info + user's prompt to GPT-5.4-mini
4. GPT-5.4-mini scores how precisely the user identified the issue
5. Score saved and displayed
```

#### Architecture Pick Pipeline
```
1. User sees scenario + 3 options
2. User ranks options 1st, 2nd, 3rd (drag-and-drop or numbered selection)
3. Frontend sends ranking to backend
4. Backend compares with correct ranking:
   - Exact match: 10/10
   - First correct, other two swapped: 6/10
   - First wrong: scaled down significantly
5. No AI call needed — deterministic scoring
```

#### UI Reproduction Pipeline
```
1. User sees target screenshot
2. User writes ONE prompt
3. Backend sends prompt to GPT-4.1 with system prompt:
   "Generate a single HTML file with inline CSS that reproduces the UI described.
    Respond with ONLY the HTML code, no explanation."
4. Backend uses Puppeteer to render the HTML and take a screenshot
5. Backend sends both screenshots (base64) to GPT-5.4-mini
6. GPT-5.4-mini returns visual similarity score
7. Combined with token efficiency for final score
```

### Voice Note Player Component
```
- Audio plays only ONCE (enforced in frontend state)
- No scrubbing, no rewind, no pause-and-resume (for easy)
- For medium/hard: allow one replay (configurable per challenge)
- Timer starts when voice note starts playing
- Visual: waveform animation during playback
- After playback: "Voice note played. You may not replay." message
```

### Prompt Editor Component
```
- Monaco Editor or CodeMirror instance
- Real-time token counter (using tiktoken-js for GPT-4 tokenizer approximation)
- Character counter
- "Submit" button with confirmation
- For Plan+Act: two editor tabs, second unlocks after first submission
- "Currently using GPT-4.1" badge in top-right corner
```

---

## 8. All 30 Challenge Definitions

### Category 1: Spec-to-Prompt (6 Questions)

#### SP-E1 (Easy, Rating: 900)
**Title**: "FizzBuzz with a Twist"
**Voice Note Script**: "Hey, I need you to write a program. It should print numbers from 1 to 100. But here's the twist — for multiples of 3, print 'Vibe' instead of the number. For multiples of 5, print 'Code' instead. And for multiples of both 3 and 5, print 'VibeCode'. Output it as a Python function that returns a list of strings."
**Supplementary**: None
**Prompt Mode**: Single
**Expected Behavior**: A Python function returning a list of 100 strings with correct FizzBuzz-style substitutions using "Vibe", "Code", "VibeCode".
**Rubric**: "Check that the prompt clearly specifies: (1) the range 1-100, (2) the three substitution rules with correct words, (3) Python function returning list of strings. Deduct for ambiguity, missing rules, or wrong output format."

#### SP-E2 (Easy, Rating: 1000)
**Title**: "CSV Data Summarizer"
**Voice Note Script**: "I have a CSV file with three columns: name, department, and salary. I need a Python script that reads this CSV file, calculates the average salary per department, and prints the results sorted by average salary from highest to lowest. The file is called employees.csv."
**Supplementary**: None
**Prompt Mode**: Single
**Expected Behavior**: Python script that reads employees.csv, groups by department, calculates avg salary per dept, sorts descending, prints results.
**Rubric**: "Check prompt specifies: (1) CSV reading with correct filename, (2) grouping by department, (3) average calculation, (4) descending sort, (5) output format. Full marks if all 5 elements are clearly communicated."

#### SP-M1 (Medium, Rating: 1300)
**Title**: "REST API Endpoint Design"
**Voice Note Script**: "Alright, so I need you to help me build a REST API endpoint using Express.js and Node. The endpoint should handle a todo list. I need CRUD operations — create, read, update, delete. Each todo has an id, a title, a description, a status which can be pending, in-progress, or done, and a created_at timestamp. Use an in-memory array for storage, no database needed. But here's the important part — I need input validation. Title is required and must be between 3 and 100 characters. Status must be one of the three valid values. Return proper HTTP status codes. And add a GET endpoint that supports filtering by status as a query parameter."
**Supplementary**: A table showing the expected endpoints:
| Method | Path | Description |
|--------|------|-------------|
| GET | /todos | List all (filter by ?status=) |
| GET | /todos/:id | Get one |
| POST | /todos | Create |
| PUT | /todos/:id | Update |
| DELETE | /todos/:id | Delete |
**Prompt Mode**: Plan + Act
**Expected Behavior**: Working Express.js CRUD API with validation, proper status codes, status filtering.
**Rubric**: "Plan should outline the structure, validation approach, and error handling. Act prompt should produce working, well-structured code. Judge: (1) All 5 endpoints present and correct, (2) Validation works, (3) Status codes correct (201, 200, 404, 400), (4) Filter by status works."

#### SP-M2 (Medium, Rating: 1400)
**Title**: "Markdown to HTML Converter"
**Voice Note Script**: "I need a JavaScript function that converts a subset of Markdown to HTML. It should handle these elements: headings — H1 through H3, so lines starting with one, two, or three hash symbols. Bold text wrapped in double asterisks. Italic text wrapped in single asterisks. Unordered lists where lines start with a dash. And code blocks wrapped in triple backticks. It should be a single function that takes a Markdown string and returns an HTML string. Don't use any external libraries."
**Supplementary**: Example input/output pair showing each element
**Prompt Mode**: Plan + Act
**Expected Behavior**: Pure JS function converting markdown (h1-h3, bold, italic, unordered lists, code blocks) to HTML.
**Rubric**: "Plan should identify the parsing approach (regex vs. line-by-line). Act should produce correct conversions for all 5 elements. Test each element type. Deduct for missing elements or broken edge cases (nested bold/italic)."

#### SP-H1 (Hard, Rating: 1700)
**Title**: "Real-time Chat Server"
**Voice Note Script**: "I need a real-time chat application backend using Node.js and Socket.io. Requirements: Users can join named rooms. When a user joins, everyone in that room gets a notification saying who joined. Messages sent in a room are broadcast to all other users in that room, not to the sender. Each message should have a timestamp, the sender's username, and the message text. Users can be in only one room at a time — joining a new room should leave the old one. Add a slash-command: when a user types /users, they should see a list of all users currently in their room. The server should also maintain a history of the last 50 messages per room, and when a new user joins, they should receive this history. Oh and usernames must be unique across the server — reject duplicates."
**Supplementary**: Architecture diagram showing client-server-room relationship
**Prompt Mode**: Plan + Act
**Expected Behavior**: Working Socket.io server with rooms, broadcasts, /users command, message history (last 50), unique usernames.
**Rubric**: "Plan should address: room management, message broadcasting, history storage, unique username enforcement. Score each feature: room join/leave (2pts), broadcast to others not sender (1pt), timestamps+metadata (1pt), /users command (2pts), 50-message history (2pts), unique usernames (2pts)."

#### SP-H2 (Hard, Rating: 1800)
**Title**: "Task Scheduler with Dependencies"
**Voice Note Script**: "Build me a task scheduling system in Python. Each task has an ID, a name, a duration in seconds, and a list of dependency task IDs — meaning those tasks must complete before this one can start. The scheduler should figure out the correct execution order using topological sorting. It should detect circular dependencies and throw an error if found. Then it should simulate execution: tasks that have no pending dependencies should run in parallel, simulated with asyncio. Print when each task starts and finishes, with timestamps. Finally, calculate and print the total time to complete all tasks and the critical path — that's the longest chain of dependent tasks."
**Supplementary**: A diagram of an example task graph with 6 tasks and their dependencies, plus the expected critical path highlighted
**Prompt Mode**: Plan + Act
**Expected Behavior**: Python asyncio scheduler with topological sort, cycle detection, parallel execution simulation, critical path calculation.
**Rubric**: "Plan must identify: topological sort algorithm, cycle detection method, parallel execution approach, critical path algorithm. Implementation: topo sort correct (2pts), cycle detection (2pts), parallel simulation with asyncio (2pts), timing output (1pt), critical path calculation (2pts), clean error handling (1pt)."

---

### Category 2: Token Golf (6 Questions)

#### TG-E1 (Easy, Rating: 850)
**Title**: "Reverse a String"
**Target Description**: "Write a Python function called `reverse_string` that takes a string and returns it reversed. Do not use slicing or the built-in `reversed()` function."
**Target Output**:
```python
def reverse_string(s):
    result = ""
    for char in s:
        result = char + result
    return result
```
**Verification Prompt**: "Check if the output is a Python function named reverse_string that reverses a string WITHOUT using slicing ([::-1]) or the reversed() built-in. It must use an iterative approach. Functionally equivalent solutions are acceptable."
**Max Tokens**: 200

#### TG-E2 (Easy, Rating: 950)
**Title**: "Palindrome Checker"
**Target Description**: "Write a JavaScript function `isPalindrome` that checks if a given string is a palindrome, ignoring case and non-alphanumeric characters."
**Target Output**:
```javascript
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}
```
**Verification Prompt**: "Check if the output is a JS function named isPalindrome that correctly checks palindromes while ignoring case and non-alphanumeric characters. The approach may differ but must be functionally equivalent."
**Max Tokens**: 250

#### TG-M1 (Medium, Rating: 1250)
**Title**: "Binary Search Tree Insert & Search"
**Target Description**: "Write a Python class `BST` with methods `insert(value)` and `search(value)` implementing a binary search tree. Include a `Node` class with `left`, `right`, and `value` attributes."
**Target Output**:
```python
class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, value):
        if not self.root:
            self.root = Node(value)
        else:
            self._insert(self.root, value)

    def _insert(self, node, value):
        if value < node.value:
            if node.left is None:
                node.left = Node(value)
            else:
                self._insert(node.left, value)
        else:
            if node.right is None:
                node.right = Node(value)
            else:
                self._insert(node.right, value)

    def search(self, value):
        return self._search(self.root, value)

    def _search(self, node, value):
        if node is None:
            return False
        if value == node.value:
            return True
        elif value < node.value:
            return self._search(node.left, value)
        else:
            return self._search(node.right, value)
```
**Verification Prompt**: "Verify this is a BST implementation with Node class (value, left, right) and BST class with insert() and search() methods. Insert must maintain BST property. Search must return boolean. Functionally equivalent implementations are acceptable."
**Max Tokens**: 500

#### TG-M2 (Medium, Rating: 1350)
**Title**: "Debounce Function"
**Target Description**: "Write a JavaScript `debounce` function that takes a function and a delay in ms, returns a debounced version. The debounced function should reset its timer on each call and only execute after the delay has passed since the last call. Include a `cancel()` method on the returned function."
**Target Output**:
```javascript
function debounce(fn, delay) {
  let timeoutId;
  
  function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  }
  
  debounced.cancel = function() {
    clearTimeout(timeoutId);
  };
  
  return debounced;
}
```
**Verification Prompt**: "Verify this is a debounce implementation that: (1) takes a function and delay, (2) returns a debounced function, (3) resets timer on each call, (4) preserves `this` context and arguments, (5) has a cancel() method. Functionally equivalent solutions acceptable."
**Max Tokens**: 400

#### TG-H1 (Hard, Rating: 1650)
**Title**: "LRU Cache"
**Target Description**: "Implement an LRU (Least Recently Used) Cache in Python with O(1) get and put operations. The class `LRUCache` takes a capacity in its constructor. `get(key)` returns the value or -1 if not found. `put(key, value)` inserts or updates. When capacity is exceeded, evict the least recently used item. Use a doubly linked list + hash map approach."
**Target Output**:
```python
class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._add_to_front(node)
            return node.value
        return -1

    def put(self, key, value):
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self.cache[key] = node
        self._add_to_front(node)
        if len(self.cache) > self.capacity:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]
```
**Verification Prompt**: "Verify this is an LRU Cache with: (1) O(1) get and put using doubly linked list + hash map, (2) correct eviction of least recently used, (3) get returns -1 on miss, (4) put updates existing keys, (5) respects capacity. Functionally equivalent implementations acceptable."
**Max Tokens**: 700

#### TG-H2 (Hard, Rating: 1750)
**Title**: "Event Emitter"
**Target Description**: "Implement a JavaScript EventEmitter class with: `on(event, callback)` - register a listener. `off(event, callback)` - remove a specific listener. `emit(event, ...args)` - call all listeners for that event with args. `once(event, callback)` - register a listener that fires only once then removes itself. All methods should be chainable (return `this`)."
**Target Output**:
```javascript
class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return this;
  }

  off(event, callback) {
    if (!this.listeners[event]) return this;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    return this;
  }

  emit(event, ...args) {
    if (!this.listeners[event]) return this;
    this.listeners[event].forEach(cb => cb.apply(this, args));
    return this;
  }

  once(event, callback) {
    const wrapper = (...args) => {
      callback.apply(this, args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }
}
```
**Verification Prompt**: "Verify this is an EventEmitter with: (1) on() registers listeners, (2) off() removes specific listener, (3) emit() calls all listeners with args, (4) once() fires once then removes itself, (5) all methods are chainable (return this). Functionally equivalent implementations acceptable."
**Max Tokens**: 600

---

### Category 3: Bug Fix (6 Questions)

#### BF-E1 (Easy, Rating: 900)
**Title**: "Off-by-One Binary Search"
**Code** (Python):
```python
def binary_search(arr, target):
    left = 0
    right = len(arr)  # BUG: should be len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```
**Bug Description**: `right` is initialized to `len(arr)` instead of `len(arr) - 1`, causing potential IndexError on the last element check.
**Bug Location**: Line 3
**Expected Fix**: Change `right = len(arr)` to `right = len(arr) - 1`

#### BF-E2 (Easy, Rating: 1000)
**Title**: "Broken Fibonacci"
**Code** (JavaScript):
```javascript
function fibonacci(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  
  let prev = 0, curr = 1;
  for (let i = 2; i < n; i++) {  // BUG: should be i <= n
    let temp = curr;
    curr = prev + curr;
    prev = temp;
  }
  return curr;
}
```
**Bug Description**: Loop condition `i < n` should be `i <= n`. For `fibonacci(5)`, it only iterates 3 times instead of 4, returning the wrong value.
**Bug Location**: Line 5 — the for loop condition
**Expected Fix**: Change `i < n` to `i <= n`

#### BF-M1 (Medium, Rating: 1300)
**Title**: "Async Race Condition"
**Code** (JavaScript):
```javascript
class UserCache {
  constructor() {
    this.cache = {};
  }

  async getUser(id) {
    if (this.cache[id]) {
      return this.cache[id];
    }

    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    this.cache[id] = user;
    return user;
  }

  async getUsers(ids) {
    const results = [];
    for (const id of ids) {
      results.push(this.getUser(id));  // BUG: not awaited, pushes promises
    }
    return results;  // Returns array of promises, not users
  }
}
```
**Bug Description**: In `getUsers`, `this.getUser(id)` returns a Promise but it's pushed directly to results without being awaited. The method returns an array of Promises instead of resolved user objects.
**Bug Location**: Lines 18-20 — the getUsers method body
**Expected Fix**: Either `await` each call or use `Promise.all()`: `return Promise.all(ids.map(id => this.getUser(id)));`

#### BF-M2 (Medium, Rating: 1400)
**Title**: "React State Mutation"
**Code** (JavaScript/React):
```javascript
import { useState } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    todos.push({ id: Date.now(), text: input, done: false });  // BUG: mutating state directly
    setTodos(todos);  // BUG: same reference, React won't re-render
    setInput('');
  };

  const toggleTodo = (id) => {
    const todo = todos.find(t => t.id === id);
    todo.done = !todo.done;  // BUG: mutating state directly
    setTodos(todos);  // BUG: same reference
  };

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} onClick={() => toggleTodo(todo.id)}
              style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```
**Bug Description**: State is mutated directly with `todos.push()` and `todo.done = !todo.done`. Then `setTodos(todos)` passes the same array reference, so React doesn't detect a change and won't re-render.
**Bug Location**: Lines 9-10 (addTodo) and Lines 16-17 (toggleTodo)
**Expected Fix**: Create new arrays/objects: `setTodos([...todos, { id: Date.now(), text: input, done: false }])` and `setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))`

#### BF-H1 (Hard, Rating: 1700)
**Title**: "Memory Leak in Event Listener"
**Code** (JavaScript):
```javascript
class DataStream {
  constructor(url) {
    this.url = url;
    this.listeners = new Set();
    this.buffer = [];
    this.maxBuffer = 1000;
    this.connection = null;
  }

  connect() {
    this.connection = new EventSource(this.url);
    
    this.connection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.buffer.push(data);
      
      // Trim buffer
      if (this.buffer.length > this.maxBuffer) {
        this.buffer = this.buffer.slice(-this.maxBuffer);
      }
      
      // Notify all listeners
      this.listeners.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error('Listener error:', err);
          // BUG: doesn't remove the failing listener, but that's minor
        }
      });
    };

    this.connection.onerror = (err) => {
      console.error('Connection error, reconnecting...');
      this.connection.close();
      setTimeout(() => this.connect(), 5000);  // BUG: recursive reconnect without cleanup
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);  // Returns unsubscribe function
  }

  disconnect() {
    if (this.connection) {
      this.connection.close();
      // BUG: doesn't clear listeners or buffer
      // BUG: doesn't prevent reconnect timeout from firing
    }
  }
}
```
**Bug Description**: Multiple bugs: (1) On error, `connect()` is called recursively via setTimeout, but the old event handlers aren't cleaned up, creating duplicate connections if errors repeat. (2) `disconnect()` doesn't cancel pending reconnection timeouts, so the stream reconnects even after explicit disconnect. (3) `disconnect()` doesn't clear the listener set or buffer, leaking memory.
**Bug Location**: Lines 33-36 (reconnect without tracking timeout), Lines 43-47 (incomplete disconnect)
**Expected Fix**: Store the timeout ID (`this.reconnectTimer = setTimeout(...)`), clear it in disconnect. Close existing connection before reconnecting. In disconnect: clear listeners, buffer, cancel reconnect timer.

#### BF-H2 (Hard, Rating: 1800)
**Title**: "Deadlock in Promise Chain"
**Code** (JavaScript):
```javascript
class ResourcePool {
  constructor(size) {
    this.available = Array.from({ length: size }, (_, i) => i);
    this.waiting = [];
  }

  async acquire() {
    if (this.available.length > 0) {
      return this.available.pop();
    }
    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  release(resource) {
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift();
      resolve(resource);
    } else {
      this.available.push(resource);
    }
  }
}

// Usage that causes deadlock
async function processItems(pool, items) {
  const results = await Promise.all(
    items.map(async (item) => {
      const resource1 = await pool.acquire();
      const resource2 = await pool.acquire();  // BUG: deadlock when items > pool size
      
      try {
        const result = await doWork(resource1, resource2, item);
        return result;
      } finally {
        pool.release(resource1);
        pool.release(resource2);
      }
    })
  );
  return results;
}
```
**Bug Description**: When `items.length > pool.size / 2`, all resources can be acquired as `resource1` by concurrent tasks in `Promise.all`, leaving none for `resource2`. Every task holds one resource and waits for another — classic deadlock. Each task acquires 2 resources, but concurrent tasks can exhaust the pool between their first and second acquire.
**Bug Location**: Lines 29-40 — the processItems function acquiring two resources per item concurrently via Promise.all
**Expected Fix**: Either (1) acquire both resources atomically (add `acquireMultiple(n)` to the pool), or (2) limit concurrency so no more than `pool.size / 2` items process at once, or (3) use a semaphore to gate the number of concurrent tasks.

---

### Category 4: Architecture Pick (6 Questions)

#### AP-E1 (Easy, Rating: 850)
**Title**: "Database for a Blog"
**Scenario**: "You're building a personal blog with posts, categories, and comments. Expected traffic is ~100 daily visitors. You need to decide on a database."
**Options**:
- **A**: PostgreSQL with a managed service (Supabase/Neon) — relational data, good for structured content, well-supported ORMs
- **B**: MongoDB Atlas — flexible schema, good for content that varies in structure, easy to get started
- **C**: Redis — blazing fast reads, in-memory, great for caching and sessions
**Correct Ranking**: A, B, C
**Explanations**:
- A (Best): Blog data is inherently relational (posts -> categories, posts -> comments). PostgreSQL handles this perfectly with JOINs, and managed services make it simple.
- B (Acceptable): MongoDB works for content but you lose relational integrity. For a blog, the schema is actually quite structured, so the flexibility isn't needed.
- C (Wrong): Redis is not a primary database — it's an in-memory cache. You'd lose data on restart unless configured for persistence, and it lacks the query capabilities needed.

#### AP-E2 (Easy, Rating: 1000)
**Title**: "Frontend Framework for a Landing Page"
**Scenario**: "A startup needs a marketing landing page with animations, a contact form, and SEO optimization. It needs to be fast to build and fast to load."
**Options**:
- **A**: Next.js with static export — React-based, SSG for SEO, good ecosystem
- **B**: Plain HTML/CSS/JS with a form service (Formspree) — minimal dependencies, fastest load time
- **C**: Angular with SSR — full framework, TypeScript by default, enterprise-ready
**Correct Ranking**: B, A, C
**Explanations**:
- B (Best): A landing page doesn't need a framework. Plain HTML/CSS loads fastest, is simplest to build, and a form service handles the only interactive part.
- A (Acceptable): Works well and gives React ecosystem benefits, but it's over-engineered for a landing page. More build complexity than needed.
- C (Wrong): Angular is heavy, slow to set up, and complete overkill for a landing page. The enterprise features add no value here.

#### AP-M1 (Medium, Rating: 1250)
**Title**: "Real-time Feature Architecture"
**Scenario**: "Your team is adding real-time notifications to an existing Express.js REST API. Users should see notifications instantly without refreshing. The backend already uses PostgreSQL. You have 2 weeks."
**Options**:
- **A**: Add Socket.io to the existing Express server — shares the same process, easy to add alongside REST endpoints
- **B**: Build a separate microservice for real-time using Go + WebSockets, with Redis pub/sub to communicate with the main API
- **C**: Use Supabase Realtime on top of your PostgreSQL — listen to database changes and push to clients via built-in WebSocket channels
**Correct Ranking**: A, C, B
**Explanations**:
- A (Best): Socket.io integrates directly into Express. Minimal new infrastructure. Can share auth middleware. 2-week timeline makes this the pragmatic choice.
- C (Acceptable): Supabase Realtime is clever but adds a dependency and may not fit existing infra. Works if you're already on Supabase, but adds complexity otherwise.
- B (Wrong): A separate Go microservice is massively over-engineered for this scope. Redis pub/sub adds infrastructure overhead. Impossible in 2 weeks alongside the main work.

#### AP-M2 (Medium, Rating: 1400)
**Title**: "Auth Strategy for a Multi-Tenant SaaS"
**Scenario**: "You're building a B2B SaaS where each company (tenant) has its own users, data, and billing. You need authentication and authorization. Some tenants will want SSO via their corporate identity provider."
**Options**:
- **A**: Auth0 / Clerk — managed auth with built-in multi-tenancy, SSO support, and RBAC out of the box
- **B**: Roll your own with JWT + bcrypt + a `tenants` table — full control, no vendor lock-in, add SSO later with passport.js
- **C**: Firebase Auth with custom claims for tenant_id — free tier is generous, Google-backed, well-documented
**Correct Ranking**: A, C, B
**Explanations**:
- A (Best): Multi-tenant auth is genuinely complex (tenant isolation, SSO/SAML, RBAC, audit logs). Managed services handle this correctly out of the box. Worth the cost for B2B.
- C (Acceptable): Firebase Auth works and custom claims can model tenancy, but SSO support is limited without Identity Platform upgrade. Adequate for starting out.
- B (Wrong): Rolling your own multi-tenant auth with SSO support is a massive undertaking. Security vulnerabilities, maintenance burden, and SSO (SAML/OIDC) is notoriously tricky to implement correctly.

#### AP-H1 (Hard, Rating: 1650)
**Title**: "Scaling a File Processing Pipeline"
**Scenario**: "Your app lets users upload PDFs (up to 50MB) which are OCR'd, parsed, and indexed for search. Currently it processes ~100 files/day synchronously in the API request. You're growing to 10,000 files/day and the synchronous approach is causing timeouts and memory issues."
**Options**:
- **A**: Move to a queue-based architecture: API accepts upload → stores in S3 → pushes job to SQS/BullMQ → worker processes asynchronously → updates status in DB → notifies user via WebSocket
- **B**: Scale the API horizontally with more instances behind a load balancer, increase request timeout to 5 minutes, and add more RAM per instance
- **C**: Use AWS Lambda triggered by S3 upload events — serverless, auto-scales, pay-per-use, no servers to manage
**Correct Ranking**: A, C, B
**Explanations**:
- A (Best): Queue-based is the textbook solution for this. Decouples upload from processing, handles retries/failures gracefully, gives progress tracking, scales workers independently.
- C (Acceptable): Lambda + S3 triggers works well and auto-scales, but 50MB PDFs with OCR may hit Lambda's 15-min timeout and memory limits. Also harder to debug and monitor. Good for simpler processing.
- B (Wrong): Horizontal scaling with longer timeouts doesn't fix the fundamental problem — synchronous processing of heavy files in request handlers. You'll still hit memory limits and users still wait.

#### AP-H2 (Hard, Rating: 1800)
**Title**: "State Management for a Collaborative Editor"
**Scenario**: "You're building a collaborative document editor (like Google Docs lite). Multiple users edit simultaneously, see each other's cursors, and changes merge without conflicts. The editor handles rich text (bold, italic, headings, lists)."
**Options**:
- **A**: Use CRDTs (Conflict-free Replicated Data Types) via Yjs library — peer-aware, handles concurrent edits mathematically, works with existing editors like TipTap/ProseMirror
- **B**: Operational Transformation (OT) via ShareDB — the original Google Docs approach, server-authoritative, well-proven at scale
- **C**: Simple last-write-wins with polling — store document in DB, poll every 2 seconds, latest write wins, show other users' cursors from polling data
**Correct Ranking**: A, B, C
**Explanations**:
- A (Best): Yjs + TipTap/ProseMirror is the modern standard for this. CRDTs handle conflicts mathematically without a central server, can work offline, and have excellent library support in 2026.
- B (Acceptable): OT works (Google Docs proved it) but is harder to implement correctly, requires a central server for transformation, and has more edge cases. ShareDB helps but is less actively maintained than Yjs.
- C (Wrong): Last-write-wins destroys concurrent edits. 2-second polling creates visible lag. This approach fundamentally cannot support real-time collaboration without data loss.

---

### Category 5: UI Reproduction (6 Questions)

#### UR-E1 (Easy, Rating: 900)
**Title**: "Pricing Card"
**Target HTML/CSS**:
```html
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .card { background: white; border-radius: 16px; padding: 40px; width: 320px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
  .card .plan { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 8px; }
  .card .price { font-size: 48px; font-weight: 700; color: #111; margin-bottom: 4px; }
  .card .price span { font-size: 18px; color: #888; font-weight: 400; }
  .card .period { font-size: 14px; color: #888; margin-bottom: 24px; }
  .card ul { list-style: none; text-align: left; margin-bottom: 32px; }
  .card ul li { padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444; }
  .card ul li::before { content: "✓"; color: #22c55e; margin-right: 8px; font-weight: bold; }
  .card button { width: 100%; padding: 14px; background: #111; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600; }
  .card button:hover { background: #333; }
</style>
</head>
<body>
  <div class="card">
    <div class="plan">Pro Plan</div>
    <div class="price">$29<span>/mo</span></div>
    <div class="period">Billed monthly</div>
    <ul>
      <li>Unlimited projects</li>
      <li>Priority support</li>
      <li>Custom domain</li>
      <li>Analytics dashboard</li>
    </ul>
    <button>Get Started</button>
  </div>
</body>
</html>
```
**Description**: A clean pricing card with plan name, price, billing period, feature list with check marks, and a CTA button. White card on light gray background.
**Rubric**: "Compare: card layout/shape, typography hierarchy (plan name small, price large), check marks on features, button styling, overall spacing and proportions."

#### UR-E2 (Easy, Rating: 1000)
**Title**: "Login Form"
**Target HTML/CSS**:
```html
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #18181b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .form-container { background: #27272a; border-radius: 12px; padding: 40px; width: 380px; }
  h2 { color: white; font-size: 24px; margin-bottom: 8px; }
  .subtitle { color: #a1a1aa; font-size: 14px; margin-bottom: 32px; }
  label { display: block; color: #d4d4d8; font-size: 13px; margin-bottom: 6px; font-weight: 500; }
  input { width: 100%; padding: 12px; background: #3f3f46; border: 1px solid #52525b; border-radius: 8px; color: white; font-size: 14px; margin-bottom: 20px; outline: none; }
  input:focus { border-color: #a78bfa; }
  .forgot { text-align: right; margin-top: -14px; margin-bottom: 24px; }
  .forgot a { color: #a78bfa; font-size: 13px; text-decoration: none; }
  button { width: 100%; padding: 12px; background: #7c3aed; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
  .signup-link { text-align: center; margin-top: 20px; color: #a1a1aa; font-size: 13px; }
  .signup-link a { color: #a78bfa; text-decoration: none; }
</style>
</head>
<body>
  <div class="form-container">
    <h2>Welcome back</h2>
    <p class="subtitle">Sign in to your account</p>
    <label>Email</label>
    <input type="email" placeholder="you@example.com">
    <label>Password</label>
    <input type="password" placeholder="••••••••">
    <div class="forgot"><a href="#">Forgot password?</a></div>
    <button>Sign In</button>
    <p class="signup-link">Don't have an account? <a href="#">Sign up</a></p>
  </div>
</body>
</html>
```
**Description**: Dark-themed login form with email/password fields, forgot password link, sign-in button (purple), and signup link. Rounded card on dark background.
**Rubric**: "Compare: dark theme consistency, input field styling, purple accent color, typography, spacing between elements, placeholder text, overall proportions."

#### UR-M1 (Medium, Rating: 1300)
**Title**: "Dashboard Stats Bar"
**Target HTML/CSS**:
```html
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 1000px; margin: 0 auto; }
  .stat-card { background: #1e293b; border-radius: 12px; padding: 24px; }
  .stat-label { font-size: 13px; color: #94a3b8; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .stat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .stat-card:nth-child(1) .stat-icon { background: #1e3a5f; color: #60a5fa; }
  .stat-card:nth-child(2) .stat-icon { background: #1a3a2a; color: #4ade80; }
  .stat-card:nth-child(3) .stat-icon { background: #3b1f4a; color: #c084fc; }
  .stat-card:nth-child(4) .stat-icon { background: #3b2f1a; color: #fbbf24; }
  .stat-value { font-size: 32px; font-weight: 700; color: white; margin-bottom: 4px; }
  .stat-change { font-size: 13px; }
  .stat-change.positive { color: #4ade80; }
  .stat-change.negative { color: #f87171; }
</style>
</head>
<body>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label"><div class="stat-icon">👥</div> Total Users</div>
      <div class="stat-value">12,847</div>
      <div class="stat-change positive">↑ 12.5% from last month</div>
    </div>
    <div class="stat-card">
      <div class="stat-label"><div class="stat-icon">💰</div> Revenue</div>
      <div class="stat-value">$48,295</div>
      <div class="stat-change positive">↑ 8.2% from last month</div>
    </div>
    <div class="stat-card">
      <div class="stat-label"><div class="stat-icon">📦</div> Orders</div>
      <div class="stat-value">1,429</div>
      <div class="stat-change negative">↓ 3.1% from last month</div>
    </div>
    <div class="stat-card">
      <div class="stat-label"><div class="stat-icon">⭐</div> Rating</div>
      <div class="stat-value">4.8</div>
      <div class="stat-change positive">↑ 0.3 from last month</div>
    </div>
  </div>
</body>
</html>
```
**Description**: Dashboard stats row with 4 cards in a grid. Each card has a colored icon, label, large number, and change percentage. Dark theme with blue/green/purple/yellow accent colors.
**Rubric**: "Compare: 4-column grid layout, dark card styling, icon color accents (4 different colors), typography hierarchy (label small, value large), positive/negative change colors (green/red), overall spacing."

#### UR-M2 (Medium, Rating: 1400)
**Title**: "Navigation Sidebar"
**Target HTML/CSS**:
```html
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; }
  .sidebar { width: 260px; height: 100vh; background: white; border-right: 1px solid #e2e8f0; padding: 24px 16px; display: flex; flex-direction: column; }
  .logo { font-size: 20px; font-weight: 700; color: #0f172a; padding: 0 12px; margin-bottom: 32px; display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 32px; height: 32px; background: #7c3aed; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: bold; }
  .nav-section { margin-bottom: 24px; }
  .nav-section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; padding: 0 12px; margin-bottom: 8px; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; color: #64748b; font-size: 14px; cursor: pointer; text-decoration: none; transition: all 0.15s; }
  .nav-item:hover { background: #f1f5f9; color: #0f172a; }
  .nav-item.active { background: #7c3aed10; color: #7c3aed; font-weight: 600; }
  .nav-item .icon { font-size: 18px; width: 20px; text-align: center; }
  .nav-item .badge { margin-left: auto; background: #7c3aed; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
  .spacer { flex: 1; }
  .user-section { border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; align-items: center; gap: 12px; padding-left: 12px; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #64748b; }
  .user-info { font-size: 13px; }
  .user-name { color: #0f172a; font-weight: 600; }
  .user-email { color: #94a3b8; font-size: 12px; }
</style>
</head>
<body>
  <div class="sidebar">
    <div class="logo"><div class="logo-icon">V</div> VibeForces</div>
    <div class="nav-section">
      <div class="nav-section-title">Main</div>
      <a class="nav-item active"><span class="icon">📊</span> Dashboard</a>
      <a class="nav-item"><span class="icon">📝</span> Challenges <span class="badge">30</span></a>
      <a class="nav-item"><span class="icon">🏆</span> Leaderboard</a>
      <a class="nav-item"><span class="icon">⚡</span> Contests</a>
    </div>
    <div class="nav-section">
      <div class="nav-section-title">Account</div>
      <a class="nav-item"><span class="icon">👤</span> Profile</a>
      <a class="nav-item"><span class="icon">⚙️</span> Settings</a>
    </div>
    <div class="spacer"></div>
    <div class="user-section">
      <div class="avatar">JD</div>
      <div class="user-info">
        <div class="user-name">Jane Doe</div>
        <div class="user-email">jane@example.com</div>
      </div>
    </div>
  </div>
</body>
</html>
```
**Description**: Clean navigation sidebar with logo, section titles, nav items with icons (one active with purple highlight), notification badge, and user profile section at the bottom. White on light gray.
**Rubric**: "Compare: sidebar structure (logo, sections, items, user), active state styling, icon placement, badge on Challenges, user avatar section at bottom, spacing and typography, overall proportions."

#### UR-H1 (Hard, Rating: 1700)
**Title**: "Hero Section with Feature Grid"
**Target HTML/CSS**:
```html
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: white; }
  .hero { text-align: center; padding: 80px 20px 60px; max-width: 800px; margin: 0 auto; }
  .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; border: 1px solid #374151; font-size: 13px; color: #9ca3af; margin-bottom: 24px; }
  .badge span { color: #a78bfa; }
  h1 { font-size: 56px; font-weight: 800; line-height: 1.1; margin-bottom: 20px; background: linear-gradient(to bottom, #ffffff, #6b7280); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .subtitle { font-size: 18px; color: #9ca3af; max-width: 600px; margin: 0 auto 40px; line-height: 1.6; }
  .buttons { display: flex; gap: 16px; justify-content: center; margin-bottom: 80px; }
  .btn-primary { padding: 14px 32px; background: #7c3aed; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
  .btn-secondary { padding: 14px 32px; background: transparent; color: white; border: 1px solid #374151; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
  .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1000px; margin: 0 auto; padding: 0 20px; }
  .feature-card { background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; text-align: left; }
  .feature-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
  .feature-card:nth-child(1) .feature-icon { background: #1e1b4b; }
  .feature-card:nth-child(2) .feature-icon { background: #1a2e05; }
  .feature-card:nth-child(3) .feature-icon { background: #2a1a05; }
  .feature-card:nth-child(4) .feature-icon { background: #1b1b3a; }
  .feature-card:nth-child(5) .feature-icon { background: #051d20; }
  .feature-card:nth-child(6) .feature-icon { background: #200515; }
  .feature-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
  .feature-desc { font-size: 14px; color: #9ca3af; line-height: 1.5; }
</style>
</head>
<body>
  <div class="hero">
    <div class="badge"><span>New</span> — Season 1 contests now live</div>
    <h1>Train Your AI Instincts</h1>
    <p class="subtitle">The competitive platform for vibe coders. Master prompt engineering, debug AI output, and prove your skills on the leaderboard.</p>
    <div class="buttons">
      <button class="btn-primary">Start Practicing</button>
      <button class="btn-secondary">View Challenges</button>
    </div>
  </div>
  <div class="features">
    <div class="feature-card">
      <div class="feature-icon">🎯</div>
      <div class="feature-title">Spec-to-Prompt</div>
      <div class="feature-desc">Listen to a spec, craft the perfect prompt. Scored on clarity and output quality.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <div class="feature-title">Token Golf</div>
      <div class="feature-desc">Achieve the target output in the fewest tokens. Efficiency is everything.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔧</div>
      <div class="feature-title">Bug Fix</div>
      <div class="feature-desc">Spot the bug, describe it precisely. Generic prompts score zero.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🏗️</div>
      <div class="feature-title">Architecture Pick</div>
      <div class="feature-desc">Choose the right tool for the job. Rank options by engineering judgment.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🎨</div>
      <div class="feature-title">UI Reproduction</div>
      <div class="feature-desc">See a screenshot, write one prompt. Get as close as possible in one shot.</div>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🏆</div>
      <div class="feature-title">Contests</div>
      <div class="feature-desc">Compete live against other vibe coders. Climb the leaderboard.</div>
    </div>
  </div>
</body>
</html>
```
**Description**: Dark landing page hero with gradient text heading, badge, subtitle, two CTA buttons (purple + ghost), and a 3x2 feature card grid below with icons, titles, and descriptions.
**Rubric**: "Compare: gradient heading effect, badge styling, button pair (filled + outlined), 3-column feature grid, card styling with colored icon backgrounds, dark theme consistency, spacing and typography hierarchy, overall layout proportions."

#### UR-H2 (Hard, Rating: 1800)
**Title**: "Leaderboard Table"
**Target HTML/CSS**:
```html
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; }
  .container { max-width: 900px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  h2 { color: white; font-size: 24px; }
  .filter-tabs { display: flex; gap: 4px; background: #1e293b; border-radius: 8px; padding: 4px; }
  .filter-tab { padding: 8px 16px; border-radius: 6px; font-size: 13px; color: #94a3b8; border: none; background: transparent; cursor: pointer; }
  .filter-tab.active { background: #334155; color: white; font-weight: 600; }
  .table-container { background: #1e293b; border-radius: 12px; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 14px 20px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-bottom: 1px solid #334155; background: #1e293b; }
  td { padding: 16px 20px; font-size: 14px; color: #e2e8f0; border-bottom: 1px solid #334155; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #334155; }
  .rank { font-weight: 700; width: 60px; }
  .rank-1 { color: #fbbf24; }
  .rank-2 { color: #d1d5db; }
  .rank-3 { color: #b45309; }
  .user-cell { display: flex; align-items: center; gap: 12px; }
  .user-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: white; }
  .score { font-weight: 700; color: #a78bfa; }
  .stat { color: #94a3b8; font-size: 13px; }
  .badge-gold { background: linear-gradient(135deg, #fbbf24, #d97706); }
  .badge-silver { background: linear-gradient(135deg, #d1d5db, #9ca3af); }
  .badge-bronze { background: linear-gradient(135deg, #d97706, #92400e); }
  .badge-default { background: #475569; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🏆 Leaderboard</h2>
      <div class="filter-tabs">
        <button class="filter-tab active">All Time</button>
        <button class="filter-tab">This Week</button>
        <button class="filter-tab">Today</button>
      </div>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>Score</th>
            <th>Accuracy</th>
            <th>Tokens</th>
            <th>Solved</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="rank rank-1">#1</td>
            <td><div class="user-cell"><div class="user-avatar badge-gold">AK</div> Alex Kim</div></td>
            <td class="score">9,847</td>
            <td class="stat">94.2%</td>
            <td class="stat">12,450</td>
            <td class="stat">28/30</td>
          </tr>
          <tr>
            <td class="rank rank-2">#2</td>
            <td><div class="user-cell"><div class="user-avatar badge-silver">SP</div> Sarah Patel</div></td>
            <td class="score">9,231</td>
            <td class="stat">91.8%</td>
            <td class="stat">14,200</td>
            <td class="stat">27/30</td>
          </tr>
          <tr>
            <td class="rank rank-3">#3</td>
            <td><div class="user-cell"><div class="user-avatar badge-bronze">MJ</div> Marcus Johnson</div></td>
            <td class="score">8,654</td>
            <td class="stat">89.5%</td>
            <td class="stat">15,800</td>
            <td class="stat">26/30</td>
          </tr>
          <tr>
            <td class="rank">#4</td>
            <td><div class="user-cell"><div class="user-avatar badge-default">LC</div> Luna Chen</div></td>
            <td class="score">7,982</td>
            <td class="stat">87.1%</td>
            <td class="stat">16,300</td>
            <td class="stat">25/30</td>
          </tr>
          <tr>
            <td class="rank">#5</td>
            <td><div class="user-cell"><div class="user-avatar badge-default">RD</div> Raj Deshmukh</div></td>
            <td class="score">7,445</td>
            <td class="stat">85.3%</td>
            <td class="stat">17,100</td>
            <td class="stat">24/30</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
```
**Description**: Dark-themed leaderboard table with rank (gold/silver/bronze colors), user avatars, score, accuracy, tokens used, and problems solved. Filter tabs (All Time / This Week / Today) in top-right. Hover effect on rows.
**Rubric**: "Compare: table structure with all 6 columns, rank coloring (gold #1, silver #2, bronze #3), avatar circles with gradient backgrounds, filter tabs in header, dark theme styling, hover effects, typography and spacing, overall layout."

---

## 9. Scoring & Leaderboard System

### Combined Score Formula

```
combined_score = (accuracy_weight * accuracy_normalized) +
                 (token_weight * token_normalized) +
                 (time_weight * time_normalized)
```

**Weights by category:**

| Category | Accuracy | Token Efficiency | Time |
|----------|----------|-----------------|------|
| Spec-to-Prompt | 0.60 | 0.20 | 0.20 |
| Token Golf | 0.40 | 0.40 | 0.20 |
| Bug Fix | 0.70 | 0.10 | 0.20 |
| Architecture Pick | 1.00 | 0.00 | 0.00 |
| UI Reproduction | 0.50 | 0.30 | 0.20 |

**Normalization:**
- Accuracy: already 0-10, normalize to 0-100
- Token efficiency: `token_score = max(0, 100 - (tokens_used / max_tokens_allowed * 100))`
- Time: `time_score = max(0, 100 - (time_taken / max_time_allowed * 100))`

### Leaderboard Calculation
```sql
-- Materialized view refreshed every 5 minutes via Supabase pg_cron
-- Or computed on-demand for real-time accuracy

SELECT
  user_id,
  username,
  SUM(combined_score) as total_score,
  AVG(accuracy_score) as avg_accuracy,
  AVG(token_score) as avg_token_efficiency,
  AVG(time_taken_seconds) as avg_time,
  COUNT(DISTINCT challenge_id) as challenges_solved,
  RANK() OVER (ORDER BY SUM(combined_score) DESC) as rank
FROM submissions
JOIN profiles ON submissions.user_id = profiles.id
WHERE status = 'completed' AND context_type = 'practice'
GROUP BY user_id, username
ORDER BY total_score DESC;
```

---

## 10. Contest System

### Contest Flow

```
1. Admin creates contest:
   - Title, description
   - Selects challenges from pool
   - Sets scheduled time (e.g., April 18, 2026, 8:00 PM)
   - Sets duration (e.g., 120 minutes)

2. Contest page shows:
   - Countdown timer before start
   - "Contest starts in 3h 42m 15s"
   - After start: challenges unlock, timer counts down

3. Learners join:
   - Click "Join Contest" before or during
   - Once started, can solve challenges in any order
   - Timer visible at all times

4. Submissions during contest:
   - Same pipeline as practice, but context_type = 'contest'
   - Real-time leaderboard updates

5. After contest ends:
   - No more submissions accepted
   - Final leaderboard published
   - Admin can review results
```

### First Contest: VibeForces Launch Challenge
```json
{
  "title": "VibeForces Launch Challenge",
  "description": "The very first VibeForces contest! Test your vibe coding skills across all categories.",
  "scheduled_at": "2026-04-18T20:00:00+05:30",
  "duration_minutes": 120,
  "challenges": [
    "SP-E1 (FizzBuzz with a Twist)",
    "TG-M1 (Binary Search Tree)",
    "BF-E2 (Broken Fibonacci)",
    "AP-M1 (Real-time Feature Architecture)",
    "UR-E1 (Pricing Card)"
  ]
}
```

---

## 11. Recruiter Test System

### Test Creation Flow

```
1. Recruiter logs in → Dashboard → "Create Test"

2. Test Builder UI:
   - Title: "Frontend Developer Assessment"
   - Time Limit: [dropdown: 30/60/90/120 min]
   - Add Challenges:
     - Filter by category, difficulty
     - Click to add/remove
     - See selected challenges list with difficulty badges
   - Proctoring toggle (disabled, shows "Coming Soon" tooltip)

3. On "Create Test":
   - Backend generates unique share_code
   - Returns shareable link: https://vibeforces.vercel.app/test/{share_code}

4. Recruiter shares link with candidates

5. Candidate experience:
   - Opens link → prompted to log in (or sign up as learner)
   - Sees test info: title, number of questions, time limit
   - Clicks "Start Test" → timer begins
   - Solves challenges in order
   - Timer runs out → auto-submit

6. Recruiter views results:
   - Dashboard → Tests → Click test
   - Table of candidates with scores
   - Click candidate → detailed breakdown per challenge
```

### Proctoring Label
On every test and contest page, show a banner:
```
🔒 Proctoring — Coming Soon
Full proctoring with tab-switch detection, screen recording, and
AI-powered anomaly detection will be available in a future update.
```

---

## 12. Frontend Pages & Components

### Page Map

| Route | Page | Role | Description |
|-------|------|------|-------------|
| `/` | Landing | Public | Hero, features, CTA, "SD1/SD2 now, Senior coming soon" |
| `/login` | Login | Public | Email/password, role auto-detected |
| `/signup` | Signup | Public | Role selector + registration |
| `/learner/dashboard` | Dashboard | Learner | Stats, recent submissions, upcoming contests |
| `/learner/challenges` | Challenge List | Learner | Filterable grid of all 30 challenges |
| `/learner/challenges/[id]` | Challenge Solve | Learner | The actual challenge interface |
| `/learner/leaderboard` | Leaderboard | Learner | Global practice leaderboard |
| `/learner/contests` | Contest List | Learner | Upcoming + past contests |
| `/learner/contests/[id]` | Contest | Learner | Contest arena with challenges + timer |
| `/test/[code]` | Take Test | Learner | Recruiter test (via share link) |
| `/recruiter/dashboard` | Dashboard | Recruiter | Test overview, create test CTA |
| `/recruiter/create-test` | Create Test | Recruiter | Test builder |
| `/recruiter/tests` | Test List | Recruiter | All created tests |
| `/recruiter/tests/[id]` | Test Results | Recruiter | Candidate scores + breakdown |
| `/admin/dashboard` | Dashboard | Admin | Platform stats |
| `/admin/contests` | Contest Mgmt | Admin | Create/manage contests |
| `/admin/contests/[id]` | Contest Detail | Admin | Contest leaderboard + management |

### Key Components

**`ModelBadge`** — Top-right of every challenge:
```
┌──────────────────────────────────┐
│ Currently using: GPT-4.1         │
│ More models coming soon →        │
└──────────────────────────────────┘
```

**`VoicePlayer`** — For Spec-to-Prompt:
```
┌──────────────────────────────────┐
│  ▶  ░░░░░░░░░░░░░░░░░  0:00     │
│     Listen carefully — one play  │
└──────────────────────────────────┘
After play:
┌──────────────────────────────────┐
│  ✓  Voice note played            │
│     You may not replay           │
└──────────────────────────────────┘
```

**`PromptEditor`** — Monaco-based:
```
┌──────────────────────────────────┐
│ Write your prompt:               │
│ ┌──────────────────────────────┐ │
│ │                              │ │
│ │  (monaco editor)             │ │
│ │                              │ │
│ └──────────────────────────────┘ │
│ Tokens: 47    Chars: 234         │
│              [Submit Prompt →]   │
└──────────────────────────────────┘
```

**`SuggestIdea`** — On landing page:
```
┌──────────────────────────────────┐
│ 💡 Have a challenge idea?        │
│ ┌──────────────────────────────┐ │
│ │ Describe your challenge...   │ │
│ └──────────────────────────────┘ │
│               [Submit Idea]      │
└──────────────────────────────────┘
```

---

## 13. UI/UX Specifications

### Color Palette
```
Background:    #030712 (near black)
Surface:       #111827 (dark gray)
Surface 2:     #1e293b (medium dark)
Border:        #1f2937
Text Primary:  #f8fafc (near white)
Text Secondary:#94a3b8 (gray)
Accent Purple: #7c3aed
Accent Green:  #22c55e (success/positive)
Accent Red:    #ef4444 (error/negative)
Accent Yellow: #fbbf24 (gold/warning)
```

### Typography
```css
/* Headings + Code */
font-family: 'JetBrains Mono', 'Fira Code', monospace;

/* Body text */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Scale */
h1: 48px / 800 weight
h2: 32px / 700 weight
h3: 24px / 600 weight
body: 15px / 400 weight
small: 13px / 400 weight
caption: 11px / 500 weight, uppercase, letter-spacing: 1.5px
```

### Background Effects
- Subtle dot grid pattern overlay (opacity 0.03)
- Gradient glow behind hero text (purple/blue, blurred)
- Noise texture at very low opacity (0.02) for depth

### Animations
- Page transitions: fade in (200ms)
- Card hovers: subtle lift (translateY -2px) + shadow increase
- Score reveal: count-up animation
- Leaderboard: row highlight on hover
- Timer: pulse animation when under 5 minutes

---

## 14. Screenshot Generation Pipeline

For UI Reproduction challenges, we need to:
1. Store the target HTML/CSS and its pre-rendered screenshot
2. Take a screenshot of AI-generated HTML/CSS at submission time

### Backend Screenshot Service

```typescript
// backend/src/services/screenshot.ts
import puppeteer from 'puppeteer';

let browser: puppeteer.Browser | null = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

export async function htmlToScreenshot(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const screenshot = await page.screenshot({
    type: 'png',
    fullPage: true,
  });
  
  await page.close();
  return screenshot as Buffer;
}

export async function htmlToBase64Screenshot(html: string): Promise<string> {
  const buffer = await htmlToScreenshot(html);
  return buffer.toString('base64');
}
```

### Pre-rendering Target Screenshots
During seed/setup phase:
1. For each UI reproduction challenge, take the target HTML/CSS
2. Run it through Puppeteer
3. Save the screenshot to Supabase Storage
4. Store the URL in challenge_data.target_screenshot_url

### Submission Flow
1. User submits prompt
2. Backend sends prompt to GPT-4.1 → gets HTML/CSS
3. Backend renders HTML/CSS via Puppeteer → gets screenshot
4. Backend uploads screenshot to Supabase Storage
5. Backend sends both screenshots to GPT-5.4-mini for comparison
6. Score returned

---

## 15. Voice Note Generation

For the prototype, voice notes will be generated using a text-to-speech service.

### Options (in order of preference):
1. **OpenAI TTS API** (`tts-1` model) — since we already have an OpenAI key
2. **ElevenLabs** — if higher quality is needed
3. **Pre-recorded** — manually record if preferred

### Implementation with OpenAI TTS
```typescript
// Script to generate voice notes for all spec-to-prompt challenges
import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI();

async function generateVoiceNote(script: string, filename: string) {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova', // natural, friendly voice
    input: script,
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(`./voice-notes/${filename}.mp3`, buffer);
}

// Generate for each spec-to-prompt challenge
const scripts = {
  'sp-e1': 'Hey, I need you to write a program...',
  'sp-e2': 'I have a CSV file with three columns...',
  // ... etc
};
```

Upload generated MP3 files to Supabase Storage and reference in challenge_data.

---

## 16. Sample Data & Seed Script

### Seed Users (for realistic leaderboard)
```sql
-- 15 fake users with varied stats
INSERT INTO profiles (id, username, display_name, role, total_score, challenges_solved) VALUES
  (gen_random_uuid(), 'alexkim', 'Alex Kim', 'learner', 9847, 28),
  (gen_random_uuid(), 'sarah_p', 'Sarah Patel', 'learner', 9231, 27),
  (gen_random_uuid(), 'marcusj', 'Marcus Johnson', 'learner', 8654, 26),
  (gen_random_uuid(), 'luna_c', 'Luna Chen', 'learner', 7982, 25),
  (gen_random_uuid(), 'raj_d', 'Raj Deshmukh', 'learner', 7445, 24),
  (gen_random_uuid(), 'emilyw', 'Emily Williams', 'learner', 6890, 22),
  (gen_random_uuid(), 'tomh', 'Tom Hernandez', 'learner', 6234, 20),
  (gen_random_uuid(), 'priya_s', 'Priya Singh', 'learner', 5678, 19),
  (gen_random_uuid(), 'jordan_b', 'Jordan Brown', 'learner', 5123, 17),
  (gen_random_uuid(), 'mia_z', 'Mia Zhang', 'learner', 4567, 15),
  (gen_random_uuid(), 'david_l', 'David Lee', 'learner', 3890, 14),
  (gen_random_uuid(), 'sofia_r', 'Sofia Rodriguez', 'learner', 3234, 12),
  (gen_random_uuid(), 'noah_k', 'Noah Kumar', 'learner', 2678, 10),
  (gen_random_uuid(), 'ava_m', 'Ava Miller', 'learner', 2012, 8),
  (gen_random_uuid(), 'liam_t', 'Liam Taylor', 'learner', 1456, 6);

-- Sample admin
INSERT INTO profiles (id, username, display_name, role) VALUES
  (gen_random_uuid(), 'admin', 'VibeForces Admin', 'admin');

-- Sample recruiter
INSERT INTO profiles (id, username, display_name, role) VALUES
  (gen_random_uuid(), 'techrecruiter', 'TechCorp Hiring', 'recruiter');
```

### Seed Submissions (for leaderboard realism)
Generate random submissions for each seed user across various challenges with realistic score distributions. Higher-ranked users have higher accuracy and lower token counts.

```typescript
// seed-submissions.ts — run as a script
// For each user, generate 15-28 submissions across random challenges
// Scores correlate with their ranking (alexkim gets 8-10s, liam_t gets 3-6s)
```

---

## 17. Deployment Plan

### Step 1: Supabase Setup
1. Create new Supabase project
2. Run migration files in order (001 through 007)
3. Enable RLS on all tables
4. Create storage buckets: `voice-notes`, `screenshots`
5. Set bucket policies (voice-notes: public read, screenshots: public read)
6. Note down: Project URL, Anon Key, Service Role Key, JWT Secret

### Step 2: Backend Deployment (Render)
1. Create a new "Web Service" on Render
2. Connect to the GitHub repo (or push to a new one)
3. Build command: `cd backend && npm install && npm run build`
4. Start command: `cd backend && npm start`
5. Set environment variables (see Section 18)
6. Instance type: Free or Starter ($7/mo for always-on)
7. Note: Puppeteer requires a Docker-based deploy or additional buildpacks for Chromium

**Puppeteer on Render:**
```dockerfile
# backend/Dockerfile
FROM node:20-slim

RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libgbm1 \
  libnspr4 \
  libnss3 \
  libxkbcommon0 \
  xdg-utils \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### Step 3: Frontend Deployment (Vercel)
1. Connect GitHub repo to Vercel
2. Set root directory: `frontend`
3. Framework preset: Next.js
4. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (Render backend URL)
5. Deploy
6. Set custom domain if desired (e.g., vibeforces.vercel.app)

### Step 4: DNS / Domain (Optional)
- If registering vibeforces.com or similar, point to Vercel

---

## 18. Environment Variables Required

### `.env` (Backend)
```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Service role for backend DB operations
SUPABASE_JWT_SECRET=...           # For verifying user JWTs

# OpenAI
OPENAI_API_KEY=sk-...             # For GPT-4.1 and GPT-5.4-mini

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://vibeforces.vercel.app  # For CORS

# Puppeteer (if needed)
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

### `.env.local` (Frontend)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Anon key (safe for client)
NEXT_PUBLIC_API_URL=https://vibeforces-api.onrender.com
```

### API Keys You Need to Provide:
1. **OpenAI API Key** — for GPT-4.1 (prompt execution) and GPT-5.4-mini (judging) and TTS (voice notes)
2. **Supabase Project URL** — from Supabase dashboard after creating project
3. **Supabase Anon Key** — from Supabase dashboard (Settings → API)
4. **Supabase Service Role Key** — from Supabase dashboard (Settings → API) — keep secret!
5. **Supabase JWT Secret** — from Supabase dashboard (Settings → API)

That's 5 secrets total (3 from Supabase, 1 from OpenAI, the rest are derived/configured).

---

## 19. Implementation Order (Build Phases)

### Phase 1: Foundation (Day 1)
1. Initialize Next.js frontend with Tailwind + shadcn/ui
2. Initialize Express.js backend with TypeScript
3. Set up Supabase project + run migrations
4. Implement auth flow (signup/login with role selector)
5. Basic layout: navbar, sidebar, routing guards per role
6. Landing page with hero section

### Phase 2: Challenge Infrastructure (Day 2)
1. Seed all 30 challenges into the database
2. Build challenge listing page (filters by category, difficulty)
3. Build OpenAI integration layer (promptRunner + judge)
4. Build the 5 category-specific submission pipelines
5. Build challenge solve page (per-category UI components)
6. VoicePlayer component
7. PromptEditor with token counter
8. Generate voice notes using OpenAI TTS, upload to storage

### Phase 3: Scoring & Leaderboard (Day 2-3)
1. Implement scoring formulas per category
2. Build leaderboard views/queries
3. Build leaderboard UI page
4. Seed fake users + submissions for realistic leaderboard
5. Score display component with breakdown

### Phase 4: Screenshot Pipeline (Day 3)
1. Set up Puppeteer on backend
2. Pre-render target screenshots for UI reproduction challenges
3. Build submission pipeline for UI reproduction
4. Test GPT-5.4-mini visual comparison

### Phase 5: Contest System (Day 3)
1. Admin contest creation page
2. Contest listing + detail pages
3. Contest participation flow (join, solve, timer)
4. Contest leaderboard (real-time via Supabase realtime)
5. Create the launch contest (April 18, 8 PM)

### Phase 6: Recruiter System (Day 4)
1. Recruiter dashboard
2. Test builder (select challenges, set time, generate link)
3. Candidate test-taking flow (timer, sequential challenges)
4. Results dashboard for recruiter
5. Proctoring "Coming Soon" badge

### Phase 7: Polish & Deploy (Day 4)
1. Landing page refinement (background effects, animations)
2. "Suggest an Idea" form on landing page
3. SD1/SD2 label + SD3/Senior "Coming Soon" section
4. "More models coming soon" label
5. ModelBadge component on all challenge pages
6. Final responsive design pass
7. Deploy to Vercel (frontend) + Render (backend)
8. Verify all flows end-to-end
9. Final leaderboard seeding
10. Verify launch contest is correctly scheduled

---

## Appendix A: Key System Prompts (Backend)

### GPT-4.1 System Prompt — Spec-to-Prompt (Single Mode)
```
You are an AI coding assistant. The user will describe what they want built.
Generate the code based on their description.

IMPORTANT: You MUST respond in this EXACT JSON format:
{
  "code": "<complete working code>",
  "language": "<programming language>",
  "explanation": "<1-2 sentence explanation>"
}

Do not include anything outside this JSON. Do not use markdown formatting.
Do not add extra commentary. Just the JSON.
```

### GPT-4.1 System Prompt — Spec-to-Prompt (Plan Mode)
```
You are an AI coding assistant in PLANNING mode.
The user will describe what they want. Create a detailed plan, NOT code.

IMPORTANT: You MUST respond in this EXACT JSON format:
{
  "plan": "<detailed step-by-step plan with numbered steps>",
  "approach": "<high-level approach in 1-2 sentences>",
  "key_decisions": "<any architectural or design decisions>"
}

Do not include code. Do not include anything outside this JSON.
```

### GPT-4.1 System Prompt — Spec-to-Prompt (Act Mode)
```
You are an AI coding assistant in EXECUTION mode.
You previously created this plan:
{{PLAN_OUTPUT}}

Now implement the code based on the user's execution prompt.

IMPORTANT: You MUST respond in this EXACT JSON format:
{
  "code": "<complete working code>",
  "language": "<programming language>",
  "explanation": "<1-2 sentence explanation of what was built>"
}

Do not include anything outside this JSON.
```

### GPT-4.1 System Prompt — Token Golf
```
You are an AI coding assistant. Generate EXACTLY what the user asks for.
Be precise and follow their instructions exactly.

IMPORTANT: You MUST respond in this EXACT JSON format:
{
  "code": "<the generated code>",
  "language": "<programming language>"
}

Do not include anything outside this JSON. Do not add comments in the code
unless the user specifically asks for them.
```

### GPT-4.1 System Prompt — Bug Fix
```
You are an AI coding assistant. The user will describe a bug in the code
and ask you to fix it. Apply the fix they describe.

IMPORTANT: You MUST respond in this EXACT JSON format:
{
  "fixed_code": "<the complete code with the fix applied>",
  "changes_made": "<brief description of what was changed>"
}

Do not include anything outside this JSON.
```

### GPT-4.1 System Prompt — UI Reproduction
```
You are a UI developer. Generate a single HTML file with inline CSS
that reproduces the UI described by the user.

IMPORTANT: You MUST respond with ONLY the complete HTML code.
- Include all CSS inline in a <style> tag
- The HTML must be self-contained (no external dependencies)
- Use modern CSS (flexbox, grid)
- Match the described layout, colors, and typography as closely as possible
- Do not include any text outside the HTML code
- Start with <!DOCTYPE html> and end with </html>
```

### GPT-5.4-mini System Prompt — Token Golf Verification
```
You are verifying if AI-generated code matches a target specification.
Compare the actual output against the target.

Respond in this EXACT JSON format:
{
  "correctness_percentage": <0-100>,
  "is_functionally_equivalent": <true/false>,
  "differences": "<list any differences>",
  "feedback": "<1-2 sentence summary>"
}

Be strict on functional equivalence but lenient on style differences
(variable names, whitespace, comments). What matters is that the code
does the same thing, not that it looks identical.
```

---

## Appendix B: Architecture Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend framework | Next.js 14 | SSR for landing page SEO, App Router for layouts, Vercel-native |
| Backend framework | Express.js | Simple, fast to build, good TypeScript support, lightweight |
| Database | Supabase/Postgres | Auth built-in, realtime subscriptions, RLS, storage — all-in-one |
| AI execution model | GPT-4.1 | User-specified. Consistent baseline for all learners |
| AI judging model | GPT-5.4-mini | User-specified. Multimodal (needed for UI comparison), cost-effective for judging |
| Screenshot engine | Puppeteer | Industry standard, headless Chrome, reliable rendering |
| Voice generation | OpenAI TTS | Already have API key, decent quality, simple integration |
| Styling | Tailwind + shadcn/ui | Minimalist by default, highly customizable, fast to build |
| Real-time leaderboard | Supabase Realtime | Built into Supabase, no extra infrastructure |
| Deployment split | Vercel + Render + Supabase | Free/cheap tiers, Puppeteer needs container (Render), Next.js native on Vercel |
