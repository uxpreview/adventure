# Critique 9 — THE 8:15

*Session 14, 2026-09-01. The art-director gate per `QUALITY-BAR.md` §2,
run on real screenshots from the running game, desktop (1280×720) and
portrait (390×844).*

**Under review:** THE CUBICLE MILE — **the last scatter draft in the
world** — its six places, its wait (DENNIS, `THE-WAITS` §12), the
Cubicle Mile end of `THE-STRANGERS` S8, and **THE 8:15 ITSELF**
(`THE-LINE` §4): the last mount, the ending's instrument, and the beat
the whole project has been walking toward for thirteen sessions.

**Sheet:** `tools/shoot-8-15.mjs`, twenty-seven framings per viewport on
Session 9's harness clock (twelve game seconds of settle, the chrome
swept, the bearing pinned), plus the protected rim framing that this
session may not break.

**Standing brief:** *rejects anything that looks procedural, placeholder,
or like a tech demo wearing a style. Blind against Gris, Sable, and
margins itself. The bar: they cannot tell which world had an art
budget.*

---

## Round 1 — NOT YET, and the land has no weight in it

> "The draft is gone and what has replaced it is a plan rather than a
> loop, which is the first thing. Nine detached blocks in their own car
> parks, an atrium, a stop, a barrier. The blocks are the best drawing
> in the session: ruled glazing that goes pale before it reaches the
> edge of the building, brick ends hatched, and a roofline at full
> weight all the way across. **The level roofline works** — from the
> back of the site you get one dead-straight line across the whole
> frame with exactly one thing breaking it, and that is the
> straightedge said in silhouette rather than in a note.
>
> Everything else in the frame is a promise nobody kept.
>
> **THE SHELTER IS A PANE OF GLASS.** It is the subject of THE SHOT and
> of the whole wait and you can see the car park through it: every mark
> in it is a hairline, there is no roof mass, the bench is three faint
> rules, and D. HALL is unreadable. A shelter is a ROOF first.
>
> **THE TIMETABLE IS A GREY SMEAR.** Twelve names and twelve times set
> at seven pixels under a stain at a seventh of alpha. The single most
> important object in Act III and you cannot tell it from a noticeboard.
>
> **DENNIS IS INSIDE THE SHELTER'S FOOTPRINT** and reads as a smudge on
> its left post.
>
> **THE BARRIER IS A TOTEM POLE.** Drawn on a wide canvas, so the boom
> — the only part of a raised barrier anybody would recognise — is a
> six-inch sliver in a seven-unit drawing.
>
> **AND THE APRON IS AN ARRAY.** A block of tactile studs, evenly
> spaced, running the full width of the frame. The one thing the bar
> forbids in capitals, in the one land that already has a grid in it.
>
> The bays are invisible from ten units — and this land has NO
> LANDFORM, on purpose, so the paint is its only recession device and it
> is the second most important mark in the drawing after the roofline.
> At 0.62 alpha it is not a mark at all."

**Also found in round 1, and it is not an art note:**

> **THE 8:15 IS PARKED IN THE CAR PARK FROM THE FIRST MINUTE OF A FRESH
> PAGE.** A player who walks east in their first ten minutes finds the
> ending standing in it with its doors shut. `PROMPT` §0 said *do not
> spend the reveal early* and the build spent it before the player had
> answered a single wait.

Fixed: the 8:15 is not in the world at all until it has run. It arrives
at a quarter past eight, once, and it is in the car park from then on.

---

## Round 2 — better, and the light says nothing

