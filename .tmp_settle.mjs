import { shoot } from './tools/shoot-lib.mjs';
await shoot({
  out: 'out/regress/settle',
  framings: [['05-square-wide-LONG', -45, -68, 14000]],
});
