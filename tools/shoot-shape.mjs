// THE PAPER HAS A SHAPE (Session 4's own sheet). Every landform in
// WORLD-SYSTEMS §1 photographed where it lives: the crease the east
// road dives through, the curled rim, the buckle of the downs, the tear
// at SPLITROCK, the dune line, and the river's fold. Both viewports.
import { shoot } from './shoot-lib.mjs';

await shoot({
  out: process.env.OUT ?? 'shots-s4',
  framings: [
    // THE CREASE — one fold, north to south, and the roads that dive
    ['01-crease-east-road', 62, 62, 1400],
    ['02-crease-in-it', 84, 40, 1200],
    ['03-crease-along', 68, 96, 1200],
    ['04-crease-main-street', 88, 226, 1200],
    ['05-crease-forest-track', 68, -100, 1400],
    // THE BUCKLE — the downs roll, the office park does not
    ['06-downs-roll', 112, 4, 1400],
    ['07-downs-swell', 150, -14, 1200],
    ['08-office-flat', 280, 232, 1200],
    // THE CURL — the world's rim is a vista
    ['09-curl-east', 348, 44, 1600],
    ['10-curl-rim-look-back', 370, 16, 1600],
    ['11-curl-south', -40, 250, 1400],
    // THE TEAR — SPLITROCK
    ['12-tear-lip', 312, -140, 1600],
    ['13-tear-along', 316, -108, 1400],
    // THE COAST — the dune line and the sea floor
    ['14-dune-line', -186, 74, 1400],
    ['15-dune-crest', -174, 52, 1200],
    ['16-shore', -232, 60, 1400],
    // THE RIVER'S OWN FOLD, and a bridge that spans it level
    ['17-river-fold', 128, 40, 1400],
    ['18-bridge', 110, 52, 1200],
    // THE RIDGE — the reason all of this exists
    ['19-ridge-from-the-common', -45, -120, 1600],
    ['20-ridge-from-the-avenue', -45, -170, 1800],
  ],
});
