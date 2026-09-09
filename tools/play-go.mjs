// SCALE: follow waypoints through the play server (tools/play-server.mjs), one game-second a call,
// and print how long the trip took. Tolerance widens with speed so a gallop does not ping-pong.
//   PORT=4321 node tools/play-go.mjs "[[x,z],[x,z]]" [run 0|1] [maxSec] [label]
const port = process.env.PORT ?? 4321;
const call = async (cmd) => (await (await fetch(`http://127.0.0.1:${port}/`, { method: 'POST', body: JSON.stringify(cmd) })).json());
const ev = (js) => call(['eval', js]);
const wps = JSON.parse(process.argv[2]);
const run = Number(process.argv[3] ?? 0);
const maxSec = Number(process.argv[4] ?? 600);
const label = process.argv[5] ?? '';
let i = 0, sec = 0, stuck = 0, last = null, tol = 2.5;
const t0 = Date.now();
while (i < wps.length && sec < maxSec) {
  const [tx, tz] = wps[i];
  const r = await ev(`(function(){const I=window.__inklands;const p=I.char.pos;const dx=${tx}-p.x,dz=${tz}-p.z;const d=Math.hypot(dx,dz);I.drive(dx/d,dz/d,${run});I.step(1/30,30);return {x:+p.x.toFixed(1),z:+p.z.toFixed(1),d:+d.toFixed(1),region:I.region()};})()`);
  sec += 1;
  const d = Math.hypot(tx - r.x, tz - r.z);
  const mv = last ? Math.hypot(last.x - r.x, last.z - r.z) : 0;
  tol = Math.max(2.5, mv * 0.75);
  if (d < tol) i++;
  if (last && mv < 0.3) stuck++; else stuck = 0;
  last = r;
  if (sec % 10 === 0 || d < tol) console.log(`${label} t=${sec}s at (${r.x},${r.z}) ${r.region} → wp${i} d=${d.toFixed(1)}`);
  if (stuck >= 6) { console.log(`${label} STUCK at (${r.x},${r.z}) for 6 s heading to wp${i} (${tx},${tz})`); break; }
}
await ev('window.__inklands.release(),window.__inklands.step(1/30,15),"ok"');
console.log(`${label} DONE ${sec} game-s (${((Date.now()-t0)/1000).toFixed(0)} wall-s), reached wp ${i}/${wps.length}`);
