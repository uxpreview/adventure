# INKLANDS — THE RESET: shared brief for every pillar agent

You are one of six engineers rebuilding INKLANDS, a Three.js open-world game
drawn in procedural ballpoint (repo: a Vite + TypeScript app, `npm run build`
= `tsc --noEmit && vite build`). The owner played it and said it is "no
longer fun or understandable". The diagnosis, in one line: **a beautiful
diorama that refuses to talk to the player.** Camera locked north, nobody
speaks, no visible goal, world one running minute wide, choices whose
consequences are hidden on purpose.

The owner's reference games, and what each one is the reference FOR:
- **Breath of the Wild** — you see a thing on the horizon and go there.
- **A Short Hike** — a first ten minutes that teaches by playing.
- **Stardew Valley** — a town that keeps its own hours and talks to you.
- **Fallout: New Vegas** — choices the world reads back to you out loud.
- **Untitled Goose Game** — toys you cannot stop messing with.

## The one rule that stays: KEEP THE PEN
Zero image assets. Every tree, person, letter and sound is procedural
(`src/engine/ink.ts` strokes onto canvases, `src/engine/script.ts` hand-letters
every word, `src/core/Audio.ts` synthesises every sound). No fonts, no PNGs,
no SVG files, no samples. 60 fps on a phone is the budget. **Every other
rule in the old design docs is retired.** Do NOT read `design/` — it is
archived doctrine and most of it is the disease (it says "nothing says",
"nobody says", "no notification" hundreds of times). If you need one fact
from it, grep for it, take the fact, and close the file.

## The six pillars (one agent each)
1. **THE CAMERA** — free orbit under the player's hand (right-drag / two
   fingers / arrow keys or Q/E), standees always face the camera, movement
   relative to the camera, gentle auto-follow behind the walker, a recentre
   key, and NEVER a turn the player did not ask for.
2. **THE VOICE OF THE WORLD** — people speak in hand-lettered bubbles; a
   notebook in the walker's hand (jobs, heard, places, found, choices);
   every action answered on screen within a second; every choice read back
   within a minute; map pins for anything a person names.
3. **THE FIRST HOUR** — the bull, then a named job from Nell that teaches
   talk, map, notebook, a border and a choice, then the world opens with
   three visible options.
4. **SCALE AND MOTION** — a land is a place and not a yard; mounts go
   anywhere; something moving in every frame (traffic, birds, crowds,
   weather you can see coming).
5. **THINGS TO DO** — twelve jobs with names, one collection with a count,
   four toys with a score, monsters that chase, night as a reason to get
   indoors.
6. **THE PEN** — procedural ink, wash, lettering and sound at 60 fps on a
   phone; the lettering has every glyph the other pillars need (digits,
   punctuation, quotes, ellipsis); sound answers every verb.

## How the work is organised
- Wave 1 (parallel, each in its own git worktree): CAMERA, VOICE, SCALE, PEN.
- Wave 2 (after wave 1 is merged): FIRST HOUR, THINGS TO DO.
- Then a loop: a COLD PLAYER (no docs, no instructions, plays ten minutes
  from the title) and a HARSH CRITIC per pillar (blind against the reference
  game). If the cold player cannot say what the game wants inside sixty
  seconds, or the critic picks the reference, that pillar gets fixed and
  re-run. Nobody argues with them.

## Rules of engagement (read twice)
1. **Your worktree, your branch.** You work in the worktree you were given.
   Commit early and often with descriptive messages on your branch. Do not
   touch other worktrees or push.
2. **Build green.** `npm run build` must pass before every commit. Vite +
   tsc strict. No `// @ts-ignore` sprees.
3. **Small labelled insertions in shared files.** `src/core/App.ts` (2400
   lines), `src/core/Input.ts`, `src/ui/UI.ts`, `src/style.css` will be
   edited by several people and merged by hand. In those files: add new
   code as a compact block with a comment `/* ---- PILLAR: <name> ---- */`,
   call out into a NEW module you own, never reformat, never move existing
   code around, never rename existing fields. Put the bulk of your pillar in
   new files under `src/` that only you touch.
4. **Delete dead doctrine freely inside files you own.** The comments are
   long essays. In a file you own, cut essays to a line; in a shared file,
   leave them.
5. **No image assets, no fonts, no audio files.** Ever.
6. **Every visible word is lettered by `script.ts` via `ui/lettering.ts`
   and carries its text as `aria-label` on the element** (the harness reads
   the screen through aria-labels; so do screen readers). New DOM text must
   follow that pattern. Three.js-side text (bubbles over heads in world
   space) must ALSO mirror its text into a hidden DOM element with
   aria-label while visible, so the harness can read it.
