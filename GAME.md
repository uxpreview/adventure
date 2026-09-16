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
What is built today (below) is the opening and jobs from before it; the
next sessions rebuild the first five minutes on it, then the twelve
promises in tiers.

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

## What exists (Session 27)
- **Controls.** WASD/stick to walk (relative to the camera), Shift to run,
  drag to look, wheel/pinch to zoom, `R` recentre, `E` talk/act, `M` map,
  `N` notebook, `H` whistle the horse, `Esc` close.
- **The opening.** Bull → gate → Nell → THE FOURTH NAME (signpost, the south
  road into Maple Court, the milestone, back to Nell) → Nell's cap → three
  pins and the horse.
  **Superseded by the story of record; still what runs.** The new opening
  is the bench, Nell's "You're back", the name lettered onto the notebook,
  the bull and the horse (GET IT HOME), three recognitions, the notebook's
  twelve lines, the second note, the pull.
- **People.** Nell (Common), Marget (Brim), Wick (castle), Pye (beach), Wren
  (ocean), Brack (Penwood), Holt (canyon), Amos (Flats), Joan Harrow
  (Downs), Val (Maple Court), the man at the junction (Greyline), Dennis
  (Cubicle Mile). Each gives one named job. Everyone else has a line.
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
