# Port candidates from the stray "Sports HQ.tsx"

**Written:** 2026-08-15
**Source (read-only, never modified):** `C:\Users\jgold\OneDrive - citycreekconstruction.com\Desktop\Sports HQ.tsx`
**Target:** `fandom-five.tsx` (this repo, mainline)

---

## Why this file exists

The stray file is a **divergent July-era branch**, not an older backup and not a newer version. Its filesystem mtime says 2026-08-15 18:17, which is misleading — three independent content markers say mainline is newer:

| Signal | Stray | Mainline |
|---|---|---|
| Dated annotations | `as of July 2026` only | `as of Aug 2026` **and** July |
| Model ID in API calls | `claude-sonnet-4-6` (older gen) | `claude-sonnet-5` (newer gen) |
| Logo strategy | `/logos/*.png` + ESPN CDN + SVG fallback | 7 embedded base64 in `LOGOS` |

The `GAMES` array is byte-identical in both (same md5), confirming a shared ancestor. Mainline then grew the CFB Hub and the analytics suite; the stray grew team-page depth. **Neither is a superset.** 12 real components live only in the stray (13 counting the old `SportsHQ` export name, now `FandomFive`).

**The good news on friction:** the two `TeamPage` functions are near-identical line-for-line, and both compute `glass` / `accentBg` / `valColor` the same way. Mainline already passes exactly the `ui` object shape these components expect:

```js
ui={{ glass, accentBg, accentColor: valColor, text: "#fff",
      idleBtn: "rgba(255,255,255,0.12)", idleBorder: "1px solid rgba(255,255,255,0.25)" }}
```

`ConfettiLayer` (line 130), `playFanfare`, and `useStorage` are identical in both files. So most of these are genuinely paste-plus-one-line jobs, not rewrites.

**One global gotcha:** every ported network component needs `claude-sonnet-4-6` → `claude-sonnet-5`. Both are real, currently-active models — Sonnet 4.6 is simply the older generation, and mainline has already moved to Sonnet 5. Bump on port so all API calls in the file stay on one model.

---

## Tier 1 — Port these. Clear value, low friction.

### 1. `HonorsWall` + `MiniJersey` + `TEAM_HONORS` — ~80 lines
**What it does:** A per-team trophy case. Three cards: championships (gold-bordered trophy chips), retired jerseys rendered as little SVG jersey shapes with the number on them, and individual hardware (Ohtani's 3 MVPs, Malone's 2, Hurts' SB LIX MVP, Dybantsa's All-American nod).
**Depends on:** `TEAM_HONORS` (static, 5 teams — no `byufootball` entry), `MiniJersey`, `ui`. Zero network.
**Friction:** Trivial. Paste two functions + one const, add one line to `TeamPage`.
**Honest read:** **Port this first.** Best value-to-effort ratio in the entire file. It's pure static data with no failure modes, and `MiniJersey` is the single most charming piece of code in either file — a hand-drawn SVG jersey with the number sized down when it's 3 digits. The empty-state copy for the Mammoth ("The case is empty — for now. This franchise's story is just starting. 🦣") is a nice touch you'd have to re-invent.

### 2. `Franchise` + `FRANCHISE` + `TROPHIES` — ~30 lines
**What it does:** Founded date, legends list, and a year-by-year timeline per team (Jackie Robinson 1947 → back-to-back 2025; Mammoth 2024 arrival → 2026 first playoff berth).
**Depends on:** `FRANCHISE`, `TROPHIES`, `ui`. Zero network.
**Friction:** Trivial, same shape as above.
**Honest read:** Port it, but **dedupe on the way in.** `TROPHIES` is ~90% redundant with `TEAM_HONORS.trophies` — same years, same labels, different key name. Pick one source of truth or you'll be editing Dodgers championships in two places forever. The timeline data itself is the valuable part and would be tedious to reconstruct.

### 3. `Collapse` — 11 lines
**What it does:** Generic accordion — icon, title, chevron, animated open/close body. Takes `T` (the BYU theme object), not `ui`.
**Depends on:** Nothing.
**Friction:** Trivial.
**Honest read:** Low value alone, high value as an enabler. Mainline's `TeamPage` is already a very long single scroll, and every Tier 1/2 port makes it longer. This is the thing that keeps it navigable. Port it *with* the others, not instead of them. Note it's written for `T`, so either generalize it or use it only inside `BYUFootballHQ`.

---

## Tier 2 — Worth porting, but there's real work or a real caveat.

