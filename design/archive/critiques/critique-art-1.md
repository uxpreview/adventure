# Art-director critique #1 — THE FIRST MINUTE

*2026-08-28, Session 2. Subject: THE COMMON, the title poster, and the
south face of THE KINGDOM OF BRIM. Judged on real screenshots from the
shipping camera (1280×720 + 390×844 portrait), reviewed blind against
Gris, Sable, and margins per QUALITY-BAR §2. Contact sheets:
`shots-r1` … `shots-r6` (session scratchpad; framings in
`tools/shoot-first-minute.mjs`). Verbatim, all rounds.*

---

## Round 1 — NOT YET

The bones of the poster are suddenly there — road to the gate, wall
banding the fog, red pennants, poppies at the well — and then the
details give the whole thing away as generated. Mandatory fixes,
deepest first:

1. **Your hatch is spraying.** Every wide-thin hatch call (wall damp,
   oak shade, well shaft) throws rotated lines far outside its box —
   diagonal streaks across open sky in EVERY shot with a wall or an
   oak in it. Nothing else matters until this is fixed; it reads as a
   renderer bug, not a hand. *(Root cause: `hatch()` never clipped;
   clip it at the primitive.)*
2. **The hedgerows are coils of wire.** Giant dark scribble-rings
   marching in rows — the exact "repeated silhouettes" the bar bans,
   in the two shots every player sees first. A hedge is ONE mass with
   one committed contour, texture inside it, and a broken base.
3. **The gatehouse cannot survive its close-up.** Capsule towers read
   as balloons; the crenellation reads as "OOO". This is the poster's
   centerpiece: rebuild it (square towers, real battlements, arch,
   portcullis) instead of inheriting the draft.
4. **The keep vista doesn't exist where it matters.** From the road it
   hides exactly behind the gatehouse at the same angular size. False
   perspective only works if the far layer is unmistakably LARGER in
   frame — treble its size and let the fog do the diminishing.
5. **The ground is telling two lies.** Worn-ground decals have hard
   octagon edges (a spill, not wear) — soft stains only. And the
   roofline layer, seen from inside the town, is a camp of beached
   tents — fade it once the walker crosses the wall.
6. Oak canopies crop flat at the canvas top; trunks are timber-heavy;
   the tall grass reads as dead sticks. Redraw within the frame,
   thinner, lighter.

## Round 2 — NOT YET

The streaks are gone and the poster stacks correctly (title → keep
ghost → gate → road: that is a poster). What still snags the eye:

1. **The keep's drawn hill is a grey slab edge** floating over the
   wall in every mid shot. The keep needs no ground — cut the hill.
2. **The hedges still carry soap bubbles** (interior rings too dark)
   and their top contour stops dead at the ends — wrap it down so the
   hedge encloses.
3. **Leaf litter is scattered rice.** Halve the leaves, cluster them.
4. The oak bark grain line drifts off the leaning trunk; the knot
   floats beside the wood.

## Round 3 — NOT YET (close)

1. **The town behind the wall is a haystack farm.** Gable strokes
   curve through the ridge (the stroke primitive smooths through
   midpoints), so every roof is a round tan mound. Draw pitches as two
   straight lines meeting at the ridge.
2. **The arch grew insect legs** — voussoir ticks crossing long
   portcullis teeth. One idea per drawing: keep short, even teeth,
   lose the ticks.
3. Gate drum interiors are blank slabs; give the masonry one more
   step of presence. Hay bales parked against the cart wheel read as
   three wheels — move them apart.

## Round 4/5 — punch list

Roofs angular (a town now, not a harvest), arch clean, hedges enclose,
bales moved. Riverbend reframed to the water; portrait shoot fixed
(headless background page was rAF-throttled — the loader never ended).

## Round 6 — verdict: **WOWED**

The title screen is a poster you could ship: the walker low on the
worn ring, the signpost carrying four hand-lettered truths, hedgerows
funneling the king's road through the south gate, Brim's wall banding
the haze with the town's rooflines and belfry behind it, and
Greyweather's pencil ghost over everything — with the one red accent
snapping on the pennants. Blind against the margins sheet I cannot
pick which had the budget; against Sable it holds its own register
(ink, not paint) without apologizing. The Common itself now has
places: the well cluster with its poppy drift earns the first walk,
the oaks earn the second, the stile + hay cart give the east seam a
reason to exist, and the deliberate voids read as composed rest, not
absence.

Noted, not blocking (carry to the ladder):
- The camera passes through the gate arch on the way into Brim; it
  currently reads as "walking under the arch" but a proximity fade
  would be kinder (Session 3, with the town interior).
- The Common's midfield could take one more authored midpoint on the
  coast-road walk (a second milestone or a lone hawthorn) if Session 8
  finds the walk long in playtest.
- Riverbend is the weakest of the six places — acceptable, but when
  Session 5 does the river properly, give the bend a willow.

A land that has WOWED may not be regressed: the title framing, the
gate stack, and the well/poppy cluster are now protected compositions.
