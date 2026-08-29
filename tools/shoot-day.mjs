// Iteration harness for the DAY CYCLE only: one place, every hour, one
// viewport. The full sheet is tools/shoot-traversal.mjs; this exists
// because the day cycle needs to be judged as a STRIP and re-judged
// after every tweak, and forty framings in two viewports is four
// minutes a round.
import { shoot } from './shoot-lib.mjs';

const HOURS = [5.75, 6.75, 9, 13, 17.8, 19.25, 19.9, 20.4, 22];
await shoot({
  out: process.env.OUT ?? 'shots-day',
  framings: [
    ...HOURS.map((h) => [
      `common-${String(Math.floor(h)).padStart(2, '0')}${String(Math.round((h % 1) * 60)).padStart(2, '0')}`,
      -45, 66, 1100, { hour: h },
    ]),
    ...[12, 19.9, 22].map((h) => [
      `brim-${String(Math.floor(h)).padStart(2, '0')}${String(Math.round((h % 1) * 60)).padStart(2, '0')}`,
      -45, -66, 1400, { hour: h },
    ]),
  ],
});
