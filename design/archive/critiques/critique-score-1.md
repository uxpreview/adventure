# Critique — THE SCORE (Session 8, 2026-08-30)

*Verbatim. Three gates, and the shape is different from every previous
session's because the product is: the first thing this project has
built that cannot be screenshotted.*

- **Gate 1 — `node tools/check-audio.mjs`.** Machine. Renders the score
  offline and asserts what a listener would notice.
- **Gate 2 — the art director**, on the SOUND SHEET (the plotted voices)
  and on a full regression of the six protected lands at two hours in
  both viewports.
- **Gate 3 — THE OWNER LISTENS.** Not run. It could not be run here and
  the session says so in as many words. See §4.

---

## 1. Gate 1 — the machine, and the four things it found

`check-audio.mjs` did not pass on the first attempt, and every one of
the failures was a real defect rather than a wrong threshold. They are
logged here because the value of building the tool is exactly this:

**FINDING 1 — every border in the game had a 3 dB bump in the middle
of it.** Two beds built from the same noise buffer at the same offset
are not two rooms, they are ONE SIGNAL PLAYED TWICE. An equal-power
crossfade assumes its two sides are uncorrelated; between two identical
signals cos + sin peaks at √2, and the meter read exactly that: +3.19
dB at the centre of a fade whose entire purpose is not to do that.
*Fixed:* every bed now enters the world's shared noise at its own
offset. **This is the finding that justifies the tool.** It is
inaudible as a fault and obvious as a wrongness — a border that swells
— and nothing but a meter was ever going to find it.

**FINDING 2 — the air voice was 12 to 18 dB under everything else.**
A resonant bandpass passes a small fraction of the noise you put into
it, so LONGSHORE, GREYLINE CITY and THE BLEACH FLATS were rendering at
a tenth of the level `MOODS` claimed. Nobody would have called it a
bug; they would have called the coast "subtle". *Fixed:* the voice's
own trim, then per-land trims measured rather than guessed. Twelve
lands now meet within **1.07×** of one level.

**FINDING 3 — three rooms were louder than the lands they were the
rooms of.** §9 says the bed is the quietest thing in the mix; the bed
was not. *Fixed:* every bed now measures below its land's own voice,
and the ordering is authored — the canyon is 14 dB below the sea.

**FINDING 4 — the ocean and Brim were the same instrument in the same
register.** Two bells at 1×, separated only by a decay time. Doubling
is a family; that was one land played twice. *Fixed:* the buoy drops to
0.75× — a fourth under the belfry, and truer to what a bell buoy is.

### What it asserts, in the end

```
the tables:            12 lands, 5 instruments, every one of them played
                       every family ≥ 5 semitones apart in sounding register
twelve sounds:         closest pair 0.492 apart (castle / city), and they
                       are a family; centres spread 322 Hz .. 2961 Hz
the level:             twelve voices within 1.07× of one level
the bed:               under its land, every land; canyon 14 dB below the sea
the border:            equal power to 1e-6; the reference fade -0.62 / +0.49 dB;
                       three real borders never leaving the curve by more than
                       the rooms' own weather
the player:            0.45 → 1.35 is monotone, melody and room
the hour:              12h 2722Hz → 22h 2414Hz, thinner, phrases 7.5s → 10.9s
the place:             the cut answers 106 dB louder than the Common does
clipping:              hottest land flat out = 0.083, -22 dB of headroom
```

And `tools/verify-score.mjs`, which is the half a renderer cannot
prove — the class's own wiring, live: fifteen crossings, then **five
crossings inside one three-and-a-half-second fade**, which is the case
that puts an AudioParam into a state Web Audio throws on. Nothing
threw. The canyon's tail is 0.55 at 0.42 s and the Common's is 0.00.

---

## 2. Gate 2 — the art director

### Round 1, on the sound sheet — NOT YET

> Three faults and they are all the same fault: **you have drawn the
> data and not the sound.**
>
> 1. **Eleven of the twelve waveforms are a flat line.** You normalised
>    every panel to the loudest land on the sheet, so THE CUBICLE MILE
>    — which is a real instrument doing a real thing — is a hair on a
>    rule. The shape IS the instrument: a bell's hard front and long
>    tail, air's slow swell, the bowed voice ARRIVING rather than
>    starting. Give each panel its own height and put the loudness in
>    the caption, where a number belongs.
> 2. **There is a picket fence at the bottom of every spectrum** and it
>    is in every panel identically, which is how I know it is yours and
>    not the sound's. That is the log binning running out of FFT bins
>    and dropping the gaps to zero.
> 3. **The room is drawn ABOVE the land in half the panels**, which
>    says the opposite of what your own checker asserts. Two lines on
>    two different scales cannot be compared and should not be drawn
>    on one axis.

**Fixed:** per-panel waveform height (stated on the sheet), empty
spectrum bins interpolated instead of floored, and **one decibel
window across the whole sheet** so a quiet land looks quiet and a room
sits under the land it belongs to.

