# VOICE — THE VOICE OF THE WORLD: report

Branch `wt/voice`. Build green (`tsc --noEmit && vite build`) at every commit. Played through the harness on both rigs (desktop 1280×720 at dpr 1, portrait 390×844 at dpr 2); screenshots were taken and looked at, not just listed.

---

## 1. What was built, and how a player meets it

**Speech bubbles.** Every named person, every unnamed figure, and the walker can speak. A line is a hand-drawn paper bubble in world space with a tail to the speaker's head, lettered by `script.ts`; it follows the speaker while it is up (Nell walks to her cart mid-sentence and the bubble goes with her). One bubble per speaker; a second line queues. Hold is 1 s + 60 ms a character, minimum 2.5 s, then a fade. The bubble is clamped inside the screen and under the HUD; on a phone the text is 11.5 px x-height and wraps at 230 px. A speaker behind the lens gets the line pinned low centre rather than lost. The text is the element's `aria-label` while it is up; the harness reads it. Every line dispatches `inklands:event` `'speech'` for PEN to score (guarded by try/catch; the audio switch has no default case so an unknown name is a no-op).

**The answer line (toasts).** Every action has a lettered answer on screen on the same frame, with a small ink glyph per kind: tick (done), star (found), pin (place), pin-with-foot (job), open book (learned), tally (score). Three stack, ~3 s each, bottom centre on a wide screen, top-left under the objective line on a phone. Verbs that now toast: read a note (`READ: THE CROSSROADS`), learn a fact (`YOU LEARNED: THERE IS A LIST, AND THE TWELVE ARE ON IT` — every knowledge id has a plain label in `lines.ts`), hear of lands (`YOU HEARD OF: THE KINGDOM OF BRIM, LONGSHORE AND THE HARROW DOWNS`, one line for a signpost that names three), pick a choice (`YOU CHOSE: …`), pick up / put down / throw a thing and where it lands (`IN HAND`, `THROWN`, `PLOP`, `3 SKIPS`, `THE WELL HAS IT`), push (`THE CART ROLLS`, or `IT WILL NOT BUDGE`), a touch nothing else answered (the prompt, ticked), sit (`YOU SIT. THE DAY RUNS SIX TIMES FASTER.`), take a mount (`THE OARS ARE YOURS…`, `ON THE BICYCLE. E RINGS THE BELL.`, `ABOARD THE 8:15`), first sight of a POI (`FOUND: THE FIELD GATE` as its label comes into range), take a worn item (`TAKEN: THE CROWN — YOU ARE WEARING IT`), and a place somebody names (`PINNED: THE CROSSROADS`).

