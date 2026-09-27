# Be-one — Product Overview

*Last updated: 2026-09-21 — reconciled with the Vault planning copy's 2026-07-15 Growth-removal decisions, which had diverged from this repo copy and never been synced back. Backlog section replaced with a pointer to `documents/story-tracker.md`. Wireframes section updated same day to match the shipped carousel map, confirmed live after the paused Supabase project was restored.*

---

## D&F Progress

Claude checks the content of each section below on PM session start and updates this table automatically.

| Stage | Status | Key Decision |
|-------|--------|-------------|
| Vision | ✅ | "Be-one makes company-to-individual OKR alignment visible on one screen — so alignment is something you see and feel, not something you dig for." |
| Personas | ✅ | Hiroshi Tanaka (transformation sponsor/exec) — needs trusted, evidence-based visibility into which products drive company direction; Satoshi Kimura (individual PM) — needs OKR check-ins that are fast, self-serving, and visibly connected to company direction |
| Problem Exploration | ✅ | 15 problems explored (7 Hiroshi, 8 Satoshi) |
| Problem Priority | ✅ | Make individual OKR check-ins low-friction enough to become a weekly habit, and turn that input into an aggregated qualitative view the sponsor trusts |
| Value Propositions | ✅ | Satoshi: 2-min habit-forming check-in that helps him plan too; Hiroshi: one trusted aggregated view of what's driving direction |
| Feature Exploration | ✅ | 15 features explored (7 Satoshi, 8 Hiroshi) |
| Feature Priority | ✅ | 10 MVP features (5 Satoshi, 5 Hiroshi); Growth OKR lane cut from MVP for now |
| Technical Feasibility | ✅ | No blocking issues on React + Supabase + Netlify; auth resolved as Supabase magic-link, restricted to Jess |
| Wireframes | ✅ | 3 MVP screens wireframed (OKR map, capture dialog, check-in); status wording aligned to "Behind"; growth removed from map and capture dialog (2026-07-15); OKR map description updated 2026-09-21 to match the shipped carousel (confirmed live) rather than the original 4-column grid |
| Story Mapping | ✅ | 5 activities, 12 MVP stories + 4 later stories mapped |
| Backlog | ✅ | 18 Iteration #1 rows (16 MVP stories/chores + 2 pre-existing infra chores) + 3 later stories + 8 built-beyond-scope items live in `documents/story-tracker.md` (migrated off Tracker Boot 2026-09-21; 2 rows still need Gherkin migrated — see file for the flagged gap) |

---

## Vision

Be-one makes company-to-individual OKR alignment visible on one screen — so alignment is something you see and feel, not something you dig for.

---

## Personas

### Hiroshi Tanaka

> "Every team has OKRs, but I lack the visibility into how individual or project efforts contribute to company growth or direction to review our strategy."

**Customer type:** Transformation sponsor / exec

**Facts**
- 52 years old
- VP of Digital Transformation at a 1,200-employee Japanese manufacturing firm
- Educates new joiners from scratch via bootcamp, assigns them to product teams every 6 months
- Runs 18 products for internal DX company-wide
- Meets with each product team lead every 2 weeks

**Behaviors**
- Asks every team lead in 1:1s for progress and blockers, referencing project info
- Flags projects falling behind to trigger follow-up actions
- Reviews project progress mid-term and sets next-term OKRs (deciding what to expand or slow down)
- Builds a manual PowerPoint rollup slide the night before quarterly board meetings
- Asks Bekind Labs consultants for a "translation" of team-level jargon into board-level language

**Needs**: A trusted, evidence-based picture of which of the 18 products are actually driving company direction — one he doesn't have to assemble by hand the night before a board review.
**Wants**: To catch falling-behind projects weeks earlier, set next-term OKRs on real evidence instead of gut feel, and stop manually translating team jargon into board language every quarter.

★ **Key Assumptions** *(to validate through customer interviews)*
- The board actually wants alignment visibility, not just a status report
- Hiroshi will trust qualitative (traffic-light + narrative) progress over the quantitative rollups he's used to for board reporting

---

### Satoshi Kimura

> "Every quarter I have to update my OKRs in a system that feels like paperwork, so I do it the night before the deadline and forget about it the rest of the time."

**Customer type:** Individual employee / team member managing their own OKRs

**Facts**
- 29 years old
- Product manager on one of the 18 internal DX product teams
- Reports directly to Hiroshi as project lead
- Spends about 20 minutes every quarter re-reading the OKR template instructions before filling it in
- Has never once looked back at last quarter's OKRs after submitting them

