// SCALE: every land at 9, 13 and 18, two frames one game-second apart, standing on a road,
// shot through a play server (PORT=4322). ONLY=meadow,city HOURS=9,13 narrow it.
const port = process.env.PORT ?? 4322;
const call = async (cmd) => (await (await fetch(`http://127.0.0.1:${port}/`, { method: 'POST', body: JSON.stringify(cmd) })).json());
const ev = (js) => call(['eval', js]);
const SPOTS = [
  ['ocean', -258, -24], ['beach', -215, 62], ['castle', -45, -190], ['kingdom', -45, -55],
  ['meadow', -45, 75], ['neighborhood', -45, 235], ['forest', 70, -105], ['canyon', 300, -140],
  ['downs', 165, 85], ['desert', 290, 20], ['city', 148, 230], ['office', 300, 225],
];
const HOURS = (process.env.HOURS ?? '9,13,18').split(',').map(Number);
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const st = await call(['status']);
if (st.title) { await call(['click', '.title-btn']); }
await ev('window.__inklands.setBearing(true),window.__inklands.setWeather("clear"),"ok"');
for (const [land, x, z] of SPOTS) {
  if (only && !only.includes(land)) continue;
  for (const h of HOURS) {
    await ev(`window.__inklands.setHour(${h}),window.__inklands.goto(${x},${z}),window.__inklands.step(1/30,210),window.__inklands.quiet?.(),window.__inklands.step(1/30,5),"ok"`);
    const a = await call(["shot", `${land}-${h}-a`]); if (!a.file) { console.log("shot failed", JSON.stringify(a)); continue; }
    await ev('window.__inklands.step(1/30,30),"ok"');
    const b = await call(['shot', `${land}-${h}-b`]);
    console.log(`${land} ${h}:00 → ${a.file.split('/').pop()} ${b.file.split('/').pop()} region=${a.region}`);
  }
}
