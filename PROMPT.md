# PROMPT — next session

You are continuing INKLANDS in `uxpreview/adventure`, branch
`claude/open-world-adventure-game-hsf9nj` (the default branch; pushes
auto-deploy to Vercel project `adventure`). Read `README.md` and
`DIRECTION.md` first — they are the state of the world and the standing
question. All twelve lands are walkable, scored, and mapped; there is
no story yet.

## This session: commit to THE UNFINISHED SHEET and build its slice

Adopt DIRECTION.md's first candidate — the sheet was abandoned
mid-drawing and the walker goes looking for the pen — unless, on
reading it against the world as built, you can argue a better one in
one paragraph in STORY.md. Then:

1. **Write STORY.md before touching code** (margins discipline): the
   premise, the verb, what "finishing" a land means mechanically and
   emotionally, the ending at the drawer's desk beyond the office park,
   and a per-land table of what is unfinished there and what wakes when
   it is inked. Wry margins-note voice throughout; nobody's face is
   ever drawn.
2. **Build the vertical slice in THE COMMON and THE PENWOOD**: some of
   each land ships as pencil under-drawing (the ghost state the standee
   fields already support); standing in a ghost patch and holding the
   interact verb inks it in through the existing cascade, with the
   pencil-scratch voice (`Audio.pencilScratch`) as the sound of the
   work. Finishing a land completes its music mood and wakes one drawn
   character with one want. The map should show finished vs unfinished
   lands.
3. **Do not build the other ten lands' content this session.** Wire the
   system so they can each be authored in a later session with data,
   not new code.

## Constraints that are law

- Zero image assets; every mark through `src/engine/ink.ts`; every
  word hand-lettered. Washes only from `palette.ts` `WASH`.
- The rects in `src/world/layout.ts` are the truth the terrain, map
  and audio share; move content, never walls.
- Verify with the real game: `npm run build` clean, then
  `tools/shoot.mjs` (all-lands screenshots) and walk the new verb
  under Playwright with real key events via `?debug` /
  `window.__inklands`. Look at the screenshots before believing them.
- Small debts to pay if touched: the loader's fade overlaps the title
  for a beat; portrait phones are untested since the vista camera.

Commit as you land things; push when green. The deploy is watched by
whoever opens the URL, so never push a build that fails locally.
