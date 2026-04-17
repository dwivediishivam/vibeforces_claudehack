# VibeForces — Complete UI Design Specification

> **Tagline**: LeetCode for Vibecoders
> **Purpose**: Hackathon prototype — must look polished, real, and production-ready
> **Target**: Hand this to any AI coding tool (Cursor, Bolt, v0, etc.) to build pixel-perfect UI

---

## 1. Tech Stack & Libraries (Mandatory)

### Framework
- **Next.js 14+** with App Router
- **TypeScript** throughout
- **Tailwind CSS v4** for all styling (no custom CSS files unless absolutely necessary)

### Component Library
- **shadcn/ui** — install and use these specific components:
  - `Button`, `Card`, `Input`, `Label`, `Badge`, `Avatar`, `Tabs`, `Table`, `Dialog`, `DropdownMenu`, `Select`, `Separator`, `Skeleton`, `Toast`, `Tooltip`, `Progress`
- Use the **"new-york"** style variant of shadcn/ui (it's more minimal/sharp than "default")
- Set shadcn theme to **dark mode** as default

### Fonts (Critical — This Defines the Brand Feel)
Import from Google Fonts in `layout.tsx`:
```
JetBrains Mono — for headings, brand name, numbers, code, and anything that should feel "techy"
Inter — for body text, descriptions, UI labels
```
Load weights: JetBrains Mono (400, 500, 600, 700, 800), Inter (400, 500, 600)

CSS variables:
```css
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Rule**: ALL headings (h1-h6), the logo, numbers/scores/ratings, nav items, and buttons use `font-mono`. Body text, descriptions, and form labels use `font-sans`.

### Icons
- **Lucide React** (`lucide-react`) — already included with shadcn/ui
- Use Lucide icons everywhere. Do NOT use emoji in the actual app UI (except in challenge content itself). Keep the UI professional.
- Specific icon mapping:
  - Dashboard: `LayoutDashboard`
  - Challenges: `Swords`
  - Leaderboard: `Trophy`
  - Contests: `Flame`
  - Profile: `User`
  - Settings: `Settings`
  - Spec-to-Prompt: `Mic`
  - Token Golf: `Zap`
  - Bug Fix: `Bug`
  - Architecture Pick: `GitBranch`
  - UI Reproduction: `Palette`
  - Easy: `Circle` (green)
  - Medium: `Circle` (yellow)
  - Hard: `Circle` (red)
  - Timer: `Clock`
  - Score: `Target`

### Animation
- **Framer Motion** (`framer-motion`) for page transitions and micro-interactions
- Keep animations subtle and fast (150-300ms). This is a tool, not a portfolio site.

### Additional Libraries
- **Monaco Editor** (`@monaco-editor/react`) — for the prompt input editor
- **react-hot-toast** or shadcn Toast — for notifications
- **recharts** — if any charts are needed (leaderboard trends, score breakdowns)
- **next-themes** — for dark mode (default and only mode for now)

---

## 2. Color System

This is a **dark-first** UI. There is NO light mode. Everything is dark.

### Core Palette (Tailwind classes)

```
Background Layer 0 (page bg):      bg-[#030712]         — near black, the deepest layer
Background Layer 1 (cards/panels):  bg-[#0a0f1e]         — very dark blue-black
Background Layer 2 (elevated):      bg-[#111827]         — dark gray (card surfaces)
Background Layer 3 (hover/active):  bg-[#1e293b]         — medium dark (interactive states)

Border Default:                     border-[#1e293b]      — subtle, barely visible
Border Hover:                       border-[#334155]      — slightly more visible on hover

Text Primary:                       text-[#f1f5f9]        — near white (headings, important text)
Text Secondary:                     text-[#94a3b8]        — muted gray (descriptions, labels)
Text Tertiary:                      text-[#64748b]        — very muted (timestamps, hints)

Accent Primary (Brand):             text-[#a78bfa] / bg-[#7c3aed]  — PURPLE (violet-500/violet-600)
Accent Primary Hover:               bg-[#6d28d9]          — darker purple on hover
Accent Primary Glow:                shadow-[0_0_30px_rgba(139,92,246,0.3)] — subtle purple glow

Success:                            text-[#4ade80] / bg-[#166534]  — green
Error/Danger:                       text-[#f87171] / bg-[#991b1b]  — red
Warning:                            text-[#fbbf24] / bg-[#92400e]  — amber/gold
Info:                               text-[#60a5fa] / bg-[#1e3a5f]  — blue
```

### Accent Color Rule
**Purple (#7c3aed / #a78bfa) is the ONLY accent color.** Every interactive element, active state, link, CTA button, and brand element uses purple. Do not introduce other accent colors for UI elements. Green/red/yellow are ONLY for semantic meaning (success/error/warning/difficulty).

### Difficulty Colors
```
Easy:    text-[#4ade80] bg-[#052e16] border-[#166534]    — green family
Medium:  text-[#fbbf24] bg-[#1c1917] border-[#92400e]    — amber family
Hard:    text-[#f87171] bg-[#1c1917] border-[#991b1b]    — red family
```

### Rating Colors (Codeforces-style)
```
800-1199:   text-[#94a3b8]   — gray (Newbie)
1200-1399:  text-[#4ade80]   — green (Apprentice)
1400-1599:  text-[#60a5fa]   — blue (Specialist)
1600-1899:  text-[#a78bfa]   — purple (Expert)
1900+:      text-[#fbbf24]   — gold (Master)
```

---

## 3. Global Layout Structure

### Page Shell
Every page (except landing) follows this structure:

```
┌──────────────────────────────────────────────────────────────────┐
│ TOP NAV BAR (h-16, fixed, bg-[#030712]/80 backdrop-blur-xl)     │
│ ┌────────┐                              ┌──────┐ ┌────────────┐ │
│ │ LOGO   │    (empty space)             │ Bell │ │ Avatar ▾   │ │
│ └────────┘                              └──────┘ └────────────┘ │
├────────────┬─────────────────────────────────────────────────────┤
│            │                                                     │
│  SIDEBAR   │              MAIN CONTENT AREA                      │
│  (w-64)    │              (flex-1, p-8)                          │
│            │                                                     │
│  Dashboard │              Scrollable content here                │
│  Challenges│                                                     │
│  Leaderbd  │                                                     │
│  Contests  │                                                     │
│  ────────  │                                                     │
│  Profile   │                                                     │
│  Settings  │                                                     │
│            │                                                     │
│            │                                                     │
│ ┌────────┐ │                                                     │
│ │User    │ │                                                     │
│ │ info   │ │                                                     │
│ └────────┘ │                                                     │
└────────────┴─────────────────────────────────────────────────────┘
```

### Top Nav Bar
- Height: `h-16` (64px)
- Background: `bg-[#030712]/80` with `backdrop-blur-xl` (semi-transparent with blur)
- Fixed position, full width, z-50
- Left: Logo (see logo section)
- Right: Notification bell icon (Lucide `Bell`), User avatar dropdown (shadcn `DropdownMenu`)
- Border bottom: `border-b border-[#1e293b]`

### Sidebar
- Width: `w-64` (256px)
- Background: `bg-[#0a0f1e]`
- Fixed height: `h-[calc(100vh-4rem)]` (full height minus nav)
- Border right: `border-r border-[#1e293b]`
- Padding: `p-4`
- Navigation items use `font-mono` at `text-sm`
- Active item: `bg-[#7c3aed]/10 text-[#a78bfa] font-semibold` with a 3px left border `border-l-[3px] border-[#7c3aed]`
- Hover: `bg-[#1e293b] text-[#f1f5f9]`
- Section dividers: `Separator` component from shadcn with `text-[11px] uppercase tracking-[2px] text-[#64748b]` section titles
- Bottom: User card showing avatar (initials in circle), name, email — compact

### Main Content Area
- `flex-1` taking remaining width
- Padding: `p-8` (32px on all sides)
- Max-width: `max-w-7xl` centered with `mx-auto`
- Scrollable independently

---

## 4. Logo & Brand

### Logo Design
The logo is TEXT-ONLY. No icon, no symbol. Just the name in the right font.

```
VibeForces
```

- Font: `JetBrains Mono`, weight 800 (extra bold)
- Size in navbar: `text-xl`
- The word "Vibe" is in `text-[#f1f5f9]` (white)
- The word "Forces" is in `text-[#a78bfa]` (purple)
- No gap between the words — it's one word visually: `Vibe` + `Forces`
- On hover: subtle purple glow effect on "Forces" (`drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]`)
- Letter-spacing: `tracking-tight`

### Tagline
When shown (landing page, about section):
```
LeetCode for Vibecoders
```
- Font: `Inter`, weight 400
- Size: `text-sm`
- Color: `text-[#64748b]`
- Positioned directly below the logo

---

## 5. Landing Page (Public — No Auth)

This is the FIRST thing anyone sees. It must be stunning but minimal.

### Structure (top to bottom):

#### 5A. Nav Bar (Landing-specific)
```
┌─────────────────────────────────────────────────────────────────────┐
│  VibeForces                                    [Log In]  [Sign Up] │
└─────────────────────────────────────────────────────────────────────┘
```
- Same blur nav as app, but no sidebar
- Right side: Ghost button "Log In" (`variant="ghost"`) + Filled button "Sign Up" (`variant="default"` purple)
- Sticky/fixed

#### 5B. Hero Section
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    (vertical center, text-center)                    │
│                                                                     │
│            ┌─────────────────────────────────┐                      │
│            │ ✦ Season 1 — First Contest Live │   ← badge/pill      │
│            └─────────────────────────────────┘                      │
│                                                                     │
│           Train Your Prompt Instincts.          ← h1, huge         │
│                                                                     │
│      The competitive platform where vibe coders                     │
│      train, rank, and prove they can ship.       ← subtitle        │
│                                                                     │
│        [ Start Practicing ]   [ View Challenges ]  ← two buttons   │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Badge/Pill** at top:
- Small rounded pill: `rounded-full border border-[#334155] px-4 py-1.5`
- Text: `text-xs font-mono text-[#94a3b8]`
- The "Season 1" part in `text-[#a78bfa]`
- Lucide `Sparkles` icon before text, size 14, purple

**H1 Heading**:
- Font: `JetBrains Mono`, weight 800
- Size: `text-5xl md:text-7xl` (48px mobile, 72px desktop)
- Color: gradient text — `bg-gradient-to-b from-white to-[#64748b]` with `bg-clip-text text-transparent`
- Line height: `leading-[1.1]`
- Max-width: `max-w-3xl mx-auto`

**Subtitle**:
- Font: `Inter`, weight 400
- Size: `text-lg`
- Color: `text-[#94a3b8]`
- Max-width: `max-w-xl mx-auto`
- Line height: `leading-relaxed`
- Margin top: `mt-6`

**Buttons**:
- Margin top: `mt-10`
- Flex row with `gap-4`, centered
- "Start Practicing": Purple filled, `bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-mono font-semibold px-8 py-3 rounded-xl text-base`
- "View Challenges": Ghost/outlined, `border border-[#334155] hover:bg-[#1e293b] text-[#f1f5f9] font-mono font-semibold px-8 py-3 rounded-xl text-base`

**Background effect for hero**:
- A large radial gradient glow behind the heading, centered, purple-blue:
  `bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15)_0%,transparent_70%)]`
- This creates a subtle atmospheric glow without being distracting
- Additionally, a very faint dot grid pattern overlay on the entire page:
  Create a tiny 1px dot repeated every 24px at opacity 0.03 using a pseudo-element or CSS background

#### 5C. Scope Badge
Between hero and features, centered:

```
┌──────────────────────────────────────────────────────┐
│  Currently: SD-1 & SD-2 Challenges                   │
│  Coming Soon: SD-3, Senior, Staff — System Design    │
└──────────────────────────────────────────────────────┘
```

- This is a simple `Card` from shadcn, centered, `max-w-lg mx-auto`
- Background: `bg-[#111827]` with `border border-[#1e293b]`
- Two lines of text:
  - First: `text-sm font-mono text-[#f1f5f9]` with a green `●` dot before "Currently"
  - Second: `text-sm font-mono text-[#64748b]` with a yellow `●` dot before "Coming Soon"
- Rounded: `rounded-xl`
- Padding: `px-6 py-4`

#### 5D. Challenge Category Cards
```
┌─────────────────────────────────────────────────────────────────────┐
│                     5 Challenge Categories                          │
│              Master every dimension of vibe coding                  │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │  🎯 Mic  │  │  ⚡ Zap  │  │  🐛 Bug  │  │ 🔀 Git  │  │ 🎨   │ │
│  │  Spec    │  │  Token   │  │  Bug     │  │  Arch   │  │ UI   │ │
│  │  to      │  │  Golf    │  │  Fix     │  │  Pick   │  │ Repr │ │
│  │  Prompt  │  │          │  │          │  │         │  │      │ │
│  │          │  │  desc    │  │  desc    │  │  desc   │  │ desc │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- Section title: `text-3xl font-mono font-bold text-center text-[#f1f5f9]`
- Section subtitle: `text-base text-[#94a3b8] text-center mt-2 mb-12`
- Grid: `grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4` (5 columns on desktop, 3 on tablet, 1 on mobile)
- Each card:
  - `bg-[#111827] border border-[#1e293b] rounded-2xl p-6`
  - Hover: `hover:border-[#334155] hover:bg-[#1e293b] transition-all duration-200`
  - Hover also: `hover:-translate-y-1` (subtle lift)
  - Icon: Lucide icon inside a colored rounded square (`w-12 h-12 rounded-xl flex items-center justify-center`)
    - Each category gets a unique background tint for its icon container:
      - Spec-to-Prompt: `bg-[#7c3aed]/10` icon in `text-[#a78bfa]`
      - Token Golf: `bg-[#eab308]/10` icon in `text-[#fbbf24]`
      - Bug Fix: `bg-[#ef4444]/10` icon in `text-[#f87171]`
      - Architecture Pick: `bg-[#3b82f6]/10` icon in `text-[#60a5fa]`
      - UI Reproduction: `bg-[#22c55e]/10` icon in `text-[#4ade80]`
  - Title: `text-base font-mono font-semibold text-[#f1f5f9] mt-4`
  - Description: `text-sm text-[#94a3b8] mt-2 leading-relaxed`
  - Description text for each:
    - "Listen to a spec. Craft the prompt. Get scored on clarity and output."
    - "Hit the target output in the fewest tokens. Efficiency is everything."
    - "Spot the bug, describe it precisely. 'Fix this' scores zero."
    - "Three AI-generated options. Rank them. Prove your judgment."
    - "See a screenshot. One prompt. Reproduce it."

#### 5E. Stats Bar
A simple horizontal bar showing platform numbers (seeded for realism):

```
┌─────────────────────────────────────────────────────────────────────┐
│     30 Challenges      15+ Vibecoders       5 Categories     1 Contest │
└─────────────────────────────────────────────────────────────────────┘
```

- Flex row, centered, `gap-12 md:gap-16`
- Each stat:
  - Number: `text-2xl font-mono font-bold text-[#f1f5f9]`
  - Label: `text-sm text-[#64748b] mt-1`
- No card background — just floating text on the page bg
- Dividers between stats: thin `|` in `text-[#1e293b]` or use `Separator` vertical

#### 5F. How It Works
```
┌─────────────────────────────────────────────────────────────────────┐
│                         How It Works                                │
│                                                                     │
│     ①                      ②                      ③                │
│  Pick a Challenge      Write Your Prompt      Get Your Score       │
│  Browse 30 challenges  Craft precise prompts   AI judges your      │
│  across 5 categories   using GPT-4.1          output and ranks     │
│  and 3 difficulty      as your execution      you against other    │
│  levels.               engine.                vibecoders.          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- Three columns, centered
- Step number: Large circle with number, `w-12 h-12 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#a78bfa] font-mono font-bold flex items-center justify-center text-lg`
- Step title: `text-lg font-mono font-semibold text-[#f1f5f9] mt-4`
- Step description: `text-sm text-[#94a3b8] mt-2 max-w-[240px] leading-relaxed`

#### 5G. Contest Banner (Important — creates urgency)
```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  🔥                                                             │ │
│ │  First Ever VibeForces Contest                                  │ │
│ │  April 18, 2026 · 8:00 PM IST · 120 minutes                   │ │
│ │                                                                 │ │
│ │  [ Join Contest → ]                                             │ │
│ │                                                                 │ │
│ │  ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░  142 registered                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

- Full-width card with special styling:
  - `bg-gradient-to-r from-[#7c3aed]/10 via-[#111827] to-[#7c3aed]/10`
  - `border border-[#7c3aed]/30 rounded-2xl p-8`
- Lucide `Flame` icon, `text-[#f97316]` (orange), size 28
- Title: `text-2xl font-mono font-bold text-[#f1f5f9] mt-3`
- Date/time: `text-base font-mono text-[#94a3b8] mt-2`
- Button: Purple filled CTA (same style as hero primary button)
- Registration count: `text-sm text-[#64748b]` with a small progress bar
- If contest is in the future, show a countdown timer: `3h 42m 15s` in `font-mono text-xl text-[#a78bfa]`

#### 5H. Suggest an Idea Section
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Have a challenge idea?                            │
│           Help us build the future of vibe coding tests             │
│                                                                     │
│     ┌─────────────────────────────────────────────┐                 │
│     │  Describe your challenge idea...            │                 │
│     │                                             │                 │
│     └─────────────────────────────────────────────┘                 │
│                                    [ Submit Idea ]                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- Section title: same style as other section titles
- Textarea: shadcn `Textarea` component, `bg-[#111827] border-[#1e293b]`
- Button: Purple, but smaller `px-6 py-2`
- Max-width: `max-w-2xl mx-auto`

#### 5I. Footer
```
┌─────────────────────────────────────────────────────────────────────┐
│  VibeForces                              Challenges  Leaderboard    │
│  LeetCode for Vibecoders                 Contests    About          │
│                                                                     │
│  © 2026 VibeForces. Built for the vibes.                           │
└─────────────────────────────────────────────────────────────────────┘
```

- `bg-[#030712] border-t border-[#1e293b]`
- Padding: `py-12 px-8`
- Logo on left (smaller), links on right
- Copyright: `text-xs text-[#64748b] mt-8`

---

## 6. Authentication Pages

### Login Page (`/login`)
- Centered card on plain `bg-[#030712]` background
- Card: `max-w-md mx-auto bg-[#111827] border border-[#1e293b] rounded-2xl p-8`
- Logo at top of card (centered)
- Title: "Welcome back" — `text-2xl font-mono font-bold text-[#f1f5f9]`
- Subtitle: "Sign in to your account" — `text-sm text-[#94a3b8]`
- Fields: Email, Password (shadcn `Input` with `Label`)
- Input styling: `bg-[#0a0f1e] border-[#1e293b] text-[#f1f5f9] focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]`
- "Forgot password?" link: `text-xs text-[#a78bfa]` aligned right
- Submit button: full width, purple
- Below: "Don't have an account? Sign up" — `text-sm text-[#94a3b8]` with "Sign up" as `text-[#a78bfa]` link
- NO role selection on login — role is detected from profile

### Signup Page (`/signup`)
- Same card layout as login
- Title: "Create your account"
- **Role selector at the top** — IMPORTANT, this is how roles are assigned:
  ```
  ┌──────────────────────┬──────────────────────┐
  │    🎯 I'm a          │    🏢 I'm a          │
  │    Learner            │    Recruiter          │
  │    Train & compete    │    Test candidates    │
  └──────────────────────┴──────────────────────┘
  ```
  - Two cards side by side (toggle selection)
  - Selected: `bg-[#7c3aed]/10 border-[#7c3aed]`
  - Unselected: `bg-[#0a0f1e] border-[#1e293b]`
  - Font: `font-mono text-sm`
- Fields: Username, Display Name, Email, Password
- Submit button: "Create Account" — purple, full width
- Below: "Already have an account? Log in"

---

## 7. Learner Dashboard (`/learner/dashboard`)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Welcome back, {name}                     ┌───────────────────────┐ │
│  Your vibe coding journey                 │  CONTEST BANNER       │ │
│                                           │  Starts in 3h 42m     │ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │  [ Join → ]           │ │
│  │ Score    │ │ Solved   │ │ Rank     │  └───────────────────────┘ │
│  │ 4,832   │ │ 18/30   │ │ #7      │                             │
│  │ ↑12.5%  │ │ 60%     │ │ ↑2      │                             │
│  └──────────┘ └──────────┘ └──────────┘                            │
│                                                                     │
│  Recent Submissions                        Category Progress        │
│  ┌──────────────────────────────────┐     ┌───────────────────────┐ │
│  │ ● Token Golf — LRU Cache        │     │ Spec-to-Prompt ████░ │ │
│  │   Score: 8.4 · 2 hours ago      │     │ Token Golf     ███░░ │ │
│  │ ● Bug Fix — React State         │     │ Bug Fix        ██░░░ │ │
│  │   Score: 7.1 · 5 hours ago      │     │ Arch Pick      ████░ │ │
│  │ ● Spec — CSV Summarizer         │     │ UI Repro       █░░░░ │ │
│  │   Score: 9.2 · yesterday        │     └───────────────────────┘ │
│  └──────────────────────────────────┘                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Stats Cards (top row)
- Grid: `grid grid-cols-3 gap-4`
- Each card: `bg-[#111827] border border-[#1e293b] rounded-xl p-6`
- Stat value: `text-3xl font-mono font-bold text-[#f1f5f9]`
- Stat label: `text-sm text-[#64748b] mt-1`
- Change indicator: `text-xs font-mono` in green (↑) or red (↓)

### Contest Banner (top right)
- Similar to landing page but compact
- `bg-gradient-to-r from-[#7c3aed]/10 to-transparent border border-[#7c3aed]/20 rounded-xl p-4`
- Countdown in `font-mono text-lg text-[#a78bfa]`

### Recent Submissions
- shadcn `Card` with a list
- Each item: flex row with category dot (colored), challenge title, score badge, time ago
- Score: `Badge` component from shadcn with appropriate color based on score (8+ green, 5-7 yellow, <5 red)

### Category Progress
- Each category: name + progress bar
- Use shadcn `Progress` component
- Bar fill color: purple (`bg-[#7c3aed]`)
- Show "4/6" solved count next to bar

---

## 8. Challenge Listing Page (`/learner/challenges`)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Challenges                                                         │
│  30 challenges across 5 categories                                  │
│                                                                     │
│  ┌─────────┐ ┌─────────────────────────────────────┐               │
│  │ All     │ │ [Search challenges...]               │               │
│  │ Spec    │ └─────────────────────────────────────┘               │
│  │ Token   │                                                        │
│  │ Bug Fix │  ┌─────────────────────────────────────────────────┐   │
│  │ Arch    │  │ ● [Easy]  FizzBuzz with a Twist      900   →   │   │
│  │ UI      │  │ ● [Easy]  CSV Data Summarizer       1000   →   │   │
│  │         │  │ ● [Med]   REST API Endpoint Design  1300   →   │   │
│  │ ─────── │  │ ● [Med]   Markdown to HTML          1400   →   │   │
│  │ Easy    │  │ ● [Hard]  Real-time Chat Server     1700   →   │   │
│  │ Medium  │  │ ● [Hard]  Task Scheduler            1800   →   │   │
│  │ Hard    │  └─────────────────────────────────────────────────┘   │
│  └─────────┘                                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Left Filter Sidebar
- Not a separate sidebar — a filter panel within the content area
- `w-48` fixed, with category filters and difficulty filters
- Category filters: clickable list items, active has purple left border
- Difficulty filters: checkboxes with colored labels
- Use `font-mono text-sm` for all filter labels

### Challenge List
- Each challenge is a row/card:
  - `bg-[#111827] border border-[#1e293b] rounded-xl p-5 hover:border-[#334155] transition-all cursor-pointer`
  - Left: Category icon (Lucide, colored) + Difficulty badge (shadcn `Badge`)
  - Center: Title (`font-mono font-semibold text-[#f1f5f9]`), brief description below (`text-sm text-[#94a3b8]`)
  - Right: Rating number (`font-mono font-bold` in Codeforces color), chevron right icon
  - If solved by user: green checkmark overlay on the left

### Difficulty Badges
- shadcn `Badge` component with variants:
  - Easy: `bg-[#052e16] text-[#4ade80] border-[#166534] font-mono text-xs`
  - Medium: `bg-[#1c1917] text-[#fbbf24] border-[#92400e] font-mono text-xs`
  - Hard: `bg-[#1c1917] text-[#f87171] border-[#991b1b] font-mono text-xs`

---

## 9. Challenge Solve Page (`/learner/challenges/[id]`)

This page varies by challenge category. Here's the layout for each:

### Common Elements (All Categories)

**Top Bar within content area:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Back to Challenges    │  FizzBuzz with a Twist   [Easy] [900]  │
│                           │                    Currently: GPT-4.1 ▾ │
└─────────────────────────────────────────────────────────────────────┘
```
- Back link: `text-sm text-[#94a3b8] hover:text-[#f1f5f9]` with Lucide `ArrowLeft`
- Challenge title: `text-xl font-mono font-bold`
- Difficulty badge + Rating badge
- **Model Badge** (TOP RIGHT, ALWAYS VISIBLE):
  - `bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-1.5`
  - "Currently:" in `text-xs text-[#64748b]`
  - "GPT-4.1" in `text-sm font-mono font-semibold text-[#a78bfa]`
  - Small Lucide `Info` icon that shows tooltip: "More models coming soon. Your prompts are executed by this model."

### 9A. Spec-to-Prompt Challenge Layout

```
┌──────────────────────────────┬──────────────────────────────────────┐
│     LEFT PANEL (40%)         │      RIGHT PANEL (60%)               │
│                              │                                      │
│  🔊 Voice Note               │   Write Your Prompt                  │
│  ┌────────────────────────┐  │   ┌──────────────────────────────┐  │
│  │ ▶ ░░░░░░░░░░░░ 0:00   │  │   │                              │  │
│  │   One-time listen only │  │   │   (Monaco Editor)            │  │
│  └────────────────────────┘  │   │                              │  │
│                              │   │                              │  │
│  📋 Supplementary Info       │   │                              │  │
│  (charts/tables for med/hard)│   └──────────────────────────────┘  │
│                              │   Tokens: 47   Characters: 234      │
│                              │                                      │
│                              │             [ Submit Prompt → ]      │
│                              │                                      │
│                              │   ─── After submission ───           │
│                              │                                      │
│                              │   AI Response                        │
│                              │   ┌──────────────────────────────┐  │
│                              │   │ (syntax highlighted output)  │  │
│                              │   └──────────────────────────────┘  │
│                              │                                      │
│                              │   Score: 8.5/10                      │
│                              │   ┌──────────────────────────────┐  │
│                              │   │ Breakdown: ...               │  │
│                              │   └──────────────────────────────┘  │
└──────────────────────────────┴──────────────────────────────────────┘
```

**Voice Player Component**:
- Card: `bg-[#0a0f1e] border border-[#1e293b] rounded-xl p-6`
- Play button: large circle, `w-14 h-14 rounded-full bg-[#7c3aed] flex items-center justify-center`
  - Lucide `Play` icon (white, 24px) before playing
  - Animated sound wave bars during playback (3 bars animating height)
  - Lucide `Check` icon after played
- Progress bar: thin line, `h-1 bg-[#1e293b] rounded-full` with fill `bg-[#7c3aed]`
- Duration: `font-mono text-sm text-[#94a3b8]`
- Warning text after played: "Voice note played. You may not replay." in `text-xs text-[#f87171]`
- State management: once played, disable button, show checkmark, cannot replay

**For Plan+Act mode (medium/hard)**:
- The right panel has TWO tabs: "Plan" and "Act"
- Plan tab: write plan prompt, submit, see AI plan response
- Act tab: unlocks only after plan is submitted. Shows the plan response above the editor. Write act prompt, submit.
- Use shadcn `Tabs` component

**Monaco Editor**:
- Theme: `vs-dark` (dark mode)
- Language: `plaintext` (it's prompt writing, not code)
- Min height: `300px`
- Font: JetBrains Mono, 14px
- Border: `border border-[#1e293b] rounded-xl overflow-hidden`
- Below editor: token count and char count in `text-xs font-mono text-[#64748b]`

### 9B. Token Golf Challenge Layout

```
┌──────────────────────────────┬──────────────────────────────────────┐
│     LEFT PANEL (45%)         │      RIGHT PANEL (55%)               │
│                              │                                      │
│  🎯 Target Output            │   Write Your Prompt                  │
│  ┌────────────────────────┐  │   ┌──────────────────────────────┐  │
│  │                        │  │   │ (Monaco Editor)              │  │
│  │  (syntax-highlighted   │  │   │                              │  │
│  │   code block showing   │  │   └──────────────────────────────┘  │
│  │   the target)          │  │   Tokens: 23 / 200 max              │
│  │                        │  │   ▓▓▓▓▓▓▓░░░░░░░░░░░░░ 11.5%       │
│  │                        │  │                                      │
│  └────────────────────────┘  │             [ Submit → ]             │
│                              │                                      │
│  Description:                │   ─── After submission ───           │
│  "Write a Python function    │                                      │
│  called reverse_string..."   │   Correctness: 95%  ✓               │
│                              │   Tokens Used: 23                    │
│  Max Tokens: 200             │   Time: 45s                          │
│                              │                                      │
└──────────────────────────────┴──────────────────────────────────────┘
```

- Target output displayed in a code block with syntax highlighting
- Token counter shows current/max with a progress bar
- Progress bar changes color as you approach the limit (green → yellow → red)

### 9C. Bug Fix Challenge Layout

```
┌──────────────────────────────┬──────────────────────────────────────┐
│     LEFT PANEL (50%)         │      RIGHT PANEL (50%)               │
│                              │                                      │
│  🐛 Broken Code              │   Describe the Fix                   │
│  ┌────────────────────────┐  │   ┌──────────────────────────────┐  │
│  │  1 │ def binary_search │  │   │ (Monaco Editor)              │  │
│  │  2 │   left = 0        │  │   │                              │  │
│  │  3 │   right = len(arr)│  │   │ Be specific! "Fix this"     │  │
│  │  4 │   while left <=   │  │   │ scores zero. Tell the AI    │  │
│  │  5 │     mid = ...     │  │   │ exactly what's wrong and    │  │
│  │  ...                   │  │   │ where.                       │  │
│  └────────────────────────┘  │   │                              │  │
│                              │   └──────────────────────────────┘  │
│  Language: Python            │                                      │
│  Task: This binary search    │   ⚡ Future: Token count & AI time   │
│  should find a target in     │      will also be scored             │
│  a sorted array.             │                                      │
│                              │             [ Submit Fix → ]         │
│                              │                                      │
└──────────────────────────────┴──────────────────────────────────────┘
```

- Code display: Monaco Editor in READ-ONLY mode with line numbers prominent
- Placeholder text in the prompt editor explaining what's expected
- "Future" badge: `bg-[#1e293b] text-[#94a3b8] text-xs font-mono px-2 py-1 rounded`

### 9D. Architecture Pick Challenge Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  📋 Scenario                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ "You're building a personal blog with posts, categories, and   ││
│  │  comments. Expected traffic is ~100 daily visitors..."         ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Rank these options from BEST (1) to WORST (3):                    │
│                                                                     │
│  ┌─ Option A ──────────────────────────────────────── [  1 ▾ ] ──┐ │
│  │ PostgreSQL with Supabase/Neon                                  │ │
│  │ Relational data, good for structured content, well-supported   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Option B ──────────────────────────────────────── [  2 ▾ ] ──┐ │
│  │ MongoDB Atlas                                                  │ │
│  │ Flexible schema, good for varied content, easy to start        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Option C ──────────────────────────────────────── [  3 ▾ ] ──┐ │
│  │ Redis                                                          │ │
│  │ Blazing fast reads, in-memory, great for caching               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│                                       [ Submit Ranking → ]          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- Scenario card: `bg-[#0a0f1e] border border-[#1e293b] rounded-xl p-6`
- Option cards: `bg-[#111827] border border-[#1e293b] rounded-xl p-6`
  - Each has a shadcn `Select` dropdown on the right for rank (1, 2, 3)
  - When a rank is selected, the card border changes to reflect position:
    - Rank 1: `border-[#4ade80]` (green — best)
    - Rank 2: `border-[#fbbf24]` (amber — middle)
    - Rank 3: `border-[#f87171]` (red — worst)
- Option label: "Option A" in `text-xs font-mono text-[#64748b] uppercase tracking-wider`
- Option title: `text-lg font-mono font-semibold text-[#f1f5f9]`
- Option description: `text-sm text-[#94a3b8]`
- **After submission**: Show correct ranking with explanations revealed below each option

### 9E. UI Reproduction Challenge Layout

```
┌──────────────────────────────┬──────────────────────────────────────┐
│     LEFT PANEL (50%)         │      RIGHT PANEL (50%)               │
│                              │                                      │
│  🎨 Reproduce This UI        │   Write Your Prompt                  │
│  ┌────────────────────────┐  │   ┌──────────────────────────────┐  │
│  │                        │  │   │ (Monaco Editor)              │  │
│  │   (target screenshot   │  │   │                              │  │
│  │    displayed as an     │  │   │ Describe the UI in a single  │  │
│  │    image)              │  │   │ prompt. GPT-4.1 will         │  │
│  │                        │  │   │ generate HTML/CSS from it.   │  │
│  │                        │  │   │                              │  │
│  │                        │  │   └──────────────────────────────┘  │
│  └────────────────────────┘  │   Tokens: 89                        │
│                              │                                      │
│  One-shot only.              │             [ Submit → ]             │
│  Fewer tokens = better.      │                                      │
│                              │   ─── After submission ───           │
│                              │                                      │
│                              │   Your Result:                       │
│                              │   ┌──────────────────────────────┐  │
│                              │   │ (generated screenshot)       │  │
│                              │   └──────────────────────────────┘  │
│                              │                                      │
│                              │   Similarity: 78%   Tokens: 89      │
└──────────────────────────────┴──────────────────────────────────────┘
```

- Target screenshot: `rounded-xl border border-[#1e293b] overflow-hidden` containing an `<img>` tag
- After submission: side-by-side comparison with slider (or just stacked)
- Similarity displayed as a large percentage with color:
  - 90%+: green
  - 70-89%: yellow
  - <70%: red

---

## 10. Score Display Component (After Submission)

Appears at the bottom of every challenge after submission:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Your Score                                                         │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │          │  │          │  │          │  │                  │   │
│  │   8.5    │  │   92%    │  │   1:23   │  │    Combined      │   │
│  │  /10     │  │  tokens  │  │  time    │  │    847 pts       │   │
│  │ Accuracy │  │ effic.   │  │          │  │    Rank: #4      │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
│                                                                     │
│  Feedback                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ "Good prompt clarity. You correctly identified all             ││
│  │  requirements. Consider being more specific about              ││
│  │  the output format to improve accuracy."                       ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  [ Try Again ]  [ Next Challenge → ]                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- Use Framer Motion to animate the score counting up (0 → 8.5)
- Score cards: same styling as dashboard stat cards
- Combined score: larger card, `bg-[#7c3aed]/10 border-[#7c3aed]/30`
- Feedback: `bg-[#0a0f1e] border-[#1e293b] rounded-xl p-4 text-sm text-[#94a3b8] italic`
- Buttons: "Try Again" ghost, "Next Challenge" purple filled

---

## 11. Leaderboard Page (`/learner/leaderboard`)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Leaderboard                              [All Time ▾] [Weekly ▾]  │
│  Top vibecoders ranked by combined score                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ #   User              Score    Accuracy  Tokens   Solved       ││
│  │ ─────────────────────────────────────────────────────────────── ││
│  │ 1   🥇 Alex Kim       9,847    94.2%    12,450   28/30        ││
│  │ 2   🥈 Sarah Patel    9,231    91.8%    14,200   27/30        ││
│  │ 3   🥉 Marcus Johnson 8,654    89.5%    15,800   26/30        ││
│  │ 4      Luna Chen      7,982    87.1%    16,300   25/30        ││
│  │ 5      Raj Deshmukh   7,445    85.3%    17,100   24/30        ││
│  │ ...                                                            ││
│  │ ─────────────────────────────────────────────────────────────── ││
│  │ 7   ⭐ You (Jane)     5,678    82.1%    18,500   19/30        ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- Use shadcn `Table` component
- Rank column:
  - #1: `text-[#fbbf24] font-bold` (gold)
  - #2: `text-[#d1d5db] font-bold` (silver)
  - #3: `text-[#b45309] font-bold` (bronze)
  - Others: `text-[#94a3b8]`
- User column: Avatar (initials circle with gradient backgrounds for top 3) + username
  - Top 3 avatars: gold/silver/bronze gradient backgrounds
  - Others: `bg-[#334155]`
- Score column: `font-mono font-bold text-[#a78bfa]`
- Other columns: `font-mono text-[#94a3b8]`
- Current user's row: highlighted with `bg-[#7c3aed]/5` and a star icon before their name
- Current user always visible (sticky row at bottom if they're beyond visible page)
- Hover on any row: `bg-[#1e293b]`
- Filter tabs: shadcn `Tabs` in top right — "All Time", "This Week", "Today"

---

## 12. Contest Pages

### Contest List (`/learner/contests`)
```
┌─────────────────────────────────────────────────────────────────────┐
│  Contests                                                           │
│                                                                     │
│  UPCOMING                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  🔥 VibeForces Launch Challenge                                 ││
│  │  April 18, 2026 · 8:00 PM IST · 120 min · 5 challenges        ││
│  │  Starts in: 03:42:15                       [ Register → ]      ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  PAST                                                               │
│  (empty for prototype — or show "No past contests yet")            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- Upcoming contests: `border-l-4 border-[#7c3aed]` left accent
- Past contests: `opacity-60`
- Countdown: `font-mono text-xl text-[#a78bfa]` with live ticking animation

### Contest Arena (`/learner/contests/[id]`)
When contest is active:
```
┌─────────────────────────────────────────────────────────────────────┐
│  VibeForces Launch Challenge          Time Left: 01:42:15    🔴LIVE│
│                                                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                         │
│  │  1  │ │  2  │ │  3  │ │  4  │ │  5  │   ← challenge nav       │
│  │  ✓  │ │  ●  │ │     │ │     │ │     │                         │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                         │
│                                                                     │
│  (Selected challenge loads below, same layout as practice)         │
│                                                                     │
│  ┌───────── LIVE LEADERBOARD (collapsible sidebar right) ─────────┐│
│  │ 1. Alex Kim      2,450                                         ││
│  │ 2. You           1,890                                         ││
│  │ 3. Sarah P       1,650                                         ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  🔒 Proctoring — Coming Soon                                       │
│  Full proctoring with tab detection and AI monitoring               │
│  will be available in a future update.                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- Timer: `font-mono text-2xl text-[#f87171]` when under 10 min, `text-[#f1f5f9]` otherwise
- Pulsing red dot animation next to "LIVE": `animate-pulse bg-red-500 w-2.5 h-2.5 rounded-full`
- Challenge nav: numbered circles, green check if solved, filled purple if current, outlined if unsolved
- Live leaderboard: collapsible panel on the right, `w-64`, real-time updates
- Proctoring banner: `bg-[#111827] border border-dashed border-[#334155] rounded-xl p-4 text-sm text-[#64748b]` with Lucide `Lock` icon

---

## 13. Recruiter Pages

### Recruiter Dashboard (`/recruiter/dashboard`)
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Recruiter Dashboard                        [ + Create Test ]       │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                          │
│  │ Tests    │  │ Cands    │  │ Avg      │                          │
│  │ Created  │  │ Tested   │  │ Score    │                          │
│  │ 3       │  │ 12      │  │ 7.2     │                          │
│  └──────────┘  └──────────┘  └──────────┘                          │
│                                                                     │
│  Your Tests                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Frontend Dev Assessment  · 4 challenges · 60 min · 5 taken     ││
│  │ Junior Vibe Coder Test   · 6 challenges · 90 min · 3 taken     ││
│  │ Quick Screen             · 2 challenges · 30 min · 4 taken     ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Create Test (`/recruiter/create-test`)
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Create a Test                                                      │
│                                                                     │
│  Title: [________________________]                                  │
│  Time Limit: [ 60 minutes ▾ ]                                      │
│                                                                     │
│  Select Challenges                                                  │
│  ┌──────────────────────────┬──────────────────────────────────────┐│
│  │  Available (30)          │  Selected (0)                        ││
│  │                          │                                      ││
│  │  Filter: [All ▾] [All ▾] │  (Drag here or click + to add)     ││
│  │                          │                                      ││
│  │  ☐ FizzBuzz       [Easy] │                                      ││
│  │  ☐ CSV Summarizer [Easy] │                                      ││
│  │  ☐ REST API       [Med]  │                                      ││
│  │  ...                     │                                      ││
│  └──────────────────────────┴──────────────────────────────────────┘│
│                                                                     │
│  🔒 Proctoring: Coming Soon                                        │
│  [ ] Enable proctoring (available in future update)                │
│                                                                     │
│                                        [ Create Test & Get Link → ] │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- Two-column challenge picker: Available (left) → Selected (right)
- Click a challenge to move it to selected
- Selected shows challenges in order with remove button
- Time limit: shadcn `Select` with options 30, 60, 90, 120 minutes

### Test Results (`/recruiter/tests/[id]`)
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Frontend Dev Assessment                                            │
│  Share Link: vibeleet.vercel.app/test/a8f3c2d1    [ Copy 📋 ]     │
│                                                                     │
│  Candidates                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Name           Score   Accuracy  Time      Status               ││
│  │ ──────────────────────────────────────────────────────────────  ││
│  │ Alice Wong     8.2     91%       42 min    Completed            ││
│  │ Bob Smith      6.7     78%       58 min    Completed            ││
│  │ Carol Davis    —       —         —         In Progress          ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- Share link with copy button
- Candidate table with status indicators
- Click candidate row to see per-challenge breakdown

---

## 14. Admin Pages

### Admin Dashboard (`/admin/dashboard`)
- Platform stats: total users, total submissions, active contests
- Quick links to create contest, view leaderboard

### Create Contest (`/admin/contests/create`)
Similar to recruiter test creation but with:
- Date/time picker for scheduling
- Duration selector
- Public/private toggle
- Same challenge selector UI

---

## 15. Loading & Empty States

### Loading
- Use shadcn `Skeleton` components everywhere
- Challenge cards: skeleton rectangles matching card dimensions
- Leaderboard: skeleton rows
- Dashboard stats: skeleton circles for numbers
- Never show a blank page — always skeleton

### Empty States
When a list is empty, show a centered illustration + message:
```
┌─────────────────────────────────────────┐
│                                         │
│            (Lucide icon, 48px,          │
│             text-[#334155])             │
│                                         │
│       No submissions yet                │
│    Start solving challenges to          │
│    see your progress here.              │
│                                         │
│      [ Browse Challenges → ]            │
│                                         │
└─────────────────────────────────────────┘
```
- Icon: relevant Lucide icon (e.g., `Inbox` for empty lists, `Trophy` for empty leaderboard)
- Title: `font-mono font-semibold text-[#f1f5f9]`
- Description: `text-sm text-[#94a3b8]`
- CTA button: ghost style

---

## 16. Responsive Behavior

### Breakpoints (Tailwind defaults)
```
sm:  640px   — mobile landscape
md:  768px   — tablet
lg:  1024px  — laptop
xl:  1280px  — desktop
2xl: 1536px  — large desktop
```

### Rules
- Sidebar: hidden on mobile/tablet (`hidden lg:block`), replaced with hamburger menu (shadcn `Sheet` slide-in)
- Challenge grid: 1 col mobile, 2 cols tablet, varies on desktop
- Challenge solve page: stacked on mobile (left panel on top, right panel below), side-by-side on desktop
- Leaderboard table: horizontal scroll on mobile with sticky rank + name columns
- Landing page: single column on mobile, stack all sections vertically
- Navbar: logo + hamburger on mobile, full nav on desktop

---

## 17. Micro-interactions & Animations (Framer Motion)

### Page Transitions
```tsx
// Wrap each page content:
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
  {children}
</motion.div>
```

### Score Counter Animation
When score is revealed after submission, count up from 0:
```tsx
// Use framer-motion useSpring or a simple interval
// 0 → 8.5 over 1.5 seconds with easing
```

### Card Hover
```css
transition: all 150ms ease;
/* On hover: */
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
border-color: #334155;
```

### Button Press
```css
/* On active/click: */
transform: scale(0.97);
transition: transform 100ms ease;
```

### Timer Pulse (Contest)
When timer is under 5 minutes:
```css
animation: pulse 2s ease-in-out infinite;
color: #f87171; /* red */
```

### Live Leaderboard Updates
When a new score comes in, the row should:
1. Flash briefly with `bg-[#7c3aed]/10`
2. Animate position change if ranking shifts (slide up/down)

---

## 18. Toast Notifications

Use a consistent toast system (react-hot-toast or shadcn Toast):

| Event | Toast Message | Style |
|-------|--------------|-------|
| Submission received | "Prompt submitted. Evaluating..." | Default (info) |
| Score ready | "Score: 8.5/10 — Nice work!" | Success (green) |
| Error | "Something went wrong. Try again." | Error (red) |
| Contest starting | "Contest starts in 60 seconds!" | Warning (amber) |
| Test time running out | "5 minutes remaining!" | Warning (amber) |
| Link copied | "Link copied to clipboard" | Default |

Toast position: bottom-right
Font: `font-mono text-sm`
Background: `bg-[#1e293b] border border-[#334155]`

---

## 19. Key Interaction Patterns

### Challenge Submission Flow (User Experience)
1. User writes prompt → clicks "Submit"
2. Button shows loading spinner, text changes to "Evaluating..."
3. Prompt editor becomes read-only (locked)
4. After 2-5 seconds (AI processing): AI response appears with fade-in animation
5. After another 1-2 seconds (judging): Score section appears with count-up animation
6. "Try Again" and "Next Challenge" buttons appear
7. Leaderboard position updates in sidebar/toast

### Voice Note Interaction
1. Play button is prominent and pulsing gently (inviting click)
2. User clicks → audio starts, play button becomes animated wave bars
3. Progress bar fills, timer counts up
4. Audio ends → icon changes to checkmark, message appears
5. Prompt editor auto-focuses (cursor moves there)

### Recruiter Test Link Flow
1. Candidate opens share link
2. If not logged in → redirect to login with return URL
3. After login → test info page (title, time limit, # of challenges)
4. "Start Test" button → confirmation dialog: "Once started, the timer cannot be paused."
5. User confirms → timer starts, first challenge loads
6. Navigate between challenges freely (numbered nav at top)
7. Timer runs out → auto-submit all answers, show summary

---

## 20. Critical UI Text & Copy

### Landing Page
- Hero H1: "Train Your Prompt Instincts."
- Hero subtitle: "The competitive platform where vibe coders train, rank, and prove they can ship."
- CTA 1: "Start Practicing"
- CTA 2: "View Challenges"

### Scope Badge
- Line 1: "● Currently: SD-1 & SD-2 Level Challenges"
- Line 2: "● Coming Soon: SD-3, Senior & Staff — System Design & Architecture"

### Model Badge
- "Currently: GPT-4.1"
- Tooltip: "All prompts are executed by this model. More AI models coming soon."

### Proctoring Badge
- "🔒 Proctoring — Coming Soon"
- "Full proctoring with tab-switch detection, screen recording, and AI-powered anomaly detection will be available in a future update."

### Empty Dashboard (New User)
- "Welcome to VibeForces"
- "Start your first challenge to begin ranking."
- [Start First Challenge →]

### Footer
- "© 2026 VibeForces. Built for the vibes."

---

## 21. File & Asset Requirements

Before building, ensure these assets are ready:

1. **Voice note MP3 files** (6 files) — generated via OpenAI TTS API
2. **UI target screenshots** (6 PNG files) — rendered from HTML/CSS via Puppeteer script
3. **Favicon** — simple "VF" monogram in purple on dark background, 32x32 and 192x192
4. **OG Image** — for social sharing: 1200x630, dark bg, "VibeForces" logo + tagline

---

## Summary of Libraries to Install

### Frontend (`frontend/package.json`)
```bash
# Core
npx create-next-app@latest frontend --typescript --tailwind --app --eslint

# UI
npx shadcn-ui@latest init  # choose "new-york" style, dark theme
npx shadcn-ui@latest add button card input label badge avatar tabs table dialog dropdown-menu select separator skeleton toast tooltip progress textarea

# Fonts
npm install @fontsource/jetbrains-mono @fontsource/inter
# OR use next/font with Google Fonts (preferred)

# Animation
npm install framer-motion

# Editor
npm install @monaco-editor/react

# State
npm install zustand

# Auth
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Icons (comes with shadcn but ensure installed)
npm install lucide-react

# Charts (optional, for dashboard)
npm install recharts

# Theme
npm install next-themes

# Toast
npm install react-hot-toast
# OR use shadcn's built-in toast (already added above)
```

### Backend (`backend/package.json`)
```bash
npm init -y
npm install express cors helmet dotenv
npm install @supabase/supabase-js
npm install openai
npm install puppeteer
npm install -D typescript @types/express @types/cors @types/node ts-node nodemon
```
