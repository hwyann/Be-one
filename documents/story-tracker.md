---
type: reference-doc
project: Be-one
created: 2026-09-21
tags: [be-one, story-tracker]
---

# Be-one — Story Tracker

*Replaces Tracker Boot (project 100000292) as of 2026-09-21.* Source of truth for backlog, story state, and acceptance criteria — Chip and Dale read AC directly from here, not from a copy in a track file. Rebuilt from `git log` + the two dev track files' "Completed Stories" sections, since the Vault's planning copy of this backlog had gone stale (only 16 of the 25 IDs actually shipped were tracked there) and Tracker Boot itself isn't reachable from this session.

**State flow — Feature/Bug**: `Unstarted → Started → Finished → Delivered → Accepted`
**State flow — Chore**: `Unstarted → Started → Accepted`

**Reality check (2026-09-21)**: `main` is 42 commits / 23 story-or-chore IDs ahead of the `production` git branch. **Confirmed live**: the Supabase backend (project `iieyhzojogjikjcwlcxn`) had auto-paused from inactivity — restored 2026-09-21. Once restored, `https://striketrio-beone.netlify.app/` loads cleanly (login → carousel map, no console errors), confirming Netlify is in fact serving `main`'s HEAD at that URL — i.e. the `netlify.toml` misconfig (`[context.production] branch = "main"`) means "production" has effectively been `main` all along, not the stale `production` git branch. So everything below is visually confirmed live, even though nothing has gone through a formal Accept. Still worth fixing `netlify.toml`/the dashboard setting properly (see delivery-playbook) so Accept has real teeth going forward — right now the acceptance/production distinction doesn't functionally exist.

---

## Iteration #1 — MVP backlog (as originally mapped)

| # | Story | Type | State | e2e |
|---|-------|------|-------|-----|
| 0 | Create core database schema in Supabase + wire Supabase client | Chore | **Accepted** (in production) | none |
| — | Add magic-link auth restricted to jessica@bekindlabs.com (`#200029150`) | Feature | Delivered | none |
| — | Add `promote.yml` to auto-publish production on Accept (`#200029152`) | Chore | Delivered | none |
| 1a | Add or edit an OKR in one inline dialog (`#200029030`) | Feature | Delivered | none |
| 1b | Link an individual objective to a company objective on creation (`#200029031`) | Feature | Delivered | none |
| 1d | Add one or more key results to an objective (`#200029259`) | Feature | Delivered | none |
| 2a-1 | Render company objective cards on the OKR map (`#200029148`) | Feature | Delivered | none |
| 2a-2 | Add KR rows with avatar/owner-initial clusters to objective cards (`#200029149`) | Feature | Delivered | none |
| 2b | Show solid/dashed legend for direct-KR vs objective-level links (`#200029034`) | Feature | Delivered *(see note)* | none |
| 2c | Display aggregated (owner-set) traffic-light status across objectives (`#200029035`) | Feature | Delivered | none |
| 2d | Show a summary strip of direct-KR / objective-level counts (`#200029036`) | Feature | Delivered | none |
| 3a | View only my own objectives in a "my thread" view (`#200029037`) | Feature | Delivered | none |
| 3b | Toggle between map view and my-thread view (`#200029038`) | Feature | Delivered | none |
| 4a | Set a traffic-light status with a short note on a check-in (`#200029039`) | Feature | Delivered | none |
| 4b | Include a "plan for next week" prompt in the check-in (`#200029040`) | Feature | Delivered | none |
| 4c | View narrative check-in history log per objective (`#200029041`) | Feature | Delivered | none |
| 5a-1 | Quarter selector dropdown in header filters the OKR view (`#200029165`) | Feature | **Accepted** (merged direct to `main` `04a48d5`, no PR/review — demo-build process, 2026-09-23) | none |
| 5a-2 | Hide edit and check-in controls when viewing a past quarter (`#200029166`) | Feature | **Accepted** (merged direct to `main` `82b89de`, no PR/review — demo-build process, 2026-09-23). Original MVP backlog (5a-1/5a-2) now fully complete. | none |

**Note on 2b**: Chip's/Dale's track files still listed `#200029523`/`#200029034` as "Current Story" (not cleared) even though both are already on `main` (commits `#28`, `#29`). Per PM decision 2026-09-21, treated as Delivered and both track files' `## Current Story` sections have been cleared — see "Track file cleanup" below.

**5a-1/5a-2 status**: no commits reference these IDs anywhere in `git log`. These are the only two originally-mapped MVP stories that are genuinely not started. **This is where "start dev" should resume.**

---

## Built beyond original MVP scope (needs retroactive stories)

These shipped to `main` but were never in the 10-feature MVP list, Story Mapping, or the wireframes. No Gherkin AC exists for any of them. Flagging rather than inventing AC after the fact — write these properly (aabt-workflow §4 `/story` procedure) before treating them as done-done.

| Story (from commit message) | ID | Type | State |
|---|---|---|---|
| Company Objectives section title above the OKR map grid + rename map toggle | `#200029527` | Feature | Delivered *(no story written)* |
| Single-objective ~70%-width carousel core on the OKR map | `#200029565` | Feature | Delivered *(no story written — see wireframe conflict below)* |
| Smooth slide animation between OKR carousel objectives | `#200029577` | Feature | Delivered *(no story written)* |
| `kr_summaries` table + `generate-kr-summary` Edge Function (AI infra) | `#200029543` | Chore | Delivered *(no story written)* |
| AI-generated summary above a KR's check-in history | `#200029544` | Feature | Delivered *(no story written)* |
| Extend `key_results` schema with `individual_objective_id` | `#200029521` | Chore | Delivered *(no story written)* |
| Extend `check_ins` schema with `key_result_id` | `#200029523` | Chore | Delivered *(no story written)* |
| Fix: `generate-kr-summary` Edge Function missing CORS headers | `#200029613` | Bug | Delivered *(no story written)* |

> ✅ **Wireframe conflict resolved 2026-09-21** — PM confirmed the live carousel (`https://striketrio-beone.netlify.app/`, post-Supabase-restore). Carousel is the real, current build; `product-overview.md`'s Wireframes section has been updated to describe it instead of the old 4-column grid. This is a documentation-sync fix, not a re-litigation of whether the carousel was the right call — that's still an open product question if you want to revisit it later.
>
> **AI check-in summaries (`#200029543`/`#200029544`/`#200029613`) are a capability with no product rationale on record** — not in Problem Exploration, Value Props, or Feature Priority. Confirmed live alongside the carousel. Still worth a quick retroactive note on *why*, so this doesn't look unexplained to a future reader (or a client demo).

