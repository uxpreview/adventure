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

## 2. Where it stands (2026-09-10, branch `claude/prompt-item-1-l6ogmg`, PR #26)

Play it: https://adventure-git-claude-prompt-item-1-l6ogmg-ryankm.vercel.app
(Vercel rebuilds this alias on every push to the branch.) PR #23 is
merged; this branch is the gate's rounds on top of it.

The gate (`design/reset/THE-GATE.md`) has been run on the merged build.
Rounds so far, all desktop, from the title, no parameters:

| round | T1 (what it wants at 60 s) | T2 (two sentences, three next) | T3 (critics for INKLANDS) |
|---|---|---|---|
| 1 | 6/10 — **fails** | yes | 0 of 6 |
| 2 | 8/10 — holds | yes | 0 of 6 |

Round 1's cold player never met Nell (the opening waited for a gate slam
only a westward run produces). Round 2's played the opening end to end
in 75 seconds and then could not get through Brim's south gate (a
3.2-unit collision gap in a 13-unit arch). Each round's fixes are in
`CHANGELOG.md` under "The gate"; the reports are in
`design/reset/rounds/round-N/`.

What every critic still names, and what a fix costs:
- **Small, done as they came up:** the opening by any exit; E always
  answered; WAIT as a verb; step pins; hints in game time; the lens
  taught once; gates wide enough; a wall that says "Solid."; names read
  from fourteen units; bubbles from off-screen pinned at the top.
- **Pillar-sized, not done (see §3):** the camera never moves for the
  world (no crane on a border, no vista); occluders are grey slabs over
  the walker and the figure stands inside props (PEN); a universal
  touch verb every drawn thing answers (THINGS); Marget, Joan and Val
  do not walk and work the way Nell does; each land's own moving life.

## 2b. The owner's notes (2026-09-12, played on a phone, no sheet)

These beat every critic. Verbatim in substance:
- The bull poses no danger. It sits there if you don't move, and it
  chases you backwards.
- Finding the field gate is extremely difficult: it isn't connected to
  anything (the hedge is blobs, not a line) and it faces you (a
  billboard, not a gate in a hedge).
- The map is incredibly hard to read.
- With the free camera it's easy to forget which way north is; "THE
  GATE IS WEST" means nothing.
- Nell's quest is confusing and wordy. Nobody will understand it. The
  first quest should pull you into the game.
- **The story itself does not work** and people will not understand or
  care about it. It is to be rethought in a fresh session, from
  scratch if need be. Nothing built is sacred if a better game needs it
  to go: the twelve lands, the 8:15, the twelve waits, the mechanics.
  The ballpoint-on-paper look is the *style* of the game, not its
  subject; do not pitch stories about drawing, pens or paper.
- Reference points for the opening the owner wants: Skyrim's cart and
  GTA's cold open. Carried through the world before you control it,
  someone talking, control arriving in stages, a spectacle that dumps
  you somewhere with one obvious thing to do.

The story conversation so far (2026-09-12) pitched and rejected: the
cap on the bull's horn; a cart-ride prologue; the 8:15 arriving empty;
a chase across the lands; get home by fixing the line; a postal round;
a fading page; a manhunt with a clock; an unfinished drawing. None got
a yes. Next time: get a bearing first (tone, who you are, a reference
whose whole shape to steal, or the trailer in three shots), then one
direction, not four.

**Three concepts, each with a bearing first, are in
`design/STORY-CONCEPTS.md` (2026-09-12): DOWNSTREAM (the river stopped;
decide who gets it back), THE KING'S ROAD (walk a thousand-year-old king
home, a companion who talks the whole way), WHAT TOOK TAM (find the
carter the wood took). A side-by-side table, a recommendation and three
questions for the owner are at the end of that file. Nothing is picked
until the owner picks.

## 3. The next session, and the ones after (one item per session, in order)

1. **Run the gate again** (round 3+): `THE-GATE.md` top to bottom on
   this branch — cold player, then the six critics. Round 2 used the
   whole usage window on one cold player and six critics (the PEN
   critic finished on the last request), so budget for exactly that
   and the fixes. Keep fixing the three things named most. T1 and T2
   hold as of round 2; T3 is 0 of 6, so the loop is not done.
   Round 2's fixes (the gate, the bump line, Joan's name, LOOK AT, the
   off-screen bubbles) are built and pushed but have not been played
   cold yet.
2. **THE CAMERA moves for the world.** A crane on every border crossing
   (pull back and rise, then settle behind the figure), an opening
   shot from the Common that frames Brim, the Downs, Maple Court and
   the sea, and occluders that dolly or line-fade instead of grey slabs.
   Two critics in two rounds named it first.
3. **THE PEN's second half: depth.** The walker and people depth-sorted
   against props (nobody inside a bull, a fence, a cart or a fountain);
   near buildings opaque and off the HUD; the figure whole at every
   distance.
4. **THINGS: one verb for everything.** A touch every drawn object
   answers — sheaves topple, the bull startles, pigeons scatter, the
   signpost's arms spin — and the "push the cart yourself" branch as a
   toy.
5. **The gate on a phone.** The same with `--rig portrait`.
6. **The open list** in `CHANGELOG.md` "Known and open", top to bottom.
7. **The four missing reports**, one page each, from the diff:
   `git log --stat dcd1a6e..origin/wt/camera-2`, `…wt/pen-2`,
   `…wt/first-hour`, `…wt/things`.
8. **The owner plays.** Nothing but the URL. Their notes beat every critic.

## 4. Rules that stay
Keep the pen (no image, font or audio assets, ever). `npm run build` green
before every commit. Small labelled insertions in `src/core/App.ts`. Every
visible word hand-lettered with its text as `aria-label`. The only play
instruction is the URL. Do not argue with the cold player or the critic.
