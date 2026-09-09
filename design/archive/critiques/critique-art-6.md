# Critique 6 — FARM & FOREST

*Session 10, 2026-08-30. The art-director gate per `QUALITY-BAR.md` §2,
run on real screenshots from the running game, desktop (1280×720) and
portrait (390×844).*

**Under review:** THE HARROW DOWNS and THE PENWOOD — their places, their
waits (JOAN HARROW and BRACK) and their named inhabitants — plus every
protected framing the session's own ground could touch, at two hours of
the day, with at least one DRIVEN framing per land and both states of
both waits photographed.

**Sheet:** `tools/shoot-farm-forest.mjs`, forty-six framings per
viewport, every one settled thirteen game seconds past the ink-in
cascade on Session 9's harness. Plus two new instruments this session
built for itself and which shortened the argument considerably —
`tools/shoot-textures.mjs` (every drawing in the prop box at actual
size, on paper, with no camera and no land in the way) and
`tools/montage.mjs` (a land on one sheet rather than one frame at a
time).

**Standing brief:** *rejects anything that looks procedural, placeholder,
or like a tech demo wearing a style. Blind against Gris, Sable, and
margins itself. The bar: they cannot tell which world had an art
budget.*

---

## Round 1 — NOT YET

> "You have built two lands out of two drawings and both drawings are
> wrong, so I am looking at the same mistake six hundred times.
>
> **The wood is a wood in heavy rain.** Your pine is a pole with a set
> of croquet hoops on it and a spray of near-vertical fuzz between them
> — and the fuzz does not stop at the tree, it goes fifty pixels past
> it in every direction, because you clipped a hatch to a rectangle
> around a branch that has no rectangle in it. Two hundred of those on a
> scatter is not a forest. It is weather. And the trunks are drawn at
> full pressure for two thirds of their height, so the stand reads as
> *burnt*: black poles with a little green on top.
>
> **The hedges are coils of wire.** You have drawn a hedge as thirty
> overlapping scribbled circles and every single one of them is visible.
> The near one in your farm shot fills the bottom third of the frame
> with loops. A hedge is a mass with a ragged top and a hard bottom; the
> loops are the mass showing its working.
>
> **And the tarn is a puddle of swimming-pool blue** in the one land
> whose entire note has said *black as the good ink* since Session 1.
> You have had that sentence for nine sessions and never once agreed
> with it."

**Mandatory:**
1. The pine, redrawn. A pine is a mass with a pole under it.
2. The hedge, redrawn. Nothing in it may read as a loop.
3. The tarn is black, and it is black in the way this game makes things
   — with a drawing, not with a shader flag.

---

## Round 2 — NOT YET

> "The trees are trees now and the hedges are hedges. So let me tell you
> what is under them, which is nothing.
>
> **Your fields are a mosaic of pale hexagons.** You laid every field's
> colour with a sixteen-sided polygon and then tiled that polygon across
> a fifty-unit field, so I can count the sides of it from a hundred
> units away, and where two fields meet I can see the seam. A stain on
> paper has no boundary. It fades. Every ground colour in both of these
> lands is doing this.
>
> **The wood has no floor.** Inside your forty units — the one place in
> the Penwood that is supposed to be the darkest ground in the game,
> because nobody has ever cut it — I am standing on a pale beige bowl
> with trees on it. That is a park. Under an old stand there is a foot
> of needles and no soil showing at all.
>
> **And your fallen trees are hanging in the air.** You drew a trunk in
> the middle of its canvas and then stood the canvas up on the ground,
> so every one of them floats three units above the wood.
>
> **The picnic is a spider.** It is the one thing in the Downs you are
> allowed to draw as a closed rectangle — you wrote that down yourself,
> in the spec, in bold — and you have given it a cloth twenty-two pixels
> deep, which at six units across a field is a line. I cannot see the
> two settings. The two settings are the entire wait."

**Mandatory:**
1. Every ground stain is a gradient. No polygon is ever a colour.
2. The wood gets a floor, and the old ring gets the darkest one.
3. The picnic reads as a laid table with two places on it, at forty
   units, in portrait.

---

## Round 3 — NOT YET

> "Now the two of them are legible and I can finally look at them as
> compositions, and the compositions are where you are actually in
> trouble.
>
> **THE HARROW DOWNS is a beach.** Stubble, turned earth, standing corn
> and a farm track are all in the tan family, and you have used all four
> and nothing else, so the whole land is one value. There is no dark in
> it anywhere. A patchwork is not made of *variety*, it is made of
> VALUE — the ploughed field is the dark one, and you have put your only
> ploughed field behind the mill where nobody stands.
>
> **Your shot has no foreground.** Cart, table, mill, wood: that is a
> subject, a mid, a far and a horizon, and thirty units of empty lane
> under the lens where the near thing should be. You know this rule. It
> is in your own spec, in the section you wrote about this frame.
>
> **And a hedge is standing five units in front of the camera**, at
> right angles, filling a quarter of the frame with a green slab. Twice.
> In the two framings you named as the land's best.
>
> **In the wood:** you are spraying the lower-left quadrant with
> individual pen scratches, because you gave the *stand* register to
> trees that end up ten units from the lens. Full ballpoint pressure at
> ten units belongs to the eight near trunks you authored for exactly
> that job, and to nothing else."

