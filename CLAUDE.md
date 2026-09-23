# INKLANDS

## When the owner says "Continue" or "Proceed" (or nothing more specific)

1. `git checkout main && git pull`.
2. Read `PROMPT.md` in full. Its §5 is the job for this session, written
   by the session before; do that job, as written, end to end. §2 says
   where things stand and which branch to build on.
3. Read the top two entries of `CHANGELOG.md` and the last merged PR's
   description (`gh pr list --state merged --limit 1 --json number,title,body`)
   for the previous session's handoff.
4. When the job is done: `npm run build` green; one page in
   `CHANGELOG.md`; **rewrite `PROMPT.md` §5 (and §2, §3) for the session
   after**; commit, push, open a PR; give the owner the Vercel branch URL
   (`https://adventure-git-<branch>-ryankm.vercel.app`).

If the owner names a different job, that job wins; still leave §5
pointing at what comes next.

## Rules that stay

- Keep the pen: no image, font or audio assets, ever.
- One agent at a time, never parallel (the owner's five-hour usage window).
- `npm run build` green before every commit.
- The harness: `tools/*.mjs`, with `PW_CHROMIUM` set as in `PROMPT.md`
  §2a (on this Mac, Playwright's own headless shell under
  `~/Library/Caches/ms-playwright/chromium_headless_shell-*/`).
