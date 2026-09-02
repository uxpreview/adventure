# critique-verbs-1 — Session 15, THE VERBS AND THE LAW

*2026-09-02. A systems session has no land to put to the art director,
so this is the session's own review of its proofs sheet
(`tools/shoot-session15.mjs`, 25 framings, both viewports) against the
bar the session set for itself: the verbs exist, the law around them
holds, and each proof is a change in the world you can see both sides
of. It is NOT the play gate. The play gate is the owner's and it was
handed over, not run (`design/play-sheets/session-15.md`).*

---

## Round 1

**Verdict: NOT YET.** Two mandatory, and both are the same finding
from two directions.

1. **MANDATORY — a thing in reach beats the thing in the hand, and the
   stone lived inside a thing's reach.** Frame `08-stone-thrown` is a
   note card (THE LONG FENCE), and `09-swing-sitting` is the same note,
   still open, over the oaks. The stone's home at (13.6, 68.2) was five
   units from THE LONG FENCE's POI, whose reach is six, so the first
   thing a player did with a stone in hand was be offered LEAN ON THE
   STILE. The rule is right (a stone at distance zero would otherwise
   swallow every prompt in the world); the placement broke it. **Fix:
   the stone's home is outside every other place's reach** — (18.5,
   70.5), ten from the fence, six from the cart. And the general rule,
   written into `meadow.ts`: a carriable must not live inside anybody's
   reach.
2. **MANDATORY — the harness pressed the verb, not the key.**
   `__inklands.press` called the nearest prompt's verb directly, so a
   note opened by one framing stayed open through the next three; the
   key itself closes a note first. `press` goes through
   `Input.fireInteract` now, exactly as a thumb does.

**Passed, and worth saying:**

- `05-cart-at-the-border`: the cart stands on the crease's west
  shoulder with the Downs' hedges beyond it and will not cross. It
  reads as a thing that was pushed there.
- `07-stone-in-hand`: the stone is in the hand and the prompt says PUT
  DOWN THE STONE. Small, and right.
- `17-king-RESTORED-avenue`: the bare poles are the best frame on the
  sheet. Ten poles, no cloth, the wind with nothing to take, and the
  keep's own two down as well. It is what relieved of duty looks like
  drawn, and it earns the door.
- `10-king-the-card`: the card over the bailey, two doors, both
  legible; on the 320 rig the long door breaks to two lines and holds
  (`shoot-mobile` asserts it).
- `23-drove-in-the-field-noon`: the flock beyond the gate at midday,
  the lane behind the walker with two sheep in it. A thing that
  happened while nobody was there.

**Passed, not praised:**

- `16-king-RESTORED-bailey` / `15-…-close`: the standing king reads as
  a statue on a plinth, crown and sceptre legible, seam drawn — and he
  is a dark column. He is a proof. Session 19, which draws Wick, should
  draw the king again with Wick's eye.
- `21-drove-on-the-lane-06h`: the flock is on the lane at a quarter
  past six and the dawn grade hides it. Right by the clock, hard to
  see. Session 17's night-as-a-different-game owns dawn's legibility.
- `25-headland-sitting`: the walker sits at the trestle, knees up, on
  the ground beside a table. It is the sit frame the game has had since
  Session 1 and it is a squat. A bench-height sit frame is a drawing,
  not a system, and it belongs to whoever next opens `characterSheet`.

## Round 2

**Verdict: PASSED (for what a systems session can pass).** Three
things changed between the rounds and all three were the sheet's
doing, not the game's, except the last:

- The stone's home moved out of the fence's reach (round 1, mandatory
  1), and the stances in `08` moved out of the CART's reach, because
  the second shot of the round photographed a walker with a stone in
  hand being offered PUSH THE CART — the rule again, from a third side.
- `throwStone` no longer picks the stone up if the previous framing
  left it in the hand: a second pick-up press with a stone in hand is a
  PUT DOWN, and round 1's second shot put the stone back a stride from
  its home and then threw nothing.
- **The swing's seat gets a `lift`** (`sit.lift`, 2.6 units): round
  1's `09` sat the walker on the ground under a plank three units up.
  The plank is drawn at 100 of 128 on a quad hung from 5.6 to 2.6, the
  hip is half a unit above the feet, and the walker's ground while
  seated is the terrain plus the lift. This is the one game change of
  the round, and it is what makes `09` a person in a swing.

`08-stone-thrown` is now a stone lying eight units west of a walker who
threw it at a run; `09-swing-sitting` is the walker on the plank under
the leaning oak with STAND UP beside it. Nothing else on the sheet
moved.

**What this sheet cannot say**, and the play sheet asks the owner:
whether the well's delay is right, whether a shove is the right length,
whether six times the clock is a sit or a skip, whether the card is in
the world's voice. A photograph of a verb is a photograph of its
result; the verb is the ten seconds before it.

**The regression gate**, for the record: `diff-sheets` against
`origin/main` (3cde91d), 92 framings — 90 of 92 bit-identical on THE
PAGE. The two that moved are `avenue-foot` on desktop at both hours
(0.027% at noon, 0.017% at dusk), a 57 × 8 pixel band at the frame's
left edge, which is the moat pool's dye stain: the pool is at the edge
of that frame and the stain is in the pool. Greyweather is the land in
scope and the move is measured, per `QUALITY-BAR` §3. On THE PAGE AND
ITS WRITING, six frames over threshold and all six deliberate: the
well's prompt (SHOUT DOWN THE WELL for LOOK DOWN THE WELL, both hours,
both viewports) and THE ARGUING OAKS' label, re-placed six units west.
Before round 1 the same tool reported 2.2% on the barbican: the bare
poles had drawn ten numbers from the land's seeded stream and moved
every boulder in the bailey. Fixed, and the diff keeps its evidence now
(`SAVE=1`).
