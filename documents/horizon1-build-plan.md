# Horizon 1 Build Plan — Guided Authoring + Manager Review (Demo)

*Created 2026-09-23. Scope: turn the Vault's Horizon 1 wireframe/PRD (F6–F9) into working software on top of the already-shipped MVP, as a demo — a client-side Member/Manager view toggle on one shared dataset, not real multi-user auth.*

---

## 0. Where this actually stands (read this first)

The Vault (`01-Focus/Work/Project Be-one/`) is a **stale planning mirror** per its own `CLAUDE.md`. The real product is `~/be-one`, and it's much further along than the Vault suggests:

- **17 of the 18 original MVP stories are already shipped to `main`** (fast capture, KR add, map with cards + link legend, my-thread view + toggle, check-in with history, plan-next-week). Only **5a-1 / 5a-2** (quarter selector, past-quarter read-only) were never started.
- **AI check-in summaries already exist**, shipped beyond original scope (`kr_summaries` table + `generate-kr-summary` Edge Function) — this already satisfies PRD F8. No new work needed there.
- The existing Chip/Dale AABT pipeline (background sub-agents, TDD, PR + human-approve gate, serial Accept) **is** the "2 tracks, checked before merging, one at a time" system you asked for — I'm using it as-is, not building a new one. See `documents/delivery-playbook.md` if you want the full mechanics.

**What's net-new for Horizon 1**: guided authoring (Coach-me), the Member/Manager view toggle, manager-side questions on check-ins, and the end-of-quarter Review ritual that gates when "+ Add OKR" reappears. 7 new stories, added to `documents/story-tracker.md` under **Iteration #2** with full Gherkin AC.

---

## 1. Manual step needed right now (before anything starts)

`~/be-one`'s working tree has **uncommitted changes to 7 PM docs**, plus `story-tracker.md` itself was never committed at all (it's untracked — created 2026-09-21 to replace Tracker Boot, never pushed). I just added the new stories and this plan file on top of that.

**Starting Chip/Dale risks losing this** — their worktrees sync from `origin/main`, and none of this is there yet.

👉 **Please double-click `commands/push-docs.command` now.** It commits + pushes `CLAUDE.md` and everything under `documents/` (covers the new stories and this plan file too). Nothing else is touched.

Once that's done, tell me and I'll kick off Round 1.

---

## 2. Round-by-round sequence

Rounds run Chip + Dale **in parallel** unless marked "solo."

**Process change (2026-09-23, your call):** for this build phase, no PR / no code review / no approve gate. Dev pushes their branch → tests must be green → I merge `dev-chip`/`dev-dale` straight into `main` myself, no bot PR, no Codex review per story. You test the whole thing in bulk once a batch of rounds has landed, rather than gating each one individually. This is a deliberate speed-over-ceremony tradeoff for the demo build — the real delivery-playbook gates (PR, Codex review, your approve/merge double-clicks) come back once we're past demo stage and actually shipping to real users. I will not start a round until the previous one's stories are both merged to `main`.

| Round | Chip | Dale | Why paired this way |
|---|---|---|---|
| 1 | **5a-1** Quarter selector dropdown | **6a** Coach-me toggle in the OKR dialog | Zero file overlap: map/thread headers vs. the dialog component |
| 2 | **5a-2** Read-only past quarters *(page-level gating only, per track-directive note)* | **6b** Persist + reveal Coach-me rationale | Chip stays at page level; Dale owns `ObjectiveCard.jsx` for the rationale reveal |
| 3 | **7a** Member/Manager view-mode toggle *(App.jsx + new hook only)* | **6c** Require ≥1 Key Result before saving | Chip stays out of `ObjectiveCard.jsx` this round too |
| 4 | **7b** Manager question on a check-in *(`CheckInHistory.jsx` + new files)* | **8a** End-of-quarter Review modal *(new modal + `ObjectiveCard.jsx` review button)* | Different files again — Chip never touches `ObjectiveCard.jsx` the whole iteration |
| 5 | — | **8b** Quarter restart gated by finalized reviews *(solo)* | The one place both tracks' territory (quarter mechanics × "+ Add OKR" button) legitimately intersects — safer to run alone after everything else has landed |

**File-ownership rule for this iteration**: Dale owns `ObjectiveCard.jsx` and `OkrDialog.jsx`. Chip owns page-level containers (`OkrMapPage.jsx`, `MyThreadPage.jsx`, `App.jsx`) and net-new standalone components (`CheckInQuestion.jsx`). This is written into each story's "Implementation note for track directive" in the tracker so it isn't lost between rounds.

---

## 3. Manual steps to expect along the way

Beyond the doc-push above, flag these when they come up — I'll call them out explicitly in the moment, not just here:

- **New Supabase migrations** (6b adds `rationale`, 7b adds `check_in_questions`, 8a adds `quarter_reviews`) need to actually be applied to the live Supabase project. There's no automated migration-apply step in this repo yet (checked — no CI hook, no existing command). When a round produces a new migration file, I'll flag it and we'll either run `supabase db push` together or I'll generate a `commands/apply-migrations.command` the same way delivery-playbook already does for `deploy-functions.command` if one doesn't exist.
- **No preview URL, no approve/merge double-clicks this phase** — see the process-change note above. I merge directly once tests are green; there's nothing for you to click per round.
- You test the batch yourself once a few rounds are in, and let Codex do a proper code review pass whenever you're ready for it — not gated per story anymore.

---

## 4. Code review — deferred to a batch pass, not per-story

Originally planned as "Codex reviews every PR." Given the no-PR process change above, there's nothing to hand Codex per round anymore. Instead: once a batch of rounds has landed on `main`, tell me and I'll either point Codex at the full diff range or you can invoke it directly — whichever you'd rather do at that point.

---

## 5. Known assumptions carried in from the design phase

Flagged in the Vault wireframe's "Known Gaps" section, still true here:
- **Coaching question copy** is placeholder translation — needs Bekind's real coaching vocabulary before this is genuinely demo-ready, not just functionally correct.
- **8b's aggregation rule** ("+ Add OKR reappears once *all* current-quarter objectives are reviewed") is my first-pass read of your instruction, not confirmed against how quarterly review actually happens at Bekind. Worth a real answer before this ships past demo stage.
- **Member/Manager toggle is explicitly a demo-scope simplification** — no real second user, no auth changes. If this demo lands well and you want real roles later, that's a separate, larger technical pass (schema + Supabase RLS), not a small follow-up.

---

## 6. What I need from you to start

1. Double-click `push-docs.command` (§1).
2. Tell me to go — I'll launch Round 1 (Chip on 5a-1, Dale on 6a) as background sub-agents and report back when they push.
