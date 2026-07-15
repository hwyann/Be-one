# Be-one

## Project
A B2B SaaS OKR system that embeds Bekind Labs' Lean/XP consulting methodology directly into goal-setting, guiding teams from output-thinking to outcome-thinking.

**Stack**: React + Supabase + Netlify
**Tracker Boot**: Project ID 100000292
**GitHub**: hwyann/be-one
**Deploy**: striketrio-beone.netlify.app — https://striketrio-beone.netlify.app

## Me
Jess — PM
**Company / Team**: Bekind Labs

## Dev Team

**Dev A**: Chip — worktree at `~/Documents/Claude/Worktrees/be-one-chip`, branch `dev-chip`
**Dev B**: Dale — worktree at `~/Documents/Claude/Worktrees/be-one-dale`, branch `dev-dale`

## ⚠️ Session Start Triggers — Always Run First

When any of the keywords below are received, use the Read tool to read the listed files **before anything else**. Do not start any work until the files have been read.

| Keyword | Files to Read |
|---------|--------------|
| `PM start` | `documents/aabt-workflow.md` + `documents/product/product-overview.md` + `documents/environment-setup.md` (its presence means environment setup is done) (+ after environment setup: dev track files + `documents/delivery-playbook.md` + `documents/iteration-plan.md`) |
| `dev-chip start` | `documents/tracks/dev-chip.md` |
| `dev-dale start` | `documents/tracks/dev-dale.md` |
| `start setup` | Read `documents/environment-setup.md` (create it if missing), brief the progress, then continue Strike Trio skill Phase 2 **one step at a time**. (Infrastructure is tracked in this checklist, NOT as Tracker Boot Chores.) |
| `/story` or `write story` | **Re-read all of §4** in `documents/aabt-workflow.md`, then apply the self-check checklist to write and register the story. Always go through this trigger before writing a story or putting it in the tracker (don't rely on memory). |
| `create a persona` / `persona workshop` | Run the persona builder skill. Check `documents/product/product-overview.md` and the `documents/product/personas/` folder, then start the workshop. |

> **`dev-* start` is NOT a keyword a human types.** It's a **Dev-session-internal trigger** that `ready-*.command` injects automatically when launching a Dev session. So when guiding the PM through story assignment, never say "type `dev-* start`" — the correct guidance is **double-click `ready-*.command`** (delivery step 1). Full Dev trigger rows are added once Dev names are collected in environment setup.

> **On `PM start`, judge whether environment setup is done by `documents/environment-setup.md`.** If the file exists, setup is (essentially) done — read its progress and brief in delivery mode, and if a step is still ⬜ (e.g. 6. Verify), guide that one first. **Do NOT misjudge "before setup" when the file is present.** Only when the file is entirely absent are you before setup (D&F stage), so proceed with D&F using `aabt-workflow.md` + `product-overview.md`.

> **When registering a story in the tracker, always go through `/story` — no exceptions.** A missing As / I want / so that is almost always the result of skipping this procedure.

> **D&F briefing on PM start**: After reading product-overview.md, check each D&F section for content, update the progress table, and deliver a briefing in this format:
> ```
> 📋 D&F Status
> ✅ Vision — "..."
> ✅ Personas — [name list + one-line Needs & Wants summary per persona]
> ⬜ Problem Priority — starting here.
> ```
> When all stages are complete (= before setup): "D&F complete. Now say «start setup» and I'll set up the development environment (repo, tracker, commands)."
>
> **Persona stage**: If the Personas row shows ⬜ in the D&F status, prompt: "You can proceed with the persona builder skill."

## Delivery Cycle — Follow This Order Without Exception

Full details in `documents/delivery-playbook.md`. Steps in order:

1. **Story assignment** — PM says "start dev" → Claude writes story into track file → double-click `ready-[dev].command`
2. **Preview check** — Dev pushes → PM pastes notification → Claude presents preview URL → PM clicks and checks
3. **PR** — PM says "PR it" in Dev session → Dev runs `bash commands/pr.sh <track>` (bot-authored PR)
4. **Code review** — Claude reads diff → PM approves (`approve-[dev].command`) or requests changes (`decline-[dev].command`)
5. **Merge** — PM double-clicks `merge-[dev].command` → merges to main → story marked Delivered → PM checks acceptance URL
6. **Accept** — PM says "Accept" → story Accepted in Tracker Boot → `promote.yml` publishes to production (auto, ~5 min)

## PM Session Response Formats

- Lead with the result or decision, not a preamble
- Preview/acceptance checks: present URL as a **clickable markdown link** — never raw text
- Story assignment: number + title + track directive only in the track file (no AC copy)
- Feedback: written as a Tracker Boot comment (`tb_create_comment`) — not in the track file
- After any PM doc edit: always end the response with the `push-docs.command` reminder

## Dev Track Report — Three Gates the PM Checks

| Gate | When | What to verify |
|------|------|---------------|
| **Preview** | After Dev push notification | Feature works on the preview URL; no visual regressions |
| **Code review** | Before approve/decline | Diff quality: duplication, naming, structural triggers; Refactor line honest |
| **Acceptance** | After merge to main | Feature works on acceptance URL; production unchanged |

## Track File Rules
- When PM updates a track file, never modify `## Notification Protocol` or `## Development Rules` sections
- `## Current Story` section must contain **exactly one story at all times. Only the number, title, and a track directive** — never copy-paste the details or AC (the source of truth is the tracker, the Dev reads it with `tb_get_story`).
- Both replacing and appending are **strictly forbidden until the "Accept" keyword is received.** Even if the next story is discussed, feedback is written, or another story is ready — do not add or write any new story to this section.
- `## Completed Stories` keeps **only the latest 5** (delete older — full history is in Tracker Boot). Each entry is `- #[number] — [title]` on **one line, no parenthetical asides** (the full story lives in the tracker). Keep `## Current Codebase State` concise — a core file tree + one-line descriptions.

## Deployment Rules (single site + deploy contexts)

**Site**: striketrio-beone.netlify.app

| Context | Branch | URL |
|---------|--------|-----|
| Production | `production` | https://striketrio-beone.netlify.app |
| Acceptance | `main` | https://main--striketrio-beone.netlify.app |
| Preview | PR branches | https://deploy-preview-{PR}--striketrio-beone.netlify.app |

- Merging a PR to `main` triggers the acceptance deploy — **production does not change.**
- `promote.yml` fast-forwards `production` to the accepted commit after PM Accept (~5 min).
- Never deploy to production by hand — the tracker's Accepted state is the gate.

> ⚠️ **One Netlify setting still needed**: go to Netlify → striketrio-beone → Site configuration → Build & deploy → **Production branch** → change from `main` to `production`. Until this is done, `main` deploys to production instead of acceptance.

## Document Persistence Rule — persist PM docs the moment they're edited

> ⚠️ **Dev merge/ready runs `git reset --hard origin/main`, which wipes uncommitted changes entirely.** When the PM session edits a git-tracked document — `product-overview.md`, `CLAUDE.md`, `aabt-workflow.md`, `delivery-playbook.md`, etc. — it stays provisional until committed and is lost at the next merge.

- **Right after editing a PM document, double-click `push-docs.command`** to persist it to origin/main. (It's a command double-click, so it doesn't violate the "never ask to push" rule.)
- **Prompting the persist is Claude's duty — it does not rely on Jess's memory.** When Claude (PM session) edits a git-tracked document (product-overview, CLAUDE.md, aabt-workflow, delivery-playbook, etc.), it must, **within that same response**, tell the user to "double-click `push-docs.command` to persist." Since Claude is the one who made the edit, prompting in the same turn is the most reliable point. Never end a response that edited a document without the persist prompt.
- Do not trust an unpersisted document change — it can vanish at the next merge.
- `documents/tracks/*` is safe from this (`.gitignore` + symlink). The persistence target is everything else.

## Preferences
- Default language: English
- Responses: concise, confident, no unnecessary preamble
- Format: prose-first, bullets only when truly necessary
- UI language: English only
- Address Jess by name.