---

## Track file cleanup (2026-09-21)

- `documents/tracks/dev-chip.md` — `## Current Story` (`#200029523`) cleared; entry moved to Completed Stories.
- `documents/tracks/dev-dale.md` — `## Current Story` (`#200029034`) cleared; entry moved to Completed Stories.
- Both are now empty and ready for the next `start dev` assignment — see 5a-1/5a-2 above.

---

## Full Gherkin AC (originally-mapped MVP stories)

### 1. Set up an objective

**1a — Fast capture and edit of an OKR**
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

**1b — Individual objective alignment link**
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

**1d — Add key results to an objective**
As Satoshi, I want to add one or more key results to an objective as free text (with an optional numeric target), so that its outcome is captured qualitatively without being forced into a number.

```gherkin
Feature: Add key results to an objective

  Scenario: Add a qualitative key result
    Given Satoshi is creating or editing an objective
    When he adds a key result as free text and saves
    Then the key result appears listed under that objective with no numeric value required

  Scenario: Add an optional numeric target
    Given Satoshi is adding a key result to an objective
    When he optionally enters a numeric target and current value alongside the free text
    Then both the qualitative text and the numeric target are saved and displayed together

  Scenario: Edit an existing key result
    Given an objective already has a key result
    When Satoshi edits its text
    Then the updated text is reflected immediately in the objective view
```

### 2. See the whole map