**Behaviors**
- Fills in his OKR form the night before the deadline, in one sitting
- Asks a teammate "wait, what did I even write for my OKR this quarter?" before a 1:1
- Keeps his real task list in a separate personal tool, disconnected from his official OKRs
- Forgets which company objective his OKR was supposed to link to
- Asks his team lead what to write because he's unsure what counts as a good OKR

**Needs**: OKR check-ins that take minutes, not twenty, and that visibly connect his own work to something Hiroshi cares about.
**Wants**: Check-ins that serve himself too — a way to organize his thoughts and plan next week — not just a compliance report upward.

★ **Key Assumptions** *(to validate through customer interviews)*
- A lighter, more personal check-in habit (planning next week, not just reporting up) would actually get adopted weekly, instead of the current once-a-quarter scramble
- Satoshi actually wants to see the line from his work to Hiroshi's company objectives — visibility is a motivator for him, not just for Hiroshi

---

## Problem Exploration

*(Results of divergent problem exploration for each persona)*

### Hiroshi Tanaka

1. **No aggregated view** — status only exists by asking each of 18 team leads individually in 1:1s; nothing synthesizes automatically.
2. **Manual rollup labor** — rebuilds a PowerPoint from scratch the night before every board meeting, re-deriving info he already gathered informally.
3. **Late risk signal** — a team falling behind only surfaces at his 2-week 1:1 cadence, not continuously — structurally weeks late on emerging problems.
4. **Translation burden** — has to convert (or pay consultants to convert) team-level jargon into board-level language by hand every quarter.
5. **Evidence-poor OKR setting** — sets next-term OKRs on scattered notes and gut feel, not a coherent trail of what actually happened last term.
6. **Busy vs. impactful blindness** — can't tell which of the 18 products are actually driving company direction vs. just staying active.
7. **No institutional memory** — re-assigns new bootcamp joiners every 6 months with no persistent record of why a given project matters or where it stands.

### Satoshi Kimura

1. **High friction to start** — 20 minutes just re-reading instructions before he can even begin filling in his OKR.
2. **Deadline-driven, no habit** — touched once a quarter, night before deadline, so no continuity forms between quarters.
3. **Memory loss** — can't recall his own last quarter's OKR even when asked directly in a 1:1.
4. **Disconnected task tracking** — his real day-to-day list lives in a separate personal tool; the "official" OKR doesn't reflect actual work.
5. **Broken traceability** — forgets which company objective his OKR was even supposed to link to; alignment quietly decays.
6. **Compliance framing, no personal payoff** — it's purely a reporting-upward chore, nothing in it helps him organize his own thinking or plan ahead.
7. **Unclear quality bar** — doesn't know what "counts as a good OKR," so he depends on his team lead instead of self-serving one.
8. **Growth work invisibility** *(assumption, not directly stated)* — may worry that personal growth not tied to a company KR won't be recognized, since the system implicitly seems to reward only company-linked contribution.

---

## Problem Priority

**Prioritized problem**: Be-one prioritizes making individual OKR check-ins low-friction enough to become a weekly habit, and turning that input into an aggregated qualitative view the sponsor actually trusts.

Ranked by which persona Key Assumption is riskiest (most foundational — if false, the most collapses):

1. **Habit-forming individual check-ins** (Satoshi) — addresses: High friction to start, Deadline-driven/no habit, Compliance framing/no personal payoff, Memory loss. Tests assumption: *"A lighter, more personal check-in habit would get adopted weekly."* Most upstream — without this, no data feeds anything else.
2. **Trustworthy aggregated view** (Hiroshi) — addresses: No aggregated view, Evidence-poor OKR setting, Busy vs. impactful blindness. Tests assumption: *"Hiroshi will trust qualitative (traffic-light + narrative) progress over quantitative rollups."* The product's core differentiation thesis.

**Deferred (not in MVP focus, revisit later)**:
- Broken traceability / translation burden — connective tissue between Satoshi's input and Hiroshi's view; relevant once habit + trust are proven.
- Board-level demand for alignment visibility (A1) — a GTM/client-validation question, not testable via the single-user MVP dogfood.

---

## Value Propositions

Format: `With Be-one, [persona] can [do what].`