**The notebook.** `N`, the HUD button `notebook`, or a click on the objective line opens it; `N`, `E`, Escape, the veil, or `put it away` closes it; the walker is frozen and POI labels suppressed while it is up. A hand-drawn page (`panelPageURL`) with five pencil-ruled tabs: **JOBS** (each job: giver — name, steps with boxes, ticks for done, a struck-through head when complete, `for: <reward>`; plus an **ASKED** list of what people have asked for and where, with the line they said it in, so the page is never blank after a conversation), **HEARD** (every line anyone has said to you, newest first, capped at 40), **PLACES** (`THE FIELD GATE — the common` in ink if you stood there, pencil if somebody only named it), **FOUND** (`<collection> — n of N` with the items, then a LEARNED list of plain-English facts), **CHOICES** (`YOU CHOSE: …` and, in pencil, what it did). Every line is lettered once and cached by content. Saved whole as `save.notebook` (jobs, heard, places, found, choices, scores, learned, activeId, and every person's talk state).

**The objective line.** Top-left, persistent, lettered: `NELL — SHUT THE FIELD GATE` (giver — the active job's next step). Flashes and tilts when it changes; hidden when there is nothing; click opens the notebook. When there is no job at all it falls back to the most recent ask (`NELL — THE CROSSROADS`) so the player always has one thing they could do next.

**People talk.** Walk up to anyone, the prompt says `TALK TO NELL` (or `TALK` for unnamed folk), press E. Named people have lines per state — `idle` (the first meeting) → `met` (small talk, cycles) → `asked` (one want, one place; the place is pinned on the map and listed under PLACES and ASKED) → `done`; a door taken in their land overrides everything with a `chose:<door>` line. If the person's own place offers a choice card not yet taken and stands within four units, talking to them opens the card (Nell's card comes through Nell). Unnamed figures get a one-line pool by routine role (`the-lamplighter`, `the-barista`, 53 roles) or by land. Every spoken line goes into HEARD.

**Choices read back.** Picking an option toasts `YOU CHOSE: <label>`, writes it to CHOICES with a plain consequence, and 6–18 game seconds later the land's person says their `chose:` line if they are on the page and within 45 units; otherwise the world says it as a **shout** across the top of the screen (`ON THE COMMON, A CART TURNS NORTH`). Every option button carries a one-line consequence hint after a dash (`TELL HER THE FOURTH NAME — the cart is loaded and goes north; Nell goes with it`).

**Map pins.** Every notebook place is a pin (loop on a stem, foot on the spot): ink if seen, pencil if only heard of, bolder with a filled loop for the active job's pin. Labels try six clear spots against every name already on the sheet, and keep off the you-are-here mark; a pin always gets its name.

**Hooks** on `window.__inklands`: `notebook`, `npcs`, `say`, `shout`, `toast`, `openNotebook()`, `closeNotebook()`, `talk(id)`.

### How a player meets it in the first two minutes (as played)
Set out → run west out of the bull's field → `FOUND: THE FIELD GATE` → prompt `TALK TO NELL` → E: *"That bull is mine. It went for you because you looked at it. It does that."* → E: *"Three of the four names on that signpost I could go to tomorrow. It's the fourth one I want."* → E: *"Go and read the signpost at THE CROSSROADS. There's a fourth name on it…"* + `PINNED: THE CROSSROADS`; the objective line reads `NELL — THE CROSSROADS`; N shows ASKED and HEARD; M shows the pin. Walk to the signpost → `FOUND: THE CROSSROADS`, `READ: THE CROSSROADS`, `YOU HEARD OF: THE KINGDOM OF BRIM, LONGSHORE AND THE HARROW DOWNS`. (With the timetable fact) back to Nell → E opens her card with hinted options → `1` → `YOU CHOSE: TELL HER THE FOURTH NAME` → 16 s later, Nell, now at her cart: *"8:15. Not a place. A time. Well — the cart goes north, then, and I go with it."*

---

## 2. Files, insertions, APIs

### Files I own (only VOICE touches these)
- `src/ui/speech.ts` (254) — bubbles and the shout
- `src/ui/toast.ts` (130) — the answer line and the glyphs
- `src/ui/notebook.ts` (306) — the notebook page and the objective line
- `src/world/notebook.ts` (253) — notebook state, toasts on change, the save shape
- `src/world/npc.ts` (349) — the people registry, talk POIs, folk scan
- `src/world/lines.ts` (375) — every line, every consequence, every knowledge label
- `src/world/voice.ts` (280) — the wiring App constructs and ticks
- `design/reset/reports/VOICE.md` — this
- `shots-voice/crop.mjs` — a screenshot cropper for reading small map text (dev only, ignored dir)

### Insertions in shared files (all labelled `VOICE`)
`src/core/App.ts`
- `46-52` imports (`Voice`, `notebook`, `npcs`, `say`, `shout`, `toast`, `withHint`)
- `90-91` field `private voice: Voice`
- `282-293` construct `Voice` with the UI, POI manager, camera, terrain getters, mounts, seat, region, started; `ui.onCloseNotebook`
- `296-300` `input.onInteract`: the key closes the notebook first
- `383-384` `notebook.load(save.data.notebook)`
- `761-769` debug hooks `notebook, npcs, say, shout, toast, openNotebook, closeNotebook, talk`
- `877` choice option labels through `withHint(label, door)`
- `885-886` in the choice callback: `this.voice.chose(def, option)`
- `907` `this.voice.read(note.title)` after `openNote`
- `914` `this.voice.touched(def)` after `def.touch(...)`
- `1793` `if (this.voice.open) this.char.frozen = true`
- `2282` `if (this.voice.open) this.poi.suppressed = true`
- `2284-2290` `this.voice.tick(dt)`; persist `save.data.notebook = notebook.saved` when `notebook.dirty`

`src/core/Save.ts`
- `1` `import type { NotebookSave }`
- `91-92` `notebook?: NotebookSave | null` on `SaveData`
- `112` `notebook: null` in `DEFAULTS`

`src/ui/UI.ts`
- `41-45` `onToggleNotebook`, `onCloseNotebook`, `objectiveEl`
- `109-112` the `notebook` HUD button after `map`
- `138-140` `objectiveEl` created and added to `chrome`
- `217-223` `KeyN` toggles; `Escape` also closes the notebook

`src/world/knowledge.ts`
- `365-366` `this.onLearn?.(id)` inside `learn()` after the set is written
- `370-371` `onLearn` listener field

`src/ui/map.ts`
- `7` `import { notebook }`
- `280-338` the pins block, drawn after districts and before you-are-here

`src/style.css`
- `410-448` bubbles and shout; `449-482` toasts; `483-509` objective; `510-670` notebook page; `681-697` portrait overrides inside the existing media query; `.nb-body > .nb-l-head` rule

Land files (one `npcs.track(...)` getter each, next to where the person is drawn):
- `src/world/regions/meadow.ts` `26` import, `535-536` Nell
- `src/world/regions/civic.ts` `83` import, `410-411` Marget, `2009-2010` Val, `2933-2934` the man at the junction, `3644-3645` Dennis
- `src/world/regions/wilds.ts` `49` import, `721-722` Brack, `1405-1406` Holt, `2052-2053` Amos, `2965-2966` Joan
- `.gitignore` `+play-*/` (harness output)

### Exported API

```ts
// src/ui/speech.ts
export type Speaker = { name: string; x: number; z: number; y?: number } | 'walker';
export function say(who: Speaker, text: string, opts?: { hold?: number; then?: () => void }): void
export function shout(text: string): void
export const holdFor: (text: string) => number          // 1 + 0.06/char, min 2.5
export function speaking(): string[]                     // "who: text" for every live bubble
export function installSpeech(o: { root; camera; groundAt; walker }): void   // App, once, via Voice
export function tickSpeech(dt: number): void; export function clearSpeech(): void

// src/ui/toast.ts
export type ToastKind = 'learned'|'found'|'job'|'done'|'score'|'plain'|'place';
export function toast(text: string, kind?: ToastKind): void
export function glyph(kind: ToastKind, size: number): HTMLCanvasElement | null
export function tickToasts(dt: number): void; export function clearToasts(): void

// src/world/notebook.ts
export const notebook: {
  job(def: { id; name; giver; steps: string[]; reward?; land?: RegionId; pin?: {x;z;label} }): void
  step(id: string, index: number): void
  complete(id: string, line?: string): void
  activate(id: string): void
  heard(who: string, line: string): void
  place(label: string, x: number, z: number, opts?: { seen?: boolean; quiet?: boolean }): void
  placeNamed(label: string): Place | null
  found(collection: string, item: string, total: number): void
  learn(label: string): void                              // plain-English line for FOUND › LEARNED
  chose(id: string, what: string, consequence: string): void
  score(toy: string, value: number): { best: number; isBest: boolean }
  active(): Job | null; list(): Job[]; counts(): Record<string, { have: number; of: number }>
  open(): void; close(): void; toggle(): void; readonly isOpen: boolean
  onChange(fn: () => void): void; setDayClock(fn: () => number): void
  jobs; heardList; places; foundMap; choices; scores; learned; npcs; dirty
  readonly saved: NotebookSave; load(s): void; landName(id): string
}

// src/world/npc.ts
export type NpcPhase = 'idle'|'met'|'asked'|'done'
export type NpcState = { phase: NpcPhase; said: number; doors: string[]; want?: string }
export const npcs: {
  define(def: { id; name; land; at?; lines(state): string[]; onTalk?(state); figures?: string[]; want?: string }): void
  track(id: string, getter: () => { x; z; present: boolean }): void   // a land that draws a person by hand
  attach(poi: POIManager): void
  near(x, z, r): Npc | null; state(id): NpcState; set(id, patch): void
  doorTaken(land: RegionId, door: string): void
  positionOf(id): { x; z; present } | null; get(id): Npc | null; list(): Npc[]; speakerOf(id): Speaker | null
  talk(id: string): void; pin(label: string): boolean; scanFolk(): void
  walker: { x; z }
}
export function defineThePeople(): void   // the twelve from lines.ts (Voice calls it)

// src/world/lines.ts
export const PEOPLE: PersonDef[]; export const WAIT_PERSON: Record<RegionId, string>
export const FOLK_BY_ROLE: [string, string[]][]; export const FOLK_BY_LAND: Record<RegionId, string[]>
export const CONSEQUENCES: Record<door, { hint: string; shout: string }>
export function withHint(label: string, door: string): string
export const KNOWLEDGE_LABELS: Record<string, string>
export function knowledgeLabel(id: string, landName: (rid: string) => string): string
```

Contract notes for wave 2: `notebook.place` has an optional fourth argument (the three-argument form pins in pencil, toasts `PINNED:`); `notebook.job` toasts `NEW JOB` and the first step and pins `def.pin`; `step(id, i)` toasts `DONE:` the step just passed and `NEXT:`; `complete` toasts `DONE: <name>`, `YOURS: <reward>`, then `line`. `npcs.define` accepts `figures: [routineId]` to attach to `life.ts` Figures by routine id, or `at`, or a later `npcs.track` getter. A registered person's talk POI is added automatically; the prompt is `TALK TO <NAME>`, reach 4.0 units, leaning a third of a stride toward the walker so it beats a seat or gate drawn at the same spot.

---

## 3. What the screenshots showed, and what was fixed

Desktop strip in `play-voice/`, portrait in `play-voice-portrait/` (both ignored by git).

- **Bubbles**: legible on both rigs, tail on the speaker, following Nell as she walked to the cart (`016-readback.png`), following Wick (a `life.ts` Figure) at the moat pool at 07:12 (`033-d-wick2.png`), the walker's own line (`021-shout-walker.png`).
- **Toasts**: three stack cleanly at the bottom on desktop (`026-d-signpost.png`); on a phone they sit under the HUD row and the objective (`008-p-signpost.png`). *Fixed*: a signpost naming three lands produced four toasts and pushed `READ:` and `FOUND:` off the three-high stack; land names are now batched into one `YOU HEARD OF: A, B AND C` line per frame.
- **Notebook**: JOBS/HEARD/PLACES/FOUND/CHOICES all rendered on both rigs; tabs wrap to two rows on a phone. *Fixed*: JOBS said "nothing yet. talk to somebody." right after Nell had asked for something — it now lists ASKED errands with the quote, and the objective line falls back to the latest ask. *Fixed*: section heads (ASKED, LEARNED, collection counts) inherited the page header's 8 % indent through a class-name collision (`nb-head`); lines now use `nb-l-<style>`.
- **Map pins** (`009-map.png` → `027-d-map.png`, `007-p-map2.png` → `009-p-map3.png`): the first pass divided the lettering canvas by 2 regardless of `devicePixelRatio`, so on a dpr-1 screen the labels were half size and unreadable, and a pencil pin with no clear spot drew no label at all. Now sized by the real DPR, ~10 px x-height scaled with the map's ink factor, pins bigger, a label always drawn (six clear spots tried, then under the foot), and the you-are-here mark reserved before placing. On the phone map the two Common pins sit under the land name and still crowd it; legible, not pretty.
- **Talk reach**: on portrait the walker overshot Nell by a step and stood 3.53 units off, and the gate's `LEAN ON THE GATE WITH HER` won. Reach raised 3.5 → 4.0 (named) and 3.0 → 3.6 (folk); moving folk (the oaks argument) still walk out of reach while you approach — the prompt follows them, but you have to keep up.
- **Shout**: the 0.6 s fade-in meant the harness photographed nothing; 0.25 s now, halo firmer (`030-d-shout.png`).
- **Choice card through a person** (`036-d-card.png`, `037-d-choices.png`): the card opens by talking to Nell, both options carry hints, CHOICES records what it did. *Found while playing*: Nell's card only exists once `fact:the-timetable` is known (Dennis's board in the office), so her first ask ("read the signpost… bring it back") sends the player to a signpost that cannot give the answer; a second ask line now says the fourth name is a time and points at the man at the Mile with a timetable.
- **Not a product bug, but for whoever plays the harness**: veil transitions (notebook, map, choice card) run on wall time and the SwiftShader frame is slow, so a `shot` straight after `press n` can miss the page; wait ~1.5 s of wall time (an `eval` on a `setTimeout` promise) before the shot. The harness `text` op lists children of a transparent veil as visible; `aria-label`s alone cannot tell you whether the notebook is open.

