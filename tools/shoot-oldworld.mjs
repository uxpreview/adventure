// THE OLD WORLD (Session 3's protected sheet, re-shot on Session 4's
// ground) — THE KINGDOM OF BRIM interior and CASTLE GREYWEATHER, plus
// the protected south-approach framings that may not regress. Both
// viewports. The camera looks north, so a subject is framed by standing
// south of it.
import { shoot } from './shoot-lib.mjs';

await shoot({
  out: process.env.OUT ?? 'shots-s3',
  map: true,
  framings: [
    // protected: the S2 south approach
    ['01-gate-fields-mid-PROT', -45, 32, 1200],
    ['02-gate-detail-PROT', -45, 6, 1400],
    // the town
    ['03-street-shot', -45, -26, 1600],
    ['04-street-mid', -45, -48, 1000],
    ['05-square-wide', -45, -62, 1200],
    ['06-square-mid', -45, -70, 1000],
    ['07-square-detail', -47, -76, 900],
    /* THE PIGEONS PUT UP — driven, not tapped, because a bird scattering
     * is MOTION and a photograph of a bird standing still proves nothing
     * about it. Session 3 shipped the scatter; Session 4 gave the page a
     * shape and left the flight arc keyed to y = 0, three and a half
     * units under the square, so for four sessions the birds vanished
     * instead of flying (owner, 2026-08-30). This is the frame that
     * would have caught it. */
    ['07b-pigeons-put-up', -44, -74, 700, { hold: [0, -1, 0], holdMs: 6000 }],
    ['08-belfry-yard', -68, -34, 1000],
    ['09-orchard', -103, -52, 1200],
    ['10-market-lane', 8, -88, 1000],
    ['11-wood-gate', 44, -98, 1000],
    ['12-north-street', -45, -128, 1000],
    ['13-north-gate-approach', -45, -142, 1200],
    // the castle, now on a real ridge
    ['14-castle-reveal', -45, -163, 1600],
    ['15-avenue-foot', -45, -176, 1600],
    ['16-avenue-climb', -45, -188, 1400],
    ['17-gatehouse-detail', -45, -199, 1200],
    ['18-through-the-gate', -45, -208, 1400],
    ['19-bailey', -45, -222, 1400],
    ['20-keep-mid', -45, -234, 1200],
    ['21-keep-detail', -45, -243, 1000],
    ['22-moat-pool', -100, -200, 1200],
    ['23-scarp-west', -120, -186, 1200],
    ['24-look-back-from-the-ridge', -45, -226, 1400],
  ],
});