**2a-1 / 2a-2 — Company objective cards + KR rows** *(NEEDS MIGRATION — full Gherkin lived only in Tracker Boot as #200029148/#200029149, never copied into any local doc; pull before treating this row as fully specified)*

**2b — Visually distinct link types**
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
*(Shipped as a static legend row per Dale's track note, not per-connector lines — confirm this satisfies the AC or if per-connector rendering is still owed.)*

**2c — Aggregated status across objectives**
As Hiroshi, I want an aggregated traffic-light status across all objectives, so I know at a glance which of the 18 products need attention.

```gherkin
Feature: Aggregated status across objectives

  Scenario: Company objective shows an owner-set status
    Given a company objective has multiple KRs with different statuses
    When Hiroshi views that objective's card on the map
    Then it shows a single owner-set traffic-light status, not an auto-computed rollup
```

**2d — Alignment summary strip**
As Hiroshi, I want a summary strip of direct-KR / objective-level counts, so I get overall alignment health without reading every card.

```gherkin
Feature: Alignment summary strip

  Scenario: Summary counts reflect current data
    Given some individual objectives are direct-KR linked and some are objective-level linked
    When Hiroshi views the map
    Then the summary strip shows accurate counts for each of the two categories
```

### 3. Drill into my thread

**3a — My thread view**
As Satoshi, I want a "my thread" view of just my own objectives and how they connect upward, so I can focus without the whole map's noise.

```gherkin
Feature: My thread view

  Scenario: View only my own objectives
    Given Satoshi has several individual objectives
    When he switches to "my thread" view
    Then only his own objectives and their upward connections are shown, with no other contributors' objectives visible
```

**3b — View toggle**
As Satoshi/Hiroshi, I want to toggle between map view and my-thread view, so I can switch between aggregate and personal perspective.

```gherkin
Feature: View toggle

  Scenario: Switch between map and my-thread views
    Given a user is viewing the OKR map
    When they select the "my thread" toggle
    Then the screen switches to the my-thread view without losing the selected quarter
```

### 4. Check in on progress

**4a — Quick check-in**
As Satoshi, I want to set a traffic-light status with a short note on why, so progress is expressed qualitatively, not by number.

```gherkin
Feature: Quick check-in

  Scenario: Save a status and note
    Given Satoshi is checking in on an objective
    When he selects a traffic-light status and enters a short note, then saves
    Then the new status and note appear as the latest entry in that objective's check-in history
```

**4b — Plan-next-week prompt in check-in**
As Satoshi, I want a "plan for next week" prompt in the same check-in, so it helps me plan, not just report upward.

```gherkin
Feature: Plan-next-week prompt in check-in

  Scenario: Capture a next-week plan alongside the check-in
    Given Satoshi is filling out a quick check-in
    When he enters text in the "plan for next week" field and saves
    Then the plan text is stored alongside that check-in entry
```

**4c — Check-in history log**
As Hiroshi, I want the narrative check-in history log per objective, so I have an evidence trail when setting next-term OKRs.

```gherkin
Feature: Check-in history log

  Scenario: View accumulated check-in history for an objective
    Given an objective has multiple past check-ins
    When Hiroshi opens that objective's history log
    Then all past check-ins are listed in chronological order with their status and note
```

### 5. Manage quarters

**5a-1 — Quarter selector dropdown**
*(Rewritten 2026-09-23 — original TB Gherkin unreachable, per note above. As Satoshi/Hiroshi, I want a quarter selector in the header, so that I can view any past or current quarter's OKRs.)*

```gherkin
Feature: Quarter selector dropdown

  Scenario: Selecting a quarter filters the view
    Given multiple quarters exist with OKR data
    When the user selects a different quarter from the header dropdown
    Then the Map/My Thread view updates to show only that quarter's objectives

  Scenario: Selector is shared across Map and My Thread
    Given a quarter is selected
    When the user toggles between Map and My Thread
    Then the same selected quarter stays active (matches story 3b's existing "without losing the selected quarter" AC)
```
`e2e: none — pure UI filter, no critical path defined yet (Critical Paths list is empty). Propose to PM for confirmation per §4 procedure.`

**5a-2 — Hide edit/check-in controls on past quarters**
*(Rewritten 2026-09-23 — original TB Gherkin unreachable, per note above. As Hiroshi, I want past quarters to be read-only, so that historical OKR data can't be silently altered.)*

```gherkin
Feature: Read-only past quarters

  Scenario: Editing disabled on a past quarter
    Given the selected quarter is not the current quarter
    When Satoshi views an objective from that quarter
    Then "+ Add OKR", edit, and check-in controls are hidden or disabled

  Scenario: Current quarter stays fully editable
    Given the selected quarter is the current quarter
    When Satoshi views an objective
    Then all edit and check-in controls remain available
```
`e2e: none — pure UI gating, no critical path defined yet. Propose to PM for confirmation.`
**Implementation note for track directive**: gate this at the page level (`OkrMapPage.jsx` / `MyThreadPage.jsx` via a new `useQuarterIsPast` hook), not by editing `ObjectiveCard.jsx` internals — keeps this story's file scope clear of the Horizon 1 stories below that also touch the card.

---

## Iteration #2 — Horizon 1 (guided authoring + manager review, demo build)

*Added 2026-09-23. Builds the Horizon 1 design from the Vault wireframe (`01-Focus/Work/Project Be-one/documents/product/wireframe-horizon1-draft.html`) and PRD F6–F9 on top of the shipped MVP. Scope decision for this build: the Member/Manager split is a **client-side view-mode toggle on the single existing account**, not real multi-user auth — data is fully shared/linked, "Manager mode" just changes which screen defaults and which actions are available. Real multi-user auth stays a separate, later technical pass (see PRD §6/§4 note).*

| # | Story | Type | State | e2e | Track |
|---|-------|------|-------|-----|-------|
| 6a | Coach-me toggle in the OKR dialog | Feature | **Accepted** (merged direct to `main` `4f1f57e`, no PR/review — demo-build process, 2026-09-23) | none | Dale |
| 6b | Persist and reveal Coach-me rationale on demand | Feature | **Accepted** (merged direct to `main` `9fbe4f8`, no PR/review — demo-build process, 2026-09-23). Migration `0005_rationale.sql` applied to live Supabase 2026-09-23, verified via REST read. | none | Dale |
| 6c | Require at least one Key Result before saving | Feature | **Accepted** (merged direct to `main` `b59b2a8`, no PR/review — demo-build process, 2026-09-23). Also fixed a real gap: creation-mode dialog had no KR UI at all before this (KRs were edit-mode-only). | none | Dale |
| 7a | Member/Manager view-mode toggle | Feature | **Accepted** (merged direct to `main` `605d37b`, no PR/review — demo-build process, 2026-09-23) | none | Chip |
| 7b | Manager can ask a question on a specific check-in | Feature | **Accepted** (merged direct to `main` `12d299f`, no PR/review — demo-build process, 2026-09-23). ⚠️ Migration renamed `0006_check_in_questions.sql` → `0007_check_in_questions.sql` during merge (numbering collision with Dale's concurrently-branched `0006_quarter_reviews.sql`) — **not yet applied to live Supabase**, manual step, see PM. | none | Chip |
| 8a | End-of-quarter Review modal (member + manager agree) | Feature | **Accepted** (merged direct to `main` `f46c02b`, no PR/review — demo-build process, 2026-09-23). ⚠️ Migration `0006_quarter_reviews.sql` written but **not yet applied to live Supabase** — manual step, see PM. Button label shipped as "Review" (English) not "レビューする" — this app's UI-chrome convention is English-only per coding-standards.md; Dale caught this correctly, disclaimer content itself is still bilingual JA/EN. | none | Dale |
| 8b | Quarter restart gated by finalized reviews | Feature | **Accepted** (merged direct to `main` `48d5942`, no PR/review — demo-build process, 2026-09-24). Iteration #2 complete. | none | Dale (solo round) |

## Bug-fix batch — Codex review findings (2026-09-24)

*Full Codex review ran over the Iteration #2 diff (`f910b25..48d5942`, `--base f910b25 --scope branch`). Found 3 P1 + 2 P2 issues. PM decision: fix P1 #2/#3 (the gating logic itself, per Jess's explicit restatement of intended behavior) plus P1 #1 (data-loss risk, same review flow) in this batch. P2 #4 (silent KR-write failure) and P2 #5 (missing DB uniqueness constraint on `check_in_questions.check_in_id`) deferred — not blocking current testing.*

| # | Bug | Type | State | e2e | Track |
|---|-----|------|-------|-----|-------|
| B1 | Quarter restart gate ignores prior quarter's review status | Bug | **Accepted** (merged direct to `main` `202990b`, no PR/review — demo-build process, 2026-09-24) | none | Dale |
| B2 | "+ Add objective" doesn't refresh eligibility after creating an objective | Bug | **Accepted** (merged direct to `main` `c2fbc4f`, no PR/review — demo-build process, 2026-09-24) | none | Dale |
| B3 | QuarterReviewModal doesn't sync form state when an existing review loads | Bug | **Accepted** (merged direct to `main` `3793917`, no PR/review — demo-build process, 2026-09-24) | none | Dale |
| B4 | Failed Key Result write during objective creation is silently swallowed | Bug | **Accepted** (merged direct to `main` `0805c3a`, no PR/review — demo-build process, 2026-09-24) | none | Dale |
| B5 | No DB-level uniqueness constraint on one-question-per-check-in | Bug | **Accepted** (merged direct to `main` `dec191f`, no PR/review — demo-build process, 2026-09-24). ⚠️ Migration `0008_check_in_questions_unique.sql` **not yet applied to live Supabase** — manual step, see PM. All 5 Codex findings now resolved. | none | Chip |

## Bug-fix + UX batch — found during Jess's manual test (2026-09-26)

*Jess tried "+ Add objective" locally: objective saved (5 duplicate orphan rows from retrying, since nothing appeared to happen), but never showed on My Thread or the OKR map. Root-caused via direct Supabase testing — two real bugs, plus two UX requests bundled into the same fix pass since they touch the same files.*

| # | Item | Type | State | e2e | Track |
|---|------|------|-------|-----|-------|
| B6 | `key_results.objective_id` NOT NULL blocks all individual Key Result inserts | Bug | **Accepted** (merged direct to `main` `13bfb79`, no PR/review — demo-build process, 2026-09-26). ⚠️ Migration `0009_key_results_objective_id_nullable.sql` **not yet applied to live Supabase** — manual step, see PM. | none | Dale |
| B7 | Creating a new objective never refetches individual objectives | Bug | **Accepted** (merged direct to `main` `37b5568`, no PR/review — demo-build process, 2026-09-26) | none | Dale |
| B8 | "+ Add objective" shows on Map view, confusable with company OKRs | Bug | **Accepted** (merged direct to `main` `c54f6be`, no PR/review — demo-build process, 2026-09-26) | none | Dale |
| B9 | OkrDialog renders as unstyled HTML, not a proper modal | Bug | **Accepted** (merged direct to `main` `4e3d1bf`, no PR/review — demo-build process, 2026-09-26) | none | Dale |
| B10 | useIndividualObjectives query fails with PostgREST embedding ambiguity | Bug | **Accepted** (merged direct to `main` `2f82b44`, no PR/review — demo-build process, 2026-09-26). Verified live via direct REST call post-merge — query now returns the objective + its KR correctly. Likely the true root cause of "My Thread always empty" since migration 0002 (2026-09-21), predating all of this week's other fixes. | none | Dale |

**B10 — useIndividualObjectives query fails with PostgREST embedding ambiguity**
As Satoshi, I want My Thread to actually show my objectives, so that creating one isn't a dead end.

```gherkin
Feature: Individual objectives query resolves its Key Results embed unambiguously

  Scenario: My Thread loads without a PostgREST embedding error
    Given at least one individual objective exists with its own Key Results
    When useIndividualObjectives queries individual_objectives with a nested key_results select
    Then the query succeeds and returns the objective's own Key Results, not a PGRST201 ambiguity error
```
`e2e: none`. Confirmed live via direct REST call — `individual_objectives` has two relationships to `key_results` (`key_results.individual_objective_id → individual_objectives.id`, the objective's own KRs; and `individual_objectives.key_result_id → key_results.id`, the direct-KR link to a company KR). PostgREST can't disambiguate a plain `key_results(...)` embed between them and returns `PGRST201`. This has silently broken `useIndividualObjectives` since migration 0002 introduced the second relationship — it just never surfaced as a visible bug until B6 made individual KRs actually persistable. Fix: qualify the embed explicitly, e.g. `key_results!key_results_individual_objective_id_fkey(id, title, target_note)`, matching the FK-qualified pattern `useCompanyObjectives.js` already uses for its own ambiguous embed.

| B11 | "My thread" tab visible and populated with Satoshi's data while in Manager mode | Bug | **Accepted** (merged direct to `main` `53f41e0`, no PR/review — demo-build process, 2026-09-26) | none | Dale |

**B11 — "My thread" tab visible and populated with Satoshi's data while in Manager mode**
As Hiroshi (Manager mode), I don't want to see "My thread" at all, since there's no separate manager identity in this demo — showing Satoshi's personal objectives under a Manager-mode tab is confusing, not a real manager's thread.

```gherkin
Feature: My Thread hidden in Manager mode

  Scenario: My Thread tab is not shown in Manager mode
    Given the view mode is set to Manager
    Then the "My thread" toggle button is not rendered, only "OKR map"

  Scenario: Switching to Manager mode while on My Thread falls back to the Map
    Given the user is viewing My Thread in Member mode
    When they switch to Manager mode
    Then the screen falls back to the OKR map, not a hidden/stale My Thread view

  Scenario: Switching back to Member mode still defaults to My Thread
    Given the user is in Manager mode viewing the Map
    When they switch to Member mode
    Then My Thread becomes available again (existing #7a default-view behavior, unaffected)
```
`e2e: none`. PM decision (2026-09-26): hide the tab entirely in Manager mode rather than showing an empty/placeholder state — simplest, and avoids implying a manager-specific data model that doesn't exist in this single-account demo. Root cause: `view` state in `OkrMapPage.jsx` only reads `viewMode` once at mount (`useState(viewMode === 'manager' ? 'map' : 'my-thread')`) — it never reacts to `viewMode` changing afterward, so toggling Manager while already on My Thread leaves the (soon-to-be-hidden) tab active with no visible way back.

## Interaction consolidation — My Thread drill-down + read-only Map (2026-09-26)

*Jess's design feedback: clicking a My Thread card only opens edit; it should also expose check-in, history, and review from the same modal. Separately, the OKR Map should become fully read-only — no editing, no check-in, no status changes for anyone, on company or individual data shown there. PM decision on scope (confirmed with Jess): Map goes fully read-only including removing the Check-in/History surface currently on direct-KR-linked rows; avatars stay as pure visual indicators.*

**Known gap opened by this change, not resolved here**: Manager's only current way to see an individual's check-in history and ask a question (#7b) was via the Map's KR rows. Once the Map has no buttons at all, Manager loses that entry point entirely, and Manager doesn't have "My Thread" (per #B11, just removed). Flagged for a follow-up decision — not solved in this batch.

| # | Item | Type | State | e2e | Track |
|---|------|------|-------|-----|-------|
| B12 | OKR Map still has company-editing and check-in surfaces (Edit button, status editor, Check-in/History triggers) | Bug | **Accepted** (merged direct to `main` `7f8f75d`, no PR/review — demo-build process, 2026-09-26) | none | Dale |
| B13 | My Thread drill-down (OkrDialog edit mode) has no check-in or history, only edit + review | Feature | **Accepted** (merged direct to `main` `e48cbcb`, no PR/review — demo-build process, 2026-09-26) | none | Dale |

**B12 — OKR Map still has company-editing and check-in surfaces**
As Jess, I don't want anyone to be able to edit company OKRs or trigger check-ins from the Map, so that the Map stays a pure read-only overview and all interaction happens through My Thread.

```gherkin
Feature: OKR Map is fully read-only

  Scenario: No edit affordances on company objective cards
    Given the OKR map is showing a company objective
    Then there is no clickable status dot, no "Edit" button on any KR row, and no "+ Add key result" button

  Scenario: No check-in surface on the map
    Given a company KR has a directly-linked individual objective
    Then the avatar for that individual still appears, but no "Check in" or "History" button is shown anywhere on the map
```
`e2e: none`. Scope: `ObjectiveCard.jsx` needs a way to distinguish company-context rendering (no `individualObjectiveId`) from individual-context rendering (has one) and suppress the status-dot click/`StatusEditor`, the KR "Edit"/"+ Add key result" buttons, and `CheckInTriggers`/`CheckInPanels` entirely for the company case. `KrListInline.jsx` likely needs a `readOnly` prop threaded through from `ObjectiveCard`. Avatars (owner-initial clusters) stay — informational only, no click behavior.

**B13 — My Thread drill-down has no check-in or history, only edit + review**
As Satoshi, I want to check in, view history, edit, and review my objective all from the same place I click into it on My Thread, so I don't need a separate flow for each.

```gherkin
Feature: Unified drill-down modal for individual objectives

  Scenario: Opening an objective from My Thread exposes all four actions
    Given Satoshi clicks one of his objectives on My Thread
    Then the same modal offers editing the title/KRs, checking in (status + note + plan-next), viewing check-in history, and starting a Review

  Scenario: Check-in applies to the whole objective, not per-KR
    Given the objective has one or more of its own Key Results
    When Satoshi checks in
    Then the check-in is recorded against the objective as a whole (individual_objective_id), matching how check-in history is already queried — not a new per-KR check-in mechanism
```
`e2e: none`. Root cause: the Map's per-KR check-in trigger (`CheckInPanelRegion`/`useCheckInPanelRegion`) only activates when a KR row has a populated `individual_objectives` array from `useCompanyObjectives`'s nested select — a shape that doesn't exist for an individual's own KRs (from `useIndividualObjectives`), so the embedded `ObjectiveCard` inside `OkrDialog`'s edit mode has never been able to show a Check-in trigger at all. Fix: add a Check-in trigger + History trigger directly in `OkrDialog.jsx` (or a small wrapper), scoped to the whole objective via `objective.id` as `individualObjectiveId` — reusing the existing `CheckInPanel`/`CheckInHistory` components directly, not the KR-row-based region mechanism. Individual KR rows keep their own "Edit" (renaming your own KR stays legitimate) — only the check-in/history surface moves to the objective level.

## UX flow tweaks — quarter demo + empty-state onboarding (2026-09-27)

*Jess: iterating on the OKR-setting UX flow directly in the PM session — build → local test → deploy → record each tweak, outside the Chip/Dale pipeline. Same "demo-build process, direct to `main`" pattern as the rest of this project's history (see B1–B13 above).*

| # | Item | Type | State | e2e | Track |
|---|------|------|-------|-----|-------|
| B14 | No way to create a new quarter for demo purposes | Feature | **Accepted** (merged direct to `main` `caf5332`, no PR/review — demo-build process, 2026-09-27) | none | PM (direct) |
| B15 | Empty individual-OKR state (Company OKR set, no personal OKR yet) never prompted the viewer to set one | Feature | **Accepted** (merged direct to `main` `caf5332`, no PR/review — demo-build process, 2026-09-27). Same commit as B14. | none | PM (direct) |
| B16 | Add Objective modal only ever creates one OKR per session, no way to add a second in the same pass | Feature | **Accepted** (merged direct to `main` `e86a45b`, no PR/review — demo-build process, 2026-09-27) | none | PM (direct) |
| B17 | No way to save an OKR as a draft vs. confirming it as final for the quarter | Feature | **Accepted** (merged direct to `main` `e86a45b`, no PR/review — demo-build process, 2026-09-27). Same commit as B16. Migration `0010_individual_objectives_status.sql` applied live by Jess via the Supabase SQL editor 2026-09-27 (existing rows backfilled to `confirmed`, verified via REST read). | none | PM (direct) |

**B14 — "+ New quarter" button for demo**
As Jess, I want a one-click way to add the next quarter for a demo, so I can show a fresh quarter's empty state without hand-seeding company objectives in Supabase every time.

```gherkin
Feature: Add a new quarter for demo

  Scenario: Creates the next quarter, active, dated after the current one
    Given the latest existing quarter is "Q3 2026" (ends 2026-09-30)
    When Jess clicks "+ New quarter"
    Then a new quarter "Q4 2026" (2026-10-01 – 2026-12-31) is created and marked active, and the previously active quarter is deactivated

  Scenario: Clones the source quarter's Company OKRs into the new quarter
    Given the current quarter has company objectives with key results
    When the new quarter is created
    Then each company objective and its key results are copied into the new quarter (status reset to not_started, current_value reset to 0), so "Company OKR is set" is true immediately for the new quarter

  Scenario: Selects the new quarter once created
    When quarter creation succeeds
    Then the quarter list refetches, the new quarter becomes selected, and a confirmation toast names it
```
`e2e: none — demo convenience action, not a user-facing production flow.` Implementation: `src/lib/quarters.js` (pure name/date helpers, unit-tested directly) + `src/hooks/useCreateQuarter.js`, wired into `OkrMapPage.jsx` next to the quarter selector. No migration needed — reuses the existing `quarters` / `company_objectives` / `key_results` schema. `useActiveQuarter.js` gained a `refetch` so the header can re-pull the quarter list after creating one.

**B15 — Auto-open Add Objective modal on empty individual-OKR state**
As Satoshi, when I land on a quarter where the Company OKR is already set but I haven't set my own OKR yet, I want the Add Objective modal to open by default, so I'm nudged straight into setting one instead of landing on a blank My Thread screen.

```gherkin
Feature: Empty-state nudge into Add Objective

  Scenario: Auto-opens when Company OKR is set and the viewer has none of their own
    Given the selected quarter has at least one company objective and the viewer has zero individual objectives in it
    When My Thread is showing, the quarter isn't past, and the quarter-restart gate (#8b) allows it
    Then the Add Objective modal opens automatically, without the viewer clicking "+ Add objective", and Cancel is hidden so they have to set one to proceed

  Scenario: Does not re-trap the viewer after they dismiss it
    Given the modal auto-opened for the current quarter
    When the viewer closes it (e.g. via a later manual open/cancel)
    Then it does not immediately reopen — the nudge fires once per quarter, not on every render

  Scenario: Does not fire when it shouldn't
    Given any of: Manager mode, Map view, a past quarter, canCreate is false, no Company OKR set yet for the quarter, or the viewer already has an individual OKR
    Then the modal does not auto-open
```
`e2e: none`. Implementation: new effect in `OkrMapPage.jsx`, ref-gated per `quarterId` so it fires exactly once per quarter; `OkrDialog.jsx` gained a `mandatory` prop that hides the Cancel button and shows "Set your OKR for {quarterName} to continue." — scoped to the auto-opened instance only, so a manual "+ Add objective" click still shows Cancel as before.

**Scope + verification note**: both stories built, unit-tested (32 new/updated tests; full suite 390/390 passing, `npm run lint` clean, `npm run build` clean), and pushed directly to `main` in one commit (`caf5332`) per Jess's explicit choice to iterate in this session rather than through the Chip/Dale pipeline. `netlify.toml`'s `[context.production] branch = "main"` misconfig (flagged 2026-09-21, still unfixed) means this went straight to **production** — confirmed live on `https://striketrio-beone.netlify.app` via built-JS string grep for both new UI strings ("New quarter", "Set your OKR").

**B16 — Add another objective in the same Add Objective session**
As Satoshi, I want a full-width "+ Add another objective" button in the Add Objective modal, so I can set up more than one OKR in the same pass instead of reopening the modal per objective.

```gherkin
Feature: Add another objective within the same modal session

  Scenario: Adds a second, independent objective section
    Given the Add Objective modal is open in create mode
    When Satoshi clicks the full-width "+ Add another objective" button
    Then a second section appears with its own Objective title, Aligns-with selector, and key results — independent of the first

  Scenario: Additional sections can be removed
    Given a second (or later) objective section has been added
    Then it has its own Remove control; the first section never shows Remove

  Scenario: Saving creates one row per section
    Given two objective sections are each filled in with a title, an alignment, and at least one key result
    When Satoshi saves
    Then one individual_objectives row (and its key results) is created per section, and the save is all-or-nothing — if any section is invalid, nothing is inserted
```
`e2e: none`. Implementation: `OkrDialog.jsx`'s create-mode state changed from a single `{title, link, draftKrs}` to an `objectiveDrafts` array, rendered via a new internal `ObjectiveDraftFields` component. Edit mode (existing objective) is untouched — still a single title field, no add/remove.

**B17 — Save as draft vs. Confirm OKR for a quarter**
As Satoshi, I want to choose "Save as draft" or "Confirm OKR for Q3 2026" when setting my OKR, so I can capture a draft without it counting as my finalized commitment for the quarter yet.

```gherkin
Feature: Draft vs. confirmed OKR status

  Scenario: Save as draft
    Given Satoshi is creating one or more objectives in the Add Objective modal
    When he clicks "Save as draft"
    Then each created individual_objectives row is saved with status: 'draft'

  Scenario: Confirm OKR for the quarter
    When he clicks "Confirm OKR for <quarter name>" instead
    Then each created row is saved with status: 'confirmed'

  Scenario: Draft rows are visibly marked
    Given an objective has status: 'draft'
    Then My Thread shows a small "Draft" badge next to its title
```
`e2e: none`. Implementation: migration `0010_individual_objectives_status.sql` adds `individual_objectives.status` (`draft`/`confirmed`, existing rows backfilled to `confirmed`, new-row default `draft`). `useIndividualObjectives.js` now selects `status`; `MyThreadPage.jsx` renders the badge. Edit mode (existing objective) keeps the single "Save" button unchanged — status is a create-time choice only for now, not editable after the fact.

**Resolved — migration applied, B16/B17 deployed (2026-09-27)**: migration 0010 was blocked on live-DB access from the PM sandbox (no `SUPABASE_ACCESS_TOKEN` for `supabase db push`'s temporary elevated role). Jess doesn't use the Supabase CLI (browser-only), so resolved by pasting the migration's SQL directly into the Supabase SQL editor instead of via CLI. Verified column exists + backfill correct via direct REST read, then pushed commit `e86a45b` to `main` (= production, per the still-unfixed `netlify.toml` misconfig) and confirmed all three new UI strings ("Add another objective", "Save as draft", "Confirm OKR") present in the live built JS at `https://striketrio-beone.netlify.app`.

**B6 — `key_results.objective_id` NOT NULL blocks all individual Key Result inserts**
As Satoshi, I want my Key Results to actually save when I create an objective, so that the objective isn't silently left without the KR I just wrote.

```gherkin
Feature: Individual Key Result inserts succeed

  Scenario: Saving an objective with a draft KR persists it
    Given Satoshi has added at least one draft Key Result while creating a new objective
    When he saves
    Then the Key Result is persisted with individual_objective_id set and objective_id null, with no database error
```
`e2e: none`. Confirmed live via direct insert: `null value in column "objective_id" of relation "key_results" violates not-null constraint" (code 23502)`. Migration 0002 added `individual_objective_id` but never relaxed `objective_id`'s NOT NULL — every individual KR insert has always failed silently until B4 started surfacing it.

**B7 — Creating a new objective never refetches individual objectives**
As Satoshi, I want my newly created objective to actually appear on My Thread and the map right away, so that saving feels like it worked.

```gherkin
Feature: Individual objectives refresh after creating a new one

  Scenario: New objective appears on My Thread without a reload
    Given Satoshi creates a new individual objective
    When the save completes
    Then it appears in My Thread immediately, no page reload required
```
`e2e: none`. `OkrMapPage.jsx`'s `handleSave` calls `refetch()` (company) and `refetchCanCreate()` on create, but never `refetchIndividual()` — only the edit branch does.

**B8 — "+ Add objective" shows on Map view, confusable with company OKRs**
As Satoshi, I want "+ Add objective" to only appear on My Thread, so it's never confused with adding a company objective while looking at the Map.

```gherkin
Feature: Add-objective button scoped to My Thread

  Scenario: Button hidden on Map view
    Given the user is viewing the OKR map
    Then "+ Add objective" is not shown

  Scenario: Button shown on My Thread view (subject to existing gates)
    Given the user is viewing My Thread, the quarter is current, and canCreate is true
    Then "+ Add objective" is shown
```
`e2e: none`. Pure UI condition change in `OkrMapPage.jsx` — combine with the existing `!isPastQuarter && canCreate` condition.

**B9 — OkrDialog renders as unstyled HTML, not a proper modal**
As Satoshi, I want the Add/Edit Objective dialog to look like the rest of the app, so it feels like a real product feature, not a debug form.

```gherkin
Feature: OkrDialog styled as a proper modal

  Scenario: Dialog renders with card styling consistent with the app
    Given the Add/Edit Objective dialog is open
    Then it renders as a centered card with padding, rounded corners, and styled inputs/buttons matching the app's existing design language (see ObjectiveCard.jsx, CheckInPanel.jsx for the established pattern), not bare unstyled HTML elements
```
`e2e: none`. Visual/styling only — no behavior change. `OkrMapPage.jsx` already wraps it in a proper overlay (`position: fixed`, dark backdrop, centered flex); the gap is entirely inside `OkrDialog.jsx` itself, which currently has zero styling on any element.

**B4 — Failed Key Result write during objective creation is silently swallowed**
As Satoshi, I want to be told if a Key Result fails to save while I'm creating an objective, so that I don't end up with an objective that's missing its required KR without knowing it.

```gherkin
Feature: Objective creation surfaces Key Result write failures

  Scenario: A failed KR write blocks the success flow
    Given Satoshi is creating a new objective with at least one draft Key Result
    When the objective insert succeeds but one of the Key Result writes fails
    Then an error is shown and the dialog does not close as if the save succeeded

  Scenario: All KRs still save successfully in the normal case
    Given Satoshi is creating a new objective with valid draft Key Results
    When all writes succeed
    Then the dialog closes normally, unchanged from current behavior
```
`e2e: none`. Codex finding: `src/components/OkrDialog.jsx:57-63` — the `createKr` loop ignores its boolean return value.

**B5 — No DB-level uniqueness constraint on one-question-per-check-in**
As a developer, I want the database itself to enforce one question per check-in, so that the "not a comment thread" rule (#7b) holds even under concurrent writes, not just via client-side UI state.

```gherkin
Feature: One question per check-in enforced at the database level

  Scenario: A second question on the same check-in is rejected
    Given a check-in already has one question attached
    When another insert attempts to add a second question for the same check-in
    Then the database rejects it as a uniqueness violation, and the app surfaces this as an "already asked" state rather than a generic error
```
`e2e: none`. Codex finding: `supabase/migrations/0007_check_in_questions.sql` — needs a `UNIQUE` constraint on `check_in_id`, plus conflict handling in `useCheckInQuestions.js`'s `askQuestion`. New migration file, not an edit to 0007 (already applied live) — do not apply to Supabase directly, PM applies manually same as every prior migration.

**B1 — Quarter restart gate ignores prior quarter's review status**
As Satoshi, I want the "+ Add objective" gate to actually check whether my prior quarter was reviewed, so that the restart rule (#8b) can't be trivially bypassed by switching to an empty new quarter.

```gherkin
Feature: Quarter restart gate checks the prior quarter, not just the selected one

  Scenario: New quarter with a prior quarter that isn't fully reviewed stays gated
    Given the current quarter has at least one individual objective without a finalized review
    When a new, empty quarter is selected
    Then "+ Add objective" is still not shown for the new quarter

  Scenario: New quarter opens once the prior quarter is fully reviewed
    Given every individual objective in the prior quarter has a finalized review
    When the new quarter is selected
    Then "+ Add objective" is shown

  Scenario: The very first quarter ever has no prior quarter to check
    Given there is no chronologically-prior quarter
    When that quarter has zero individual objectives
    Then "+ Add objective" is shown (vacuously satisfied — matches Q3 2026's current state)
```
`e2e: none`. Codex finding: `src/hooks/useCanCreateObjective.js:18-29`.

**B2 — "+ Add objective" doesn't refresh eligibility after creating an objective**
As Satoshi, I want the "+ Add objective" button to disappear immediately after I create my first objective this quarter, so I can't create a second unreviewed one in the same session.

```gherkin
Feature: Creation eligibility refreshes after saving an objective

  Scenario: Button hides right after the first objective is created
    Given a quarter currently has zero individual objectives (button visible)
    When Satoshi creates his first objective this quarter
    Then "+ Add objective" is no longer shown, without needing a page reload
```
`e2e: none`. Codex finding: `src/components/OkrMapPage.jsx:173-176` — the save handler only refetches company objectives, not individual objectives / creation eligibility.

**B3 — QuarterReviewModal doesn't sync form state when an existing review loads**
As Satoshi or Hiroshi, I want the Review modal to show the real saved data once it loads, so I don't accidentally overwrite a finalized review with blank fields.

```gherkin
Feature: Review modal syncs loaded data into form state

  Scenario: Opening an existing review shows its real values, not blank defaults
    Given an objective already has a saved (possibly finalized) quarter_reviews row
    When the Review modal is opened for that objective
    Then the status, reflection, comment, and confirmation checkboxes reflect the loaded row once it arrives, not blank/unchecked defaults

  Scenario: Saving immediately after open never nulls out existing data
    Given the review data is still loading asynchronously
    When Save is clicked before the load resolves
    Then the save does not overwrite existing reflection/comment/confirmation fields with null
```
`e2e: none`. Codex finding: `src/components/QuarterReviewModal.jsx:48-52`.

### 6. Guided authoring (Coach-me)

**6a — Coach-me toggle in the OKR dialog**
As Satoshi, I want an optional "Coach me" toggle inside the same OKR dialog, so that I can get guided outcome-framing questions without leaving my flow.

```gherkin
Feature: Coach-me toggle in the OKR dialog

  Scenario: Toggle expands two questions inline, same dialog
    Given Satoshi has the OKR dialog open
    When he clicks "Coach me"
    Then two sequential questions expand inline in the same dialog, with no navigation to a new screen

  Scenario: Skip is always available inside the panel
    Given the coach panel is open
    When Satoshi clicks "Skip coaching"
    Then the panel closes without requiring an answer, and saving the OKR proceeds normally
```
`e2e: none — isolated UI within an existing dialog. Propose to PM for confirmation.`

**6b — Persist and reveal Coach-me rationale on demand**
As Satoshi, I want my Coach-me answers saved as rationale attached to the objective, so that I and my manager can see why it's written this way later.

```gherkin
Feature: Coach-me rationale, on demand only

  Scenario: Rationale saved per question
    Given Satoshi answered both coach questions and saved the OKR
    When the objective is stored
    Then two rationale rows are saved (PRD §8 `rationale` table), one per question, linked to the objective

  Scenario: Rationale is hidden by default
    Given an objective has saved rationale
    When Satoshi or Hiroshi view its card
    Then the rationale is hidden by default and only shown after clicking "View rationale"

  Scenario: Rationale frozen on a past quarter
    Given an objective belongs to a past (read-only) quarter
    When its rationale is viewed
    Then no edit action is available on it (consistent with 5a-2)
```
`e2e: none — isolated UI + new table, no critical path defined yet. Propose to PM for confirmation.`

**6c — Require at least one Key Result before saving**
As Satoshi, I want the OKR dialog to require at least one Key Result before I can save, so that every objective has a concrete outcome attached from the start.

```gherkin
Feature: At least one Key Result required

  Scenario: Save blocked with zero KRs
    Given Satoshi is creating a new objective with no key results added
    When he tries to save
    Then the save is blocked with a message that at least one KR is required

  Scenario: Save proceeds with one KR
    Given Satoshi has added exactly one key result
    When he saves
    Then the objective is created successfully
```
`e2e: none — client-side validation only.`

### 7. Manager review surface

**7a — Member/Manager view-mode toggle**
As Hiroshi, I want a Manager view that defaults to the full map, so that I land on the org-wide picture instead of my own thread — and as Satoshi, I want my default to stay My Thread, so I land on my own objectives first.

```gherkin
Feature: Member/Manager view-mode toggle

  Scenario: Manager mode defaults to Map
    Given the view mode is set to Manager
    When the app loads
    Then the Map screen is shown by default

  Scenario: Member mode defaults to My Thread
    Given the view mode is set to Member
    When the app loads
    Then the My Thread screen is shown by default

  Scenario: Both modes can still reach both screens
    Given either view mode is active
    When the user clicks the existing Map/My Thread toggle (story 3b)
    Then the screen switches, regardless of which mode is active
```
`e2e: none — client-side mode state, not real auth. Propose to PM for confirmation.`
**Implementation note for track directive**: new `useViewMode` hook + a header control in `App.jsx`. Do not touch `ObjectiveCard.jsx` — Dale owns that file this round (6b).

**7b — Manager can ask a question on a specific check-in**
As Hiroshi, I want to attach a short question to one specific check-in entry, so that I can prompt a real conversation with the person instead of just observing silently.

```gherkin
Feature: Manager question on a check-in entry

  Scenario: Question attached to one check-in
    Given Hiroshi is in Manager view looking at someone's check-in history
    When he adds a question to one specific check-in entry and sends it
    Then the question is saved against that check-in only (PRD §8 `check_in_questions`), visible to both Hiroshi and the check-in's owner

  Scenario: One question per check-in, not a thread
    Given a check-in already has a question attached
    When Hiroshi views it again
    Then there is exactly one question/reply pair shown for that check-in
```
`e2e: none — isolated UI + new table.`
**Implementation note for track directive**: new `CheckInQuestion.jsx` + `useCheckInQuestions` hook, wired into `CheckInHistory.jsx`. Do not touch `ObjectiveCard.jsx` or `OkrDialog.jsx`.

### 8. Quarter closeout

**8a — End-of-quarter Review modal**
As Satoshi and Hiroshi, we want a shared Review modal where we each add a reflection and confirm, so that we can finalize and agree on the quarter's evaluation together.

```gherkin
Feature: End-of-quarter Review modal

  Scenario: Finalizes only once both sides confirm
    Given an objective's quarter has ended
    When only one of Satoshi or Hiroshi has confirmed their part
    Then the review is not yet finalized

  Scenario: Finalized once both confirm
    Given both Satoshi and Hiroshi have confirmed their part
    When the second confirmation is saved
    Then the review is finalized with a timestamp (PRD §8 `quarter_reviews.finalized_at`)

  Scenario: Not tied to salary calibration
    Given the review modal is open
    When either party views it
    Then a visible note states the evaluation is not used for salary or performance calibration
```
`e2e: none — isolated UI + new table. Propose to PM for confirmation.`
**Implementation note for track directive**: new `QuarterReviewModal.jsx`, a "レビューする" entry button on `ObjectiveCard.jsx`, new `quarter_reviews` migration. Dale owns `ObjectiveCard.jsx` this iteration (see 6b) — this story continues that ownership.

**8b — Quarter restart gated by finalized reviews**
As Satoshi, I want "+ Add OKR" to reappear once my prior quarter's objectives are all reviewed and finalized, so that I know when I'm clear to start the new quarter.

```gherkin
Feature: Quarter restart gated by finalized reviews

  Scenario: Add button hidden mid-quarter
    Given Satoshi already has at least one objective in the current quarter
    When he views his My Thread screen
    Then "+ Add OKR" is not shown (consistent with 6c/5a-2's controls)

  Scenario: Add button reappears after all reviews finalized
    Given all of Satoshi's current-quarter objectives have a finalized review (8a)
    When the next quarter is selected
    Then "+ Add OKR" is shown again for that quarter
```
`e2e: none — depends on 5a-1, 5a-2, and 8a all being merged first. Propose to PM for confirmation.`
**Implementation note for track directive**: new `useCanCreateObjective` hook, consumed by the existing "+ Add OKR" button in `OkrMapPage.jsx`/`MyThreadPage.jsx`. **Run this story solo (no concurrent Chip story)** — it's the one place this iteration's two tracks' files legitimately intersect.

---

## Later (drafted, not in Iteration #1 — do not start)

### 2e — Filter and sort by risk status
As Hiroshi, I want to filter/sort by risk status, so red/yellow items surface first.

```gherkin
Feature: Filter and sort objectives by risk status

  Scenario: Filter to at-risk and behind objectives
    Given company objectives exist with a mix of on-track, at-risk, and behind statuses
    When Hiroshi applies the "at risk + behind" filter on the map
    Then only objectives with those statuses are shown

  Scenario: Sort surfaces the riskiest objectives first
    Given the filter is cleared
    When Hiroshi sorts the map by status
    Then behind objectives appear before at-risk, which appear before on-track and not-started
```
`e2e: none`

### 3c — Search for a person's OKR thread
As Hiroshi, I want to search for a specific person by name, so I can jump straight to their objectives without scanning the whole map.

```gherkin
Feature: Search for a person's OKR thread

  Scenario: Search by name jumps to that person's thread
    Given multiple individuals across the organization have OKRs in the system
    When Hiroshi searches for a person by name
    Then their thread view opens, showing their objectives and how they connect upward

  Scenario: No match found
    Given Hiroshi searches for a name with no matching person
    When the search returns no results
    Then a clear empty-state message is shown, with no thread view opened
```
`e2e: none` — not testable until a second real user is onboarded post-MVP.

### 5b — Quarter-over-quarter comparison
As Hiroshi, I want quarter-over-quarter comparison, so I have a lightweight evidence trail for next-term OKR setting.

```gherkin
Feature: Quarter-over-quarter comparison

  Scenario: Compare an objective across two quarters
    Given a company objective exists with equivalent objectives in two different quarters
    When Hiroshi opens quarter-over-quarter comparison for that objective
    Then he sees the status and key results for both quarters side by side

  Scenario: No prior quarter to compare
    Given the selected quarter is the first one with any data
    When Hiroshi opens quarter-over-quarter comparison
    Then the view indicates there is no prior quarter to compare against
```
`e2e: none`

---

## Dropped (do not revive without a new PM decision)

- **1c** — ~~last quarter's OKR pre-filled as a starting draft~~ — dropped 2026-07-15.
- **2f** — ~~board-ready export view~~ — dropped 2026-07-15.

---

## Critical Paths

*(Reference point for e2e judgment — see aabt-workflow §4. Empty by design; grow only when a regression or real usage proves a path belongs here — don't mirror the feature list.)*

-
