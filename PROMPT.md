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

## 2. Where it stands (2026-09-17, branch `claude/next-session-r4gate`; main is PR #29)

Play it: https://adventure-git-claude-next-session-r4gate-ryankm.vercel.app
(Vercel rebuilds `adventure-git-<branch>-ryankm.vercel.app` on every push
to a branch.) PRs #23 to #29 are merged; main is the story of record's
first five minutes plus the gate's rounds on it.

The gate (`design/reset/THE-GATE.md`) rounds so far, all desktop, from
the title, no parameters:

| round | T1 (what it wants at 60 s) | T2 (two sentences, three next) | T3 (critics for INKLANDS) |
|---|---|---|---|
| 1 | 6/10 — **fails** | yes | 0 of 6 |
| 2 | 8/10 — holds | yes | 0 of 6 |
| 3 | 8/10 — holds (first five minutes) | yes | not run |
| 4 | 7/10 — holds | yes | 0 of 6 |
| 5 | 9/10 — holds (the three verbs) | yes | 0 of 1 (FIRST HOUR only) |

Round 1's cold player never met Nell. Round 2's could not get through
Brim's south gate. Round 3 (the rebuilt opening) rode fifteen metres of
fence looking for the gap. Round 4 (2026-09-16, after the by-hand play
and its fixes) penned the bull at 53 seconds, took the belfry job in
Brim and sat through the rain to the lamps, but spent eighty seconds
on Brim's wall walking under the South Gate twice, and never got THE
LIST (a wait added that session; fixed after the round). Each round's
fixes are in `CHANGELOG.md`; reports in `design/reset/rounds/round-N/`.

Round 5 (2026-09-17, after the three verbs) chose I'LL HANDLE IT at
thirty seconds and could not shut the gate in ten tries; it never saw
Morrow or the list. Fixed after the round (the gate always works, Nell
offers again, a press is answered now, the bull keeps off); **not yet
played cold.** Round 4's items 1 and 2 below are built as of round 5's
fixes and also not yet played cold.

**What round 4's critics name most, in order (1 and 2 built 2026-09-17):**
1. **The South Gate arch** is drawn as faint as its wall; the player
   walked under it twice. The "BRIM'S GATE IS WEST ALONG THE WALL"
   nudge fires while standing at it (3 critics).
2. **The map's labels** pile into one smudge wherever places cluster
   (THE COMMON / THE FIELD GATE / THE LONG FENCE / THE BENCH; BRIM
   SQUARE / THE MARKET CROSS / THE BELFRY / THE SOUTH GATE) (2, and
   the owner on 2026-09-12).
3. **Brim's bystanders**: six or seven drawn people in the square and
   only Marget has a name or a line (2).
4. **The moving figure has no legs** at walking pace in a third of the
   frames; **the hedge wash** overprints Nell, the gate and the bull
   (PEN).
5. Nell's "it follows the horse" line lands after the mount (FIRST
   HOUR); a toy in THE COMMON with a score, and the bull loose again
   in the field (THINGS).

Done after round 4 (see `CHANGELOG.md` "Fixed after round 4"): the
list always comes; a called horse jumps a fence; E at the bench is
answered; the controls line prints at the bench.

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

## 2a. Running the gate on the owner's machine (2026-09-16)

- `tools/play-server.mjs` needs a Chromium. Playwright 1.62 looks for
  headless shell 1234; the machine has 1228. Either
  `npx playwright install chromium`, or
  `PW_CHROMIUM=~/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-x64/chrome-headless-shell`
  in the server's environment (`tools/pw.mjs` reads it).
- The desktop app's in-app browser sends keydown with an empty
  `e.code`; the game reads `e.code`. It cannot drive the walk. And
  when its pane is hidden `requestAnimationFrame` stops, the loader
  never lets go. Use the harness for play; the in-app browser only to
  look. `.claude/launch.json` starts `npm run dev` on 5173 for that.
- A round costs about 1.4M tokens: the cold player ~250k (ninety
  commands, 77 screenshots), each critic ~200k (reads every frame).
  One agent at a time (the owner's amendment).
- A sub-agent may be refused the Write tool ("return findings as
  text"): round 5's cold player was. Tell it to return the report as
  its final message and save it yourself to `play-gate/round-N/` (for
  the critic) and `design/reset/rounds/round-N/`. The cold player also
  ran out of commands at gameSec 220 on this machine; ask for fewer
  screenshots per command, not fewer seconds.
- `tools/check-verbs.mjs` is stale since the reset (112 failures, from
  its first section); it is not a gate.
- The harness clears `localStorage` on every load: a reload is a fresh
  game. `node tools/play.mjs eval` can teleport
  (`__inklands.char.teleport(x, z)`) and step
  (`__inklands.step(1/30, n)`) when a check needs a place, not a play.

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

**The fourth, and the owner's own direction (2026-09-13):**
`design/YOU-SAID-AN-HOUR.md`. Wake on the ridge with no memory, choose a
name, "You're back. You said an hour.", a list of twelve promises in your
own hand. Written to be shared with people who know nothing about the
game; the owner is collecting opinions on it.

**The working foundation (2026-09-14):** `design/foundation/01`–`04`
are the owner's baseline (core vision, story overview, opening sequence,
decision log). `05_Inklands_Critique_2.md` answers the open questions:
he left rather than forgot, the sea and Pye, Joan and the bench, Morrow
as successor not rival, four tiers of three, the railway as the
connection that needs no person, the bench and the note as the ending.
Nothing in 05 is decided until the owner logs it in 04.
`06` is the owner's refined foundation (2026-09-16: the disastrous day,
the sea, Morrow, the dog, the network, a gathering as the endgame, the
bench as the ending). `07` stress-tests it: make the disastrous day the
gathering itself (the 8:15 is its time, the bridge is the emergency),
fix the three-year timeline (Pye found him coming in), Joan said the
line, the network as one relay of twelve calls, cut "leave honestly",
the player writes the first page at the end.

