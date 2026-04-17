# VibeForces — LeetCode for Vibecoders

## The Core Thesis

LeetCode is dead for 2026. DSA interviews still exist, but the real-world skill that matters — especially at startups and companies where software isn't the core product — is **vibe coding**. The ability to communicate with AI, guide it effectively, and ship working software through prompts is the new hiring signal.

**The problem**: There is no standardized way to train or evaluate vibe coding ability. Companies hiring for this skill are flying blind. Developers who want to improve have no structured path.

**VibeForces** solves both sides: a training ground for learners and a testing platform for recruiters.

---

## Target Audience

### Current Scope (v1)
- **SD1 / SD2 (Entry-level Software Developer) roles** — junior to mid-level positions
- Focus on practical prompt engineering, debugging via prompts, architectural instinct, and efficient AI usage

### Future Scope
- **SD3 / Senior / Staff roles** — system design, complex architecture, multi-service vibe coding
- More advanced challenges requiring deeper technical judgment
- This will be clearly labeled on the main page as "Coming Soon"

---

## Three User Roles

### 1. Learner
- Signs up and logs in
- Practices challenges across 5 categories
- Sees leaderboards comparing their performance to other learners
- Participates in contests
- Takes recruiter-shared tests

### 2. Recruiter
- Signs up and logs in (separate recruiter portal)
- Selects challenges by category and difficulty to compose a test
- Sets a time limit for the test
- Gets a shareable link to send to candidates
- Views results: scores, token usage, time taken
- Proctoring labeled as "Coming Soon — Future Feature"

### 3. Admin
- Logs in via admin portal
- Creates and schedules contests
- Manages contest leaderboards
- First contest: **April 18, 2026 at 8:00 PM IST** (launch contest)

---

## Challenge Categories

### Category 1: Spec-to-Prompt
A detailed specification is delivered via a **voice note** (audio, one-time listen). The learner must write prompts to achieve the described output.

- **Easy**: Simple spec (just voice note). Single prompt. Could be a simple program or DSA solution.
- **Medium/Hard**: Complex spec (voice note + supplementary charts/diagrams below). Plan-and-Act format — learner writes a "Plan" prompt, sees the AI response, then writes an "Act" prompt.

**AI Usage**:
- GPT-4.1 executes the learner's prompts and returns the output
- GPT-5.4-mini judges both the prompts and the outputs, scoring out of 10

### Category 2: Token Golf
A specific target output is shown (code snippet, DSA solution, program output). The learner must achieve the correct output using the **fewest tokens possible**.

- Everyone uses the same GPT-4.1 model
- Output correctness is verified by GPT-5.4-mini (percentage correctness)
- Leaderboard ranked by: accuracy, token count, time taken, and a combined score

**Difficulty scaling**: Easy = simple code snippets. Medium = moderate algorithms. Hard = complex programs.

### Category 3: Bug Fix Prompting
A piece of broken code is presented. The learner must prompt the AI to fix it. The key skill tested: **how precisely they identify and describe the bug**, not just saying "fix this."

- **Easy**: Broken DSA code (off-by-one errors, wrong conditions, etc.)
- **Medium/Hard**: Broken application code (larger codebases, subtle bugs)

**Judging**:
- GPT-5.4-mini receives: the actual bug location, the learner's prompt, and the AI's fix
- Scores based on how precisely the learner pointed to the actual issue
- "fix this" = 0 marks. Precise identification = high marks.
- Future feature label: "Token count and AI time will also factor into scoring"

### Category 4: Architecture Pick
Given a scenario/prompt, the AI has produced 3 possible approaches/architectures/solutions. The learner must **rank them from best to worst**.

- All questions are pre-written with pre-determined correct rankings
- Easy: Simple tech choices (which library, which approach for a CRUD app)
- Medium: Moderate architecture decisions (database choice, API design)
- Hard: Complex system design trade-offs (scaling, caching strategies, service boundaries)

**Scoring**: Exact match on ranking = full marks. Partial credit for partially correct orderings.

