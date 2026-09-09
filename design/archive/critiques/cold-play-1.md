# COLD PLAY 1 — a player who read nothing, 2026-09-07

*The first cold playtest. An agent with no access to `design/`, the README, the plan or the source played the Session 23 build from the title screen for about fifteen minutes in the build sandbox (3.5 fps, no audio), with keys, mouse and touch only. Its report is verbatim below and it is the evidence for `design/THE-RESET.md` §7. The screenshots it cites are not committed (shot directories are git-ignored); the method is what matters and `PROMPT.md` makes it the gate for every loop from here.*


All screenshots are in `(local shots dir)`.
Desktop frames are `NN-*.png` (1280x720); portrait frames are `P0N-*.png` (390x844).
I never used any debug API — only keys, mouse, touch, and the on-screen buttons.

Note on timing: this sandbox renders at ~3.5 fps and the game runs at roughly one sixth speed, so "game-seconds" below are my estimate (wall-clock / 6).

---

## 1. First 60 game-seconds: what I thought the game wanted

**What I saw:** A hand-inked loading card ("inking the sheet…", `01-loader.png`), then the title over a sketch of a well, a signpost (BRIM / THE SEA / DOWNS / 8:15) and a castle gate at the end of a path (`02b-title.png`). Tagline: "a world in one sheet — twelve lands, one pen". One button: "set out".

**After "set out"** I was NOT at the signpost from the title. I was dropped in a fenced field with a haycart, sunflowers, a target/haybale, and a wall+castle in the distance (`03-just-started.png`). One line of text at the bottom: "wasd to walk — E to look — , . to lean — M for the map". It faded within a few seconds.

**Idle for 5 game-seconds:** the hint vanished and a cow walked up and stood next to me (`04-idle-5s.png`). Nothing else happened; no further prompting.

**What I thought it wanted:** walk toward the castle, because it's the only landmark and the title screen showed a gate at the end of a path. The "twelve lands" tagline made me guess it's a walk-and-discover game. But the fence in front of me and the cart beside me both suggested "there's something to do here first", and the game never said what. The mismatch between the title composition (signpost, path, gate straight ahead) and the actual spawn (fenced field, no path) was the single most confusing thing in the first minute.

## 2. Goal of the game, as far as I can tell — confidence 6/10

Walk through twelve hand-drawn "lands" and ink them onto a map. The evidence is the map screen's footer: "1 of 12 lands walked — 16 strides of ink" (`09-map.png`), which became "2 of 12 lands walked — 156 strides of ink" later (`38-map-final.png`), plus the tagline "twelve lands, one pen". Place-name labels ("THE LONG FENCE", "THE SOUTH GATE", "THE KINGDOM OF BRIM") appear as you arrive, and the map fills in as you walk.

Why not higher than 6: nothing in the game *says* this. There's no objective, no "go to X", no reward when a land counts. I got the second land counted (`38-map-final.png`) without noticing any moment of arrival — it ticked over while I was stuck against a wall. The prompts "PUSH THE CART" / "LEAN ON THE STILE" hint at a verb system I never actually triggered, so I'm not sure whether the goal is purely walking or whether there are chores.

## 3. Controls: found and not found

