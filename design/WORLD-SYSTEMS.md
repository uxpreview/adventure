# WORLD SYSTEMS — how INKLANDS becomes a world

*Owner decision, 2026-08-28 (after Session 3). This file is the standing
plan for everything that is not a land: what makes an open world worth
living in, in this game's own idiom. `QUALITY-BAR.md` still governs how
anything here is judged. `PLAN.md` holds the order.*

---

## 0. What kind of open world this is

The bar names *Alto's Odyssey*, *Journey*, *Sable* and *A Short Hike*.
Those are **small open worlds**, and they shine for nearly the opposite
reasons Skyrim and GTA do: no quest log, no markers, no urgency, and a
map you could cross in ten minutes.

We take **principles** from the big ones — RDR2's world having business
of its own, GTA's density of incidental activity, Skyrim's "see a thing,
go to it" — and never their breadth. A thousand-person-year simulation
is not the competition; a world that feels authored in every frame is.

Three rules fall out of that, and they govern every system below:

1. **No UI where the world can say it.** No quest markers, no objective
   list, no fast-travel menu, no dialogue trees. If the player needs to
   know something, a drawing tells them.
2. **Nothing is urgent.** No timers, no fail states, no combat.
3. **Curiosity runs on sightlines.** The reason to walk somewhere is
   that you can see it from here.

---

## 1. Terrain — the paper has a shape

**The flat ground was never a design decision. It was inherited** from
margins (a book of flat pages) and then written into the quality bar as
if it were law. It is the single biggest thing holding the world back:
it is why Session 3 lost a full critique round to the keep hiding
behind its own gatehouse, and why Greyweather's "high seat" and its
"wall riding the crags" are *drawn* rather than *modelled*.

Paper is flat. Paper is not rigid. The sheet gives us a better terrain
vocabulary than generic hills, and every term is more on-brand, not
less:

| feature | what it is | where it belongs |
|---|---|---|
| **the crease** | a hard fold with a shadow in it | a valley; a road that dives |
| **the curl** | the sheet's margins lift, as paper always does | the world's rim — a boundary that is also a vista |
| **the buckle** | where the wash was wet, the paper cockled | rolling ground: the downs, the common |
| **the tear** | the page ripped; you can see down to the desk | SPLITROCK CANYON, which should *be* a tear |
| **what's under the sheet** | a book, a pencil, another sheet | hills, mesas, the castle ridge |

Rules: **low amplitude** (roughly 0–12 units across the sheet) with two
or three authored exceptions. Standees stay **vertical** on slopes —
they are paper cutouts standing on a warped page, they do not tilt with
the ground. Steep is impassable, which is free traversal gating.

What it costs: a subdivided terrain mesh with a height function, and a
`heightAt(x, z)` query. The good news is placement is centralised —
`ctx.standee()`, `ctx.decal()` and the field setters in
`src/world/regions/index.ts` are the only places props meet the ground,
so twelve region builders do **not** each need editing. Footprints, the
camera and the character controller each need one lift.

**This must land before any more lands are authored.** Every land built
flat is a land re-opened later.

## 2. The camera — due a real design pass

Session 3 established the **frame-top ceiling**: the shipping camera
shows roughly 10 world units of height at 33 units out and 16 at 82, so
any tall near object fills the upper frame and hides everything behind
it. That is why Greyweather's keep is drawn wide (640×320) and its
gatehouse is only 9.5 units.

That ceiling is a camera constant nobody chose on purpose. With terrain
height arriving, the camera has to change anyway (it must follow the
ground, and rising ground must actually reveal more). Treat the camera
as a designed system with elevation, pitch and fog as its parameters —
not as three magic numbers in `cameraOffset()`.

## 3. Traversal — the game's weakest verb today

Twelve lands connected by one constant walking speed is the likeliest
thing to cap us at "gorgeous tech demo". Every benchmark game has a
traversal verb with texture and mastery.

- **Ink weight as speed.** Sprint and the footprints press darker and
  wetter; walk and they feather. Your speed is legible in the marks you
  leave behind you. Footprints already exist.