### Category 5: UI Reproduction
A screenshot of a UI is shown. The learner writes a **single prompt** to reproduce it. One-shot only.

- GPT-4.1 generates HTML/CSS from the learner's prompt
- The backend screenshots the generated HTML/CSS
- GPT-5.4-mini (multimodal) compares the original screenshot with the generated screenshot
- Scored on: visual similarity percentage + token efficiency (fewer tokens = better)

**Difficulty scaling**: Easy = simple components (button, card, form). Medium = page sections. Hard = full page layouts with interactions.

---

## Question Count (Prototype)

Each category: **6 questions** (2 Easy, 2 Medium, 2 Hard)
5 categories x 6 questions = **30 questions total**

### Difficulty Rating System
Similar to Codeforces:
- Easy: 800–1200
- Medium: 1200–1600
- Hard: 1600–2000+

---

## AI Models Used

| Purpose | Model | Notes |
|---------|-------|-------|
| Executing learner prompts | GPT-4.1 | Shown in top-right of challenge UI: "Currently using GPT-4.1" |
| Judging/Scoring | GPT-5.4-mini | Multimodal, used for all evaluation |

- UI must note "Currently using GPT-4.1" with a label that more AI models are coming in the future
- All prompts to GPT-4.1 must enforce specific output formats so learners don't lose marks on formatting
- All judging prompts to GPT-5.4-mini must return structured JSON for programmatic scoring

---

## Leaderboards

### Practice Leaderboard
- Global leaderboard across all practice submissions
- Four columns: Accuracy Score, Token Efficiency, Time Taken, Combined Score
- Populated with sample attempts to look real at launch

### Contest Leaderboard
- Per-contest leaderboard (public)
- Same four scoring dimensions
- Admin can view and manage

### Recruiter Test Results
- Private to the recruiter who created the test
- Per-candidate breakdown of scores

---

## Contests

- Created by Admin
- Scheduled with a specific date/time
- **First contest: April 18, 2026 at 8:00 PM**
- Shareable link for participants
- Timed
- Public leaderboard
- Proctoring: labeled as "Coming Soon"

---

## Recruiter Tests

- Recruiter selects questions from the pool (by category, difficulty)
- Sets time limit
- System generates a unique shareable link
- Candidates log in as learners and take the test
- Recruiter views results dashboard
- Proctoring: labeled as "Coming Soon — Future Feature"

---

## UI/UX Design Principles

- **Minimalistic and beautiful**
- Clean backgrounds with subtle effects (gradients, noise textures, or subtle animations)
- **Fonts**: Monospace/computerized feel — JetBrains Mono or Space Mono for code, Inter or similar clean sans-serif for body text
- Simple color palette — dark mode primary
- No clutter — every element earns its place
- Clear labeling: "SD1/SD2 Challenges — Senior/Staff level coming soon"
- "Suggest a Challenge Idea" section on main page

---

## Additional UI Elements

- **Main page**: Hero section with tagline "LeetCode for Vibecoders", current scope label (SD1/SD2), coming soon label (SD3/Senior), challenge categories overview, suggest ideas section
- **Challenge page**: Category filter, difficulty filter, rating display, leaderboard sidebar
- **Challenge execution page**: Voice player (for spec-to-prompt), prompt input area, AI response display, submission button, "Currently using GPT-4.1" badge in top-right
- **Proctoring badge**: "Proctoring: Coming Soon" on all test/contest pages

---

## Deployment

| Component | Platform |
|-----------|----------|
| Frontend (Next.js) | Vercel |
| Backend (Node.js/Express) | Render |
| Database + Auth | Supabase |
| File Storage (voice notes, screenshots) | Supabase Storage |

---

## Future Features (Labeled in UI)

- More AI models beyond GPT-4.1
- SD3/Senior/Staff level challenges (system design, multi-service architecture)
- Proctoring for tests and contests
- Token count + AI time as additional scoring for Bug Fix challenges
- Community-submitted challenges
- Team contests
- More challenge categories
