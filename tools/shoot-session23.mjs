// THE INTERIORS, SHOT — Session 23's proofs sheet, both viewports.
//
//   npx vite preview --port 4173 &
//   node tools/shoot-session23.mjs
//
// Every room from outside (the house exactly as it was), from the door
// (the front wall going to pencil), and from inside (the section: the
// plan, the elevation, the two side walls edge-on), at the hours the
// person is home and the hours they are not; the errands at both ends.
// The harness clock is pinned so two runs are one picture.
import { shoot } from './shoot-lib.mjs';

const OUT = process.env.OUT ?? 'out/session23';

await shoot({
  out: OUT,
  bearing: true,
  framings: [
    // VAL'S KITCHEN
    ['01-val-court', -78, 141, 900, { hour: 12 }],
    ['02-val-door', -78, 129.2, 1400, { hour: 12 }],
    ['03-val-kitchen-noon', -78, 124.6, 600, { gameSecs: 3,  hour: 12 }],
    ['04-val-kitchen-evening', -77, 124.6, 600, { gameSecs: 3,  hour: 21.8 }],
    ['05-val-kitchen-out', -79, 125.2, 600, { gameSecs: 3,  hour: 19.3 }],
    ['06-val-kitchen-light-off', -77, 124.6, 600, { gameSecs: 3,  hour: 21.8, learn: ['name:castle', 'door:the-light-off', 'fact:the-light-off-day-0'] }],
    // MARGET'S HOUSE
    ['07-marget-street', -80, -84, 900, { hour: 12 }],
    ['08-marget-door', -80, -96.4, 1400, { hour: 12 }],
    ['09-marget-day', -80, -101, 600, { gameSecs: 3,  hour: 12 }],
    ['10-marget-night', -80, -101, 600, { gameSecs: 3,  hour: 22.5 }],
    // THE LOFT
    ['11-loft-bailey', -45, -205, 900, { hour: 12 }],
    ['12-loft-door', -34, -213.2, 1400, { hour: 12 }],
    ['13-loft-inside', -34, -217.4, 600, { gameSecs: 6,  hour: 12 }],
    ['14-loft-relieved', -34, -217.4, 600, { gameSecs: 6,  hour: 12, learn: ['door:the-king-restored'] }],
    // THE ERRANDS
    ['15-banner-bank', -96.5, -201.5, 900, { hour: 12 }],
    ['16-crate-lane', -5.5, -99, 900, { hour: 12 }],
    ['17-bike-lawn', -75.5, 165, 900, { hour: 12 }],
    ['18-bike-home', -27.4, 150, 900, { hour: 12 }],
  ],
});