- **With Be-one, Satoshi can** turn his OKR check-in into a 2-minute update that also helps him plan his own week — so he never re-reads instructions from scratch or forgets what he wrote.
- **With Be-one, Hiroshi can** see, in one trusted view, which of his 18 products are actually driving company direction — without hand-building a rollup the night before the board meeting.

---

## Feature Exploration

*(Full list of feature ideas to realize the value propositions)*

### For Satoshi's VP (habit-forming, low-friction check-in)

1. Fast capture/edit dialog — add or edit an OKR in under 30 seconds *(PRD: F5)*
2. Traffic-light status + short narrative note per check-in *(PRD: F3)*
3. Quarter framing with read-only history of past quarters *(PRD: F4)*
4. "My thread" view — his own OKRs and how they ladder up, without seeing the whole company map *(PRD: F1 visibility intent)*
5. Growth OKR lane (🌱) for personal growth not linked to any company KR *(PRD: F1)*
6. Auto-carry-forward — last quarter's OKR pre-filled as a starting draft
7. A "plan next week" prompt woven into the check-in itself, so it serves him, not just upward reporting

### For Hiroshi's VP (trusted aggregated view)

1. OKR map — one screen, whole system as connected layers *(PRD: F1 core screen)*
2. Two visually distinct link types: direct KR contribution vs. objective-level alignment *(PRD: F1)*
3. Traffic-light status aggregated across all objectives *(PRD: F3)*
4. Narrative check-in history log, visible per objective *(PRD: F3)*
5. Map view / my-thread view toggle *(PRD: F1)*
6. Filter/sort by risk status — surface red/yellow items first
7. Quarter-over-quarter comparison — a lightweight evidence trail for next-term OKR setting
8. Board-ready export/summary view *(serves the deferred A1 assumption — board demand)*

---

## Feature Priority

Filter rule: **must-have** = directly required to test the prioritized bet (habit-forming check-in + trusted aggregated view) within the MVP's solo dogfood; everything else is **good-to-have / later**.

**MVP** (10 features):
- Satoshi: fast capture/edit dialog (F5); traffic-light + narrative check-in (F3); quarter framing + read-only history (F4); "my thread" view (F1); "plan next week" prompt in the check-in
- Hiroshi: OKR map (F1); two visually distinct link types (F1); traffic-light status aggregated (F3); narrative check-in history log per objective (F3); map/my-thread view toggle (F1)

**Later**:
- Growth OKR lane (🌱) — **cut from MVP for now.** PRD updated 2026-07-15 to match (§5 F1 superseded note, §6 non-goal, §10 future candidate). Revisit post-MVP.
- ~~Auto-carry-forward of last quarter's OKR as a starting draft~~ — **dropped 2026-07-15** (PM decision; removed from backlog, not just deferred)
- Filter/sort by risk status
- Quarter-over-quarter comparison
- ~~Board-ready export/summary view~~ — **dropped 2026-07-15** (PM decision; removed from backlog, not just deferred)
- Search across users within the organization — **added 2026-07-15** (post-MVP, multi-user concern)

**Not in this list but shipped anyway (2026-09-21 reconciliation finding)**: an AI-generated check-in summary (`#200029543`/`#200029544`/`#200029613`) and a company-objective-carousel redesign of the map (`#200029565`/`#200029577`/`#200029527`) both merged to `main` without ever going through Feature Exploration/Priority. See `documents/story-tracker.md` → "Built beyond original MVP scope" for the full list and the open wireframe-conflict question.

---

## Technical Feasibility

**Stack**: React + Supabase + Netlify.

> ⚠️ **Stack conflict resolved**: the MVP PRD (§8, 2026-07-04) specifies local-first/no-server/localStorage with "no multi-user, auth, or real-time" as an explicit non-goal. CLAUDE.md specifies Supabase. Confirmed with Jess: **Supabase is current** — feasibility below assumes a real backend from day one, not localStorage.

