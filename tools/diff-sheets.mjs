// A REGRESSION IS A DIFF AND NOT AN OPINION.
//
//   node tools/diff-sheets.mjs                    # against origin/main
//   node tools/diff-sheets.mjs --base 2ed1147     # against a commit
//   node tools/diff-sheets.mjs --only desktop     # one viewport, iterating
//
// WORLD-SYSTEMS §2 wrote this file's requirement before anybody built
// it: "every protected framing must be reproducible exactly — the shoot
// harness pins yaw to zero, every existing contact sheet re-shoots
// unchanged, and a regression is a diff and not an opinion." Until now
// "unregressed" has meant a person looking at two contact sheets a week
// apart, which is not a claim anybody can check.
//
// So: build the base ref and the working tree, serve both, shoot THE SET
// THAT CARRIES THE VERDICTS — the six lands that hold a WOWED, at two
// hours, in both viewports — through the same protocol on both, and
// count the pixels that moved.
//
// ---- THE PART THAT MAKES IT WORK, AND IT IS NOT THE DIFF ------------
//
// Two shots of one framing were never the same picture in this project,
// and the reason is not the renderer, it is the CLOCK. Three things
// animate on their own between two shutter presses and every one of them
// is in every pixel of the frame:
//
//   · the paper pass's grain and its hand-drawn wobble, hashed off uTime
//     and re-seeded three times a second — a one-pixel random resample
//     of EVERY INK EDGE in the picture;
//   · the standee wind, sin(uTime · f) in the vertex stage of every
//     field in the world;
//   · the ink-in cascade, which travels 34 units a second out from
//     wherever the walker first stood in a land, so a frame shot early
//     catches the page half drawn — and this sandbox renders at about
//     three and a half frames a second, so a 900 ms settle is FOUR
//     FRAMES, which is a sixth of a second of game time and nowhere near
//     the eight seconds a land takes to ink in.
//
// Two more turned up when this file was actually run, and neither would
// ever have been found by looking: the walker's own quiet breath, eight
// parts in a thousand of its height, which is a third of a pixel and
// exactly enough to redraw an outline; and THE WATER, whose clock lives
// in the terrain shader, accumulates from page load and is reset by
// nothing — which made the four coast framings, and only those, the ones
// that would not come back the same twice.
//
// So the settle is not milliseconds, it is GAME SECONDS: __inklands
// pins all five clocks and steps a fixed number of fixed ticks, and
// renders once at the end. Twelve game seconds costs about a third of a
// second instead of seventy, and two runs of one framing come back
// bit-identical. That is the whole tool; the diff underneath it is
// twenty lines.
//
// ---- WHAT IT PRINTS, AND WHY IT IS TWO NUMBERS ----------------------
//
// Every framing is diffed TWICE, off the same simulation:
//
//   THE PAGE — the rendered world with the world's own writing hidden
//     (labels, the interact prompt, the hint line, which are DOM over
//     the canvas). This is the hard gate. If the camera moved, if a
//     prop moved, if the ground moved, it is in here, and it may not
//     move at all.
//   THE PAGE AND ITS WRITING — the whole frame as a player sees it,
//     chrome included, because QUALITY-BAR shoots the chrome too. This
//     one moves whenever a label is deliberately re-placed, so it is
//     reported and thresholded rather than required to be zero.
//
// Splitting them is what lets one run say both "nothing in the world
// moved" and "these eleven names moved, on purpose, and here they are".
//
// For each frame: the share of pixels that differ by more than TOL, and
// the worst single-channel delta. A grain difference is ±3/255 and a
// camera that moved by a hair is thousands of pixels at full contrast,
// so the two are not close and the threshold does not have to be
// delicate. The worst frames are listed; anything over THRESH fails.
//
// If the base ref predates the harness clock (anything before Session 9)
// the tool says so and falls back to shooting both sides on wall clock
// with the same long settle. That mode is honest but noisy, and it is
// the reason the clock went in as its own commit: from Session 10 on,
// `origin/main` carries it and every run of this file is the tight one.
import { chromium } from 'playwright';
import { execFileSync } from 'child_process';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { extname, join, normalize } from 'path';
import { CHROMIUM } from './pw.mjs';