**THE STORY OF RECORD (2026-09-16):
`design/foundation/08_Inklands_Story_Foundation_v1.md`.** Consolidated
from 01–07 and the owner's decisions; nothing in it is provisional. Files
02, 03, 06 are history. Read 01 (core vision) and 08, nothing else in the
folder, to build story.

## 3. The next session, and the ones after (one item per session, in order)

**The story rebuild comes first (owner, 2026-09-16: "proceed"). One item
per session, in order, each ending with the cold player and the critic
from `THE-GATE.md`.** Item 1 is built; **item 2 (Tier 1) is next.**
Round 4's arch and map labels rode along with item 1; Brim's
bystanders ride with Tier 1's Marget. Round 5's open list (`CHANGELOG.md`
"Named and not done") rides where an item touches it: the hedge's
drawn edge and the strangers' prompts are the two a first minute meets.

0. ~~**The first five minutes on the story of record**~~ **BUILT,
   2026-09-16** (`src/world/opening.ts`, `regions/meadow.ts`, the name
   card in `ui/UI.ts`, THE LIST in `ui/notebook.ts`, `world/thelist.ts`).
   Plays end to end on the harness in ninety game-seconds; see
   `CHANGELOG.md` "The first five minutes". Left for the next pass:
   the title poster is still the crossroads, not the Common at dusk
   from the ridge (the camera pillar's crane); the phone rig has not
   been played cold; a faint second walker is drawn under the horse's
   feet when mounted (pre-existing; `Character` on a mount).
   The item as written:
   the
   title as the Common at dusk from the ridge; the bench with the note;
   Nell's "You're back" / "It's been three years"; the name typed and
   lettered onto the notebook cover (a keyboard on the phone rig); the
   bull that comes for you and the horse Nell whistles, GET IT HOME,
   the bull following the horse to a gate Nell stands in; three
   recognitions on the walk back (Morrow, fifteen, with the dog);
   the notebook's first page and twelve lines, one crossed out; the
   second note; the pull. The old opening (`src/world/opening.ts`)
   is replaced, not patched. Gate: the cold player says what the game
   wants inside sixty seconds and names three of the twelve.
1. ~~**The three verbs the arc stands on**~~ **BUILT, 2026-09-17**
   (`CHANGELOG.md` "The three verbs"): SIT is a held press with a
   fidget (`App.trySit`); "I'LL HANDLE IT" is an answer strip
   (`world/handle.ts`, `ui/replies.ts`), live at Nell's gate and
   Morrow's bridge, with `JobSpec.offer` waiting for every promise;
   a line of THE LIST is crossed out by holding it down
   (`world/crossout.ts`). Left: each tier hangs its own offers; Joan's
   SIT DOWN card door still sits at once (Tier 4); the cost does not
   yet compound at the gathering (item 6).
2. **Tier 1 promises** (Wick, Nell, Marget) as built in `08` §9, each
   with its turn, its choice, its visible change, and its call
   reconnected. The jobs registry (`src/world/jobs/`) is re-hung on
   the twelve lines verbatim.
3. **Tier 2** (Val, Brack, Holt): the faded footprints, the lantern, the
   canyon and the Flats.
4. **Tier 3** (Amos, Pye, Wren): the rain table, the eighth pot and the
   honest note, the fleet and the Vikings.
5. **Tier 4** (Joan, the man at the crossing, Dennis): the second plate
   and the sit, the truth told, the board and the date.
6. **The relay and the gathering** (`08` §10, §14): the call in one
   shot, Morrow's morning, handing lines to people, the gate held,
   the table, Joan, the bench, the first page typed, the note taken
   down, "You coming?"
7. Then the gate rounds below, on the whole thing.

The pillar items that follow (camera, pen, things, phone) are done
inside these sessions where the story needs them, not before.

1. **Run the gate again** (round 5+): `THE-GATE.md` top to bottom —
   cold player, then the six critics, one agent at a time. Keep fixing
   the three things named most (§2 has round 4's). T1 and T2 hold as
   of rounds 2, 3 and 4; T3 is 0 of 6 every round, so the loop is not
   done. Round 4's after-fixes (the list always comes, the horse jumps
   a fence, E at the bench, the controls line) are built and pushed
   but have not been played cold yet.
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
