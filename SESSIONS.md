# SESSIONS — the handoff log

## Session 3 — 2026-08-28 — the old world

### Shipped
- **THE KINGDOM OF BRIM interior rebuilt to spec**
  (`design/specs/kingdom-of-brim.md`): six places — the south gate
  inside, the high street, Brim Square, the belfry yard, the orchard
  close, the Wood Gate. Terrace runs of half-timbered houses
  (`townRowTexture`, 6 seeds, front- AND side-gabled roofs mixed)
  replace the 14 scattered cottage stamps; the square gets a
  two-tier fountain, market cross, five stalls, bunting, crates,
  cobble-wear; the belfry is now full-pressure with a clock whose
  hands disagree. East + north walls rebuilt in the Session 2 wall
  register with drum towers and a new north gate.
- **CASTLE GREYWEATHER rebuilt to spec**
  (`design/specs/castle-greyweather.md`): the banner avenue tightens
  toward a low gatehouse, the ridge wall rides its crags, the bailey
  keeps a toppled king and the castle well, the moat pool gets reeds
  and a wind-flagged hawthorn, and a pencil pine treeline closes the
  north horizon.
- **The Session 2 vista placeholder is gone.** The pale roofline rank
  is replaced by the real town plus a new `backStreetTexture` far
  rank (long ridges + chimneys, never a picket of triangles) that
  fades as the walker closes on it.
- **New prop box** `src/world/textures-oldworld.ts` (~20 textures).
- **Motion**: bunting breathing, swifts round the belfry, pigeons that
  scatter when you walk into them, rooks circling the keep and a
  parliament on the statue that breaks when you approach, banner-field
  wind. **Sound**: `brim-bell`, `market-murmur`, `pigeon-flap`,
  `banner-snap`, `rook-caw`, wired per region in App's ambience.
- **Gate: WOWED** after 4 rounds — `design/critiques/critique-art-2.md`
  (verbatim). Protected now: the north-gate reveal, the banner avenue
  with the keep clearing its gatehouse, and Brim Square under bunting.

### State
- Build green; `tools/shoot-oldworld.mjs` is the Session 3 contact
  sheet; Session 2's protected framings re-shot and verified richer,
  not regressed.
- Four lands hold the bar (Common, Brim south face + interior,
  Greyweather). Ladder says Session 4 = THE COAST.

### Gotchas (new; Sessions 1–2 all still apply)
- **The frame-top ceiling decides all architecture.** The shipping
  camera shows only ~10 world units of height at 33 units out and
  ~16 at 82. Anything taller crops, and a tall near building fills
  the upper frame so nothing behind it can be seen at all. That is
  why Greyweather's keep is drawn WIDE (640×320, 34×17 units) and its
  gatehouse is only 9.5: height contests are won by spread, not by
  scale. Do not "fix" a hidden landmark by making it taller.
- Gate arches need `passFade(px, pz, gx, lo, hi)` — the camera trails
  12 units behind the walker, so a fade keyed to the walker alone
  pops while the camera is still inside the arch. Both Brim gates,
  the Greyweather gatehouse and the whole ridge wall use it.
- The pale/failing-pressure register is a DISTANCE register only: any
  pale standee within ~16 units reads as a flat grey slab. Fade them.
- Region builders can fire audio without plumbing: dispatch
  `inklands:event` on window (App bridges it to `Audio.event`).
- `layout.ts` gained one road (the market lane, Brim Square → Wood
  Gate). No rect, river, bridge, mood or step-zone change; terrain and
  map pick roads up automatically.
- `bannerTexture(seed, 'red'|'blue')` now takes a forced color — the
  coin-flip was putting blue banners in a land whose accent is red.

## Session 2 — 2026-08-28 — the first minute

### Shipped
- **THE COMMON rebuilt to spec** (`design/specs/the-common.md`, the
  first land spec): six named places (crossroads, well, oaks, gate
  fields, long fence, riverbend), cluster-scattered grass in six
  drawings + tall seedheads + three one-species flower drifts, worn
  ground under every place, two composed voids. New prop box in
  `src/world/textures-common.ts` (~25 textures).
- **The Brim vista** (kingdom south face, in `buildKingdom`): varied
  wall segments + drum towers, the rebuilt south gatehouse
  (`brimGateTexture`) with red pennants (animated), town rooflines +
  belfry stacked behind the battlements, and the false-perspective
  pencil keep (`keepVistaTexture`, a meadow standee) that fades before
  the walker reaches the wall. Roof/belfry layer fades once inside the
  town. East wall stays draft for Session 3.