7. **Play it.** Before you report done, play your own work through the
   harness (below) for at least three game minutes and look at the
   screenshots. A feature nobody has seen in a screenshot is not done.
8. **Performance.** Don't add per-frame allocations, don't add draw calls
   per NPC; use instancing/shared canvases; the phone budget is real.
9. **Report** with: what you built, the files you own, the hooks you added
   to shared files (file:line), what the harness screenshots showed, what
   you did not finish. Be blunt.

## The harness (the cold player's hands)
There is no GPU here: Chromium renders at ~4 fps. `tools/play-server.mjs`
keeps a browser open and advances GAME time on a fixed clock, so play is
deterministic and one game-second is one game-second.

    npm run build && (npx vite preview --port <P> --strictPort &)     # your own port
    node tools/play-server.mjs --port <Q> --url http://localhost:<P>/ --out <dir> &
    # wait ~40 s for "loaded to title"
    PORT=<Q> node tools/play.mjs shot title          # screenshot + state + all visible text
    PORT=<Q> node tools/play.mjs click .title-btn    # press the first title button
    PORT=<Q> node tools/play.mjs hold w,shift 3      # run "north" 3 game seconds
    PORT=<Q> node tools/play.mjs press e             # interact
    PORT=<Q> node tools/play.mjs drag 640 360 900 360 right 1   # right-drag (orbit)
    PORT=<Q> node tools/play.mjs status | text | sec N | errors | quit
    node tools/play.mjs   (no args) lists every op. `--rig portrait` = phone.

Then Read the PNGs it wrote. Use ports from your own range (given in your
task) so agents don't collide. Kill your servers when done.

## Contracts between pillars (APIs to implement exactly / rely on)
These are agreed now so wave 2 can rely on them. VOICE implements them.

    // src/ui/speech.ts — VOICE owns
    export function say(who: Speaker, text: string, opts?: { hold?: number; then?: () => void }): void
      // Speaker = { name: string; x: number; z: number; y?: number } | 'walker'
      // one bubble per speaker at a time; hand-lettered; queues if busy
    export function shout(text: string): void   // a world line, unattributed, e.g. "THE 8:15 IS COMING"

    // src/ui/toast.ts — VOICE owns: the answer-within-a-second line
    export function toast(text: string, kind?: 'learned'|'found'|'job'|'done'|'score'|'plain'): void

    // src/world/notebook.ts — VOICE owns; everything is saved in Save
    export const notebook: {
      job(def: { id: string; name: string; giver: string; steps: string[]; reward?: string; land?: RegionId; pin?: {x:number;z:number;label:string} }): void
      step(id: string, index: number): void             // marks steps < index done, toasts the next
      complete(id: string, line?: string): void         // toasts "DONE: <name>", moves to done
      heard(who: string, line: string): void            // "things heard"
      place(label: string, x: number, z: number): void  // map pin + "places"
      found(collection: string, item: string, total: number): void   // "3 of 12"
      chose(id: string, what: string, consequence: string): void     // choices and what they did
      score(toy: string, value: number): { best: number; isBest: boolean }
      active(): Job | null;  list(): Job[];  counts(): Record<string, {have:number; of:number}>
      open(): void; close(): void; toggle(): void       // the N key / button
    }

    // src/world/npc.ts — VOICE owns the registry; others register into it
    export const npcs: {
      define(def: { id: string; name: string; land: RegionId; at: (hour:number)=>{x:number;z:number} | {x,z}; lines: (state: NpcState) => string[]; onTalk?: (state) => void }): void
      near(x, z, r): Npc | null;  state(id): NpcState;  set(id, patch): void
    }
    // Talking = walk up, prompt "TALK TO NELL", press E → say(...) the next line.

    // src/world/jobs.ts — THINGS TO DO owns (wave 2), FIRST HOUR uses for job 1
    // a job = notebook.job + triggers; jobs.ts wires triggers (reach place, talk to X, carry Y to Z)

CAMERA exposes on `__inklands`: `yaw()`, `setYaw(rad)`, `recentre()`.
SCALE exposes: the new `WORLD` rect and `REGION_SPECS` (positions of every
land change; anything authored in absolute coordinates must use the region
helpers or be re-authored). SCALE must leave a written table of each land's
new rect and the walker's start position in its report.

## Tone of the writing (for anyone lettering a line)
Short sentences. Plain words. Dry, a little funny, never cute. A person
says what they want in one line and why in a second. Nell: "That bull is
mine. Get the gate shut and I'll owe you." Not: "Greetings, traveller!"
