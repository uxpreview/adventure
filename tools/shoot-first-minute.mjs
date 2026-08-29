// THE FIRST MINUTE (Session 2's protected sheet) — THE COMMON, the
// title poster and the south face of Brim. Shot in BOTH viewports since
// Session 4; the camera looks north, so a subject is framed by standing
// south of it.
import { shoot } from './shoot-lib.mjs';

await shoot({
  out: process.env.OUT ?? 'shots-s2',
  framings: [
    ['01-common-wide', -45, 84, 1200],
    ['02-the-shot', -45, 66, 1200],
    ['03-crossroads-mid', -45, 63, 900],
    ['04-crossroads-detail', -44.5, 57, 900],
    ['05-well-mid', -56, 53, 900],
    ['06-well-detail', -56.5, 48, 900],
    ['07-oaks-wide', -97, 48, 1000],
    ['08-oaks-mid', -96, 35, 1000],
    ['09-gate-fields-mid', -45, 32, 1000],
    ['10-gate-detail', -45, 6, 1400],
    ['11-fence-wide', 12, 78, 1000],
    ['12-fence-mid', 10, 70, 900],
    ['13-riverbend', 52, 108, 1000],
    ['14-west-void', -118, 72, 900],
    ['15-inside-kingdom-look-back', -45, -22, 2000],
  ],
});