> "The shelter is a shelter: a slab roof at full weight, a glazed back
> with a wash behind it so it is a pane and not a hole, two side panels
> turned in, four posts, an empty bench, and a brass plate that says
> **D. HALL** legible from the road. Nobody screws a desk plate to a bus
> shelter. He did, and nothing in the game mentions it, and that is the
> best single detail in the land.
>
> The board reads. Twelve names, twelve times, in order, and the player
> is the only thing in the world that can read it and understand what
> they are reading.
>
> **But the wait's own picture is not there.** `THE-WAITS` §12's change
> is *the shelter's light comes on at dusk* — and at dusk every lighting
> column in this land is thirty units away at the back of a car park,
> so the shot that is supposed to say *the one dark thing in a lit car
> park* says nothing at all. The lamps' lit texture is a hard orange bar
> at nine tenths alpha hanging in the air over the mile. A light is a
> SOURCE with a halo. Round 2 drew a painted panel.
>
> And the west end of the land is empty: the framing called THE BARRIER
> has its subject twenty units off to the right and nothing in the left
> half of the picture at all."

Fixed: two columns moved to flank the stop; the lantern redrawn as a
source with a halo and a cone; and **the estate board** — a heading
somebody paid a signwriter for and six slots for the six tenants the
site was drawn for, two of which have anything in them at all.

---

## Round 3 — the arrays, and a bug no tool in this repository could see

> "The planting is five identical boxes at four-unit spacing across the
> middle of the frame, and the weeds are forty-four identical scribbles
> on a Poisson scatter over the whole north end. **A hedge drawn as an
> array, in the one land whose subject is a grid.** Weeds do not
> scatter — they come up in the JOINTS.
>
> The overflow's own framing has a building standing dead in front of
> it.
>
> And the atrium's forecourt has a six-metre lighting column two and a
> half units in front of the lens, so the shot of the front door of the
> tallest building in the land has a black bar down it."

**And then the sheet found the session's real defect, and it is worth
the space:**

> **EVERY PLATFORM FIGURE IN THE GAME IS THREE HUNDRED UNITS OFF THE
> SHEET.** The 8:15 draws whoever is waiting at each stop as a child of
> its own group — which is already translated to the train's position —
> and the update wrote that child's position in WORLD coordinates. So at
> the Cubicle Mile's stop the person waiting was at (504, 412), on the
> other side of the page, and at every other stop they were somewhere
> equally absurd.
>
> **Nothing in this repository would have said so.** `check-fields`
> reads instanced fields and this is a one-off; `check-sightline` reads
> the skyline and a thing off the sheet is not in a corridor; and a
> contact sheet of an EMPTY platform is pixel-for-pixel a contact sheet
> of a platform whose figure is elsewhere. **IV.3 is the ending** — *at
> every land whose wait you answered, somebody gets on* — and it had
> been shipping as *nobody ever gets on anywhere*, and the only thing
> that caught it was somebody looking at the picture and asking where
> the person was.

Fixed: the offset is local. Runs, and it is the ending.

---

## Round 4 — portrait, and the thing the wide frame hid

> "Desktop is composing. Portrait's shot of THE 8:15 STOP has the
> shelter filling the frame beautifully and **the timetable outside the
> picture** — which is the entire point of the place, missing, in the
> viewport that is half this game's audience.
>
> `WORLD-SYSTEMS` §8: portrait's frame is 26.5° wide against desktop's
> 68.6°. A place is composed for the NARROW frame and allowed to be
> generous in the wide one, and round 3 stood the board eight units off
> the shelter because there was room."

Fixed: the shelter narrows to 6.8 and the board comes in to 5.2 units
off it, so the whole stop — shelter, plate, board, man — is inside seven
units and fits a portrait frame with the mile behind it.

---

## Round 5 — the back of the site

> "South of the road is honest and it is also grey. The bin store is a
> pale box with a lozenge in it and the substation is a rectangle with
> stripes painted on it: at fifteen per cent hatching they cannot hold
> their own against nine ruled glass buildings, and a back-of-house wall
> is the DIRTIEST thing in a clean land.
>
> And they are standing on grass, which no service yard has ever done."

Fixed: brick courses at a third alpha, a recessed louvre so it reads as
a hole rather than a pattern, cowled fans with weight on them, three
wheelie bins out (because it is always three wheelie bins out), and the
yard's own apron under all of it.

---

## Round 6 — WOWED

