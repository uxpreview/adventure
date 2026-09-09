# THE GATE — how a session runs the loop, exactly

The brief's stop condition, restated as tests:
- **T1** At game-second 60 of a cold play from the title, the cold player
  can say what the game wants (its report, section 1, confidence ≥ 7).
- **T2** At the end, the cold player describes the game to a friend in two
  sentences and names three things it wants to do next (section 7).
- **T3** For each of the six pillars, the blind critic's VERDICT line reads
  INKLANDS at least as often as REFERENCE across the runs so far.
The loop is done when T1, T2 and T3 all hold on the same build.

## One round (about one usage window; do not run agents in parallel)

    npm install && npm run build
    (npx vite preview --port 4173 --strictPort &)
    node tools/play-server.mjs --port 4321 --url http://localhost:4173/ --out play-gate/round-N &
    # wait for "loaded to title" (about 60 s here; the sandbox has no GPU)

1. **Cold player.** Spawn ONE sub-agent whose entire prompt is
   `design/reset/COLD-PLAYER-PROMPT.md` plus `PORT=4321` and the report
   path `play-gate/round-N/REPORT.md`. It must read nothing else on disk.
   Wait for it. Read its report. Do not argue with it.
2. **Critics, one at a time.** For each pillar, spawn ONE sub-agent whose
   entire prompt is `design/reset/CRITIC-PROMPT.md` plus the pillar, the
   reference, the strip directory `play-gate/round-N/` and the output path
   `play-gate/round-N/CRITIC-<pillar>.md`:

   | pillar | reference |
   |---|---|
   | THE CAMERA | Breath of the Wild (seeing a thing on the horizon and going there) |
   | THE VOICE OF THE WORLD | Stardew Valley (a town that talks to you) and Fallout: New Vegas (choices read back) |
   | THE FIRST HOUR | A Short Hike (a first ten minutes that teaches by playing) |
   | SCALE AND MOTION | A Short Hike ("does the world feel inhabited") |
   | THINGS TO DO | Untitled Goose Game (toys you cannot stop messing with) |
   | THE PEN | any of the above ("is it beautiful, and does it run") |

3. **Record.** Copy the cold player's section-7 answer and each critic's
   VERDICT line into `CHANGELOG.md` under "After", with the round number.
   Commit `play-gate/round-N/*.md` (not the PNGs) under
   `design/reset/rounds/round-N/` so the next session can read them.
4. **Fix.** Take the three changes the critics name most (their last line
   lists three each). Fix them yourself in this session, one at a time,
   build green, commit, push. If a fix is a whole pillar's worth of work,
   stop and write it into `PROMPT.md` §3 as the next session's item.
5. **Again.** Kill the servers (`node tools/play.mjs quit`; `pkill -f "vite preview"`),
   rebuild, start round N+1. Stop when T1, T2, T3 hold.

## Then
Push. Update PR #23's body with the round's verdicts. Hand the owner one
line: the URL. Nothing else.

## Notes for whoever runs this
- The play server steps the game on its own clock: `hold w 3` is three
  game-seconds however slow the sandbox is. Ten game-minutes is ~3 wall
  minutes of stepping plus the agent's thinking.
- `node tools/play.mjs text` is exactly the words on screen (every lettered
  element carries its text as `aria-label`). A bubble, toast, objective line
  or notebook line that is not in that list is not on screen.
- `--rig portrait` on a second port is the phone. Do it as its own round.
- The harness has no ears. Sounds are verified by `tools/render-wavs.mjs`
  and the owner's own play, never by the critic.