Pre-existing, seen, not mine: the map's land names also divide by 2 regardless of DPR (`map.ts:215-216`), so on a 1× screen they are half size; POI labels (`NELL`, `WICK`) float up to the skyline by the label-clearing rule.

---

## 4. The people

| Person | Land | Drawn by | Wants (pinned place) | Lines (idle / met / asked / done / chose) |
|---|---|---|---|---|
| **NELL** | meadow | `meadow.ts` standees, `npcs.track('nell')`; absent while the 8:15 has her on the platform | THE CROSSROADS | idle 1 / met 3 / asked 2 / done 2 / `the-cart-turned-north`, `the-cart-pushed` |
| **MARGET** | kingdom | `civic.ts` standee at the stall, `track('marget')` | THE BELFRY | 1 / 2 / 1 / 2 / `the-bell-rings-it`, `the-clock-set-to-eight`, `the-clock-set-to-eleven` |
| **WICK** | castle | Figures `wick` (05:18–08:18 poles/pool) and `wick-evening` (17:24–18:54) | THE MOAT POOL | 1 / 2 / 1 / 1 / `the-king-restored`, `the-king-left` |
| **PYE** | beach | Figure `pye` (`PYE_DAY`) | THE MARK | 1 / 2 / 1 / 1 / `the-eighth-pot`, `the-pots-hauled` |
| **WREN** | ocean | Figures `wren`, `wren-afternoon` | THE SANDBAR | 1 / 2 / 1 / 1 / `the-second-mark`, `the-fleet-finished` |
| **BRACK** | forest | `wilds.ts` watch/turn standees, `track('brack')` | THE TARN | 1 / 2 / 1 / 1 / `the-water-stood`, `the-oar-taken` |
| **HOLT** | canyon | `wilds.ts` standees, `track('holt')` | THE RIVERHEAD | 1 / 2 / 1 / 1 / `the-boat-righted`, `the-sea-has-no-bottom` |
| **AMOS** | desert | `wilds.ts` standees, `track('amos')` | THE CATCH | 1 / 2 / 1 / 1 / `the-lid-off`, `the-cistern-yours` |
| **JOAN HARROW** | downs | `wilds.ts` field/table standees, `track('joan')` | THE HEADLAND | 1 / 2 / 1 / 1 / `the-seat-taken`, `the-setting-cleared` |
| **VAL** | neighborhood | `civic.ts` standees (gate/bin), `track('val')` | THE KEEP | 1 / 2 / 1 / 1 / `the-gap-cut`, `the-light-off` |
| **THE MAN AT THE JUNCTION** | city | `civic.ts` standees (junction/bench), `track('the-man')` | THE JUNCTION | 1 / 2 / 1 / 1 / `the-stood-with`, `the-walked-round` |
| **DENNIS** | office | `civic.ts` standees (kerb/board), `track('dennis')` | THE 8:15 STOP | 1 / 2 / 1 / 1 / `the-board-wiped`, `the-corner-pressed` |

