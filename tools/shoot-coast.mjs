// THE COAST (Session 5) — LONGSHORE and THE WIDE BLUE, both viewports.
// The camera looks north, so a subject is framed by standing south of
// it: every framing here is the walker's own position, not the
// subject's.
import { shoot } from './shoot-lib.mjs';

await shoot({
  out: process.env.OUT ?? 'shots-s5',
  map: true,
  framings: [
    // the arrival: the coast road running out of the meadow
    ['01-coast-road', -150, 60, 1200],
    ['02-road-end', -212, 62, 1200],
    // THE BOARDWALK — a promenade walked NORTH
    ['03-boardwalk', -228, 84, 1400],
    ['04-boardwalk-mid', -224, 60, 1400],
    ['05-jetty-head', -250, 60, 1400],
    // north: the bight, the huts, the flock
    ['06-bight-wide', -221, 36, 1400],
    ['07-tide-line', -228, 16, 1200],
    ['08-the-huts', -206, 10, 1400],
    ['09-huts-detail', -203, -1, 1200],
    // the point announcing itself from the south
    ['10-holdfast-from-the-bight', -220, -6, 1600],
    // THE CUT — the shot
    ['11-cut-foot', -208, -22, 1600],
    ['12-THE-SHOT-cut', -237, -49, 1700],
    ['13-cut-upper', -228, -39, 1500],
    // THE HOLDFAST
    ['14-the-point', -238, -70, 1600],
    ['15-point-look-north', -232, -90, 1400],
    // SHELTER COVE
    ['16-cove-approach', -212, -114, 1400],
    ['17-shelter-cove', -222, -128, 1400],
    // the landward way past the point, and the north void
    ['18-behind-the-point', -178, -70, 1200],
    ['19-last-groyne', -228, -186, 1200],
    // south: the void's midpoint and the river mouth
    ['20-a-boat-resting', -232, 122, 1200],
    ['21-river-mouth', -204, 216, 1600],
    // THE WIDE BLUE — the bar
    ['22-shallows', -258, 100, 1400],
    ['23-bar-root', -268, 68, 1400],
    ['24-bar-mid', -286, 42, 1400],
    ['25-long-water', -297, 22, 1600],
    ['26-THE-SHOT-the-mark', -300, -4, 1800],
    ['27-mark-close', -296, -22, 1400],
    ['28-seaward-face', -277, -30, 1800],
    ['29-bar-ashore', -264, -26, 1400],
    // the far south of the water: the composed void
    ['30-moorings', -274, 172, 1200],
  ],
});
