# archive/

Frozen snapshots. Nothing in here is built, imported, or run — it exists so work
isn't stranded on a machine or an account we don't control.

## `sports-hq-2026-07.tsx`

A **divergent July-2026 branch** of the app, not an older backup and not a newer
version. Preserved here on 2026-08-15 from its only copy, which lived on a work
OneDrive account (`citycreekconstruction.com`) outside this repo.

It shares a common ancestor with mainline `fandom-five.tsx` — the `GAMES` array is
byte-identical in both — and then the two diverged:

- **Mainline grew:** the CFB Hub, season simulator, bracket predictor, poll board,
  history vault, team compare, embedded base64 logos.
- **This snapshot grew:** team-page depth — honors walls, franchise timelines,
  live player profile modals, per-team mascot analysts, hardcoded schedules,
  victory alerts, a throwback-logo mode.

Neither is a superset of the other. Mainline is the newer of the two
(`as of Aug 2026` annotations vs `July 2026`; the newer-generation
`claude-sonnet-5` vs `claude-sonnet-4-6`), despite this file carrying a later
filesystem mtime from OneDrive sync.

**Copied verbatim — do not edit.** md5 `f75816da9af1a03332ea6666af3caf03`.

See `../PORT-CANDIDATES.md` for the component-by-component assessment of what's
worth pulling forward. Tier 1 of that list has since been ported to mainline.