### 4. `PlayerModal` + `PLAYER_CACHE` — ~63 lines
**What it does:** Tap any player in the KEY PLAYERS list → bottom-sheet modal that live-fetches a bio, 4–6 current stats, and 2–3 recent headlines via the API with web search. Caches per player name for the session.
**Depends on:** `useState`/`useEffect`, the Anthropic fetch pattern, `ui.accentColor`.
**Friction:** **Moderate — the only one needing changes to existing mainline code.** Mainline renders players as inert `<div>`s (line ~1400); the stray renders them as `<button>`s with `onClick={() => setPlayerOpen(pl.name)}`, plus a `playerOpen` state at the top of `TeamPage` and the modal at the bottom. That's ~15 lines of edits across 4 spots, plus the model-ID bump.
**Honest read:** **This is the best feature in the stray file.** It's the one that makes team pages feel alive instead of static — every roster name becomes a door. The JSON-extraction code is also more defensive than you'd expect (walks text blocks backwards, falls back to joining them, try/catch on each parse), so it's not fragile the way the LLM-scraping in `VictoryWatch` is. If you port exactly one thing from Tier 2, port this.

### 5. `TeamAnalyst` + `ANALYSTS` — ~63 lines
**What it does:** A per-team mascot chatbot. Jazz Bear for the Jazz, Swoop for the Eagles, Tusky for the Mammoth, Cosmo-in-hoops-mode for BYU BB, and a smooth broadcast-booth voice called "Blue" for the Dodgers. Collapsed card → 420px chat panel with suggestion chips, message history, and a live system prompt built from that team's record, status, players, storylines, and upcoming schedule.
**Depends on:** `ANALYSTS`, `SCHEDULES` (so it wants #6 too), `team.record` / `.status` / `.players` / `.notes` (mainline's `TEAMS` already has all of these), `ui`.
**Friction:** Moderate. Self-contained component, one line to wire up — but the `SCHEDULES` dependency means porting #6 as well, and the model ID needs bumping.
**Honest read:** Port it. The code is ordinary; **the `ANALYSTS` personality descriptions are the actual asset** and they're genuinely well-written — "gritty Philly energy, zero patience for doubters," Jazz Bear being "honest about the rebuild while hyped on the young core." That voice work is the expensive part to recreate and it's sitting right there. Note there's deliberately no `byufootball` analyst — BYU football has `AskCosmo` in its own sub-hub, so the coverage is already complete.

### 6. `TeamSchedule` + `SCHEDULES` — ~72 lines
**What it does:** Clean schedule table for Mammoth (15 games), Eagles (15, with Preseason/MNF/SNF/London/Thanksgiving tags), and Jazz (15). Date, home/away, opponent, tag pill, tip time.
**Depends on:** `SCHEDULES`, `ui`. Zero network — despite the note text claiming "synced from live NFL data," it is hardcoded.
**Friction:** Trivial mechanically. The caveat is strategic, not technical.
**Honest read:** Port it, but know what you're taking on. These are hardcoded 2026-27 dates that go stale on their own, and that copy saying "synced from live data" is currently a lie. Mainline's whole direction has been the opposite — 10 live fetches, `SCHED_CACHE`, `WEEK_CACHE`. So treat this as **a scaffold with real data in it**, valuable today because `TeamAnalyst` and `buildTimeline` both read from it, but the thing you'd eventually replace with a live pull. Fix the note text on the way in.

---

## Tier 3 — Skip. Superseded or not worth the weight.

### 7. `TeamLogo` + `LOGO_SOURCES` + `TeamCrest` — ~42 lines
**What it does:** Three-step logo fallback chain — try `/logos/<team>.png`, then the ESPN CDN, then a generated SVG crest (gradient circle, team initials, diagonal speed stripes).
**Honest read:** **Superseded, and mainline's answer is better.** Mainline embeds 7 base64 logos directly in a `LOGOS` const: no network, no 404 cascade, no missing-file state. The stray's chain points at `/public/logos/`, which does not exist in this repo — you have a `Team Logos/` folder with entirely different filenames. The comment at stray line 1282 gives the game away: *"drop them in /public/logos/ after the Claude Code migration."* That migration already happened, and embedding is what came out of it. `TeamCrest` is a genuinely nice piece of SVG, but with `LOGOS` populated the fallback path never executes — you'd be porting 42 lines of dead code. Skip all three.

### 8. Retro / throwback mode — `RETRO_MODE`, `RETRO_COLORS`, `sportshq_retro` — ~10 lines + wiring
**What it does:** A 🕰 nav toggle that swaps in throwback logos from `/logos/throwback/` and overrides team colors (Eagles kelly green, Jazz purple-and-teal).
**Honest read:** **Dead end — skip.** Three independent reasons. It's built entirely on the `TeamLogo` fallback chain you're not porting. It only has color overrides for 2 of 6 teams, so four teams get a toggle that visibly does nothing. And `let RETRO_MODE = false` is a module-level mutable global read during render — a React anti-pattern that only works because of a manual `modeRef` comparison hack inside `TeamLogo`. If you want throwback mode, rebuild it properly against the embedded `LOGOS` const; don't port this.

### 9. `buildTimeline` + `TIMELINE` — ~19 lines
**What it does:** Merges `GAMES` and `SCHEDULES` into one chronologically sorted cross-team event feed for the home hub.
**Honest read:** Mostly superseded — mainline has `ThisWeek` plus `WEEK_CACHE`/`HOMENEWS_CACHE` doing a live version of this idea. It also has a real bug waiting: `parse()` hardcodes `new Date(2026, mo, day)`, so every event silently lands in 2026 forever. Skip unless you specifically prefer a static, offline-safe timeline — in which case fix the year first.

### 10. `VictoryWatch` + `WIN_LINES` — ~80 lines
**What it does:** On home-hub load, fetches a one-line status per team, diffs it against the last seen line in `sportshq_celeb`, and if it detects a win fires confetti, a fanfare, and a gold "VICTORY ALERT" banner — with blowout detection ("💥 STATEMENT WIN +21") using per-sport margin thresholds (6 for the Dodgers, 4 for the Mammoth, 17 otherwise).
**Honest read:** **Port the idea, not the code.** The concept is the most *fun* thing in the stray file and the per-sport thresholds show real thought. But the implementation regex-scrapes free-text LLM output for wins — `/\b(won|win|beat|defeated|victory)\b/i` — then grabs every number ≤200 and subtracts the last two for the margin. A line like "lost to Denver after beating them Tuesday" fires a false celebration; "won 4-2 in the 11th" can compute a nonsense margin. It's a false-positive machine pointed at confetti. Mainline already has structured live score data (`SCORES_CACHE`, `CFBScoreboard`, 10 live fetches) — rebuild the alert on top of *that*, where you have real home/away scores, and keep `WIN_LINES` and the threshold table verbatim. Those two small consts are the part actually worth saving.

### 11. `FootballHonors` — ~53 lines
**What it does:** BYU-football-specific honors wall — 1984 national title, 20+ conference titles, honored jerseys (8 Young, 9 McMahon, 14 Detmer), and hardware down to LJ Martin's 2025 Big 12 OPOY.
**Depends on:** `MiniJersey`, the `T` theme object. Belongs in `BYUFootballHQ`, not `TeamPage`.
**Honest read:** Sits between tiers, and I checked the overlap rather than assuming it. Mainline's `HistoryVault` is **era-narrative** (Early Years / LaVell / modern, with win-pct bars and prose) — it is *not* a trophy-and-jersey wall, so this genuinely doesn't duplicate it. Real value, but lower than Tier 1: it's one team's static data, and it only pays off if you've already ported `MiniJersey`. Port it as a follow-on to #1 if the BYU sub-hub feels thin, otherwise leave it.

---

## Suggested order

1. `MiniJersey` + `HonorsWall` + `TEAM_HONORS` — one line into `TeamPage`, instant payoff
2. `Franchise` + `FRANCHISE` — dedupe `TROPHIES` against `TEAM_HONORS` as you go
3. `TeamSchedule` + `SCHEDULES` — unblocks #5, fix the "synced from live data" note
4. `PlayerModal` — the one that changes how the app feels; needs the player-row → button edit
5. `TeamAnalyst` + `ANALYSTS` — bump the model ID
6. `Collapse` — once the page is long enough to need it
7. *(optional)* `FootballHonors` into the BYU sub-hub

Skip: `TeamLogo`, `LOGO_SOURCES`, `TeamCrest`, retro mode, `buildTimeline`. Rebuild `VictoryWatch` on mainline's structured scores rather than porting it.

**Global on every port:** `claude-sonnet-4-6` → `claude-sonnet-5`.

---

## Loose end worth closing

The stray is the only copy of this work and it lives on your **work** OneDrive (`citycreekconstruction.com`), not your personal one. Whatever you decide about porting, it's worth getting a copy somewhere you control — even just committed to this repo on a `stray-july-branch` branch so the 12 components have a home that isn't tied to a corporate account.