| Feature | Feasible | Notes |
|---------|----------|-------|
| Fast capture/edit dialog (F5) | ✅ | Inline modal, single Supabase insert/update. No blocker. |
| Traffic-light + narrative check-in (F3) | ✅ | `check_ins` table: status enum + free-text note + timestamp. No blocker. |
| Quarter framing + read-only history (F4) | ✅ | `quarter_id` on objectives; past quarters filtered read-only in UI (client-side gate, not a schema concern). |
| "My thread" view (F1) | ✅ | Query objectives by `owner`, join up through `link.companyObjectiveId`/`companyKrId`. Straightforward relational query. |
| "Plan next week" prompt in check-in (new) | ✅ | Add a `plan_next` text column to `check_ins` (or reuse note field with a second prompt). Pure UI + schema addition. |
| OKR map — core screen (F1) | ✅ | Highest engineering effort of the 10, not a blocker: fetch all objectives+KRs+links, render as tree/radial SVG. PRD already flags "avoid heavy graph libraries unless needed" — a hand-rolled SVG layout is enough at MVP scale (single company + ~18 product teams' individual OKRs). |
| Two visually distinct link types (F1) | ✅ | `link` type field (`direct_kr` vs `objective_level`) drives CSS/stroke styling. Pure data + styling, no blocker. |
| Traffic-light status aggregated (F3) | ✅ | Client-side aggregation is fine at this data volume; a Postgres view is an option later if this becomes multi-tenant. |
| Narrative check-in history log per objective (F3) | ✅ | `check_ins` ordered by `created_at` filtered on `objective_id`. No blocker. |
| Map/my-thread view toggle (F1) | ✅ | Same data source, different client-side filter/state. No blocker. |

**Auth decision (resolved 2026-07-15)**: Supabase magic-link auth, restricted to Jess's email. Chosen over a hardcoded service key so no rework is needed if a second person (e.g. Hiroshi) is added post-MVP.

---

## Wireframes

Wireframes agreed for the 3 MVP screens. The standalone HTML design mock is the source of truth for structure and visual vocabulary; deviations from it are noted explicitly below.

### 1. OKR map (core screen)

The header row contains a "Map / My thread" segmented toggle, with Map as the default/active state, alongside a legend. The legend documents the two link types that connect a company objective or KR down to an individual objective — a solid line means "Direct KR link," a dashed line means "Objective-level" — and the five status dot colors: on track (green), at risk (amber), behind (red), not started (gray/muted), done (blue).

> ⚠️ **Superseded 2026-09-21** (confirmed live via `https://striketrio-beone.netlify.app/` after the Supabase project was restored from an inactivity pause). Originally specified a 4-column grid of company objective cards; a Chip/Dale build during the 2026-07-15→22 iteration replaced it with a single-objective carousel (`#200029565`, `#200029577`, `#200029527`) without this doc being updated to match — see `documents/story-tracker.md` for the full reconciliation. Description below now reflects what's actually built.

Company objectives are shown in a "Company Objectives" section as a **single-objective, ~70%-width centered carousel**, not a static grid — one objective card in view at a time, with a smooth slide animation moving between objectives (`#200029565`, `#200029577`). Each card carries a small category kicker label, the objective title, and a status dot in the top corner. Inside each card, the objective's key results are listed as rows: each KR row has its own status dot, the KR text, and a small cluster of avatar/owner initials showing which individuals are linked to that KR (`#200029149`). A static legend row near the top of the Map view content documents the two link types — solid = "Direct KR link," dashed = "Objective-level" (`#200029034`) — rather than per-connector lines drawn between cards.

Below the carousel sits a 2-card summary strip. The first card reads "Direct KR · N objectives" (the solid-link count); the second reads "Objective-level · N objectives" (the dashed-link count, with example badge text like "Aligns to O3 · People").

**Terminology (resolved 2026-07-15)**: the MVP PRD's original text called the red status "off track"; the reference design mock labels it "Behind." Wording is now aligned on "Behind" across the PRD and this doc, since the mock is the source of truth for status vocabulary.

**Growth removed from the map wireframe (2026-07-15, PM decision)**: the summary strip was originally 3 cards, with a third "Growth · N objectives" card. Since Growth OKR lane is cut from MVP scope, that third card is removed rather than kept as an always-empty placeholder.

**AI-generated KR summary (shipped, not originally wireframed)**: `#200029543`/`#200029544` added an AI-generated summary above a KR's check-in history. Confirmed live 2026-09-21. No Problem Exploration / Value Prop / Feature Priority entry exists for this — see `story-tracker.md` "Built beyond original MVP scope" for the flag.

### 2. Fast capture/edit dialog

A single modal dialog rendered as a centered overlay. It contains a title text input and a select/link field that attaches the objective to a company objective, optionally a specific KR (direct link) or just the objective itself (objective-level link). The dialog closes with Cancel and Save buttons. Design goal per the PRD: the whole flow takes under 30 seconds.

**Growth removed from the capture dialog (2026-07-15, PM decision)**: the field's helper text previously read "leave empty for a growth objective," implying a third link type with no company link at all. That contradicted PRD §6 (every individual Objective requires at least a company-Objective link in MVP) and is removed — the field now only ever produces a direct-KR or objective-level link, matching story 1b's AC.

### 3. Check-in flow

An inline "quick check-in" panel — not a separate modal. It expands in place, e.g. under an objective/KR card. The panel contains, top to bottom: a row of 5 status dot-selectors for on track / at risk / behind / not started / done, matching the OKR map's status vocabulary exactly; a one-line free-text input prompted "what changed? one line is enough"; a second one-line free-text input prompted "plan for next week"; Save check-in / Cancel buttons; and a small "under 30 seconds" hint text, consistent with the zero-friction design principle.

Past check-ins accumulate into a visible history log per objective/KR, and (as shipped, `#200029543`/`#200029544`) an AI-generated summary now appears above that history — not originally in this wireframe, see Feature Priority note above.

---

## Story Mapping

Stories arranged along a user-journey (Activity) axis, in the order a user actually moves through the product. MVP rows are the walking skeleton; Later rows are deferred (see Feature Priority). The Growth OKR lane doesn't appear at all — cut from MVP and parked in PRD §10 (Beyond MVP), not even a Later backlog item.

### 1. Set up an objective

- **MVP** — As Satoshi, I want to add or edit an OKR in one inline dialog, so that creating one takes under 30 seconds. (F5)
- **MVP** — As Satoshi, I want my individual objective to link to a company objective (optionally a specific KR), so that alignment is explicit the moment I create it.
- **MVP** — As Satoshi, I want to add one or more key results to an objective as free text (with an optional numeric target), so that outcome is captured qualitatively without being forced into a number. (F2)
- ~~**Later** — As Satoshi, I want last quarter's OKR pre-filled as a starting draft, so I don't start from a blank page each quarter.~~ **Dropped 2026-07-15.**

### 2. See the whole map

- **MVP** — As Hiroshi, I want to see all company objectives and their KRs on one screen, so I don't have to open each page individually. (F1 core)
- **MVP** — As Hiroshi, I want solid lines for direct-KR links and dashed lines for objective-level links, so I can see alignment strength at a glance.
- **MVP** — As Hiroshi, I want an aggregated traffic-light status across all objectives, so I know at a glance which of the 18 products need attention.
- **MVP** — As Hiroshi, I want a summary strip of direct-KR / objective-level counts, so I get overall alignment health without reading every card. *(Growth count excluded 2026-07-15.)*
- **Later** — As Hiroshi, I want to filter/sort by risk status, so red/yellow items surface first.
- ~~**Later** — As Hiroshi, I want a board-ready export view, so I stop hand-building a rollup slide.~~ **Dropped 2026-07-15.**

### 3. Drill into my thread

- **MVP** — As Satoshi, I want a "my thread" view of just my own objectives and how they connect upward, so I can focus without the whole map's noise.
- **MVP** — As Satoshi/Hiroshi, I want to toggle between map view and my-thread view, so I can switch between aggregate and personal perspective.
- **Later (added 2026-07-15)** — As Hiroshi, I want to search for a specific person by name, so I can jump straight to their objectives without scanning the whole map.

### 4. Check in on progress

- **MVP** — As Satoshi, I want to set a traffic-light status with a short note on why, so progress is expressed qualitatively, not by number. (F3)
- **MVP** — As Satoshi, I want a "plan for next week" prompt in the same check-in, so it helps me plan, not just report upward.
- **MVP** — As Hiroshi, I want the narrative check-in history log per objective, so I have an evidence trail when setting next-term OKRs.

### 5. Manage quarters

- **MVP** — As Jess, I want OKRs organized by quarter with past quarters read-only, so history is preserved without accidental edits. (F4)
- **Later** — As Hiroshi, I want quarter-over-quarter comparison, so I have a lightweight evidence trail for next-term OKR setting.

---

## Critical Paths & Backlog

**Moved to `documents/story-tracker.md`** (2026-09-21) — that file is now the single source of truth for the backlog, story state, Gherkin AC, chores, "Later" stories, dropped stories, built-beyond-scope items, and the Critical Paths list (the e2e-judgment reference point). It was rebuilt from `git log` + the dev track files, since Tracker Boot itself is retired and this repo's own copy of the backlog had gone stale.

Keep this document (`product-overview.md`) as the D&F record: vision, personas, problem/feature exploration and priority, technical feasibility, wireframes. Anything backlog- or story-shaped goes in `story-tracker.md` instead.
