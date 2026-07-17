# Be-one — Environment Setup

*Last updated: 2026-07-15*

> The **single source of truth for this project's environment-setup progress and infrastructure values.** On the `start setup` trigger, Claude reads this file and briefs "where we are and what's next." (Mirror of D&F's `product-overview.md` — status lives on the deliverable document.)
>
> ⚠️ **Onboarding ≠ Phase 2.** Installing the Claude desktop app, accounts, tools, and the skill is **once per person·machine** (onboarding) — not recorded here. This document only covers the resources created **fresh for each project** (TB project, repo, site, bot invite).

---

## Setup progress

On `start setup`, Claude reads the table below to brief the current position, and updates it as each step finishes. **One step at a time** — don't move on until the previous is ✅.

| Step | Status | Value / note |
|------|--------|--------------|
| 1. Tracker Boot project | ✅ | Project ID: 100000292 |
| 2. GitHub repo | ✅ | hwyann/be-one (private) |
| 3. Bot access | ✅ | strike-trio-devbot, push access; token in ~/.strike-trio/.env |
| 4. Deploy hosting | ✅ | striketrio-beone.netlify.app |
| 5. Local wiring | ✅ | .env.local created; src/lib/supabase.js wired |
| 6. Verify (first ready) | ✅ | https://striketrio-beone.netlify.app loads |

Status marks: ⬜ not done · 🔄 in progress · ✅ done

---

## Team gate (bot path)

- [ ] **Are you on the Bekind Labs team?**
  - **Yes** → internal shared bot `strike-trio-devbot`. Token lives in global `~/.strike-trio/.env` (wired once at onboarding).
  - **No** → your own team bot (self-sufficient). Create it once if you don't have one.

---

## Collected infrastructure values

*(Claude fills these in as each step is confirmed.)*

- **Tracker Boot Project ID**: 100000292
- **GitHub repo**: `hwyann/be-one`
- **Deploy hosting**: `striketrio-beone.netlify.app`
- **Production URL**: https://striketrio-beone.netlify.app
- **Acceptance URL**: https://main--striketrio-beone.netlify.app
- **Preview URL pattern**: https://deploy-preview-{PR}--striketrio-beone.netlify.app

### Supabase Edge Function secrets

- **`ANTHROPIC_API_KEY`** — required by `generate-kr-summary` edge function. Set once per Supabase project via `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`. Rotate here (not in code) if leaked.

---

## Per-step notes

*(Record blockers, decisions, and any manual account actions here — so a later session can pick up if this one is interrupted.)*

---

*This file is actively updated only during setup. Afterward it remains as the reference for infrastructure values.*