All lines are in `src/world/lines.ts` `PEOPLE`. Sample of the register: Nell *"That bull is mine. It went for you because you looked at it. It does that."*; Marget *"Stall's shut. It's been shut since the argument. Don't ask which argument."*; Holt *"River went. I stayed. The boat stayed. I oil it."*; the man *"I've been here long enough to be geography."*

Pins depend on the want being an existing POI label: THE CROSSROADS, THE BELFRY, THE MOAT POOL, THE MARK, THE SANDBAR, THE TARN, THE RIVERHEAD, THE CATCH, THE HEADLAND, THE KEEP, THE JUNCTION, THE 8:15 STOP. `npcs.pin` looks the label up in the POI manager; if a land's label differs the pin is silently skipped (only THE CROSSROADS and THE MOAT POOL were verified in play).

**Unnamed folk**: 53 role pools keyed by routine-id prefix (`the-lamplighter`, `the-brim-sweeper`, `the-sentry`, `the-barista`, `the-nine-oclock`, `the-beachcomber`, `the-oaks-argument`, `the-shepherd`, `the-funeral`, …) plus a fallback pool per land. Every `life.ts` Figure not claimed by a named person gets a `TALK` POI (reach 3.6, enabled while the figure is visible and inked in), one line per press, cycling.

---