> "**THE CUBICLE MILE reads as a place somebody was disappointed by, and
> it reads that way in the drawing rather than in a note.** The third
> rule earns its keep: every mark ruled, and every mark stopping short
> of the one it was going to meet — bay paint short of the kerb, the
> hatch short of the wall, the mullions short of the head, the road
> short of the edge of the world. Nobody will ever name it and everybody
> will feel it. It is genuinely a THIRD thing beside Maple Court's
> closed marks and Greyline's marks that leave, which is the hard part,
> and it is the opposite of Greyline in the one measurement the camera
> cares about: **nothing here touches the top of the frame.**
>
> **The level roofline is the best silhouette decision in the project
> since the Penwood's circle.** Eight blocks off three canvases, one
> line across the whole width of the world, and one building two floors
> taller because it was phase two. From the muster point it is the whole
> land in one frame.
>
> **THE OVERFLOW is the best composition in the land** and it has no
> subject in it at all: ruled bays running north into haze, weeds in
> four joints, one car, and then the tarmac stops and the Bleach Flats
> start with no marker of any kind. A car park is a recession device and
> this land had to prove it, because it is the only land in the world
> that authors no ground.
>
> **THE WAIT IS PHOTOGRAPHED AT BOTH STATES AND THE CHANGE IS
> UNMISTAKABLE.** Dusk before: two lit columns, warm windows across the
> mile, and one grey box between them with a man standing at the kerb
> beside it. Dusk after: the same frame with the shelter the warmest
> thing in it and the light on the tarmac at his feet. Nothing announces
> it. There is no note. *A stop with a light on is a stop that expects
> somebody at an hour when it is dark.*
>
> **And the 8:15 works.** A ruled railcar the width of the frame with
> its doors open at a stop, seven people in the windows who got on
> further up the line, one person on the platform in front of it, and
> the mile behind. It is drawn front-on coming down the king's road and
> broadside at every stop, which is not a compromise — it is what those
> two things look like. Standing in the car park at the end of the run
> with everyone still aboard and the page curling up behind it is the
> best single image this game has made."

**WOWED**, and three things are noted-not-blocking:

1. **THE 8:15 STOP's label prints across the building behind it.** The
   skyline writes a name above the tallest thing under it and the
   shelter is 4.8 units, so the name clears the shelter and lands on a
   block twenty-five units further north that is higher on screen. It is
   the same compromise class as READ THE PROCLAMATION
   (`critique-camera-1`, round 3) and it belongs to whoever next opens
   the skyline, not to a land.
2. **The atrium's canopy is the only curve in the land and it reads as
   an arc floating over the doors** at distance. It is correct up close
   and it is the front door, so it stays.
3. **The extract fans sit beside the substation rather than on it**, so
   from twenty units south they read as three objects standing in a car
   park. One drawing, and a later session may split it.

---

## And the regression gate found the session's other defect

`diff-sheets` against `origin/main`: **92 of 92 bit-identical on THE
PAGE**, first run, in a session that added a mount that crosses six
lands. Nothing in the world moved.

**Four frames moved in THE WRITING**, all of them the same
hundred-and-two-pixel band in Greyweather's bailey, at both hours and in
both viewports — which is the interact prompt, in a land this session
never opened.

> **The 8:15's boarding prompt was showing at the castle.** The POI that
> says TAKE A SEAT reads the train's live coordinates, the way the
> rowboat's has since Session 6 — and before the 8:15 has ever run,
> those coordinates are the head of the line, **which is Greyweather's
> gate.** So on a fresh page, standing in the bailey of a castle in the
> oldest land in the world, the game offered you a seat on a train that
> does not exist yet.

No contact sheet of the Cubicle Mile could ever have contained it, and
no check in this repository asks where a prompt is. The tool that found
it is the one built to answer a different question entirely.

Fixed: the POI reads `boardingPos`, which is off the sheet unless a door
is open in front of you. Re-run clean.

**Unregressed:** `diff-sheets` against `origin/main`, and the number is
in `SESSIONS.md`.

**Eleven lands hold a verdict. There are no scatter drafts left in this
world.**
