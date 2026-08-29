# PLAN — the session ladder

Session 1 built the sheet, the engine, and a scatter draft of all twelve
lands. Every session from here builds it out or up under
`design/QUALITY-BAR.md`, and `design/WORLD-SYSTEMS.md` is the standing
plan for everything that is not a land.

**The ordering rule (owner decision, 2026-08-28):** *systems that change
how a land is authored must land before the lands are authored.*
Elevation, the camera, traversal and time all do. Building six more
lands flat and then adding elevation means re-opening six lands — so the
ladder was re-cut after Session 3 to put the foundations first.

**The same rule moved THE SCORE forward** (2026-08-29): a land's VOICE
is part of authoring the land, so per-land music belongs ahead of the
five lands still to be built, not in the polish pass at the end. It sat
at Session 11; it is Session 8. Nothing else moved, and the story stays
at Session 7 where the owner put it.

**And one standing rule governs everything from here** (owner
direction, 2026-08-29): *the medium is the style, never the subject.*
No story about the paper, the pen or the drawing. Every candidate
DIRECTION.md carried before that date was one, and all of them are
retired; the chosen story is **THE 8:15** (`design/STORY.md`).

| # | Session | Scope |
|---|---------|-------|
| 2 | **The first minute** ✓ 2026-08-28 | THE COMMON + the title framing + the south face of THE KINGDOM OF BRIM. Gate to WOWED (`critique-art-1.md`). |
| 3 | **The old world** ✓ 2026-08-28 | CASTLE GREYWEATHER + THE KINGDOM interior. The flagship keep walk. Gate to WOWED (`critique-art-2.md`). |
| 4 | **The paper has a shape** ✓ 2026-08-28 | **Foundations.** Terrain elevation (crease / curl / buckle / tear / what's under the sheet) in `elevation.ts`, routed through the build context; a fold DRAWN rather than shaded; the camera redesigned around it; footprints, collision and the character lifted; steep made impassable. Portrait made a gated viewport. The margins inheritance audit executed. Greyweather rebuilt on a real ridge. Gate to WOWED (`critique-art-3.md`). |
| 5 | **The coast** ✓ 2026-08-29 | LONGSHORE + THE WIDE BLUE, the first lands authored *with* elevation. THE HOLDFAST (a headland the tear went round, authored as a polygon so its faces are planar), THE CUT (a ledge graded out of the page — the only way up), SHELTER COVE, and THE SANDBAR, which is what makes open water a land you can walk. Four new audio voices and two new instruments. Gate to WOWED (`critique-art-4.md`). |
| 6 | **Traversal & time** ✓ 2026-08-29 | **Foundations.** Sprint as INK WEIGHT (one continuous scalar: speed, stride, the print's ink, the step's level and the score's intensity are all readouts of it, and the middle of its range is the shipped mark). Roads that CARRY, authored per road and *measured* — the king's road / main street / commuter spur chain carries hardest, because STORY §4 makes it one road under twelve names. THE ROWBOAT, the first mount: found at the river mouth, left where you leave it, the river turned from a wall into the only east–west road in the world, and the open sea authored to refuse. And THE DAY CYCLE — forty minutes, graded in one place, with eight in the morning to four in the afternoon bit-for-bit the shipped page, plus Brim's lamps, its windows and two fires at Greyweather's gate. Gate to WOWED (`critique-art-5.md`). See `design/specs/traversal.md`. |
| 7 | **The stories** | The story is LOCKED (**THE 8:15** — `design/STORY.md`) and its architecture written (`design/QUESTS.md`, six tiers). This session **maps all of them**: THE LINE's four acts beat by beat, the twelve WAITS, the eight STRANGERS, and the errand/encounter/unmarked inventories — then builds the content system around KNOWLEDGE rather than collection (WORLD-SYSTEMS §6), makes the map the record, and does the voice pass the story requires (STORY.md §8 rule 7). From here every land session ships places **and** its wait **and** its named inhabitant. |
| 8 | **The score** | Owner direction, 2026-08-29: each land gets its own music, not the same music box in a different mode. One synthesised instrument per land, a bed per land, borders that crossfade, and a mix that answers the hour and how you are moving. See `design/WORLD-SYSTEMS.md` §9. |
| 9 | **Farm & forest** | THE HARROW DOWNS + THE PENWOOD: field patchwork vs pine dark; the tarn; the forest track. |
| 10 | **The dry lands** | SPLITROCK CANYON (a tear in the page) + THE BLEACH FLATS: corridor drama, the oasis as reward. |
| 11 | **The now** | MAPLE COURT + GREYLINE CITY + THE CUBICLE MILE: street rhythm, lit windows at dusk, the junction — and the 8:15 drawn into existence. |
| 12 | **Motion & life** | Systems pass: wind everywhere, sails and windmills turning, NPC routines, road encounters. (The score moved out of this session to 8 — see the ordering rule.) |
| 13 | **The juror** | Awwwards pass on the whole build: title, first minute, map, UI feel, mobile portrait, performance audit, then the full-gauntlet critique. |

**This ladder does not reach the owner's target yet, and it should say
so.** The target is now HOURS of play, not a short walk
(`design/WORLD-SYSTEMS.md` §0). Sessions 2–13 build a world that is
complete, beautiful and roughly four to six hours deep. Getting to
twelve-plus needs about five more, and they are the ones DIRECTION.md
sizes: **interiors** (they multiply the map without expanding the
sheet), **inhabitants and routine** (§5 — the cheapest texture per byte
in any world), **weather** (§7 — it multiplies every land again, the way
time does), and **one authoring pass for the story's evidence** across
all twelve lands. They are deliberately NOT numbered here: the story
pick at Session 7 decides what they contain, and putting numbers on them
before that is planning fiction.

Rules of the ladder:

- A session may swap scope up the ladder, never skip the gate.
- Improvements to already-WOWED lands are welcome; regressions are not.
- Mounts arrive with their quadrant's land session (WORLD-SYSTEMS §4).
- Blots/caves stay parked until the story gives them a reason (§ audit).
- Every session ends: build green, pushed, SESSIONS.md updated,
  critique logged in design/critiques/.
- **Elevation is authored, not sprinkled.** A land session that wants
  ground it does not have edits `src/world/elevation.ts` in the sheet's
  own vocabulary (§1) and re-runs `node tools/check-terrain.mjs`. No
  other file may invent a height.
- **Both viewports, every sheet.** `tools/shoot-lib.mjs` does it for
  free; there is no excuse left for judging landscape only.
- **The camera only ever looks north, and that decides LAYOUT.** A thing
  the player walks ALONG runs north–south; a thing they LOOK at is north
  of where they stand. Session 5 lost rounds to a boardwalk laid
  east–west and a regatta staged west of its viewpoint. Check the
  bearing before placing, not after.
- **Author landforms with PLANAR FACES.** The terrain draws a cliff in
  strokes down its fall line, and a doubly-curved landform has no
  constant fall line to draw down — it comes out as a thumb print. Paper
  tears in straight runs and turns at corners; use that.