## 5. Not finished, bluntly

- **No jobs exist.** `notebook.job/step/complete` and the objective line are verified only with a job injected through the hook (`017-objective.png`, `018-nb-job.png`, `020-map2.png`). Until FIRST HOUR / THINGS TO DO call `notebook.job`, the objective line shows the fallback ask or nothing. The ASKED list is a stopgap for exactly that gap.
- **Pins verified for two labels only** (THE CROSSROADS, THE MOAT POOL). The other ten wants are matched to POI labels by string; I did not walk every land to confirm each label exists and matches. A mismatch skips the pin without a toast.
- **Talking to people I did not reach**: Nell and Wick were talked to in play; Marget, Pye, Wren, Brack, Holt, Amos, Joan, Val, the man, Dennis were not (their `track`/`figures` wiring follows the same two paths as Nell and Wick). Read-back was verified for Nell's door only; the other 23 doors have lines and shouts but were not fired.
- **`found()` and `score()`** are implemented and toast, but nothing calls them yet (no collection, no toy). Untested in play.
- **Moving folk are hard to catch** at 3.6 units; a per-figure "stops to talk when you are near" would fix it but that is the routine system (SCALE/THINGS TO DO), not mine.
- **The bubble tail is always bottom-centre**; when the bubble is clamped to a screen edge the tail no longer points at the speaker.
- **No speech sound**: `inklands:event 'speech'` is dispatched on every line; PEN has to add the `case`.
- **Option hints make long buttons** on a phone (three lines). Reads fine, looks heavy.
- **Nell's first ask points at a signpost that cannot answer it** by design of the meadow's story (`fact:the-timetable` comes from the office). The second ask line redirects, but a player who reads the signpost and comes back gets told to go across the world; FIRST HOUR should decide whether Nell's first job should be something the Common can finish.
- Harness output dirs `play-voice/`, `play-voice-portrait/` are left in the worktree, ignored via `.gitignore` `play-*/`.
