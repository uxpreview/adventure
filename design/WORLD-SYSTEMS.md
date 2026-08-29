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
go to it", **Fallout's habit of telling whole stories with nothing but
the objects left in a room** (§10) — and never their breadth. A
thousand-person-year simulation is not the competition; a world that
feels authored in every frame is.

### A small map is not a short game

**Owner correction, 2026-08-29, and it matters enough to write in
capitals somewhere: TEN MINUTES IS THE CROSSING, NOT THE GAME.** The
target is a world people play for HOURS.

Those two facts are not in tension, and every game on the benchmark list
proves it — Skyrim's map is a twenty-minute run and people give it three
hundred hours; Outer Wilds' entire solar system is smaller than this
sheet and it is a twenty-hour game; *Obra Dinn* is one ship. A small map
is a decision about **density**, and this project's whole bar is density:
every mark authored, nothing generated, nothing filler.

So the hours do not come from more sheet. **Expanding the world is still
parked** (see the audit) and gets more expensive every session, because
at this bar a new land costs a full session. The hours come from **depth
— reasons to walk the same ground again** — and there are exactly four
engines for that, all of them already half-built or already planned:

1. **The world changes without you** (§7 — time, then weather). The
   cheapest hours in this file by a wide margin: it multiplies every
   land already built by the number of states it can be in, at no
   authoring cost per land. Session 6.
2. **You change how you move** (§4 — the mounts). Each mount re-opens
   the whole map, because a map you row is not the map you walked.
   Five are designed; the rowboat is Session 6.
3. **Knowledge as progression.** Nothing gets stronger; *you* get
   better at reading the page, and the world was always open. This is
   how Outer Wilds, Obra Dinn, Tunic and Chants of Sennaar all run long
   with no combat and no levelling — and it is the one engine this
   project has never considered. It costs **no new system class**: the
   verb is looking, which is the only verb we have. See DIRECTION.md.
4. **Routine you learn** (§5). You come to know people by where they
   are at a given hour. Enormous texture for a small cast.