- **The title poster**: pulled-back pre-start camera, loader now fully
  lets go before the title letters in (title-veil starts `gone` +
  0.75 s delay), portrait subtitle clamped.
- **Engine**: `hatch()` clips itself (was spraying streaks from every
  wide box); StandeeField wind sway + player-bend (`wind` opt,
  `setPlayer`); region updates receive `(dt, t, px, pz)`; meadow
  ambience (`lark`, `well-plink` events + App ticker); swallows,
  rope-swing pendulum.
- **Gate: WOWED** after 6 rounds — `design/critiques/critique-art-1.md`
  (verbatim, all rounds). Title framing, gate stack, and well/poppy
  cluster are now protected compositions.

### State
- Build green; all 12 lands verified walkable (`tools/shoot.mjs`);
  first-minute framings in `tools/shoot-first-minute.mjs`.
- THE COMMON + the Brim south face hold the bar. Kingdom interior,
  castle, and everything else remain scatter drafts — ladder says
  Session 3 = CASTLE GREYWEATHER + KINGDOM interior.

### Gotchas (new; Session 1's all still apply)
- The keep vista is FALSE PERSPECTIVE (meadow-owned standee at
  z≈−52, fog off). Session 3 must keep its fade (gone by z<12) or
  players catch it standing inside the town.
- The camera passes through the gate arch entering Brim — reads as
  "walking under", but Session 3 should add a proximity fade.
- Meadow lean-grass is never x-flipped: the wind lean is drawn in.
- Headless screenshot pages that aren't foregrounded get rAF-throttled
  (the loader tween never finishes) — `bringToFront()` in shoot
  scripts, and close the desktop page before the portrait one.
- Rooflines/belfry and the vista keep are placeholders the Session 3
  town must REPLACE seamlessly from the south approach: re-shoot
  `09/10` framings and diff against the WOWED sheet before removing.

## Session 1 — 2026-08-28 — the sheet

### Shipped
- The whole engine, ported from `uxpreview/margins` branch
  `claude/margins-s13-quality-bar-ulkjig`: ink library, paper, hand
  lettering + handwriting synthesis, footprints, character, paper
  post-pass, all-procedural audio.
- One continuous 760×560 sheet with twelve walkable lands, roads, a
  river with three bridges, ocean/ponds/oasis; painted wash terrain
  whose pixels double as collision, step timbre and print suppression.
- Region streaming with the ink-in cascade; the vista camera (replacing
  margins' steep page camera — that change is what made landmarks
  visible at distance); per-land music moods; three new step surfaces;
  the hand-drawn map (M); 24 POI notes; localStorage save.
- Hosted: Vercel project `adventure` (imported by owner; the connector
  cannot create projects — 403), production tracks this branch at
  https://adventure-ryankm.vercel.app.

### State
- Build green (`npm run build` = tsc + vite). All twelve lands verified
  walkable under Playwright with real keys (`tools/shoot.mjs`).
- **Quality: everything is a scatter draft.** No land has faced a gate;
  design/QUALITY-BAR.md now governs; PLAN.md is the ladder; Session 2
  is THE FIRST MINUTE (see PROMPT.md).

### Gotchas
- **Deployment Protection is still ON** — the URL is team-only until
  the owner flips Vercel Authentication off (Settings → Deployment
  Protection). The permission classifier blocks doing it from here.
- The sandbox egress proxy blocks `*.vercel.app` — verify deploys via
  the Vercel MCP tools (`web_fetch_vercel_url`, build logs), never the
  browser.
- Commits must be authored `Claude <noreply@anthropic.com>` — the
  owner's iCloud email is push-rejected by GitHub email privacy.
- `?debug` exposes `window.__inklands` (goto, region, terrain probes,
  audio); `tools/shoot.mjs` (all-lands contact sheet),
  `tools/verify-live.mjs` (hosted smoke test) depend on it.
- The camera decides everything: standees taller than ~4 units vanish
  above the frame if you steepen it back toward margins' angle. The
  terrain fog cap eases to full fog past ~2.6× fogFar so the desk never
  bands the horizon — keep that if touching fog.
- StandeeField ghost/cascade is the "world inks itself in" mechanic;
  region builders run once per land at stream-in and must stay
  one-frame cheap.