- **The line pulls the pen.** Roads already exist as a mask the CPU can
  read (`terrain.roadAt`). Make roads *carry* you — faster, gently
  auto-steering — because a pen likes following a line it already drew.
  This turns the whole road web from decoration into infrastructure.
- **The river as a route.** It currently only says no. `rowboatTexture`
  is already in the prop box, unused.

## 4. Mounts — one per quadrant, each refusing the others

The RDR2 lesson is not "add a horse", it is that the horse is a
**relationship with a cost**. The Skyrim lesson is inverted: fast travel
is the thing that most damages Skyrim's world.

**The rule: every mount is fast on its own ground and refuses every
other ground.** Walking stays the universal verb; a mount is a
*place-feeling*, never a menu. Mounts are **found in the world and left
in the world** — yours is where you left it.

Each is the reward for finishing its quadrant, which marries the mount
system to the content system (§6) and to the geography DIRECTION.md
already established: walking east-by-south is growing up.

| mount | quadrant | earned | refuses |
|---|---|---|---|
| **the horse** | the old world (Brim, Greyweather) | finishing the keep | the city — it is drawn in ballpoint and balks at the straightedge world |
| **the bicycle** | Maple Court — the childhood one | finishing the neighborhood | sand, and stairs |
| **the rowboat** | the river and the coast | finishing the coast | dry land |
| **the 8:15** | GREYLINE CITY → THE CUBICLE MILE | finishing the office park | everywhere the line is not drawn |
| **the paper plane** | the wilds | launched from height | being steered, mostly |

**The 8:15 is the best payoff available to us and it is already set up.**
The existing office-park note reads: *"the timetable says the 8:15 is
coming. the 8:15 is drawn nowhere on this sheet. everyone waiting knows
both of these things and has made their peace."* The reward for
finishing that land is that **you draw the 8:15 into existence and it
arrives.** A railway is a ruled line across a page, in the one quadrant
described as the only part of the world drawn with a straightedge.

## 5. Inhabitants — behavior, not dialogue

The no-faces rule is a gift: doodle-folk cannot emote, so they must
express through posture, placement and routine.

- **Routine over time.** The ferryman actually crosses. The shepherd's
  flock actually moves. Shutters open in the morning and shut at dusk.
  You come to recognise people by where they are at a given hour.
- **One visible want each.** Not a dialogue tree — someone standing at
  the gate *looking north* tells you what they want. You learn wants by
  looking, which is the verb the game already has.
- **The co-walker.** Someone falls in beside you for a stretch and then
  stops dead at their land's border, because they are drawn in that
  land's ink and cannot leave it.
- **Road encounters** (RDR2's cheapest magic): a cart with a broken
  wheel, someone lost, a funeral you should not interrupt. Authored,
  never generated.
- **Animals** are the cheapest life-per-byte in any world, and ours
  respond: sheep part, fish scatter in the shallows, a dog follows you
  for half a land, a cat on a wall wakes if you run past.

## 6. The unfinished sheet — the content system

DIRECTION.md's recommended verb (stand in pencil-ghost ground, hold to
ink it in) is not only a story mechanic. It is **the side-quest system**,
in the world's own logic, with no log and no markers: every land holds
unfinished things, and finishing one wakes what lives there.

**The map is the quest journal** — pencil for what you have heard about,
ink for what you have finished. That also fixes the map's current
problem: it is a reference tool when it should be the record of your own
walk, and the artifact people screenshot.

## 7. Time and weather — the world changes without you

**Time of day has the highest return of anything in this file**, because
every land already built improves for free: washes shift, lamps light in
Brim, the city's windows come on, moods change, routines move. The
metaphor supports it — the desk lamp comes on.

**Rain** is nearly gift-wrapped: the ink library's smudge pass is
already documented as weather ("her smear as weather"), so rain in this
world runs the drawing.

## 8. Mobile and desktop are both first-class