### Round 2 — NOT YET (one fault)

> Better. The waveforms read as sounds now. But **two thin traces with
> a gap between them is two scribbles, not a waveform** — give it a
> body. And your caption is sitting on the rule.
>
> The border sheet is worse than useless: **the lower lane is a solid
> block pinned to the ceiling in all three panels.** You have drawn a
> level normalised to its own maximum, which can only ever be flat at
> the top. It proves nothing and it looks like it proves something,
> which is the worst state a diagram can be in.

**Fixed:** the envelope filled, the caption moved below the rule, and
the border sheet's lower lane rebuilt as **the deviation from the curve
the fade is supposed to follow** — √(cos²·a² + sin²·b²) between the two
rooms' own levels, on a ±4 dB window with the zero line drawn. Flat is
now the claim, and a sag would be visible.

### Round 3 — WOWED

> **Twelve lands are twelve sounds and I can see it from across the
> room.** The struck lands hit and decay, the air lands are a
> continuous band, the bowed lands sit still, and THE HARROW DOWNS is
> a row of spikes that could not be mistaken for anything else on the
> page. The spectra spread from 322 Hz to nearly 3 kHz and no two of
> them have the same profile.
>
> What I like best is that the sheet is **drawn** — the ballpoint is
> doing the plotting, the room is in pencil under the land in ink,
> which is the same two registers the map already uses for *somebody
> told me* and *I stood in it*. It is a page out of the same notebook
> as everything else in this project, and it is an instrument panel.
>
> On THE SANDBAR's meter wandering two decibels: that is the sea
> breathing, your own checker measures it at 3.69 dB, and it is in the
> caption. Fine.
>
> And the regression is the right kind of boring. **One hundred and
> fifty-four frames** — six protected lands, two hours, both viewports —
> and there is nothing new drawing anywhere: the Common's well and
> poppies and the signpost with the time on it, Brim's square and its
> belfry with the lamps lit at dusk, Greyweather's avenue and gatehouse,
> the Cut with its chain and its chisel marks, the Mark with the regatta
> rounding it. The diff is one file that draws nothing, and the sheets
> agree with the diff.
>
> **Two honest notes, because I would rather say them than have them
> found later.** Frames shot at short settle in this sandbox catch the
> ink-in cascade mid-wave — Brim Square arrives half in pencil at three
> and a half frames a second — which is the streaming mechanic and not
> this session's doing, but it means a frame is not a fixed thing to
> compare against. And that is the second note: **this pass was a person
> looking at pictures, which is what "unregressed" has meant in this
> project every time it has been said.** A score session got away with
> it because its diff is one file that cannot draw. **The next session
> touches the camera, and it will not get away with it** — which is why
> the Session 9 prompt asks for `tools/diff-sheets.mjs` before it asks
> for a bearing.

**Verdict: WOWED** (round 3).

---

## 3. What this session refused

**The music player, and the unlock message** (`INSPIRATION.md`,
RuneScape §6). Every land now has a voice that is recognisably its own,
which is precisely the condition under which a project starts wanting
to LIST them. There is no track name anywhere in this game, nothing
announces a land's voice, nothing collects it, and the only place any
of the twelve names appear together is a developer tool that is not in
the build. A land's voice arrives because you are standing there.

**The medium as the subject.** Nothing in the twelve reasons mentions
paper, pen, desk or room. The instruments are things that are actually
there: a belfry, a buoy, wind in a stone building, two notes of hold
music, air off a grating.

**A twelfth unrelated instrument.** Five voices, twelve lands, five
families. Two lands on the plucked string in different registers is a
family; twelve lands on twelve instruments is a sound library.

---

## 4. THE GATE THIS SESSION DID NOT RUN, AND CANNOT

**The score has not been heard. Not by anybody, not once.**

It has been rendered, measured, plotted and asserted, and none of that
is a judgement. A spectrum is not a listen. Every sentence in this file
about how something SOUNDS — that a bell reads as bronze, that the
office park is two notes on hold, that the sea breathes — is a
statement about a design intention and about a graph, and it is not
evidence.

`node tools/render-wavs.mjs` writes nineteen files to `out/sound/`:
twelve land voices at seventeen seconds, three border crossings at
twenty-two, and THE PENWOOD at noon, six, nine and eleven at night.
They carry one uniform 16× gain and nothing else — never a per-file
normalisation, because a land that is quieter than another one here is
quieter in the game by exactly as much.
`out/sound/WHAT-TO-LISTEN-FOR.txt` says what is worth asking of them.

**The ear gate is the owner's.** The three questions that matter and
that no tool in this repository can answer:

1. Can you tell the twelve apart with your eyes shut — and can you
   still, a week from now? That is RuneScape's bar and it is the reason
   this session exists.
2. Does a border sound like a place you walk through, or like a switch?
3. Does a family sound like a family, or like a mistake?
