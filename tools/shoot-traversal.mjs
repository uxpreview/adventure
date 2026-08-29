// SESSION 6's OWN CONTACT SHEET — the three things this session added
// that cannot be photographed standing still in the middle of the day:
// a road crossing at speed, the river under oar, and the hour.
//
// The camera only ever looks north, so every framing here is the
// WALKER'S position and the subject is north of it. Anything driven is
// driven with `hold` (see tools/shoot-lib.mjs) rather than by tapping a
// key, because a road that carries and a boat that moves are both
// motion and a still of somebody standing on a road proves nothing.
import { shoot } from './shoot-lib.mjs';

// THE HOLDS ARE LONG ON PURPOSE. This sandbox renders at about three
// and a half frames a second and App clamps dt at 0.05, so a second of
// wall clock is roughly a sixth of a second of game time (see
// shoot-lib.mjs). Fourteen seconds here is about two and a half seconds
// of walking — ten to fifteen units — which is what it takes for a
// trail to exist, for the run to finish ramping, and for the road's
// carry to have straightened anybody out.
const HOLD = 14000;
// north is -Z, so [0, -1] is "walk away up the road"
const N = (run, ms) => ({ hold: [0, -1, run], holdMs: ms ?? HOLD });
const S_ = (run, ms) => ({ hold: [0, 1, run], holdMs: ms ?? HOLD });
const E_ = (run, ms) => ({ hold: [1, 0, run], holdMs: ms ?? HOLD });
const W_ = (run, ms) => ({ hold: [-1, 0, run], holdMs: ms ?? HOLD });

await shoot({
  out: process.env.OUT ?? 'shots-s6',
  framings: [
    /* ---- 1. SPRINT AS INK WEIGHT ---------------------------------- *
     * The same ground three times: standing, walked, run. What has to
     * read is the TRAIL — darker and wetter at speed, feathered at a
     * walk — because that is the whole item. */
    // WALKED ACROSS THE FRAME, not away up it: the camera only ever
    // looks north, so a trail laid walking north is behind the walker
    // and off the bottom of the page. What the player actually sees of
    // their own marks is the ones they laid going ACROSS, and coming
    // back to. Same ground, same distance, one at a walk and one flat
    // out — the only difference in these two frames is the ink.
    ['01-print-still', -45, 66, 1400],
    ['02-print-walk', -78, 62, 1200, E_(0, 20000)],
    ['03-print-run', -78, 62, 1200, E_(1, 20000)],
    // and the same again on damp paper, where the print blooms
    ['04-print-run-tideline', -232, 34, 1400, S_(1, 18000)],

    /* ---- 2. A ROAD THAT CARRIES ----------------------------------- *
     * Judged where the brief says it will misbehave: the king's road
     * climbing to Greyweather, and the east road's dive through the
     * crease. Plus the crossroads, which is what the carry is FOR. */
    ['05-kings-road-run', -45, 20, 1400, N(1)],
    ['06-kings-road-climb', -45, -166, 1600, N(1)],
    ['07-kings-road-ramp', -45, -196, 1700, N(1)],
    // the crease itself: the camera only looks north, so the road's
    // DIVE is felt and not framed — what can be framed is standing in
    // the bottom of it, and running down into it from the west lip
    ['08-into-the-crease', 74, 52, 1500, E_(1)],
    ['09-in-the-crease', 85, 46, 1600],
    ['10-crossroads-at-speed', -45, 70, 1300, N(1)],
    ['11-crossing-the-road', -45, 58, 1300, E_(1)],
    ['12-main-street-run', -20, 202, 1400, E_(1)],
    ['13-coast-road-run', -150, 60, 1400, W_(1)],

    /* ---- 3. THE RIVER UNDER OAR ----------------------------------- *
     * The boat where it lives, then the river as a route: the mouth,
     * the long reach, under a road bridge, and up into the middle of
     * the sheet where the river has only ever been a wall. */
    // Seen from the SOUTH BANK across the water, which is how a walker
    // coming down LONGSHORE actually meets her: the boat is drawn up on
    // the far side, and the footbridge that has been on this map since
    // Session 1 is the way over to it.
    ['14-the-boat', -206, 219, 1600],
    ['15-oars-taken', -205, 207, 1500, { boat: [-205, 207], aboard: true }],
    ['16-under-oar-upriver', -150, 200, 1600,
      { boat: [-150, 200], aboard: true, ...E_(1) }],
    ['17-under-oar-reach', -62, 178, 1600,
      { boat: [-62, 178], aboard: true, ...E_(1) }],
    ['18-under-the-kings-bridge', -45, 176, 1700,
      { boat: [-45, 176], aboard: true, hold: [0.4, -1, 1], holdMs: 2400 }],
    ['19-under-oar-meadow', 40, 110, 1600,
      { boat: [40, 110], aboard: true, ...E_(1) }],
    ['20-under-oar-downs', 168, 8, 1600,
      { boat: [168, 8], aboard: true, ...E_(1) }],
    ['21-the-lagoon', -252, 60, 1600,
      { boat: [-252, 60], aboard: true, ...S_(1) }],
    ['22-rowing-the-cove', -232, -130, 1600,
      { boat: [-232, -130], aboard: true, ...S_(0.6) }],
    ['23-where-she-stops', -300, 40, 1700,
      { boat: [-300, 40], aboard: true, ...W_(1) }],

    /* ---- 4. THE DAY ----------------------------------------------- *
     * One place, six hours. This is the day cycle judged as a strip
     * rather than as a screenshot: nothing may look like a filter, and
     * eight in the morning has to be indistinguishable from the sheet
     * that earned its WOWED. */
    ['30-hour-0545', -45, 66, 1300, { hour: 5.75 }],
    ['31-hour-0645', -45, 66, 1300, { hour: 6.75 }],
    ['32-hour-0900', -45, 66, 1300, { hour: 9.0 }],
    ['33-hour-1300', -45, 66, 1300, { hour: 13.0 }],
    ['34-hour-1800', -45, 66, 1300, { hour: 18.0 }],
    ['35-hour-1915', -45, 66, 1300, { hour: 19.25 }],
    ['36-hour-2000', -45, 66, 1300, { hour: 20.0 }],
    ['37-hour-2200', -45, 66, 1300, { hour: 22.0 }],

    /* ---- 5. THE LAMPS COME ON ------------------------------------- *
     * The claim WORLD-SYSTEMS §7 makes for the whole system is that
     * every land already built improves for free. Brim's square and
     * high street, and Greyweather's gate, are where that is cashed. */
    ['40-brim-square-noon', -45, -66, 1500, { hour: 12.0 }],
    ['41-brim-square-dusk', -45, -66, 1500, { hour: 19.9 }],
    ['42-brim-square-night', -45, -66, 1500, { hour: 22.0 }],
    ['43-high-street-dusk', -45, -26, 1500, { hour: 20.1 }],
    ['44-high-street-night', -45, -46, 1500, { hour: 22.0 }],
    ['45-brim-gate-dusk', -45, 6, 1600, { hour: 20.1 }],
    ['46-gatehouse-night', -45, -180, 1700, { hour: 22.0 }],
    ['47-avenue-dusk', -45, -172, 1700, { hour: 19.6 }],
  ],
});