Not a session — **a standing law, enforced at the gate.** The joystick
and a portrait FOV switch already exist and have never been judged.
From now on every contact sheet shoots **portrait (390×844) as well as
desktop (1280×720)**, and the art director reviews both. A composition
that only works in landscape is not done.

Portrait implications to design for, not patch later: less horizontal
frame means vistas must be *taller* compositions; touch targets and POI
prompts need thumb-reach placement; the joystick must never sit under
the thing it is steering toward.

---

## The inheritance audit

*The flat ground was inherited, not chosen. So the standing question for
every rule in this codebase is: did INKLANDS choose this, or did it
arrive from margins? Anything inherited must be re-ratified on its own
merits or dropped. Session 4 executed the first pass; keep auditing.*

### Dropped — Session 4, 2026-08-28 ✓

| what | where | why | outcome |
|---|---|---|---|
| **`AudioDirector`** (739 lines) | `src/core/AudioDirector.ts` | margins' Chapter 10 finale score. `director()` was never called from anywhere in INKLANDS. | File deleted; `director()`, `releaseDirector()` and the `holdSilence` hook into it gone from `Audio.ts`. |
| **59 of 66 `Audio.event` cases** | `src/core/Audio.ts` | margins chapter hooks (`wo-tape-boom`, `blot-edge`, `xray-taught`, `mom-underline`, `ghost-raised`…). | Deleted. The seven that survive are the ones the world actually says: `lark`, `well-plink`, `brim-bell`, `market-murmur`, `pigeon-flap`, `banner-snap`, `rook-caw`. Every synthesis helper kept — they are the instrument, not the score. |
| **The two-blues forgery contract** | `src/engine/palette.ts` | WARM_BLUE vs COLD_BLUE, the paling curves, the greyscale-separation requirement and the "nothing may write a blue" law all encoded margins' plot (a 1996 Bic vs a 1999 forging pen). INKLANDS has no forger. | Gone, with `warmBlueA`/`coldBlueA`, the four paling tokens, `PRINTED_RULE`, `DAWN_WARM` and `INK_PALE_HEX`. One `BLUE` remains as a colour. |
| **Smudge auto-on for WARM_BLUE** | `src/engine/ink.ts` | the drag-ghost is a left-handed character's hand in margins. | The rule is gone; the *effect* is kept and is now opt-in and off by default. It is a true ballpoint behaviour and it is how this world will draw rain (§7). |
| **The flat sheet** | `terrain.ts` and the quality bar | see §1. | Gone. `src/world/elevation.ts` is the page's shape and the one authority on where the ground is. |

Net: ~900 lines of another game's story removed, and the bundle is
~14 kB smaller than it was before elevation was added to it.

### Keep, but re-ratified on INKLANDS' own merits

- **Zero image assets / all-procedural ink.** This is the moat. Not
  inherited so much as the whole point.
- **The typeset glyph kit** (`legibleCaps`, `typeGlyph`) — still used by
  `ui/lettering.ts`. The *comments* about receipts and savings bonds are
  stale; the code earns its place.
- **The paper post-pass, hand-lettering, footprints, region streaming,
  the ink-in cascade.** All load-bearing.
- **No faces on doodle-folk** — kept, because it forces expression
  through posture and that is what makes the folk work. The rule as
  written was already violated by `characterSheet()`'s two dot eyes, so
  Session 4 re-worded it in QUALITY-BAR §3: *the walker has two dots;
  nobody else has a face.* ✓

### Parked

- **Blots as caves** (owner decision, 2026-08-28: skip until the story
  needs them). The `BLOT` palette (black ground, white marks) is
  unused and would give us a spectacular inversion — but *skip it until
  a story gives it a reason*. Skyrim's caves are its weakest content
  because they are generated; if we ever ship blots, every one is
  hand-authored or we do not ship them.
- **Character skins** (`skin: 'b'`, the flat cap) — margins' second
  character. Harmless; revisit when the story picks its protagonist.
- **Expanding the sheet.** 760×560 is more than we can fill at this bar.
  When the time comes it needs its own design conversation, because the
  one-sheet metaphor is doing real work.
