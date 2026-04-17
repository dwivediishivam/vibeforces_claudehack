# VibeForces — Hackathon Pitch Deck

## Presentation Instructions

**Style**: Minimalistic, dark theme, lots of whitespace. One idea per slide. No clutter.
**Fonts**: Use a clean monospace font (JetBrains Mono, Space Mono, or similar) for headings and numbers. Use Inter or a clean sans-serif for body text. Nothing decorative.
**Colors**: Dark backgrounds (#030712 or #0f172a). White text for headings. Gray (#94a3b8) for body. Purple (#7c3aed / #a78bfa) as the only accent color. Green/red only for semantic meaning.
**Layout**: Center-aligned for impact slides. Left-aligned for content slides. Generous padding. Never more than 3-4 bullet points per slide. Large text, few words.
**Animations**: Subtle fade-ins only. No flashy transitions.

---

## SLIDE 1 — Title

**[Center of slide, large]**

# VibeForces

**[Below, smaller, in gray]**

LeetCode for Vibecoders

**[Bottom of slide, small, muted gray]**

Created by Shivam Dwivedi · @dwivediishivam

---

## SLIDE 2 — The Provocation

**[Large text, centered, bold]**

Let's be honest.

**[Even larger, white on dark]**

LeetCode is dead.

**[Smaller gray text below]**

At least for the world we're building in 2026.

---

## SLIDE 3 — The Problem (Part 1)

**[Heading]**

The way we build software has changed. The way we hire hasn't.

**[Body — three short lines, staggered or appearing one by one]**

- 80% of startups now use AI-assisted coding as their default workflow
- Companies where software isn't the core product? Their teams vibe code everything.
- Yet hiring still tests whether you can reverse a linked list on a whiteboard.

---

## SLIDE 4 — The Problem (Part 2)

**[Heading]**

DSA tests measure the wrong skill.

**[Two columns or contrast layout]**

**What LeetCode tests:**
Memorized algorithms
Manual code writing speed
Textbook data structures

**What actually ships products in 2026:**
Prompt clarity and precision
Debugging AI-generated code
Architectural judgment
Knowing when to let AI run vs. when to intervene

**[Bottom, small gray italic]**

DSA isn't dead. It's just not the full picture anymore. Not even close.

---

## SLIDE 5 — The Insight

**[Single line, large, centered]**

There are mass Vibecoders now.
But no standard way to train them.
No standard way to test them.
No standard way to rank them.

**[Below, purple accent text]**

Until now.

---

## SLIDE 6 — Introducing VibeForces

**[Center, large logo treatment]**

# VibeForces

**[Below]**

The competitive platform where vibe coders train, rank, and prove they can ship.

**[Three short descriptors in a row, icon + text]**

🎯 Train — 5 challenge categories, 3 difficulty levels, rated like Codeforces (800–2000+)

🏆 Compete — Live contests with real-time leaderboards

🏢 Hire — Recruiters build custom tests from our challenge pool and share a link

---

## SLIDE 7 — How It Works (For Learners)

**[Heading]**

How it works

**[Three steps, clean layout, numbered]**

**1. Pick a challenge**
Browse 30 challenges across 5 categories. Each rated by difficulty (800–2000+) just like Codeforces.

**2. Write your prompt**
Every challenge runs on GPT-4.1 as the execution engine. You write the prompts. The AI executes. Your skill is how well you communicate.

**3. Get scored and ranked**
GPT-5.4-mini judges your submission on accuracy, token efficiency, and time. You land on the global leaderboard.

---

## SLIDE 8 — The 5 Challenge Categories

**[Heading]**

5 ways to test a vibe coder

**[Five items, each with a short name and one-line description. Use icons or colored dots.]**

**Spec-to-Prompt**
Listen to a voice-note spec. Write the prompt. Scored on output quality and prompt clarity.

**Token Golf**
Achieve the target output in the fewest tokens possible. Efficiency is everything.

**Bug Fix Prompting**
Broken code is shown. Describe the fix precisely. "Fix this" scores zero. Exact identification scores ten.

**Architecture Pick**
AI gives 3 options for a technical decision. Rank them best-to-worst. Tests engineering judgment, not coding.

**UI Reproduction**
See a screenshot. Write one prompt. GPT-4.1 generates HTML/CSS. AI judges how close your reproduction is.

---

## SLIDE 9 — The Three User Roles

**[Heading]**

One platform. Three audiences.

**[Three cards/columns]**

**Learners**
Sign up, practice challenges, climb the leaderboard, join live contests. Think of it as your gym for prompt skills.

**Recruiters**
Pick challenges by category and difficulty. Set a time limit. Get a shareable link. Candidates take the test. You see scores, accuracy, token usage — everything.

**Admins**
Create and schedule contests. Manage the platform. Oversee leaderboards.

---

## SLIDE 10 — The Recruiter Value Prop

**[Heading]**

For companies: stop testing the wrong thing.

**[Body]**

- Create a test in 2 minutes: pick challenges, set time, get a link
- Candidates take the test on VibeForces — timed, structured, scored automatically
- You see: accuracy score, token efficiency, time taken, and a combined ranking
- AI-powered plagiarism detection ensures submissions are genuine (not copy-pasted from ChatGPT outputs)
- Proctoring with tab-switch detection and screen monitoring (coming soon)

**[Bottom callout in purple]**

You're not hiring someone who can memorize merge sort. You're hiring someone who can ship with AI.

---

## SLIDE 11 — Live Demo / Current Prototype State

**[Heading]**

What we've built — the prototype

**[Body — clean bullet list]**

- Full-stack application: Next.js frontend (Vercel) + Express.js backend (Render) + Supabase (database, auth, storage)
- Complete authentication system with three roles (learner, recruiter, admin)
- 30 pre-built challenges across all 5 categories (2 easy, 2 medium, 2 hard each)
- AI pipeline: GPT-4.1 executes prompts, GPT-5.4-mini judges and scores submissions
- Scoring engine: accuracy, token efficiency, and time — weighted per category
- Global leaderboard with real-time rankings
- Recruiter test builder: select challenges → set time → generate shareable link → view candidate results
- Contest system with the first-ever VibeForces contest scheduled and live
- Voice note specs generated via OpenAI TTS for Spec-to-Prompt challenges
- Puppeteer screenshot pipeline for UI Reproduction challenge judging
- Difficulty ratings from 800 to 2000+ (Codeforces-style)
- Seeded with sample users and submissions for a realistic leaderboard experience

---

## SLIDE 12 — Tech Architecture (Keep This Simple)

**[Heading]**

Under the hood

**[Simple architecture diagram — three boxes connected by arrows]**

**Frontend** (Vercel)
Next.js 14 · Tailwind CSS · shadcn/ui · Monaco Editor · Framer Motion

↕ REST API

**Backend** (Render)
Express.js · TypeScript · OpenAI SDK · Puppeteer (screenshots)

↕ Supabase Client

**Database & Auth** (Supabase)
PostgreSQL · Row-Level Security · Auth · File Storage (voice notes, screenshots)

**[Side note]**

AI Models:
- GPT-4.1 → executes user prompts (consistent baseline for all users)
- GPT-5.4-mini → judges submissions, scores accuracy, compares UI screenshots (multimodal)

---

## SLIDE 13 — Current Scope & What's Next

**[Heading]**

Today: SD-1 & SD-2 developers
Tomorrow: the entire engineering ladder

**[Two columns]**

**Built Now (v1 — Prototype)**
- Entry-level challenges (SD-1, SD-2 roles)
- 5 challenge categories, 30 questions
- Single-model execution (GPT-4.1)
- Practice, contests, and recruiter tests
- Automated AI scoring

**Coming Next (v2+)**
- SD-3, Senior, Staff level challenges — system design, multi-service architecture, complex debugging
- Multi-model support: Claude, Gemini, open-source models — choose your weapon
- Full project-based challenges: "Build a complete app in 2 hours" with AI
- AI-powered proctoring: tab detection, screen recording, anomaly detection
- Plagiarism detection engine
- Team contests and company leaderboards
- Community-submitted challenges with voting
- Mobile app for on-the-go practice

---

## SLIDE 14 — The Business Model

**[Heading]**

How VibeForces makes money

**[Clean layout, 3-4 revenue streams]**

**1. Freemium for Learners**
- Free tier: Access to a limited set of challenges per category (e.g., 2 free per category = 10 free challenges)
- Premium ($12/month or $99/year): Full access to all challenges, unlimited attempts, detailed analytics, priority in contest registration
- Senior/Staff tier ($29/month): Access to advanced SD-3+ challenges when launched — project-based, system design, multi-service prompting

**2. Recruiter Subscriptions**
- Pay-per-test: $49 per test (up to 20 candidates)
- Team plan: $199/month — unlimited tests, unlimited candidates, candidate comparison dashboard, proctoring features
- Enterprise: Custom pricing — SSO, ATS integration, custom challenge creation, dedicated support

**3. Contest Sponsorships**
- Companies sponsor contests and get branding + access to top performers
- "Sponsored by Stripe" on a contest = Stripe gets the leaderboard + can reach out to top 10

**4. Certification (Future)**
- "VibeForces Certified Prompt Engineer" — verified score across all categories
- Shareable badge for LinkedIn, portfolio

**[Bottom — market context, small gray text]**

For reference: LeetCode Premium is $35/month ($159/year). HackerRank charges companies $100-$450/month for hiring plans. CodeSignal's enterprise plans start at thousands per year. The market pays for standardized developer assessment.

---

## SLIDE 15 — Market Opportunity

**[Heading]**

The market is moving. Fast.

**[Three data points, large numbers]**

**$500B+**
Global AI market in 2026. Every company is adopting AI-assisted development.

**70%+**
Of professional developers use AI coding tools daily (GitHub Copilot, Cursor, Claude Code, etc.)

**0**
Standardized platforms to train or assess this skill. That's the gap. That's VibeForces.

**[Bottom]**

LeetCode built a $1B+ business on DSA assessment. The vibe coding assessment market is wide open.

---

## SLIDE 16 — Why Now

**[Heading]**

Why this, why now

**[Four short points]**

- AI models just got good enough (GPT-4.1, GPT-5.4, Claude Opus) that vibe coding is no longer a toy — it's production-grade
- Companies are already hiring "AI-native developers" but have no way to test for it
- The gap between traditional coding interviews and actual job requirements has never been wider
- First-mover advantage in developer assessment platforms is massive — LeetCode, HackerRank, and CodeSignal all got there early for DSA. Nobody has claimed vibe coding yet.

---

## SLIDE 17 — Vision

**[Large centered text]**

Every developer assessment platform of the last decade tested one thing:

Can you write code from scratch?

**[Below, in purple]**

The question for the next decade:

Can you ship with AI?

**[Below, smaller]**

VibeForces is where that question gets answered.

---

## SLIDE 18 — Closing / CTA

**[Center, clean]**

# VibeForces

LeetCode for Vibecoders

**[Below, medium text]**

30 challenges · 5 categories · 3 difficulty tiers
Train. Compete. Get hired.

**[Below, smaller, gray]**

Live at: vibeforces.vercel.app

**[Bottom]**

Shivam Dwivedi · @dwivediishivam

---

## Notes for the Presentation Tool

- Total slides: 18
- Keep every slide to a maximum of 60% filled. Whitespace is a feature.
- The dark background should be consistent throughout (#030712 or very close)
- Slide 2 ("LeetCode is dead") should feel bold and punchy — biggest text on the slide
- Slides 3-5 (problem/insight) should build tension
- Slide 6 (introducing VibeForces) should feel like the reveal/relief
- Slides 7-10 (product) should feel clean and informative
- Slides 11-12 (tech) should be quick — don't linger here, the audience cares about the product, not the stack
- Slides 13-16 (future/business) should feel ambitious but grounded
- Slides 17-18 (vision/close) should feel inspiring and memorable
- No decorative elements. No stock photos. No illustrations. Just text, spacing, and the occasional icon or simple diagram.
- If using any imagery at all, use abstract geometric shapes or subtle gradient glows — nothing representational
- Every heading should be in the monospace font (JetBrains Mono or similar). Every body text in the sans-serif (Inter or similar).
- Purple is the only accent color. Use it sparingly — for emphasis words, key numbers, and the brand name.
