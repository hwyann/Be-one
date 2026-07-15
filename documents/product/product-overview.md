# Be-one — Product Overview

*Last updated: 2026-07-15*

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
| Wireframes | ✅ | 3 MVP screens wireframed (OKR map, capture dialog, check-in); status wording aligned to "Behind"; map stays growth-aggregate-only |
| Story Mapping | ✅ | 5 activities, 12 MVP stories + 4 later stories mapped |
| Tracker Boot Backlog | ✅ | 12 MVP stories registered in project 100000292 (#200029030–#200029042) |

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
- Auto-carry-forward of last quarter's OKR as a starting draft
- Filter/sort by risk status
- Quarter-over-quarter comparison
- Board-ready export/summary view — weakest of the later items; serves the deferred A1 assumption (board demand)

---

## Technical Feasibility

**Stack**: React + Supabase + Netlify.

> ⚠️ **Stack conflict resolved**: the MVP PRD (§8, 2026-07-04) specifies local-first/no-server/localStorage with "no multi-user, auth, or real-time" as an explicit non-goal. CLAUDE.md specifies Supabase. Confirmed with Jess: **Supabase is current** — feasibility below assumes a real backend from day one, not localStorage. PRD §8 is now stale on this point and should be updated before Wireframes/Story Mapping so Dev tracks don't inherit the old localStorage assumption.

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

The body is a 4-column grid of company objective cards, one card per company objective (e.g. O1 Brand, O2 Discovery, O3 People, O4 Delivery). Each card carries a small category kicker label, the objective title, and a status dot in the top corner. Inside each card, the objective's key results are listed as rows: each KR row has its own status dot, the KR text, and a small cluster of avatar initials showing which individuals are linked to that KR.

Below the grid sits a 3-card summary strip. The first card reads "Direct KR · N objectives" (the solid-link count); the second reads "Objective-level · N objectives" (the dashed-link count, with example badge text like "Aligns to O3 · People"); the third reads "Growth · N objectives." The Growth card is visually distinct — a light blue tint — and carries the caption "Personal mastery, no company link — celebrated, never flagged," reflecting the design principle that growth OKRs are never treated as a warning.

**Terminology (resolved 2026-07-15)**: the MVP PRD's original text called the red status "off track"; the reference design mock labels it "Behind." Wording is now aligned on "Behind" across the PRD and this doc, since the mock is the source of truth for status vocabulary.

**Growth on the map (resolved 2026-07-15)**: the map screen stays aggregate-only for growth — it shows just the "Growth · N objectives" summary card, not full growth-objective cards. Full growth-objective cards remain a "My thread" (per-person) concern only. This supersedes the PRD §5 F1 wording that called for a dedicated growth lane on the map screen itself.

### 2. Fast capture/edit dialog

A single modal dialog rendered as a centered overlay. It contains a title text input and a select/link field that optionally attaches the objective to a specific KR (direct link) or just to a company objective (objective-level link). Helper text on that field clarifies "leave empty for a growth objective" — one field handles all three link types depending on what is chosen or left blank. The dialog closes with Cancel and Save buttons. Design goal per the PRD: the whole flow takes under 30 seconds.

### 3. Check-in flow

An inline "quick check-in" panel — not a separate modal. It expands in place, e.g. under an objective/KR card. The panel contains, top to bottom: a row of 5 status dot-selectors for on track / at risk / behind / not started / done, matching the OKR map's status vocabulary exactly; a one-line free-text input prompted "what changed? one line is enough"; a second one-line free-text input prompted "plan for next week"; Save check-in / Cancel buttons; and a small "under 30 seconds" hint text, consistent with the zero-friction design principle.

The "plan for next week" field is a new MVP feature added during Feature Priority and is not yet present in the older reference mock — a deliberate addition beyond what the mock currently shows.

Past check-ins accumulate into a visible history log per objective/KR. The history is read access only and is not part of this quick check-in interaction.

---

## Story Mapping

Stories arranged along a user-journey (Activity) axis, in the order a user actually moves through the product. MVP rows are the walking skeleton; Later rows are deferred (see Feature Priority). The Growth OKR lane doesn't appear at all — cut from MVP and parked in PRD §10 (Beyond MVP), not even a Later backlog item.

### 1. Set up an objective

- **MVP** — As Satoshi, I want to add or edit an OKR in one inline dialog, so that creating one takes under 30 seconds. (F5)
- **MVP** — As Satoshi, I want my individual objective to link to a company objective (optionally a specific KR), so that alignment is explicit the moment I create it.
- **Later** — As Satoshi, I want last quarter's OKR pre-filled as a starting draft, so I don't start from a blank page each quarter.

### 2. See the whole map

- **MVP** — As Hiroshi, I want to see all company objectives and their KRs on one screen, so I don't have to open each page individually. (F1 core)
- **MVP** — As Hiroshi, I want solid lines for direct-KR links and dashed lines for objective-level links, so I can see alignment strength at a glance.
- **MVP** — As Hiroshi, I want an aggregated traffic-light status across all objectives, so I know at a glance which of the 18 products need attention.
- **MVP** — As Hiroshi, I want a summary strip of direct-KR / objective-level / growth counts, so I get overall alignment health without reading every card.
- **Later** — As Hiroshi, I want to filter/sort by risk status, so red/yellow items surface first.
- **Later** — As Hiroshi, I want a board-ready export view, so I stop hand-building a rollup slide.

### 3. Drill into my thread

- **MVP** — As Satoshi, I want a "my thread" view of just my own objectives and how they connect upward, so I can focus without the whole map's noise.
- **MVP** — As Satoshi/Hiroshi, I want to toggle between map view and my-thread view, so I can switch between aggregate and personal perspective.

### 4. Check in on progress

- **MVP** — As Satoshi, I want to set a traffic-light status with a short note on why, so progress is expressed qualitatively, not by number. (F3)
- **MVP** — As Satoshi, I want a "plan for next week" prompt in the same check-in, so it helps me plan, not just report upward.
- **MVP** — As Hiroshi, I want the narrative check-in history log per objective, so I have an evidence trail when setting next-term OKRs.

### 5. Manage quarters

- **MVP** — As Jess, I want OKRs organized by quarter with past quarters read-only, so history is preserved without accidental edits. (F4)
- **Later** — As Hiroshi, I want quarter-over-quarter comparison, so I have a lightweight evidence trail for next-term OKR setting.

---

## Critical Paths

*(**The reference point for deciding when e2e fires** — `/story` self-check cross-checks each story against this list to decide whether e2e applies.)*

**Definition**: A Critical Path is not a "user journey" — it's the **end-to-end integration spine the product depends on**. It covers user journeys (URL → screen), but also the **data spine** (server integrations like webhook → ingest → DB that a user never directly walks, yet are catastrophic when broken).

**Slot criterion — integration-risk filter**: Only paths whose **core risk lives at an integration point (realtime, transport, webhook, deploy, browser, etc.) that units can't catch** make this list. Pure logic, isolated UI, and simple translate+render are **excluded even if they're user journeys** — units catch those.

> ⚠️ **Inflation boundary**: Once this list starts mirroring the feature list, you're back to "e2e on every story" (the very trap we escaped). Start **conservatively, with just a seed** (usually one), and grow it **only when a regression actually occurs and proves the need**. A backbone journey doesn't earn a slot automatically — it must pass the integration-risk filter.

Format: `**[path name]**: [one-line end-to-end flow] — [e2e spec file path or "none yet"]`

Examples:
- **cube arrival**: URL open → realtime event received → cube renders on screen — `e2e/cube-arrival.spec.js` *(realtime/transport integration risk — units can't catch it)*
- *(data spine example: event ingest — webhook → Edge Function → DB load. Not a user journey, but high integration risk makes it a slot candidate)*

-

---

## Tracker Boot Backlog

**Status**: 12 MVP stories registered in Tracker Boot project 100000292 (2026-07-15).

| Story | ID |
|-------|----|
| 1a — Add or edit an OKR in one inline dialog | #200029030 |
| 1b — Link an individual objective to a company objective on creation | #200029031 |
| 2a — View all company objectives and their KRs on one screen | #200029032 |
| 2b — Show solid lines for direct-KR links and dashed lines for objective-level links | #200029034 |
| 2c — Display aggregated traffic-light status across all objectives | #200029035 |
| 2d — Show a summary strip of direct-KR / objective-level / growth counts | #200029036 |
| 3a — View only my own objectives in a "my thread" view | #200029037 |
| 3b — Toggle between map view and my-thread view | #200029038 |
| 4a — Set a traffic-light status with a short note on a check-in | #200029039 |
| 4b — Include a "plan for next week" prompt in the check-in | #200029040 |
| 4c — View narrative check-in history log per objective | #200029041 |
| 5a — Organize OKRs by quarter with past quarters read-only | #200029042 |

**e2e judgment (all 12)**: `e2e: none — Critical Paths list is empty; no reference point exists yet. Per aabt-workflow's anti-inflation guidance, don't grow the list speculatively — revisit once a regression or real usage need proves a path belongs there.`

**Estimation flag for IPM**: story 2a (OKR map core screen) is the largest of the 12 — already flagged in Technical Feasibility as the highest-effort item. Consider whether it needs splitting at IPM estimation time (e.g. company-objective-cards-only vs. KR-rows-with-avatar-clusters as a follow-on).

---

### 1. Set up an objective

**1a.**
As Satoshi, I want to add or edit an OKR in one inline dialog, so that creating one takes under 30 seconds.

```gherkin
Feature: Fast capture and edit of an OKR

  Scenario: Create a new objective in under 30 seconds
    Given Satoshi has the OKR map open
    When he opens the new objective dialog, enters a title, and saves
    Then the objective appears on the map immediately with no further required fields

  Scenario: Edit an existing objective inline
    Given an objective already exists
    When Satoshi opens it from the map and changes its title
    Then the updated title is reflected immediately without a page reload
```

**1b.**
As Satoshi, I want my individual objective to link to a company objective (optionally a specific KR), so that alignment is explicit the moment I create it.

```gherkin
Feature: Individual objective alignment link

  Scenario: A company-level link is required
    Given Satoshi is creating a new individual objective
    When he leaves the link field empty and tries to save
    Then the save is blocked with a message that a company objective link is required

  Scenario: Objective links directly to a KR
    Given Satoshi is creating a new individual objective
    When he selects a specific company KR as the link
    Then the objective is saved with link type "direct KR"
```

### 2. See the whole map

**2a.**
As Hiroshi, I want to see all company objectives and their KRs on one screen, so I don't have to open each page individually.

```gherkin
Feature: OKR map single-screen view

  Scenario: View all company objectives without navigating
    Given company objectives and their KRs exist for the current quarter
    When Hiroshi opens the OKR map
    Then all company objectives and their KRs are visible on one screen with no required navigation into sub-pages
```

**2b.**
As Hiroshi, I want solid lines for direct-KR links and dashed lines for objective-level links, so I can see alignment strength at a glance.

```gherkin
Feature: Visually distinct link types

  Scenario: Direct KR link renders as solid
    Given an individual objective links directly to a company KR
    When the map renders that connection
    Then it displays as a solid, prominent line

  Scenario: Objective-level link renders as dashed
    Given an individual objective links only to a company objective, with no specific KR
    When the map renders that connection
    Then it displays as a dashed, secondary-style line
```

**2c.**
As Hiroshi, I want an aggregated traffic-light status across all objectives, so I know at a glance which of the 18 products need attention.

```gherkin
Feature: Aggregated status across objectives

  Scenario: Company objective shows an owner-set status
    Given a company objective has multiple KRs with different statuses
    When Hiroshi views that objective's card on the map
    Then it shows a single owner-set traffic-light status, not an auto-computed rollup
```

**2d.**
As Hiroshi, I want a summary strip of direct-KR / objective-level / growth counts, so I get overall alignment health without reading every card.

```gherkin
Feature: Alignment summary strip

  Scenario: Summary counts reflect current data
    Given some individual objectives are direct-KR linked, some are objective-level linked, and some are growth-only
    When Hiroshi views the map
    Then the summary strip shows accurate counts for each of the three categories
```

### 3. Drill into my thread

**3a.**
As Satoshi, I want a "my thread" view of just my own objectives and how they connect upward, so I can focus without the whole map's noise.

```gherkin
Feature: My thread view

  Scenario: View only my own objectives
    Given Satoshi has several individual objectives
    When he switches to "my thread" view
    Then only his own objectives and their upward connections are shown, with no other contributors' objectives visible
```

**3b.**
As Satoshi/Hiroshi, I want to toggle between map view and my-thread view, so I can switch between aggregate and personal perspective.

```gherkin
Feature: View toggle

  Scenario: Switch between map and my-thread views
    Given a user is viewing the OKR map
    When they select the "my thread" toggle
    Then the screen switches to the my-thread view without losing the selected quarter
```

### 4. Check in on progress

**4a.**
As Satoshi, I want to set a traffic-light status with a short note on why, so progress is expressed qualitatively, not by number.

```gherkin
Feature: Quick check-in

  Scenario: Save a status and note
    Given Satoshi is checking in on an objective
    When he selects a traffic-light status and enters a short note, then saves
    Then the new status and note appear as the latest entry in that objective's check-in history
```

**4b.**
As Satoshi, I want a "plan for next week" prompt in the same check-in, so it helps me plan, not just report upward.

```gherkin
Feature: Plan-next-week prompt in check-in

  Scenario: Capture a next-week plan alongside the check-in
    Given Satoshi is filling out a quick check-in
    When he enters text in the "plan for next week" field and saves
    Then the plan text is stored alongside that check-in entry
```

**4c.**
As Hiroshi, I want the narrative check-in history log per objective, so I have an evidence trail when setting next-term OKRs.

```gherkin
Feature: Check-in history log

  Scenario: View accumulated check-in history for an objective
    Given an objective has multiple past check-ins
    When Hiroshi opens that objective's history log
    Then all past check-ins are listed in chronological order with their status and note
```

### 5. Manage quarters

**5a.**
As Jess, I want OKRs organized by quarter with past quarters read-only, so history is preserved without accidental edits.

```gherkin
Feature: Quarter framing and read-only history

  Scenario: Past quarter is read-only
    Given a quarter has ended and a new quarter has started
    When a user views the past quarter's OKRs
    Then no edit or check-in controls are available, only viewing

  Scenario: Switch the active quarter
    Given multiple quarters of data exist
    When a user selects a different quarter
    Then the map/thread view updates to show that quarter's objectives
```
