# INKLANDS — what the game is

*Read this and `design/THE-RESET.md`. Nothing else in `design/` binds.*

## In two sentences
You wake on a bench on a village green with no memory and a note in your
own hand saying BACK IN AN HOUR, and everyone knows you: three years ago
you were the one who held twelve small places together, and you left.
Twelve promises in your notebook, a bull, a horse, a kid who took your job,
a dog that has him now, and a gathering that failed once and happens again
at the end without you running it.

**The story of record is `design/foundation/08_Inklands_Story_Foundation_v1.md`.**
The first five minutes and Tier 1 (Wick, Nell, Marget) are built on it
(below). Every job hangs on its line of the list; the other nine people's
steps are still the ones from before it until their tier's session.

## The six pillars (the only rules)
1. **You can always look.** Orbit, pitch and zoom are the player's. Never
   an automatic turn. Everything faces the lens.
2. **The world talks back.** Every action gets an answer on screen within a
   second. People speak. Choices are read back within a minute.
3. **You always know something you could do next.** A named job in the
   first minute; a notebook (N); an objective line; pins on the map (M);
   three visible options after the first job.
4. **The world is big and busy.** A land is a place. Mounts go anywhere.
   Something moves in every frame.
5. **Play, not reading.** Jobs, a collection with a count, toys with a score,
   monsters that chase, night as a reason to get indoors.
6. **Keep the pen.** Zero image assets, procedural ballpoint and wash,
   hand lettering, procedural sound, 60 fps on a phone.

## What exists (Session 29)
- **Controls.** WASD/stick to walk (relative to the camera), Shift to run,
  drag to look, wheel/pinch to zoom, `R` recentre, `E` talk/act, `M` map,
  `N` notebook, `H` whistle the horse, `Esc` close. **Hold** `E` to sit
  (a tap will not take). `1` `2` answer a person when answers are up.
  `T` (or the HUD's `wait`) passes the time anywhere, once Marget's line
  is kept. A click or tap on the thing a prompt is about is the press.
- **The three verbs the arc stands on.** SIT is a held press with a
  visible fidget until the end. "I'LL HANDLE IT" is an answer wherever
  somebody offers their part: it always works and it always costs them
  something you can see (`world/handle.ts`; live at Nell's gate and
  Morrow's bridge; every promise hangs one on `JobSpec.offer`). Hold a
  line of THE LIST down to cross it out; the notebook does not object,
  and the world says what it did (`world/crossout.ts`).
- **The opening (the first five minutes, on the story of record).** You
  wake sitting on a bench on the green under a note in your own hand.
  Nell at her washing line: "You're back." "It's been three years." You
  type a name and it is lettered onto the notebook's cover. The bull is
  loose and knows you; it knocks you down; Nell whistles the horse. GET
  IT HOME: get on the horse, the bull follows the horse, lead it through
  the gate and Nell shuts it. The horse is yours. Morrow, fifteen, goes
  past with the dog and does not stop. The notebook's first page: TWELVE
  THINGS. THEN I CAN GO HOME, twelve lines, one crossed out; twelve pins
  on the map; the bell rings the wrong hour; a second note on the bench.
- **Tier 1 promises (`foundation/08` §9; `world/tier1.ts`,
  `jobs/tier1.ts`).** WICK: a chain across the king's road and a board
  that says it is nothing; ask twice; be at the braziers at dusk and
  watch him light them and wait for a bell; the fires are the castle's
  call to Brim; open the road (he unhooks the chain, or you do and he
  sits down) or leave it chained and carry his word to Marget on foot;
  the hall behind the keep's door is yours to come home to. NELL: the
  bull (the opening); the well answers a shout on the page and, once
  the bull is home, so does she. MARGET: you owe her for five stalls and
  have half a sandwich; wait in the belfry yard till the lamps come on,
  say which hand is right (Dorrie the baker or Fenn the lamplighter is
  wrong for good), and the bell is rung by her or by you; the covers
  come off the stalls, the bell keeps the hour every day, WAIT is yours,
  and Hob tells you what the debt was. Six people in Brim Square have
  names and lines that turn on the bell.
- **People.** Nell (Common), Marget (Brim), Wick (castle), Pye (beach), Wren
  (ocean), Brack (Penwood), Holt (canyon), Amos (Flats), Joan Harrow
  (Downs), Val (Maple Court), the man at the junction (Greyline), Dennis
  (Cubicle Mile). Each has one job, hung on their line of THE LIST and
  headed by it in the notebook. Everyone else has a line.
- **Things to do.** Twelve jobs; twelve stamps; four scored toys (stone
  skimming, paper plane, main-street time trial, office chair); three
  monsters (Penwood at night, the canyon, under the pier); the 8:15.
- **Mounts.** Horse (crossroads), bicycle (Maple Court), rowboat (river and
  sea), the 8:15 (once it runs).
- **Systems kept from before.** A forty-minute day, weather as a function of
  time, sixty-odd routines, interiors, collision, footprints as ink, save.

## How to run and test
    npm install && npm run build && npx vite preview        # http://localhost:4173
    node tools/play-server.mjs --out play-x &                # stepped Playwright session
    node tools/play.mjs                                      # lists the ops
    node tools/check-fps.mjs                                 # draw-call / triangle budget
    node tools/check-camera.mjs                              # the camera's invariants
    node tools/check-glyphs.mjs                              # the hand's glyph sheet
The only play instruction a person gets is the URL. No `?hour=`, no sheet.

## How a session works from here
One session, one agent, one pillar or one loop at a time. Read `PROMPT.md`.