**Mandatory:**
1. The patchwork has a dark note in it, in the frame that matters.
2. THE SHOT gets a near thing.
3. Nothing large stands inside fifteen units of a named viewpoint.
4. Register 0 is not a field tree.

---

## Round 4 — NOT YET, and this one is not about looking

> "Two things, and the first is not an opinion.
>
> **You are spending forty megabytes of texture on two lands.** A
> hundred and forty hedge panels, each with its own 512×160 canvas.
> Thirty-three field decals, each with its own. Nine 512-square canvases
> for one pond. Your own spec's budget is four megabytes and eighteen
> draw calls, and your farm shot is at three hundred and ninety-seven
> draws — worse than THE COMMON, which has a town in it. Variety in a
> land comes from the field plan and from placement. It does not come
> from giving every instance in a hundred-and-forty-instance run its own
> drawing.
>
> **And your drove fords a river. Twice.** It is a sunken lane full of
> sheep and you have run it straight through the water."

**Mandatory:**
1. Shared drawings, instanced fields. Get under THE COMMON.
2. The drove goes where a drove can go.

---

## Round 5 — WOWED

> "Yes.
>
> **THE PENWOOD is the best land in this game.** Not the prettiest —
> Greyweather is the prettiest — the best. You have a colonnade of old
> pine falling three and a half units into a bowl of black water, a man
> standing on a path between me and it with his back to me, and a road
> that goes round. I did not need to be told what the road was. I looked
> at the map afterwards and the road is a **circle**, and there is
> nothing else in the wood, and the moment that landed is the best thing
> in this project. It is a fable told entirely in a polyline.
>
> **And nothing announces it.** That is the part I want on the record.
> There is no note that says the road is a circle, no note that says
> forty, no note about Brack at all. What there is: the wear on the
> track is heavier on the water side than the other, the pines lean away
> from the tarn *everywhere in the land*, the biggest trees in the wood
> are the ones inside the forty because nobody has ever dared cut them,
> and within twenty units of the man the ambient stops. Four facts,
> none of them written down, all of them the same fact.
>
> **THE HARROW DOWNS is the opposite and it is right to be.** Nothing
> in it is clever. A mill on the highest ground with the sails turning a
> quarter every few minutes, a lane going north to it, a ford with the
> cart ruts running into the water, a table laid for two on the strip
> where the plough turns, and four people working a field who never look
> up. The register holds — I could not find a joke in it, and I looked.
>
> **The waits.** At nine in the evening the second setting is put away
> and the table has one plate on it. Sit down once and it is out at nine
> in the evening forever. And the man turns a quarter. That is all. Both
> of them are photographed in both states and in both cases the
> difference is small enough that a player might miss it, which is the
> correct size for a permanent change in a world this quiet.
>
> **Portrait.** Both lands are better in portrait than in landscape,
> which has not happened before in this project. The mill is a landmark
> in a tall frame and the wood is a corridor in one.
>
> **Two things I am passing and not praising.** The Downs' stooked field
> is still the weakest framing either land owns — the sheaves are in
> lines now and they recede, but the field around them is thin. And the
> Penwood's east arc is a road through a wood and not much else; you
> filled it, it is fine, it is not a place.
>
> WOWED. And go and look at what you have done to the sheet's east half
> while you were at it — the protected `crease-east-road` framing has the
> Penwood's edge on its horizon now instead of eleven identical cartoon
> trees. That is the fourth-best thing in this session and you got it
> for nothing."

**Verdict: WOWED**, round 5. Logged 2026-08-30.

---

## The regression gate, run beside the art director

`tools/diff-sheets.mjs`, 92 framings against `origin/main`, bearing
pinned: **73 bit-identical on THE PAGE**; nineteen moved. Four of those
are `crease-east-road`, whose far half IS the Harrow Downs — shot side
by side, the fold and both its shoulders are pixel-for-pixel what they
were, and what changed beyond it is eleven cartoon oaks and a red barn
becoming a hedged patchwork under a pine horizon. The rest are four- and
five-pixel strips of SKYLINE where a neighbouring land's own new edge
shows at the fog limit. `SESSIONS.md` carries the numbers, the bounding
boxes and the argument.

**The tool also found something the art director could not**, and it is
worth logging in the same file as a verdict: eight per cent of the
protected `curl-rim` framing had moved, in THE BLEACH FLATS, a land this
session never opened, because the Downs' corrugation shipped without an
east bound and ran clean across two lands and onto the world's rim.
Fixed before this gate's round 5.

---

## What this gate did NOT judge, and it matters

**The sound.** Six new voices — `mill-creak`, `sheep`, `field-work`,
`axe-far`, `tarn-drip`, `pine-tick` — and one authored SILENCE (nothing
but the bed fires within twenty units of Brack, and nothing anywhere
says so). `tools/check-audio.mjs` asserts that the levels sit where they
should and that nothing clips. **Nobody has heard any of it**, which is
the standing owner's gate from Session 8 and this session cannot run it
either.

## Standing notes for a later session

- **The stooked field** is the weakest composition in either land.
- **THE PENWOOD's east arc** is passed and unpraised.
- **The rowboat's first meeting at THE RIVER MOUTH** is still a lot of
  sand. **Four** gates have now passed it without praising it.