And one that must never be the spine: **collection**. It is the cheapest
to author, it caps out fast, and it turns into a checklist — which is
the exact failure the bar already refuses ("Skyrim's caves are its
weakest content because they are generated"). Collection is a texture.
It is never the reason anybody is still here at hour six.

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
| **the tear** | the page ripped; you can see down to the desk | SPLITROCK CANYON, which should *be* a tear; and the coast, where the wet margin tore away round THE HOLDFAST |
| **the miss** | the wash ran over the page and left a dry streak | THE SANDBAR — how open water became a land you can walk |
| **what's under the sheet** | a book, a pencil, another sheet | hills, mesas, the castle ridge |

Rules: **low amplitude** (roughly 0–12 units across the sheet) with two
or three authored exceptions. **Author landforms with PLANAR FACES**
(Session 5): the terrain draws a cliff in strokes down its fall line,
and a doubly-curved landform has no constant fall line to draw down — it
comes out as a thumb print, and then, if you wobble it, as herringbone.
Paper tears in straight runs and turns at corners, so a landform is a
polygon with faces, not an ellipse. Standees stay **vertical** on slopes —
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
- **And a name** (§10). A name costs one line and converts a prop into
  a person; nothing else about them changes.
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

## 9. The score — one music box, twelve rooms

*Owner direction, 2026-08-29: each region should have its own
background music. This section is the standing plan for it.*

### Where we actually are

`Audio.MOODS` already carries twelve per-region entries, and each one
sets a **scale**, a **gap** and a **level**. That is real — the melody
genuinely wanders a different mode in every land — but it is all played
on the **same instrument**, over the **same room tone**, and the
difference between two lands is a handful of semitones. A player can
cross a border blind and hear the footstep change; they cannot hear the
*music* change. That is the gap.

### The five moves, in order of return

1. **A land's music is its INSTRUMENT, not its scale.** This is
   nine-tenths of the effect and it is the thing we do not have. Five
   synthesised voices cover twelve lands with deliberate doubling:
   - **the music box** — what exists: a fast-decay pitched ping;
   - **the plucked string** — Karplus–Strong (a noise burst into a
     short delay line with a lowpass in its feedback). About twenty
     lines, costs almost nothing, and sounds *nothing* like a sine.
     This is the single highest-value addition to the instrument box;
   - **the bowed/held voice** — a saw through a resonant lowpass with a
     slow attack, for the ceremonial lands;
   - **struck metal** — an inharmonic partial stack with a long tail.
     `bell-buoy` (Session 5) is already this instrument;
   - **air** — filtered noise with a moving resonant peak. `surge`
     (Session 5) is already this instrument.
   Two of the five are therefore already written; the score session
   builds the other three and gives each land a voice.
2. **A bed per land, not one room tone everywhere.** `startAmbient` is
   currently a single lowpass noise loop and it is identical in the
   canyon and the office park. It should be per-land and it should be
   the quietest thing in the mix: the sea's hush, the pines' hush, the
   city's hum, the office park's air handling, the canyon's near-silence
   with a long tail on everything else.
3. **A border is a CROSSFADE, not a cut.** `setMood` already ramps the
   melody's level; the instrument and the bed need an equal-power
   crossfade of three or four seconds so a border is a place you pass
   through rather than a switch you flip.
4. **The score answers the player.** `setMoodIntensity` exists and
   **nothing in this game calls it.** Traversal is the obvious caller:
   run and the score leans in, stand still and it thins to almost
   nothing. Session 6 owns traversal and must leave that seam in place.
5. **The score answers the hour.** Same crossfade machinery as the day
   cycle. Session 6 builds the cycle; it must expose the hour as a
   parameter the mixer can read, or the score session has to re-open it.

### Where the music comes from — a proposal, owner's call

Fallout's radio works because the music has a **source**: somebody is
broadcasting, and you are receiving. Our equivalent is not a radio, and
it is sitting right there in the metaphor:

> **The music is not in the world. It is in the room where the page is.**
> Somebody is at that desk, drawing this, with something on quietly in
> the background. What changes per land is not the tune — it is what the
> page does to it.

Near the sea the wind takes it; under the pines it is muffled and close;
in GREYLINE CITY it picks up an AM edge; on the Holdfast you are far
enough out that only the low end reaches you. One line of fiction, and
it explains why the music is small, why it is sparse, why it is
recognisably the same everywhere, and why it is different everywhere. It
also gives THE UNFINISHED SHEET (DIRECTION.md) its ending a second
meaning: you reach the desk, and you find out what has been playing.

**Law, unchanged:** zero assets, so every voice is synthesis; the whole
graph stays a handful of nodes; and nothing outside `Audio.ts` invents
an instrument, exactly as nothing outside `palette.ts` invents a colour.

---

## 10. What we take from Fallout, and what we refuse

*Owner direction, 2026-08-29. Fallout is a strange benchmark for a game
with no combat — which is the point. It is on this list for exactly one
thing it does better than anything else, and that one thing is the thing
INKLANDS is structurally forced into. It is also the benchmark that best
answers "how does a world stay interesting for hours without fighting in
it", which is now the standing target (§0).*

### The one thing

**Fallout tells whole stories with nothing but the objects left in a
room.** Two skeletons in a bathtub and a teddy bear. A chair, a chain
and a cage. You are never told; you read the room and you are certain.

INKLANDS has **no faces, no dialogue trees, no quest log and no
cutscenes** — every channel Fallout could have used and chose not to,
we do not have at all. So the vignette is not an influence here, it is
the native mode, and Fallout is the best available teacher of it.

**The rule that falls out:** every land carries **two or three authored
TABLEAUX** — small groups of props that tell one complete story and are
never explained. Not decoration, not "misc props" (which the bar
already forbids): a composition with a subject.

And ours has a twist Fallout cannot use, because everything here is a
DRAWING and the drawing can be part of the story:

- a picnic blanket with two settings, one of them rubbed out;
- a boat with no oars, and a pair of oars drawn ten units away at the
  wrong scale;
- a fence that runs perfectly for forty units and then, where the hand
  got bored, becomes four wobbles and stops;
- the same tree drawn three times, getting better.

### The other four

2. **Deadpan institutional cheer, not grimness.** Vault-Tec is funny
   because an upbeat voice describes something bleak and never breaks.
   We already do this and have not admitted it — the office park's
   standing note is pure Fallout: *"the timetable says the 8:15 is
   coming. the 8:15 is drawn nowhere on this sheet. everyone waiting
   knows both of these things and has made their peace."* That is the
   house voice. Name it, keep it, and never let it become jokes.
3. **The world can be WRITTEN ON.** Fallout speaks through terminals,
   posters and notes. We hand-letter everything (`ink.lettering`,
   `legibleCaps`) and currently use it only for the UI and the map,
   which leaves an entire channel unused. Signs, a chalked board, a
   notice actually nailed to Greyweather's gate rather than only
   described on a card, a tide table, a timetable. Cheap, on-brand, and
   it is how a land argues without a narrator.
4. **A region has a THESIS, not just a biome.** Fallout's regions are
   ideological before they are geographic. Ours vary by wash and by
   landform; DIRECTION.md's east-by-south gradient (walking is growing
   up) is a thesis we have written down and barely used. From the story
   session on, a land spec's §1 should be able to say what its land
   *argues*, not only what it looks like.
5. **A name is free, and it turns a prop into a person.** Fallout is
   full of people you meet once who are entirely one thing. Our
   doodle-folk cannot have faces, so they get one posture, one place,
   one routine (§5) — and a NAME. Nothing else about them changes.

### What we refuse, explicitly

Combat, weapons, damage, enemies. A quest log, objective markers, a
compass. Dialogue trees and speech checks. Loot, inventory, crafting,
encumbrance. Karma and reputation. Levelling. **The Pip-Boy** — a
diegetic menu is still a menu, and rule 1 of §0 is that the world says
it or it does not get said. And the ash: Fallout is post-apocalyptic
and this is a sheet of paper with a lark on it. **We take the
archaeology and the deadpan. We do not take the apocalypse.**

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
