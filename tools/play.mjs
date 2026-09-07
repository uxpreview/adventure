// One command to the play server. See tools/play-server.mjs.
//   node tools/play.mjs <op> [args...]      (PORT=4321 to pick a server)
const port = process.env.PORT ?? 4321;
const cmd = process.argv.slice(2);
if (!cmd.length) { console.log('ops: status text sec N hold KEYS SECS press KEY down KEY up KEY click X Y|SELECTOR tap X Y drag X0 Y0 X1 Y1 [left|right] [SECS] wheel DY touch X0 Y0 X1 Y1 [SECS] touch2 X Y DX DY [SECS] shot NAME eval JS errors quit'); process.exit(0); }
const r = await fetch(`http://127.0.0.1:${port}/`, { method: 'POST', body: JSON.stringify(cmd) });
const j = await r.json();
console.log(typeof j === 'string' ? j : JSON.stringify(j, null, 1));