const arg = (name, dflt) => {
  const i = process.argv.indexOf('--' + name);
  return i > 0 ? process.argv[i + 1] : dflt;
};
const BASE = arg('base', process.env.BASE ?? 'origin/main');
const ONLY = arg('only', process.env.VIEWPORT);
const WORK = '.diff';
/** A pixel counts as moved past this. The grain is ±3. */
const TOL = 12;
/** And a frame fails past this share of them. */
const THRESH = 0.0015;
/** Game seconds of settle per framing: past the ink-in cascade (34
 *  units a second across a land), past every damper, and past the
 *  standee birth spring. */
const SETTLE = 12;

/* ================================================================== *
 * THE SET THAT CARRIES THE VERDICTS.
 *
 * Not a tour: these are the framings six WOWED verdicts were awarded on
 * (critique-art-1 through -5), the ones QUALITY-BAR §2 says a later
 * session may not regress. THE SHOT of each land is in here, and so is
 * every framing a previous critique named by name.
 * ================================================================== */
const FRAMINGS = [
  // THE COMMON and the first minute (critique-art-1)
  ['common-wide', -45, 84],
  ['common-THE-SHOT', -45, 66],
  ['crossroads', -44.5, 57],
  ['well', -56.5, 48],
  ['oaks', -96, 35],
  ['gate-fields', -45, 32],
  ['gate-detail', -45, 6],
  // THE KINGDOM OF BRIM (critique-art-2)
  ['street-shot', -45, -26],
  ['square-wide', -45, -62],
  ['square-mid', -45, -70],
  ['belfry-yard', -30, -86],
  // CASTLE GREYWEATHER (critique-art-2, -3: the session's own flagship)
  ['avenue-foot', -45, -150],
  ['barbican', -45, -178],
  ['curtain-wall', -45, -196],
  ['bailey', -45, -214],
  // the sheet's shape (critique-art-3)
  ['crease-east-road', 62, 62],
  ['curl-rim', 370, 16],
  ['tear-lip', 312, -140],
  // LONGSHORE and THE WIDE BLUE (critique-art-4)
  ['boardwalk', -228, 84],
  ['tide-line', -228, 16],
  ['THE-SHOT-cut', -237, -49],
  ['the-point', -238, -70],
  ['sandbar', -292, -20],
];
/** Every protected framing is judged at two hours since Session 6. */
const HOURS = [12, 19.6];

/* ---- a static server, because vite preview only serves one dist --- */
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
};
function serve(root, port) {
  const s = createServer(async (req, res) => {
    const p = normalize(decodeURIComponent(req.url.split('?')[0]));
    const f = join(root, p === '/' ? '/index.html' : p);
    try {
      const body = await readFile(f);
      res.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('no');
    }
  });
  return new Promise((ok) => s.listen(port, () => ok(s)));
}

/* ---- build a git ref into its own dist ---------------------------- */
function buildRef(ref, into) {
  console.log(`building ${ref} → ${into}`);
  rmSync(into, { recursive: true, force: true });
  mkdirSync(into, { recursive: true });
  execFileSync('sh', ['-c', `git archive ${ref} | tar -x -C ${into}`], { stdio: 'inherit' });
  // the base ref's own source, this checkout's node_modules: the tool is
  // comparing what the two trees DRAW, not what they install
  execFileSync('sh', ['-c', `ln -s "$PWD/node_modules" ${into}/node_modules`]);
  execFileSync('sh', ['-c', `cd ${into} && ./node_modules/.bin/vite build --logLevel error`], {
    stdio: 'inherit',
  });
}

