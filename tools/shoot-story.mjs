// THE STORIES — the contact sheet for Session 7.
//
// Almost nothing this session changed is geometry, so this sheet is not
// a tour of a land. It photographs exactly three things, and every one
// of them is a thing the player READS or a thing the world DID:
//
//   1. BRIM'S WAIT AT BOTH ITS STATES. Marget's stall shut (a trestle
//      and a cloth and nothing on it) and open (the cloth bunched, the
//      awning down, the town's red back over the square), from the same
//      camera, at the same hour, so the art director is judging a
//      change and not two photographs.
//   2. HER ROUTINE. The same stall at dawn, at noon and at dusk, plus
//      the empty square at night — because a routine that cannot be
//      seen is a description (STORY §7).
//   3. THE MAP AT ITS THREE REGISTERS, and the line inked. The map is
//      the record now, and it is the artifact this project wants people
//      to screenshot.
//
//   node tools/shoot-story.mjs
//
// Everything else the gate needs is shot by the scripts that already
// exist: tools/shoot-first-minute.mjs for the protected framings (at
// two hours, per QUALITY-BAR §2) and tools/shoot-mobile.mjs for the
// chrome at four phone widths.
import { shoot } from './shoot-lib.mjs';

// what the walker knows by the time the market is called
const OPEN = ['fact:brim-hour', 'reason:brim'];

await shoot({
  out: process.env.OUT ?? 'shots-story',
  framings: [
    /* ---- BRIM'S WAIT, THE SAME FRAME TWICE --------------------------
     * Standing south of the fountain looking north, which is the walk
     * up from the south gate and the only way into this square that
     * matters: the market cross near on the right, the fountain as the
     * subject, Marget's stall far, under the bunting, between two
     * lamps. Noon, so nothing but the stall is different between them. */
    /* KNOWLEDGE IS STICKY WITHIN A PAGE, so every SHUT frame is shot
     * before the first OPEN one. The first sheet of this session shot
     * "marget shut" with the awning already up, because the frame
     * before it had learned why. */
    ['00-warm', -45, -55, 5200, { hour: 12 }],
    ['01-square-wide-shut', -45, -55, 1400, { hour: 12 }],
    ['02-square-mid-shut', -45, -63, 1400, { hour: 12 }],
    ['03-marget-shut', -45, -67, 1400, { hour: 12 }],
    ['04-routine-dawn', -45, -67, 1400, { hour: 6.4 }],
    ['05-routine-dusk', -45, -67, 1400, { hour: 19.8 }],
    ['06-routine-night', -45, -67, 1400, { hour: 22.5 }],

    /* ---- THE BELFRY YARD AT DUSK ------------------------------------
     * Where the fact is. The lamps are coming on and one of the two
     * hands agrees with them, and nothing in the game says so. */
    ['07-belfry-dusk', -66, -31, 1600, { hour: 19.6 }],

    /* ---- AND THE SAME FRAMES, ANSWERED ----------------------------- */
    ['08-square-wide-open', -45, -55, 1400, { hour: 12, learn: OPEN }],
    ['09-square-mid-open', -45, -63, 1400, { hour: 12, learn: OPEN }],
    ['10-marget-open', -45, -67, 1400, { hour: 12, learn: OPEN }],
    ['11-market-board', -39, -60, 1400, { hour: 12, learn: OPEN }],
    ['12-open-dusk', -45, -67, 1400, { hour: 19.8, learn: OPEN }],
  ],
});
