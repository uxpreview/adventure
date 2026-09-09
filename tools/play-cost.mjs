// SCALE: frameCost(30) in the city, the Common and Brim on a play server (PORT=...).
const port = process.env.PORT ?? 4321;
const call = async (cmd) => (await (await fetch(`http://127.0.0.1:${port}/`, { method: 'POST', body: JSON.stringify(cmd) })).json());
const ev = (js) => call(['eval', js]);
const st = await call(['status']);
if (st.title) { await call(['click', '.title-btn']); }
await ev('window.__inklands.setBearing(true),window.__inklands.setWeather("clear"),window.__inklands.setHour(13),"ok"');
for (const [name, x, z] of [['city', 148, 230], ['common', -45, 75], ['kingdom', -45, -55]]) {
  await ev(`window.__inklands.goto(${x},${z}),window.__inklands.step(1/30,240),"ok"`);
  const a = await ev('window.__inklands.frameCost(30)');
  const b = await ev('window.__inklands.frameCost(30)');
  console.log(`${name.padEnd(8)} calls=${b.calls} tris=${b.tris} ms=${a.ms.toFixed(1)}/${b.ms.toFixed(1)}`);
}
