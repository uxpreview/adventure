# The INKLANDS quality bar

*Binding on every session. Adapted from margins' `design/QUALITY-BAR.md`,
which earned its verdicts — but margins is a **reference, not an
authority**: this is a different game, and its inherited laws hold only
where INKLANDS has ratified them (§3). If a session cannot meet the bar,
the session ships less scope — never a lower bar.*

---

## 1. The target

INKLANDS is being built to win: **Awwwards Site of the Day and upward**,
and to be the walk people send each other the way they send *Alto's
Odyssey*, *Journey*, *Sable*, and *A Short Hike* — a drawn open world
that feels authored in every frame.

**The world comes first, then the systems, then the story.** Owner
decision, 2026-08-28: the foundations that change how a land is authored
(elevation, camera, traversal, time) land before the remaining lands do,
and the story is picked at Session 7 — see `PLAN.md`. Until then
DIRECTION.md holds the candidates; do not start one without the owner.
`design/WORLD-SYSTEMS.md` is the standing plan for everything that is
not a land.

## 2. The verdict gates

Nothing is "done" because it is placed. It is done when it survives its
critic, judged on **real screenshots from the running game** — never on
specs, never on intentions.

- **The art director** — rejects anything that looks procedural,
  placeholder, or like a tech demo wearing a style. Reviews a contact
  sheet of the session's lands (wide, mid, and detail shots per land,
  from the shipping camera, **desktop and portrait**) blind against
  *Gris*, *Sable*, and margins itself. The bar: *they cannot tell which
  world had an art budget.*
- **The Awwwards juror** — scores design, usability, creativity,
  content on the whole build: title, first minute, one full land
  crossing, the map. The bar: Site of the Day contention, not "nice".

A gate returns **WOWED** or **NOT YET**. NOT YET comes with the fewest,
deepest mandatory fixes — never polish notes. Iterate until WOWED.
Critiques are saved to `design/critiques/` (numbered, dated, verbatim),
and a land that earned a WOWED may not be regressed by a later session.

**Verdicts earned so far:** THE COMMON + the Brim south face + the
title poster (WOWED, critique-art-1); THE KINGDOM OF BRIM interior +
CASTLE GREYWEATHER (WOWED, critique-art-2); the sheet's ELEVATION, the
redesigned camera, and all four of those lands re-audited on the new
ground with Greyweather moved onto a real ridge (WOWED,
critique-art-3 — the first sheet judged in both viewports); LONGSHORE
and THE WIDE BLUE, the first two lands authored ON that ground (WOWED,
critique-art-4). Every other land is a scatter draft and is presumed
NOT YET.

## 3. The permanent constraints

- **Three.js + GLSL. Zero image assets.** Every mark via
  `src/engine/ink.ts` on canvases; every word hand-lettered. No binary
  art, ever.
- **Sketch-like but real.** Ballpoint line work over muted watercolor
  wash. Washes come only from `palette.ts` `WASH`; nothing outside that
  file invents a color.
- **One sheet, and the sheet has a shape.** The world is a single page
  on a desk. The rects in `src/world/layout.ts` are the shared truth of
  terrain, map, audio and collision — move content freely, move borders
  only with a layout-wide audit (map, roads, river, moods, step zones).
  The page is **not flat**: it creases, curls, buckles and tears (see
  `design/WORLD-SYSTEMS.md` §1). `src/world/elevation.ts` is the ONE
  authority on where the ground is — the mesh, the shading, the walker,
  every prop and all collision read the same grid, and nothing else may
  invent a height. Elevation is drawn from the paper vocabulary, never
  from generic hills, and standees stay vertical on slopes — they are
  cutouts standing on a warped page. **A fold is DRAWN, not shaded:**
  tone where the page leans out of the light, a pooled ink line down the
  bottom of a crease, and pen hatching down the fall line of anything
  that is actually a cliff. A smooth gradient on a hillside is an
  airbrush, and it cost this project two critique rounds to learn it.
- **Water cannot climb a hill.** The river, the sea and the ponds have
  BEDS (elevation.ts), and the river's falls monotonically from source
  to mouth. Anything blue that goes uphill is a bug, always.
- **`node tools/check-terrain.mjs` before you look at anything.** It
  bundles the height field and asserts the amplitude envelope, that no
  road is severed, that every standing place is reachable on foot from
  the spawn, and that Greyweather's south face still refuses. Cheaper
  than a screenshot and it catches what a screenshot cannot.
- **60fps on mid-range mobile**, portrait playable, DPR capped at 2.
  A land that cannot hold frame rate is redesigned, not shipped slow.
- **The build stays green.** `npm run build` (tsc + vite) passes before
  any commit; pushes auto-deploy, so never push what fails locally.
- **No faces.** The walker has two dots; nobody else has a face.
  Doodle-folk are posture, placement and clothing — which is exactly why
  they must express through routine instead (WORLD-SYSTEMS §5).
- **Mobile and desktop are both first-class.** Every contact sheet is
  shot in portrait (390×844) as well as desktop (1280×720), and the art
  director reviews both. A composition that only works in landscape is
  not done.
- **Inherited rules must be re-ratified or dropped.** This engine was
  ported whole from margins, and some of its laws are margins' story
  rather than our design — the flat ground was one, and it cost us a
  critique round before anyone noticed. When a rule blocks the world,
  ask first whether INKLANDS ever chose it. `design/WORLD-SYSTEMS.md`
  keeps the running audit.

## 4. What "good" means for a land

The margins environment bar, promoted to law for an open world:

- **THE SHOT.** Every land owns one composition people share
  unprompted, reachable by walking, framed by the real camera. If a
  land has no shot, the land is not done — density is not the fix,
  composition is.
- **Nothing reads as an array.** No even spacing, no repeated
  silhouettes in one frame, no uniform density, no dead symmetry, no
  "misc props". Scatter is a starting fluid, not a finish: every land
  gets authored clusters, deliberate voids, occlusion layers
  (foreground element / subject / haze), and edges that decay rather
  than stop.
- **Places, not coverage.** A land is 4–7 NAMED places with walks
  between them, not a filled rectangle. The walks earn their length
  with midpoints — a bend in the road, a lone silhouette, a change
  underfoot — or they shrink.
- **Depth is staged.** Every frame has a near thing, a subject, and a
  far silhouette in fog. The vista camera exists for this; use it.
- **Motion is life.** Each land has at least two idle motions (banners,
  gulls, smoke, sails, weeds, water) and one that responds to the
  player. A still frame should still imply the wind.
- **Sound is place.** Crossing a border must be audible blind: mood,
  step timbre, and at least one land-specific ambient event
  (`Audio.event`) per land.
- **The seams are art.** Border zones, road junctions, bridge
  approaches and the coastline are compositions of their own — the
  places players actually linger.

## 5. Session cadence (how the world grows)

Every session is one of two shapes, and both end: build green,
committed, pushed, `SESSIONS.md` handoff updated, contact sheet shot.

1. **A land session:** take 1–2 lands. Write or update their spec
   (`design/specs/`, per `LAND-SPEC-TEMPLATE.md`) — cheap, one pass,
   the spec serves the build. Rebuild the land to spec. Shoot the
   contact sheet with `tools/shoot.mjs` + walked framings. Run the art
   director gate on the screenshots. Fix until WOWED. Log the verdict.
2. **A systems session:** a cross-cutting pass (motion & ambient audio,
   performance & mobile, UI & map polish, the Awwwards juror on the
   whole build) that raises every land at once. Same gate discipline.

`PLAN.md` holds the ladder. Judge screenshots by LOOKING at them; a
session that never rendered its own work has not reviewed it.
