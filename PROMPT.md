# PROMPT — the next session

Read `GAME.md`, `CHANGELOG.md` and `design/THE-RESET.md` §4. Nothing else.
Then do ONE of the numbered items below, in order, in this session, alone.
Do not fan out sub-agents in parallel: every session shares one usage
window and parallel agents empty it in an hour. One cold player and one
critic at a time is fine.

1. **The gate, run cold.** Build, start `tools/play-server.mjs`, spawn a
   COLD PLAYER with only `design/reset/COLD-PLAYER-PROMPT.md`, then one
   HARSH CRITIC per pillar with `design/reset/CRITIC-PROMPT.md` (camera →
   Breath of the Wild; voice → Stardew Valley; first hour → A Short Hike;
   scale → A Short Hike, "does the world feel inhabited"; things → Untitled
   Goose Game; pen → any, "is it beautiful and does it run"). Write both
   verdicts into `CHANGELOG.md` under "After". Fix the three things the
   critics name most. Run the cold player again. Stop when it can describe
   the game in two sentences and name three things to do next.
2. **Mobile portrait, cold.** The same, `--rig portrait`.
3. **The open list** in `CHANGELOG.md` "Known and open", top to bottom.
4. **The reports** the cut-off sessions never wrote: CAMERA, PEN, FIRST
   HOUR, THINGS — one page each in `design/reset/reports/`, from the diff.

Rules that stay: keep the pen (no assets); build green before every commit;
small labelled insertions in `App.ts`; every visible word lettered with an
aria-label; the only play instruction is the URL.