/* ================================================================== */
mkdirSync(WORK, { recursive: true });
const baseSha = execFileSync('git', ['rev-parse', '--short', BASE]).toString().trim();
buildRef(baseSha, `${WORK}/base`);
console.log('building the working tree → dist');
execFileSync('sh', ['-c', 'node_modules/.bin/vite build --logLevel error'], { stdio: 'inherit' });

const servers = [
  await serve(`${WORK}/base/dist`, 4191),
  await serve('dist', 4192),
];

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
].filter((v) => !ONLY || v.name === ONLY);

const browser = await chromium.launch({ executablePath: CHROMIUM });

/**
 * Shoot one side of the comparison and hand back base64 PNGs keyed by
 * frame name. Both sides go through this identically — that is the only
 * property that matters about it.
 */
async function shootSide(port, vp) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.addInitScript(() => localStorage.clear());
  page.on('pageerror', (e) => console.log(`  PAGE EXCEPTION [${port}]:`, e.message));
  await page.goto(`http://localhost:${port}/?debug`, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page
    .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), {
      timeout: 25000,
    })
    .catch(() => {});
  const stepped = await page.evaluate(() => typeof window.__inklands.setTime === 'function');
  await page.evaluate(() => {
    window.__inklands.begin();
    // the bearing is pinned on both sides: this file asks whether the
    // SHIPPED page moved, and the shipped page is a walker standing still
    window.__inklands.setBearing?.(false);
  });
  await page.waitForTimeout(1200);

  const shots = {};
  const bare = {};
  for (const hour of HOURS) {
    for (const [name, x, z] of FRAMINGS) {
      await page.evaluate((h) => window.__inklands.setHour(h, false), hour);
      if (stepped) {
        await page.evaluate(
          ([tx, tz, secs]) => {
            const I = window.__inklands;
            I.goto(tx, tz);
            I.setTime(0);
            I.step(1 / 60, Math.round(secs * 60));
          },
          [x, z, SETTLE]
        );
        // long enough for any CSS transition the frame carries (the
        // region card, a label fading in) to have finished on both sides
        await page.waitForTimeout(650);
      } else {
        await page.evaluate(([tx, tz]) => window.__inklands.goto(tx, tz), [x, z]);
        await page.waitForTimeout(4000);
      }
      const key = `${name}@${hour}`;
      shots[key] = (await page.screenshot()).toString('base64');
      // and again with the world's own writing off: same frame, same
      // instant, no re-simulation — just the DOM stepping aside
      await page.evaluate(() => {
        document.getElementById('inklands-nowrite')?.remove();
        const st = document.createElement('style');
        st.id = 'inklands-nowrite';
        /* The world's own writing, and the two transients. `.labels` is
         * a CLASS and not an id — the first version of this line said
         * `#labels`, matched nothing, and quietly scored every
         * deliberately re-placed label as a regression of the page.
         * The region card and the hint are hidden here because both are
         * real-time transients (a 3.4-second setTimeout): whether one is
         * still up when the shutter fires depends on wall-clock jitter,
         * which is exactly the kind of noise this pass exists to
         * exclude. They are still in the full-frame pass below, which is
         * where QUALITY-BAR's "the chrome is shot too" lives. */
        st.textContent =
          '.labels,#labels,#prompt,.hint,.region-card{display:none !important}';
        document.head.appendChild(st);
      });
      bare[key] = (await page.screenshot()).toString('base64');
      await page.evaluate(() => document.getElementById('inklands-nowrite')?.remove());
    }
  }
  await page.close();
  return { shots, bare, stepped };
}

