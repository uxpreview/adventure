# PROMPT — the standing order, the state, and the next session

*Read this, `GAME.md` and `CHANGELOG.md`. Then `design/reset/THE-GATE.md`
for the loop procedure. Nothing under `design/archive/` binds.*

## 1. The standing order (the owner's brief, verbatim, 2026-09-07)

> I want you to turn INKLANDS into an open world that feels alive and
> immersive, at the level of the best games in the genre: Breath of the Wild
> for seeing a thing on the horizon and going there, A Short Hike for a first
> ten minutes that teaches by playing, Stardew Valley for a town that keeps
> its own hours and talks to you, Fallout: New Vegas for choices the world
> reads back to you out loud, Untitled Goose Game for toys you cannot stop
> messing with. Keep the ballpoint. Throw out every other rule. Read
> design/THE-RESET.md once for the diagnosis, the six pillars and the phases,
> and read nothing else in design/ unless you need a fact from it.
>
> Fan out sub-agents, one per pillar, and have each one own its pillar end to
> end: THE CAMERA (free orbit, standees that face it, movement relative to
> it, never a turn the player did not ask for), THE VOICE OF THE WORLD
> (people who speak in hand-lettered bubbles, a notebook in the walker's
> hand, every action answered on screen within a second, every choice read
> back within a minute), THE FIRST HOUR (the bull, then a named job from Nell
> that teaches talk, map, notebook, a border and a choice, then the world
> opens), SCALE AND MOTION (a land is a place and not a yard, mounts that go
> anywhere, something moving in every frame), THINGS TO DO (twelve jobs with
> names, one collection with a count, four toys with a score, monsters that
> chase), and THE PEN (zero image assets, procedural ink, wash, lettering and
> sound, 60 fps on a phone). /loop on each one.
>
> Every loop ends with two separate sub-agents that have not read a single
> design document. A COLD PLAYER opens the URL with no instructions, plays
> for ten minutes from the title screen, and writes what it understood, what
> it did, what reacted, and what it wanted to do next. A HARSH CRITIC takes
> the strip of that play and puts it beside the reference game for that
> pillar, blind, and says which one it would rather keep playing and why, in
> one paragraph. If the cold player cannot say what the game wants inside
> sixty seconds, or the critic picks the reference, the loop is not done. Do
> not argue with either of them. Fix it and run them again.
>
> Don't stop until the cold player can describe the game to a friend in two
> sentences, name three things it wants to do next, and the critic picks
> INKLANDS at least as often as the reference on every pillar. Then hand the
> owner one line: the URL. No script, no ?hour= parameter, no play sheet. If
> the owner needs a sheet to find the content, the content is not found.
> Three.js, build green, pushed, and one page of notes in CHANGELOG.md saying
> what changed and what the cold player said before and after. /loop until
> it's utterly alive.

**The one amendment, from the owner on 2026-09-09:** do not fan out in
parallel any more. Every session and sub-agent shares one five-hour usage
window; four parallel sessions emptied it in about an hour, three times.
Run the pillars and the loop **one at a time, one agent at a time, over as
many sessions as it takes.** A cold player and then one critic in sequence
is fine. The brief's goal is unchanged; only the shape of the work is.

## 2. Where it stands (2026-09-09, branch `claude/inklands-open-world-va3lgx`, PR #23)

Play it: https://adventure-git-claude-inklands-open-world-va3lgx-ryankm.vercel.app
(Vercel rebuilds this alias on every push to the branch.)

| Pillar | Built | Verified by | Report | Gate |
|---|---|---|---|---|
| THE CAMERA | yes | its engineers' orbit tours; integrator smoke | **missing** | not run |
| THE VOICE | yes | its engineer's play on both rigs | `design/reset/reports/VOICE.md` | not run |
| THE FIRST HOUR | yes | integrator: bull → Nell → THE FOURTH NAME in the notebook | **missing** | not run |
| SCALE AND MOTION | yes | its engineer's timed runs and three-hour sweep | `design/reset/reports/SCALE.md` | not run |
| THINGS TO DO | yes | **nobody** past the build | **missing** | not run |
| THE PEN | yes | its engineers' fps/glyph/bench tools | **missing** | not run |

"Gate" is the brief's test: a ten-minute cold play from the title with no
instructions, then a blind critic per pillar. **It has not been run on the
merged build**, so nothing above is done in the brief's sense. The code of
every pillar is merged and the build is green.

What the integrator saw with the harness, from the title, no parameters:
0:04 the bull looks, Nell's bubble "RUN. THE GATE. NOW.", hint "hold shift
to run"; 0:40 through the gate, Nell: "That bull is mine…"; four E presses:
"Read it. Bring me the fourth name and I'll owe you."; objective line NELL —
READ THE SIGNPOST AT THE CROSSROADS; N shows THE FOURTH NAME, four steps,
"for: NELL'S CAP", THE 8:15 WILL STOP FOR 0 OF 12.

## 3. The next session, and the ones after (one item per session, in order)

1. **Run the gate.** `design/reset/THE-GATE.md`, top to bottom: cold player,
   then the six critics one at a time. Write both verdicts into
   `CHANGELOG.md` under "After". Fix the three things named most. Run the
   cold player again. Repeat until the brief's stop condition holds.
2. **The gate on a phone.** The same with `--rig portrait`.
3. **The open list** in `CHANGELOG.md` "Known and open", top to bottom.
4. **The four missing reports**, one page each, from the diff:
   `git log --stat dcd1a6e..origin/wt/camera-2`, `…wt/pen-2`,
   `…wt/first-hour`, `…wt/things`.
5. **The owner plays.** Nothing but the URL. Their notes beat every critic.

## 4. Rules that stay
Keep the pen (no image, font or audio assets, ever). `npm run build` green
before every commit. Small labelled insertions in `src/core/App.ts`. Every
visible word hand-lettered with its text as `aria-label`. The only play
instruction is the URL. Do not argue with the cold player or the critic.