**Found:**
- **WASD walks** — from the one-line hint. Works; leaves footprints (`06-walk-north.png`).
- **Shift runs** — guessed (the hint didn't mention it). Clearly faster, denser footprints (`11-run-north.png`). A hidden "hold shift to run" label exists in the DOM but I never saw it on screen.
- **E "looks"** — from the hint. Opens a reading card about the nearby place (`13-E-at-stile.png`, `36-E-at-south-gate.png`). Did nothing at the cow, the cart, or a blank wall (`05`, `07`, `28`).
- **Escape closes a card** — guessed. The card says "put it back" with no key named; Escape worked on the first try. Holding E just re-opens the card (`16-hold-E-stile.png`).
- **, and . turn the camera** — from the hint, which calls it "lean". It's a camera orbit (`10-comma-lean.png`, `10b-period-lean.png`). "Lean" was a bad word for it: when the game later said "LEAN ON THE STILE" I pressed comma at the stile expecting that to be the verb. It wasn't.
- **M opens the map; M closes it** — from the hint. The on-screen "map" button also opens it; clicking the button again does NOT close it (the map sheet intercepts the click). Clicking anywhere on the sheet closes it (`29-map-button.png`).
- **Sound button** toggles "sound: on / off". (No audio in this sandbox, so I can't judge sound.)
- **Portrait/touch:** "drag to walk — two fingers to lean — tap to look" (`P02-start.png`). Drag-to-walk works with a little ring joystick (`P04-drag-walk.png`).

**Never found / never worked:**
- **How to "PUSH THE CART"** (`06`, `08-push-cart-left.png`). E did nothing; walking into it just put my figure inside the cart's drawing. I could not tell whether the cart moved.
- **How to "LEAN ON THE STILE"** (`11`, `17`, `18`). E, held E, comma, period, idling: none did anything. I got across by walking straight into the "A" shape (`19-into-A.png`), so the prompt was describing something optional or something else entirely. Never learned what.
- **Number keys 1/2/3** on a card: pressing 1 on the fence card did nothing visible; Escape is what closed it.
- **Tap to look** on touch did nothing when I tapped on/near the fence (`P05-tap-look.png`).
- **Escape in the open world** does nothing (no pause, no menu) (`35-escape.png`).
- **A "wearing: nothing" button** exists in the DOM but never appeared on screen; no idea what it's for.

## 4. Every on-screen text I saw, and whether it helped

| Text | Where | Helped? |
|---|---|---|
| "INKLANDS / inking the sheet…" | loader | Neutral, sets the tone. |
| "a world in one sheet — twelve lands, one pen" / "set out" | title | Somewhat: "twelve lands" is the only statement of scope in the whole game. |
| "wasd to walk — E to look — , . to lean — M for the map" | first seconds, bottom | Yes for WASD/E/M. "Lean" is misleading (it's camera turn). Gone in seconds; never repeatable. No mention of Shift. |
| "PUSH THE CART" | near the cart, drifting around the bottom corners | No. Names an action, gives no key, and no key I tried did it. |
| "THE LONG FENCE" | arriving at fence | Mildly: tells me places have names. |
| "LEAN ON THE STILE" | near the stile | Actively misleading (see above). |
| Card: "the long fence — a fence with one stile, one gate, and several strong opinions about which side is the field. the bull is on the field side. the stile is for people who have met it." / "put it back" | E at fence | Charming, and "one stile, one gate" is a real hint that the stile is a crossing. "put it back" does not say how (Escape). |
| Map: "you", "THE COMMON", "THE WELL", "THE FAIR GROUND", "THE WOOD GATE", "THE KINGDOM OF BRIM", "?" marks, "N of 12 lands walked — N strides of ink" | M | The most useful screen in the game: the only place the goal is implied. But the wall that blocked me for 5 minutes is not drawn on it, and the tiny hand-lettering is nearly unreadable at portrait size (`P06-map.png`). |
| "THE SOUTH GATE" + "look" | at the gatehouse | "look" is the first prompt that maps to a key I knew (E). Good. |
| Card: "the south gate — the portcullis has been up so long the chain has gone stiff in its housing…" | E at gate | Nice writing; tells me the gate is open, but I still couldn't get through it. |
| "where you woke — THE COMMON" | flashed when I backed away from the gate | Confusing; I was nowhere near where I woke. |
| Touch: "drag to walk — two fingers to lean — tap to look" | portrait start | Yes for drag. Tap-to-look didn't work for me. |

## 5. What produced a reaction, and what produced nothing

**Reactions:**
- Walking/running: footprints, camera follow, the cow trailing me (`04`, `06`, `11`).
- Walking into the stile: I crossed the fence (`19-into-A.png`).
- E at a named place: a reading card (`13`, `36`).
- , / . : camera swings (`10`, `10b`).
- M / map button: the map sheet (`09`, `22`, `25`, `38`).
- Sound button: label toggles.
- Backing away (S) at the gate: camera tipped down and I ended up inside a giant hedge drawing (`40-back-away.png`).
- Touch drag: joystick ring + movement (`P04`).

**Nothing:**
- E at the cow, at the cart, at a plain wall (`05`, `07`, `28`).
- Holding E, comma, period, idling at the stile in response to "LEAN ON THE STILE" (`16`, `17`, `18`).
- Digit 1 on a card.
- Escape in the world.
- Tap on touch.
- Running W into the town wall for ~30 game-seconds at three different spots (`21`, `24`, `27`, `31`, `37`, `39`): the figure just stands there. Frames 34, 37 and 39 are pixel-identical despite ~8 game-seconds of held Shift+W and Shift+A between them.

## 6. Did I feel lost, bored, or stuck? When?

- **Stuck at the fence (minute ~3-5).** "LEAN ON THE STILE" plus a card telling me the stile is "for people who have met it" made me think there was a ritual to perform. There wasn't; you just walk into it. I burned five different key experiments on a non-puzzle.
- **Stuck at the wall (minute ~7-14).** After the fence, the only direction is a long wall with no visible opening. I ran west along it for a long time before "THE SOUTH GATE" appeared, then could not get into the gate: standing next to the gatehouse, W and A both did nothing at all (`34`, `37`, `39`). Only S worked, and it dumped me into a hedge. I ended the session having read the card that says the gate is permanently open, unable to go through it.
- **Lost (throughout).** The map is nice but I'm a dot with no heading indicator, the wall isn't on it, and I never found the signpost/crossroads shown on the title screen. I don't know where "where you woke" is relative to anything.
- **Bored:** not exactly, because the drawings kept changing, but the loop was "hold a key for a long time, nothing announces itself, open map to see if a number went up."

## 7. Delight / surprise

- The cow walking up to stand beside me while I did nothing (`04-idle-5s.png`): the first thing the world did unprompted, and it was funny.
- The look of the whole thing: it genuinely reads as a pen drawing on paper, and the footprints as ink dots are lovely (`11-run-north.png`).
- The card prose is good ("several strong opinions about which side is the field"; "everyone has agreed to be civil about it"). I wanted more of these; they were the one interaction that always paid off.
- The map as a hand-drawn sheet that fills in is a great idea, and "strides of ink" as the currency of progress is a nice phrase.
- Surprise, negative: my stick figure walks *inside* the cart drawing (`08`) and *inside* a huge hedge (`40`, `41`), which breaks the paper illusion.

## 8. Scores

- **Understandable: 3/10.** One fading hint line, two prompts that name verbs with no keys, one prompt that names the wrong verb, and a goal that is only inferable from a footer on the map screen.
- **Alive: 5/10.** The cow, footprints, chimney smoke and a tiny figure with a cart in the town make it feel drawn-by-someone; but nothing reacts to me except the cow, E does nothing at most things, and the cart I was told to push didn't visibly push.
- **Fun: 3/10.** The one thing I did on purpose that worked (get over the fence) turned out to require nothing. The next ten minutes were walking into a wall. Reading cards was the only reliably rewarding action and there were two of them.
- **Beautiful: 8/10.** The paper/ink look is consistent, the title frame is lovely, the haze on the distant city is nice. Points off for the figure clipping inside props and the near-unreadable map lettering on a phone.

## 9. Two sentences to a friend

"It's a gorgeous ink-on-paper walking game where you're a stick figure crossing twelve hand-drawn lands and your map fills in as you go, with little cards of dry, funny writing when you press E at a place. Right now it doesn't tell you what to do or how, so I spent most of my time walking into a fence and then a wall and never actually got into the town on the box art."