/* ---- the diff itself, in a page, because there is no PNG decoder -- */
const differ = await browser.newPage();
async function diff(a, b) {
  return differ.evaluate(
    async ([da, db, tol]) => {
      const load = (d) =>
        new Promise((res) => {
          const i = new Image();
          i.onload = () => res(i);
          i.src = 'data:image/png;base64,' + d;
        });
      const [ia, ib] = await Promise.all([load(da), load(db)]);
      const px = (im) => {
        const c = document.createElement('canvas');
        c.width = im.width;
        c.height = im.height;
        const x = c.getContext('2d');
        x.drawImage(im, 0, 0);
        return x.getImageData(0, 0, c.width, c.height).data;
      };
      const A = px(ia);
      const B = px(ib);
      const n = A.length / 4;
      let over = 0;
      let max = 0;
      let minx = 1e9, maxx = -1, miny = 1e9, maxy = -1;
      for (let i = 0; i < n; i++) {
        const d = Math.max(
          Math.abs(A[i * 4] - B[i * 4]),
          Math.abs(A[i * 4 + 1] - B[i * 4 + 1]),
          Math.abs(A[i * 4 + 2] - B[i * 4 + 2])
        );
        if (d > max) max = d;
        if (d > tol) {
          over++;
          const x = i % ia.width;
          const y = (i / ia.width) | 0;
          if (x < minx) minx = x;
          if (x > maxx) maxx = x;
          if (y < miny) miny = y;
          if (y > maxy) maxy = y;
        }
      }
      return {
        share: over / n,
        over,
        max,
        box: maxx < 0 ? null : [minx, miny, maxx - minx + 1, maxy - miny + 1],
      };
    },
    [a, b, tol()]
  );
}
const tol = () => TOL;

const page = [];
const full = [];
let loose = false;

for (const vp of VIEWPORTS) {
  console.log(`\n${vp.name}: ${FRAMINGS.length} framings × ${HOURS.length} hours`);
  const base = await shootSide(4191, vp);
  const head = await shootSide(4192, vp);
  if (!base.stepped || !head.stepped) loose = true;
  for (const key of Object.keys(head.shots)) {
    page.push({ vp: vp.name, key, ...(await diff(base.bare[key], head.bare[key])) });
    full.push({ vp: vp.name, key, ...(await diff(base.shots[key], head.shots[key])) });
  }
}

const report = (title, rows, thresh) => {
  rows.sort((a, b) => b.share - a.share);
  const bad = rows.filter((w) => w.share > thresh);
  const clean = rows.filter((w) => w.over === 0).length;
  console.log(`\n${title}`);
  console.log(`  ${clean}/${rows.length} bit-identical, ${bad.length} over ${(thresh * 100).toFixed(3)}%`);
  for (const w of rows.slice(0, 12)) {
    if (w.over === 0) break;
    console.log(
      `  ${(w.share * 100).toFixed(4).padStart(8)}%  max ${String(w.max).padStart(3)}  ` +
      `${w.vp}/${w.key}${w.box ? `  at ${w.box.join(',')}` : ''}${w.share > thresh ? ' ✗' : ''}`
    );
  }
  return bad.length;
};

console.log(
  `\n${full.length} framings compared against ${BASE} (${baseSha}), ` +
  `bearing pinned, ${SETTLE} game seconds of settle` +
  (loose ? '\nLOOSE MODE: one side predates the harness clock — see the header' : '')
);
// THE PAGE MAY NOT MOVE AT ALL. Not "within a threshold": the whole
// claim of this session is that a stopped walker is in the shipped
// composition, and a shipped composition that has moved by one pixel
// has moved.
const pageFails = report('THE PAGE (the world, writing hidden):', page, 0);
const fullFails = report('THE PAGE AND ITS WRITING (what a player sees):', full, THRESH);
const fails = pageFails + fullFails;
console.log(
  fails
    ? `\n${pageFails} PAGE REGRESSION(S), ${fullFails} FRAME(S) OVER THRESHOLD`
    : '\nevery protected framing is unchanged'
);

await browser.close();
for (const s of servers) s.close();
if (!process.env.KEEP && existsSync(WORK)) rmSync(WORK, { recursive: true, force: true });
process.exit(fails ? 1 : 0);
