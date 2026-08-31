// WHERE THE BROWSER IS.
//
// Every tool in here launches Chromium, and for eleven sessions all
// nineteen of them named one absolute path: `/opt/pw-browsers/chromium`,
// which is where the build sandbox keeps it. On any other machine —
// including the owner's, which is where the FEEL GATE is run — that path
// does not exist and every gate in this repository fails at its first
// line with an error about a missing executable rather than anything
// about the game.
//
// A gate the owner cannot run is a gate that does not get run, and
// Session 12 exists because a gate did not get run. So the path is
// resolved rather than asserted:
//
//   1. $PW_CHROMIUM, if the machine wants to say;
//   2. the sandbox's path, if it is there;
//   3. otherwise undefined, which is Playwright asking its own installed
//      browser — `npx playwright install chromium`.
import { existsSync } from 'node:fs';

const SANDBOX = '/opt/pw-browsers/chromium';
export const CHROMIUM =
  process.env.PW_CHROMIUM ?? (existsSync(SANDBOX) ? SANDBOX : undefined);
