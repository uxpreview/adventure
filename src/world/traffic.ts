import * as THREE from 'three';
import type { Terrain } from './terrain';
import { clock } from './daylight';
import { weather } from './weather';
import { barriers } from './barriers';
import { coastX } from './layout';
import { rng } from '../engine/ink';
import {
  folkAtlas, wheelsAtlas, birdsAtlas, marksAtlas, folkCell, WHEELS, BIRDS, MARKS, type Atlas,
} from './textures-traffic';

/**
 * TRAFFIC (SCALE pillar) — something moving in every frame.
 *
 * A land is a place, not a yard, and a place has other people in it
 * going about their own business: carts on the king's road, cars on
 * main street, sails on the wide blue, birds over everything, a crowd
 * in Brim's square in the day, sheep drifting in the Downs, a dog on
 * main street, and weather you can see coming. None of it is for the
 * walker and none of it talks; it is there so a frame is never still.
 *
 * Cost: four instanced fields (folk, wheels, birds, marks), one draw
 * call each, whatever is on screen. Everything animates on the
 * harness clock (`t`, `dt`) and the day clock (`clock.hour`), never
 * the wall clock, so the cold player's screenshots are reproducible.
 */

const say = (name: string) => window.dispatchEvent(new CustomEvent('inklands:event', { detail: name }));

/* ================================================================== *
 * A SPRITE FIELD: one atlas, N instances, a frame and an alpha each.
 * Fogged like every standee (the same chunks MeshBasicMaterial uses),
 * so a cart at the far end of the road fades into the paper haze.
 * ================================================================== */
class SpriteField {
  mesh: THREE.InstancedMesh;
  private mat: THREE.ShaderMaterial;
  private frame: THREE.InstancedBufferAttribute;
  private alpha: THREE.InstancedBufferAttribute;
  private dummy = new THREE.Object3D();
  readonly count: number;

  constructor(atlas: Atlas, capacity: number, soft = false) {
    this.count = capacity;
    const geo = new THREE.PlaneGeometry(1, 1);
    geo.translate(0, 0.5, 0);
    this.frame = new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1);
    this.alpha = new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1);
    geo.setAttribute('aFrame', this.frame);
    geo.setAttribute('aAlpha', this.alpha);
    this.mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        { uMap: { value: null }, uCols: { value: atlas.cols } },
      ]),
      vertexShader: /* glsl */ `
        attribute float aFrame;
        attribute float aAlpha;
        uniform float uCols;
        varying vec2 vUv;
        varying float vAlpha;
        #include <fog_pars_vertex>
        void main() {
          vUv = vec2((uv.x + aFrame) / uCols, uv.y);
          vAlpha = aAlpha;
          vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vec4 mvPosition = viewMatrix * wp;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        varying vec2 vUv;
        varying float vAlpha;
        #include <fog_pars_fragment>
        void main() {
          vec4 t = texture2D(uMap, vUv);
          float a = t.a * vAlpha;
          if (a < ${soft ? '0.01' : '0.1'}) discard;
          gl_FragColor = vec4(t.rgb, a);
          #include <fog_fragment>
        }
      `,
      transparent: true,
      depthWrite: !soft,
      side: THREE.DoubleSide,
      fog: true,
    });
    this.mat.uniforms.uMap.value = atlas.tex;
    this.mesh = new THREE.InstancedMesh(geo, this.mat, capacity);
    this.mesh.frustumCulled = false;
    if (soft) this.mesh.renderOrder = 4;
    for (let i = 0; i < capacity; i++) this.hide(i);
  }

  set(i: number, x: number, y: number, z: number, w: number, h: number, frame: number, flip: boolean, alpha: number, rotY = 0) {
    this.dummy.position.set(x, y, z);
    this.dummy.rotation.set(0, rotY, 0);
    this.dummy.scale.set(flip ? -w : w, h, 1);
    this.dummy.updateMatrix();
    this.mesh.setMatrixAt(i, this.dummy.matrix);
    this.frame.setX(i, frame);
    this.alpha.setX(i, alpha);
  }

  hide(i: number) {
    this.dummy.position.set(0, -4000, 0);
    this.dummy.rotation.set(0, 0, 0);
    this.dummy.scale.set(0, 0, 0);
    this.dummy.updateMatrix();
    this.mesh.setMatrixAt(i, this.dummy.matrix);
    this.alpha.setX(i, 0);
  }

  flush() {
    this.mesh.instanceMatrix.needsUpdate = true;
    this.frame.needsUpdate = true;
    this.alpha.needsUpdate = true;
  }
}

/* ================================================================== *
 * PATHS: a polyline with arc length, walked by a distance `s`.
 * ================================================================== */
type Path = { pts: [number, number][]; cum: number[]; len: number };

function mkPath(pts: [number, number][]): Path {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return { pts, cum, len: cum[cum.length - 1] };
}

const _at = { x: 0, z: 0, tx: 1, tz: 0 };
function pathAt(p: Path, s: number) {
  s = Math.max(0, Math.min(p.len, s));
  let i = 1;
  while (i < p.cum.length - 1 && p.cum[i] < s) i++;
  const a = p.pts[i - 1];
  const b = p.pts[i];
  const seg = Math.max(1e-6, p.cum[i] - p.cum[i - 1]);
  const k = (s - p.cum[i - 1]) / seg;
  _at.x = a[0] + (b[0] - a[0]) * k;
  _at.z = a[1] + (b[1] - a[1]) * k;
  _at.tx = (b[0] - a[0]) / seg;
  _at.tz = (b[1] - a[1]) / seg;
  return _at;
}

/** 0..1 presence inside an hour window, ramped at both ends. */
function during(h: number, a: number, b: number, ramp = 0.3): number {
  if (a <= b) {
    if (h < a || h > b) return 0;
    return Math.min(1, (h - a) / ramp, (b - h) / ramp);
  }
  // a window across midnight
  if (h >= a) return Math.min(1, (h - a) / ramp);
  if (h <= b) return Math.min(1, (b - h) / ramp);
  return 0;
}

/* ================================================================== *
 * THE ROUTES. Authored off `layout.ROADS`, with two detours: the
 * king's road goes round Brim's fountain (which stands on it), and
 * the carts stop short of the castle ramp.
 * ================================================================== */
const KINGS_ROAD = mkPath([
  [-45, -196], [-45, -120], [-48, -100], [-52, -88], [-52, -74], [-48, -64], [-48, -60],
  [-45, -15], [-45, 58], [-42, 130],
]);
const MOTOR_ROAD = mkPath([
  [-45, 258], [-45, 240], [-45, 200], [-8, 202], [40, 198], [90, 200], [148, 205],
  [210, 208], [268, 205], [330, 202],
]);
const MAIN_STREET = mkPath([[-40, 200], [-8, 202], [40, 198], [90, 200], [144, 205]]);
/** Maple Court's pavement: the king's road through the neighbourhood. */
const MAPLE_WALK = mkPath([[-42, 132], [-45, 200], [-45, 258]]);
/** The Penwood's track, from the Downs' edge to the ring. */
const FOREST_TRACK = mkPath([[55, -110], [78, -122], [101, -134], [120, -148], [129, -158.6]]);
/** The sentry's beat across the castle gate. */
const GATE_WALK = mkPath([[-58, -191], [-32, -191]]);

/** Brim square's open ground: the fronts of the stalls, the cross,
 *  the fountain's sides. */
const SQUARE_SPOTS: [number, number][] = [
  [-53, -90], [-55, -78], [-51, -68], [-37, -91], [-35, -73], [-40.5, -71],
  [-50, -84], [-40, -86], [-49, -75], [-38, -79], [-45, -95], [-45, -68],
];
const FOUNTAIN = { x: -45, z: -81, r: 3.8 };
const MARGET = { x: -43.1, z: -75, r: 1.6 };
const SHEEP_RECT = { minX: 170, maxX: 204, minZ: 46, maxZ: 78 };
/** Where the shepherd stands about, on the sheep's side of the field. */
const SHEPHERD_SPOTS: [number, number][] = [[176, 44], [200, 50], [206, 70], [188, 82], [172, 80], [168, 60]];
const MILL_CHIMNEY = { x: 147.4, z: -8.8, lift: 13.2 };
const KEEP_FLAG = { x: -45.5, z: -250.6, lift: 17.0 };
const TOWER_LAMPS: [number, number, number][] = [[132, 194, 28.5], [161, 194, 28.8], [124, 194, 20.5], [137, 172, 19.2]];

/* ================================================================== *
 * THE MOVERS
 * ================================================================== */
type Runner = { idx: number; path: Path; s: number; dir: 1 | -1; speed: number; side: number; wait: number; ph: number; horn: number };

type Bird = {
  idx: number;
  kind: 'orbit' | 'lark' | 'flit' | 'bat' | 'cross' | 'flock';
  cx: number; cz: number; rx: number; rz: number; w: number; ph: number;
  lift: number; amp: number; up: number; down: number; flap: number;
  size: number; hours: [number, number];
  // flit state
  tx?: number; tz?: number; x?: number; z?: number; rest?: number;
};

type Walker = {
  idx: number; kind: 0 | 1 | 2; x: number; z: number; tx: number; tz: number; wait: number; stride: number; face: 1 | -1;
  spots: [number, number][]; speed: number; hours: [number, number]; round: boolean; reach: number;
};
type Sheep = { idx: number; x: number; z: number; tx: number; tz: number; wait: number; stride: number; face: 1 | -1; ok: boolean };
type Sail = { idx: number; x: number; z: number; ax: number; az: number; heading: number; tack: number; ph: number; minZ: number; maxZ: number; maxX: number };
type Tumble = { idx: number; x: number; z: number; ph: number };

class Traffic {
  private folk!: SpriteField;
  private wheels!: SpriteField;
  private birds!: SpriteField;
  private marks!: SpriteField;
  private terrain!: Terrain;
  private ready = false;
  /** Every mover's rotation about y: the bearing from the walker to the lens. */
  yaw = 0;

  private carts: Runner[] = [];
  private cars: Runner[] = [];
  private dogs: Runner[] = [];
  /** Folk who walk a road: the strollers, the rambler, the sentry. */
  private strollers: { m: Runner; kind: 0 | 1 | 2; hours: [number, number] }[] = [];
  private crowd: Walker[] = [];
  private sheep: Sheep[] = [];
  private sails: Sail[] = [];
  private tumbles: Tumble[] = [];
  private flock: Bird[] = [];
  private flockUp = 0;
  private flockNext = 30;
  private birdList: Bird[] = [];
  private rainDist = 130;
  private rainDir = -1;
  private sounds = { cart: 0, sheep: 0, murmur: 0, gull: 0 };

  /** Draw calls this module adds: one per field, whatever is on screen. */
  get calls() { return 4; }

  init(scene: THREE.Scene, terrain: Terrain) {
    this.terrain = terrain;
    this.folk = new SpriteField(folkAtlas(), 24);
    this.wheels = new SpriteField(wheelsAtlas(), 32);
    this.birds = new SpriteField(birdsAtlas(), 80);
    this.marks = new SpriteField(marksAtlas(), 32, true);
    for (const f of [this.folk, this.wheels, this.birds, this.marks]) scene.add(f.mesh);
    const r = rng(4242);

    // the wheels field: carts 0-3, cars 4-9 (four on the whole motor road,
    // two that only work main street), dogs 10-11, sheep 12-19, sails
    // 20-22, tumbleweeds 23-24
    this.carts = [0, 1, 2, 3].map((i) => ({
      idx: i, path: KINGS_ROAD, s: KINGS_ROAD.len * (0.08 + i * 0.24), dir: (i % 2 ? -1 : 1) as 1 | -1,
      speed: 2.3 + i * 0.15, side: 0, wait: 0, ph: r() * 6, horn: 0,
    }));
    this.cars = [0, 1, 2, 3].map((i) => ({
      idx: 4 + i, path: MOTOR_ROAD, s: MOTOR_ROAD.len * (0.1 + i * 0.22), dir: (i % 2 ? -1 : 1) as 1 | -1,
      speed: 8.5 + i * 0.7, side: 1.3, wait: 0, ph: r() * 6, horn: 12 + r() * 30,
    }));
    this.cars.push(
      { idx: 8, path: MAIN_STREET, s: 30, dir: 1, speed: 7.2, side: 1.3, wait: 0, ph: 1, horn: 20 },
      { idx: 9, path: MAIN_STREET, s: 140, dir: -1, speed: 7.8, side: 1.3, wait: 0, ph: 2, horn: 33 },
    );
    // the dogs: one on main street, one running the tideline
    const tide = mkPath([-40, 10, 60, 110, 150].map((z) => [coastX(z) + 4, z] as [number, number]));
    this.dogs = [
      { idx: 10, path: MAIN_STREET, s: 20, dir: 1, speed: 3.1, side: -2.6, wait: 0, ph: 0, horn: 0 },
      { idx: 11, path: tide, s: 40, dir: 1, speed: 3.6, side: 0, wait: 0, ph: 0, horn: 0 },
    ];
    for (let i = 0; i < 8; i++) {
      const x = SHEEP_RECT.minX + r() * (SHEEP_RECT.maxX - SHEEP_RECT.minX);
      const z = SHEEP_RECT.minZ + r() * (SHEEP_RECT.maxZ - SHEEP_RECT.minZ);
      const ok = !terrain.blockedAt(x, z) && terrain.waterAt(x, z) < 0.2;
      this.sheep.push({ idx: 12 + i, x, z, tx: x, tz: z, wait: r() * 8, stride: 0, face: r() > 0.5 ? 1 : -1, ok });
    }
    this.sails = [
      { idx: 20, x: -312, z: -196, ax: -312, az: -196, heading: 0.9, tack: 1, ph: 0, minZ: -240, maxZ: -140, maxX: -290 },
      { idx: 21, x: -300, z: 118, ax: -300, az: 118, heading: 2.2, tack: -1, ph: 3, minZ: 60, maxZ: 190, maxX: -280 },
      // the third works the deep water west of the bar, in sight of anyone on it
      { idx: 22, x: -336, z: -10, ax: -336, az: -10, heading: 1.4, tack: 1, ph: 8, minZ: -70, maxZ: 46, maxX: -322 },
    ];
    this.tumbles = [
      { idx: 23, x: 250, z: 40, ph: 0 },
      { idx: 24, x: 300, z: 90, ph: 2 },
    ];

    // the folk field: cart drivers 0-3, the crowd 4-11, the shepherd 12,
    // two strollers in Maple Court 13-14, the rambler 15, the sentry 16
    const DAY: [number, number] = [5.6, 20.4];
    for (let i = 0; i < 8; i++) {
      const spot = SQUARE_SPOTS[(i * 5) % SQUARE_SPOTS.length];
      this.crowd.push({
        idx: 4 + i, kind: (i % 3) as 0 | 1 | 2, x: spot[0], z: spot[1], tx: spot[0], tz: spot[1],
        wait: 2 + r() * 6, stride: 0, face: i % 2 ? 1 : -1,
        spots: SQUARE_SPOTS, speed: 1.3, hours: [8.5, 17.5], round: true, reach: 200,
      });
    }
    this.crowd.push({
      idx: 12, kind: 2, x: 176, z: 44, tx: 176, tz: 44, wait: 4, stride: 0, face: 1,
      spots: SHEPHERD_SPOTS, speed: 0.8, hours: [6.5, 19.5], round: false, reach: 220,
    });
    this.strollers = [
      { m: { idx: 13, path: MAPLE_WALK, s: 20, dir: 1, speed: 1.25, side: 2.8, wait: 0, ph: 0, horn: 0 }, kind: 0, hours: [7, 21] },
      { m: { idx: 14, path: MAPLE_WALK, s: 90, dir: -1, speed: 1.1, side: -2.8, wait: 0, ph: 0, horn: 0 }, kind: 1, hours: [7, 21] },
      { m: { idx: 15, path: FOREST_TRACK, s: 30, dir: 1, speed: 1.3, side: 1.4, wait: 0, ph: 0, horn: 0 }, kind: 1, hours: DAY },
      { m: { idx: 16, path: GATE_WALK, s: 5, dir: 1, speed: 0.8, side: 0, wait: 0, ph: 0, horn: 0 }, kind: 2, hours: [0, 24] },
    ];

    // the birds
    let b = 0;
    const bird = (o: Omit<Bird, 'idx'>) => { this.birdList.push({ idx: b++, ...o }); };
    const NIGHT: [number, number] = [19.9, 5.4];
    const gull = (cx: number, cz: number, rx: number, rz: number, lift: number, ph: number, w = 0.3) =>
      bird({ kind: 'orbit', cx, cz, rx, rz, w, ph, lift, amp: 2, up: BIRDS.gullUp, down: BIRDS.gullDown, flap: 2.6, size: 2.2, hours: DAY });
    // gulls along the coast, and two out over the sea, and two at the castle ridge
    gull(-236, -150, 16, 12, 9, 0.2); gull(-232, -60, 14, 10, 11, 1.4); gull(-238, 20, 18, 12, 8, 2.9, -0.28);
    gull(-230, 90, 15, 11, 12, 4.1); gull(-234, 170, 17, 13, 9, 5.2, -0.32); gull(-226, 230, 14, 10, 10, 0.9);
    gull(-300, -40, 24, 16, 13, 2.2, 0.22); gull(-290, 140, 26, 18, 12, 3.7, -0.2);
    gull(-70, -240, 22, 14, 24, 1.1, 0.24); gull(-20, -230, 20, 12, 22, 3.3, -0.26);
    // and over the bar itself, low, where a walker out on it looks
    gull(-280, 20, 14, 10, 7, 0.6, 0.34); gull(-262, -26, 12, 9, 6, 2.8, -0.3);
    // rooks round the keep, all day; they roost at dusk
    const rook = (cx: number, cz: number, ph: number, w: number) =>
      bird({ kind: 'orbit', cx, cz, rx: 12, rz: 9, w, ph, lift: 27, amp: 3, up: BIRDS.smallUp, down: BIRDS.smallDown, flap: 3.2, size: 1.5, hours: [6.2, 19.2] });
    rook(-52, -246, 0, 0.36); rook(-38, -252, 2.4, -0.31);
    // larks over the Common and the Downs: up, hang, and down
    const lark = (cx: number, cz: number, ph: number) =>
      bird({ kind: 'lark', cx, cz, rx: 6, rz: 4, w: 0.35, ph, lift: 7, amp: 5, up: BIRDS.smallUp, down: BIRDS.smallDown, flap: 7, size: 1.4, hours: DAY });
    lark(-80, 30, 0); lark(-20, 20, 2); lark(20, 90, 4); lark(-110, 90, 1); lark(120, 60, 3); lark(190, 20, 5);
    // small birds flitting garden to garden in Maple Court, and in the office park's shrubs
    const flit = (cx: number, cz: number, rx: number, rz: number, ph: number) =>
      bird({ kind: 'flit', cx, cz, rx, rz, w: 0, ph, lift: 1.4, amp: 0, up: BIRDS.smallUp, down: BIRDS.smallDown, flap: 9, size: 0.9, hours: DAY, x: cx, z: cz, tx: cx, tz: cz, rest: ph });
    flit(-70, 150, 22, 14, 1); flit(-30, 180, 20, 16, 2.5); flit(-90, 230, 24, 18, 0.4); flit(300, 240, 26, 20, 1.7); flit(-120, 60, 20, 20, 3.3);
    // in the pines along the track, and the wrens in the cut
    flit(84, -126, 18, 14, 0.9); flit(104, -140, 16, 12, 2.1); flit(300, -158, 12, 14, 1.3);
    // crows over the pines, kites over the canyon and the flats, pigeons over the city
    const cross = (cx: number, cz: number, rx: number, rz: number, w: number, ph: number, up: number, down: number, size: number, lift: number, flap: number) =>
      bird({ kind: 'cross', cx, cz, rx, rz, w, ph, lift, amp: 3, up, down, flap, size, hours: DAY });
    cross(145, -190, 70, 30, 0.09, 0, BIRDS.smallUp, BIRDS.smallDown, 1.3, 26, 3); cross(120, -160, 60, 40, -0.07, 2, BIRDS.smallUp, BIRDS.smallDown, 1.3, 24, 3.4);
    cross(160, -220, 50, 20, 0.11, 4, BIRDS.smallUp, BIRDS.smallDown, 1.2, 28, 3.2);
    bird({ kind: 'orbit', cx: 300, cz: -190, rx: 30, rz: 22, w: 0.14, ph: 0, lift: 30, amp: 4, up: BIRDS.kite, down: BIRDS.kite, flap: 0, size: 2.6, hours: [6, 19] });
    bird({ kind: 'orbit', cx: 270, cz: -130, rx: 26, rz: 20, w: -0.12, ph: 2, lift: 26, amp: 3, up: BIRDS.kite, down: BIRDS.kite, flap: 0, size: 2.4, hours: [6, 19] });
    bird({ kind: 'orbit', cx: 310, cz: 20, rx: 36, rz: 28, w: 0.1, ph: 1, lift: 32, amp: 5, up: BIRDS.kite, down: BIRDS.kite, flap: 0, size: 2.6, hours: [6, 19] });
    bird({ kind: 'orbit', cx: 280, cz: 90, rx: 30, rz: 24, w: -0.13, ph: 4, lift: 28, amp: 4, up: BIRDS.kite, down: BIRDS.kite, flap: 0, size: 2.4, hours: [6, 19] });
    // one low over the cut, so it reads from the floor of the canyon
    bird({ kind: 'orbit', cx: 302, cz: -168, rx: 18, rz: 14, w: 0.17, ph: 3, lift: 16, amp: 3, up: BIRDS.kite, down: BIRDS.kite, flap: 0, size: 2.2, hours: [6, 19] });
    const pigeon = (cx: number, cz: number, rx: number, rz: number, lift: number, ph: number, w: number) =>
      bird({ kind: 'orbit', cx, cz, rx, rz, w, ph, lift, amp: 1.5, up: BIRDS.pigeonUp, down: BIRDS.pigeonDown, flap: 4, size: 1.1, hours: DAY });
    pigeon(146, 200, 14, 10, 9, 0, 0.5); pigeon(150, 204, 12, 9, 12, 2, 0.46); pigeon(120, 230, 16, 12, 10, 4, -0.44);
    pigeon(300, 200, 14, 10, 6, 1, 0.5); pigeon(330, 240, 12, 10, 7, 3, -0.48);
    // bats after dark, in the lands with somewhere to roost
    const bat = (cx: number, cz: number, ph: number) =>
      bird({ kind: 'bat', cx, cz, rx: 9, rz: 7, w: 1.3, ph, lift: 4, amp: 1.5, up: BIRDS.bat, down: BIRDS.bat, flap: 0, size: 0.9, hours: NIGHT });
    bat(-40, 40, 0); bat(-60, 90, 2); bat(-70, 160, 1); bat(-30, 220, 3); bat(-50, -100, 4); bat(-40, -215, 1.5);
    bat(140, -170, 0.5); bat(150, 40, 2.5); bat(100, 100, 4.5); bat(-190, 100, 1.2);
    // Brim's flock, aloft now and then, and when the walker runs at them
    for (let i = 0; i < 8; i++) {
      const bd: Bird = {
        idx: b++, kind: 'flock', cx: -45, cz: -81, rx: 9 + (i % 3) * 2, rz: 7 + (i % 2) * 2, w: 0.9, ph: i * 0.8,
        lift: 4 + (i % 4) * 1.2, amp: 1.5, up: BIRDS.pigeonUp, down: BIRDS.pigeonDown, flap: 5, size: 1.0, hours: [6.5, 19.5],
      };
      this.flock.push(bd);
    }
    this.ready = true;
  }

  /** The walker whistled or ran: the square's pigeons go up. */
  private liftFlock() {
    if (this.flockUp <= 0) { this.flockUp = 9; say('pigeons-lift'); }
  }

  tick(dt: number, t: number, px: number, pz: number, effort = 0, camX = px, camZ = pz + 1) {
    if (!this.ready) return;
    // every sprite squares up to the lens, whichever way it has been turned
    this.yaw = Math.atan2(camX - px, camZ - pz);
    const h = clock.hour;
    const near = (x: number, z: number, r: number) => Math.hypot(px - x, pz - z) < r;
    const ground = (x: number, z: number) => this.terrain.heightAt(x, z);
    const windK = weather.windK;
    for (const k of Object.keys(this.sounds) as (keyof typeof this.sounds)[]) this.sounds[k] = Math.max(0, this.sounds[k] - dt);

    /* ---- the roads ---------------------------------------------- */
    const run = (m: Runner, present: number, frames: [number, number], w: number, hh: number, stridePer: number, field: SpriteField, stand = -1) => {
      if (present <= 0.01 || !near(pathAt(m.path, m.s).x, pathAt(m.path, m.s).z, 260)) {
        field.hide(m.idx);
        if (present > 0.01) this.advance(m, dt);
        return;
      }
      this.advance(m, dt);
      const p = pathAt(m.path, m.s);
      const x = p.x - p.tz * m.side * m.dir;
      const z = p.z + p.tx * m.side * m.dir;
      const waiting = m.wait > 0;
      const f = waiting && stand >= 0 ? stand : Math.floor(m.s / stridePer) % 2 ? frames[1] : frames[0];
      const flip = p.tx * m.dir < -0.05 || (Math.abs(p.tx) < 0.05 && p.tz * m.dir > 0);
      // a vehicle that has reached the end of its road is out of sight;
      // a person waiting at the end of theirs just stands there
      field.set(m.idx, x, ground(x, z), z, w, hh, f, flip, waiting && stand < 0 ? 0 : present, this.yaw);
    };
    const cartsOn = during(h, 6.8, 19.6, 0.4);
    for (const c of this.carts) {
      run(c, cartsOn, [WHEELS.cartA, WHEELS.cartB], 4.8, 3.36, 0.9, this.wheels);
      // the driver, on foot beside the pony
      const p = pathAt(c.path, c.s);
      const dx = p.x + 1.3;
      const dz = p.z + 0.6;
      if (cartsOn > 0.01 && c.wait <= 0 && near(dx, dz, 260)) {
        const f = folkCell(2, (Math.floor(c.s / 0.62) % 2 ? 1 : 2));
        this.folk.set(c.idx, dx, ground(dx, dz), dz, 1.15, 1.9, f, p.tx * c.dir < 0, cartsOn, this.yaw);
      } else this.folk.hide(c.idx);
      if (cartsOn > 0.5 && c.wait <= 0 && near(p.x, p.z, 34) && this.sounds.cart <= 0) { this.sounds.cart = 5 + (t % 3); say('cart-wheels'); }
    }
    const night = during(h, 21.5, 5.8, 0.5);
    this.cars.forEach((c, i) => {
      const on = i < 2 ? 1 : 1 - night;
      run(c, on, [WHEELS.carA + (i % 3), WHEELS.carA + (i % 3)], 4.6, 3.22, 1, this.wheels);
      c.horn -= dt;
      if (c.horn <= 0) {
        c.horn = 16 + ((t * 7 + i * 13) % 30);
        const p = pathAt(c.path, c.s);
        if (on > 0.5 && c.wait <= 0 && near(p.x, p.z, 80)) say('horn');
      }
    });
    for (const d of this.dogs) run(d, during(h, 7, 21, 0.4), [WHEELS.dogA, WHEELS.dogB], 1.7, 1.19, 0.5, this.wheels);
    // the folk on the roads: strollers, a rambler, the sentry
    for (const s of this.strollers) {
      run(s.m, during(h, s.hours[0], s.hours[1], 0.4), [folkCell(s.kind, 1), folkCell(s.kind, 2)], 1.15, 1.9, 0.55, this.folk, folkCell(s.kind, 0));
    }

    /* ---- the crowd in Brim's square, and the shepherd in the Downs -- */
    const market = during(h, 8.5, 17.5, 0.35);
    for (const w of this.crowd) {
      const on = during(h, w.hours[0], w.hours[1], 0.35);
      if (on <= 0.01 || !near(w.x, w.z, w.reach)) { this.folk.hide(w.idx); continue; }
      let moving = false;
      if (w.wait > 0) w.wait -= dt;
      else {
        const dx = w.tx - w.x;
        const dz = w.tz - w.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.3) {
          w.wait = 3 + ((t * 3.7 + w.idx * 11) % 7);
          const s = w.spots[Math.floor((t * 1.3 + w.idx * 7) % w.spots.length)];
          w.tx = s[0] + Math.sin(t + w.idx) * 1.2;
          w.tz = s[1] + Math.cos(t * 0.7 + w.idx) * 1.2;
        } else {
          const step = Math.min(d, w.speed * dt);
          let nx = w.x + (dx / d) * step;
          let nz = w.z + (dz / d) * step;
          // round the fountain and Marget's counter, not through them
          if (w.round) for (const o of [FOUNTAIN, MARGET]) {
            const ox = nx - o.x;
            const oz = nz - o.z;
            const od = Math.hypot(ox, oz);
            if (od < o.r) { nx = o.x + (ox / od) * o.r; nz = o.z + (oz / od) * o.r; }
          }
          if (barriers.blocks(nx, nz) || this.terrain.blockedAt(nx, nz)) { w.tx = w.x; w.tz = w.z; }
          else {
            if (Math.abs(nx - w.x) > 1e-4) w.face = nx > w.x ? 1 : -1;
            w.stride += Math.hypot(nx - w.x, nz - w.z);
            w.x = nx; w.z = nz; moving = true;
          }
        }
      }
      const f = folkCell(w.kind, moving ? (Math.floor(w.stride / 0.55) % 2 ? 1 : 2) : 0);
      this.folk.set(w.idx, w.x, ground(w.x, w.z), w.z, 1.15, 1.9, f, w.face < 0, on, this.yaw);
    }
    if (market > 0.5 && near(-45, -81, 32) && this.sounds.murmur <= 0) { this.sounds.murmur = 8 + (t % 4); say('market-murmur'); }

    /* ---- sheep in the Downs -------------------------------------- */
    for (const s of this.sheep) {
      if (!s.ok || !near(s.x, s.z, 220)) { this.wheels.hide(s.idx); continue; }
      let moving = false;
      const wd = Math.hypot(px - s.x, pz - s.z);
      if (wd < 6) {
        // away from the walker, at a trot
        const ux = (s.x - px) / wd;
        const uz = (s.z - pz) / wd;
        s.tx = Math.max(SHEEP_RECT.minX, Math.min(SHEEP_RECT.maxX, s.x + ux * 9));
        s.tz = Math.max(SHEEP_RECT.minZ, Math.min(SHEEP_RECT.maxZ, s.z + uz * 9));
        s.wait = 0;
      }
      if (s.wait > 0) s.wait -= dt;
      else {
        const dx = s.tx - s.x;
        const dz = s.tz - s.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.3) {
          s.wait = 4 + ((t * 2.3 + s.idx * 5) % 9);
          s.tx = SHEEP_RECT.minX + ((t * 5.1 + s.idx * 17) % (SHEEP_RECT.maxX - SHEEP_RECT.minX));
          s.tz = SHEEP_RECT.minZ + ((t * 3.3 + s.idx * 23) % (SHEEP_RECT.maxZ - SHEEP_RECT.minZ));
        } else {
          const step = Math.min(d, (wd < 8 ? 2.4 : 0.55) * dt);
          const nx = s.x + (dx / d) * step;
          const nz = s.z + (dz / d) * step;
          if (this.terrain.blockedAt(nx, nz) || this.terrain.waterAt(nx, nz) > 0.2) { s.tx = s.x; s.tz = s.z; }
          else {
            if (Math.abs(nx - s.x) > 1e-4) s.face = nx > s.x ? 1 : -1;
            s.stride += step; s.x = nx; s.z = nz; moving = true;
          }
        }
      }
      const f = moving && Math.floor(s.stride / 0.6) % 2 ? WHEELS.sheepB : WHEELS.sheepA;
      this.wheels.set(s.idx, s.x, ground(s.x, s.z), s.z, 2.1, 1.47, f, s.face > 0, 1, this.yaw);
    }
    if (near(187, 62, 44) && this.sounds.sheep <= 0) { this.sounds.sheep = 18 + (t % 12); say('sheep'); }

    /* ---- two sails tacking on the wide blue ----------------------- */
    for (const s of this.sails) {
      // a beat up the coast, and a run back down it
      s.ph += dt;
      if (s.ph > 22) { s.ph = 0; s.tack = -s.tack as 1 | -1; }
      const along = s.tack > 0 ? 1 : -1;
      s.x += Math.sin(t * 0.07 + s.idx) * 0.4 * dt + (s.tack > 0 ? -0.35 : 0.35) * dt;
      s.z += along * 2.0 * dt;
      if (s.z > s.maxZ) { s.z = s.maxZ; s.tack = -1; s.ph = 0; }
      if (s.z < s.minZ) { s.z = s.minZ; s.tack = 1; s.ph = 0; }
      s.x = Math.max(-360, Math.min(coastX(s.z) - 34, s.maxX, s.x));
      if (!near(s.x, s.z, 260)) { this.wheels.hide(s.idx); continue; }
      const heel = Math.sin(t * 0.9 + s.idx) * 0.03;
      this.wheels.set(s.idx, s.x, ground(s.x, s.z) + 0.1 + Math.sin(t * 1.1 + s.idx) * 0.08, s.z, 5.4, 3.78, s.tack > 0 ? WHEELS.sailR : WHEELS.sailL, false, 0.96, this.yaw + heel);
    }

    /* ---- tumbleweed across the flats ------------------------------- */
    for (const tw of this.tumbles) {
      const v = 3 + windK * 4;
      tw.x += v * dt;
      tw.z += Math.sin(t * 0.8 + tw.ph) * 0.8 * dt;
      tw.ph += dt * v * 0.9;
      if (tw.x > 372) { tw.x = 236; tw.z = -60 + ((t * 13) % 150); }
      if (!near(tw.x, tw.z, 240) || this.terrain.waterAt(tw.x, tw.z) > 0.3) { this.wheels.hide(tw.idx); continue; }
      const hop = Math.abs(Math.sin(tw.ph * 0.5)) * 0.6;
      this.wheels.set(tw.idx, tw.x, ground(tw.x, tw.z) + hop, tw.z, 2.2, 1.54, Math.floor(tw.ph) % 2 ? WHEELS.tumbleB : WHEELS.tumbleA, false, 0.9, this.yaw);
    }

    /* ---- the birds ------------------------------------------------- */
    if (effort > 0.55 && near(-45, -81, 15)) this.liftFlock();
    this.flockNext -= dt;
    if (this.flockNext <= 0) { this.flockNext = 38 + (t % 20); if (near(-45, -81, 90)) this.liftFlock(); }
    this.flockUp = Math.max(0, this.flockUp - dt);
    for (const bd of this.flock) {
      const on = during(h, bd.hours[0], bd.hours[1]) * Math.min(1, this.flockUp, (9 - this.flockUp) * 0.6);
      if (on <= 0.01 || !near(bd.cx, bd.cz, 200)) { this.birds.hide(bd.idx); continue; }
      this.placeBird(bd, t, on, ground);
    }
    for (const bd of this.birdList) {
      const on = during(h, bd.hours[0], bd.hours[1], 0.4);
      if (on <= 0.01 || !near(bd.cx, bd.cz, 240)) { this.birds.hide(bd.idx); continue; }
      if (bd.kind === 'flit') this.flitBird(bd, dt, t);
      this.placeBird(bd, t, on, ground);
    }
    if (near(-236, 40, 60) && this.sounds.gull <= 0 && during(h, 5.6, 20.4) > 0) { this.sounds.gull = 14 + (t % 9); say('gull-cry'); }

    /* ---- the lures move ------------------------------------------ */
    // the mill's smoke: six puffs, rising, thinning, blown east
    for (let i = 0; i < 6; i++) {
      const age = (t * 0.16 + i / 6) % 1;
      const x = MILL_CHIMNEY.x + age * age * 7 * windK + Math.sin(t * 0.6 + i) * 0.4;
      const z = MILL_CHIMNEY.z - age * 1.5;
      const y = ground(MILL_CHIMNEY.x, MILL_CHIMNEY.z) + MILL_CHIMNEY.lift + age * 11;
      const sc = 1.6 + age * 3.4;
      const a = 0.55 * Math.min(1, age * 8) * (1 - age) * (1 - 0.4 * night);
      if (near(x, z, 300)) this.marks.set(i, x, y, z, sc, sc, MARKS.smoke, false, a);
      else this.marks.hide(i);
    }
    // the keep's flag, snapping in whatever wind there is
    {
      const rate = 1.4 + windK * 2.6;
      const f = Math.floor(t * rate) % 2 ? MARKS.flagB : MARKS.flagA;
      const y = ground(KEEP_FLAG.x, KEEP_FLAG.z) + KEEP_FLAG.lift;
      if (near(KEEP_FLAG.x, KEEP_FLAG.z, 320)) this.marks.set(6, KEEP_FLAG.x, y, KEEP_FLAG.z, 3.0, 3.0, f, false, 0.95, this.yaw + Math.sin(t * 2.1) * 0.05);
      else this.marks.hide(6);
    }
    // three glints on the sea, coming and going
    [-60, 30, 110].forEach((z, i) => {
      const x = coastX(z) - 16 - i * 3;
      const p = Math.pow(Math.max(0, Math.sin(t * 1.1 + i * 2.1)), 8);
      const a = p * (0.9 - 0.5 * night) * (1 - weather.state.fog);
      if (a > 0.02 && near(x, z, 300)) this.marks.set(7 + i, x, ground(x, z) + 0.4, z, 3.6, 1.6, MARKS.glint, false, a);
      else this.marks.hide(7 + i);
    });
    // the city's towers blink after dark
    {
      const dark = during(h, 18.7, 6.3, 0.5);
      TOWER_LAMPS.forEach(([x, z, lift], i) => {
        const period = 1.4 + i * 0.37;
        const on = ((t + i * 0.9) % period) < period * 0.5 ? 1 : 0.08;
        const a = dark * on;
        if (a > 0.02 && near(x, z, 320)) this.marks.set(10 + i, x, ground(x, z) + lift, z, 2.2, 2.2, MARKS.lamp, false, a);
        else this.marks.hide(10 + i);
      });
    }

    /* ---- weather you can see coming -------------------------------- */
    {
      const now = weather.state.rain;
      const ahead = weather.ahead;
      const front = Math.max(now, ahead);
      const clearing = ahead < now - 0.03;
      this.rainDir += ((clearing ? 1 : -1) - this.rainDir) * (1 - Math.exp(-dt * 0.5));
      const want = clearing ? 40 + 95 * (1 - now) : 135 - 95 * (now / Math.max(front, 0.05));
      this.rainDist += (want - this.rainDist) * (1 - Math.exp(-dt * 0.6));
      const a = front < 0.04 ? 0 : Math.min(0.75, front * 0.8) * (1 - 0.7 * weather.state.fog);
      const centre = this.rainDir < 0 ? Math.PI : 0;
      for (let i = 0; i < 12; i++) {
        if (a < 0.02) { this.marks.hide(14 + i); continue; }
        const ang = centre + (i / 11 - 0.5) * 2.2;
        const x = px + Math.cos(ang) * this.rainDist;
        const z = pz + Math.sin(ang) * this.rainDist;
        const y = ground(x, z) - 2 + Math.sin(t * 0.5 + i) * 0.6;
        const rot = Math.atan2(px - x, pz - z);
        this.marks.set(14 + i, x, y, z, 44, 34, MARKS.rain, false, a * (0.8 + 0.2 * Math.sin(t * 0.7 + i * 1.7)), rot);
      }
    }

    for (const f of [this.folk, this.wheels, this.birds, this.marks]) f.flush();
  }

  private advance(m: Runner, dt: number) {
    if (m.wait > 0) { m.wait -= dt; if (m.wait <= 0) m.dir = -m.dir as 1 | -1; return; }
    m.s += m.speed * m.dir * dt;
    if (m.s >= m.path.len) { m.s = m.path.len; m.wait = 3.5; }
    else if (m.s <= 0) { m.s = 0; m.wait = 3.5; }
  }

  private flitBird(bd: Bird, dt: number, t: number) {
    // sits, then dashes to another perch
    bd.rest! -= dt;
    const dx = bd.tx! - bd.x!;
    const dz = bd.tz! - bd.z!;
    const d = Math.hypot(dx, dz);
    if (d > 0.4) {
      const step = Math.min(d, 9 * dt);
      bd.x! += (dx / d) * step;
      bd.z! += (dz / d) * step;
    } else if (bd.rest! <= 0) {
      bd.rest = 3 + ((t * 2.9 + bd.idx * 3) % 5);
      bd.tx = bd.cx + Math.sin(t * 1.7 + bd.idx) * bd.rx;
      bd.tz = bd.cz + Math.cos(t * 1.1 + bd.idx * 2) * bd.rz;
    }
  }

  private placeBird(bd: Bird, t: number, on: number, ground: (x: number, z: number) => number) {
    let x: number;
    let z: number;
    let lift = bd.lift;
    let vx = 1;
    let moving = true;
    if (bd.kind === 'flit') {
      x = bd.x!; z = bd.z!;
      moving = Math.hypot(bd.tx! - x, bd.tz! - z) > 0.4;
      vx = bd.tx! - x;
      lift = moving ? bd.lift + 1.2 : bd.lift;
    } else if (bd.kind === 'lark') {
      const a = t * bd.w + bd.ph;
      x = bd.cx + Math.cos(a) * bd.rx;
      z = bd.cz + Math.sin(a * 1.3) * bd.rz;
      lift = bd.lift + Math.sin(t * 0.45 + bd.ph) * bd.amp;
      vx = -Math.sin(a);
    } else if (bd.kind === 'bat') {
      const a = t * bd.w + bd.ph;
      x = bd.cx + Math.sin(a) * bd.rx + Math.sin(a * 3.1) * 2.5;
      z = bd.cz + Math.cos(a * 0.8) * bd.rz + Math.cos(a * 2.7) * 2;
      lift = bd.lift + Math.sin(a * 2.3) * bd.amp;
      vx = Math.cos(a) * bd.rx + Math.cos(a * 3.1) * 7.5;
    } else if (bd.kind === 'cross') {
      // back and forth over a long line, high
      const u = (t * bd.w + bd.ph) % 2;
      const k = u < 1 ? u : 2 - u;
      x = bd.cx - bd.rx + 2 * bd.rx * k;
      z = bd.cz + Math.sin(t * 0.3 + bd.ph) * bd.rz;
      lift = bd.lift + Math.sin(t * 0.5 + bd.ph) * bd.amp;
      vx = u < 1 ? 1 : -1;
    } else {
      const a = t * bd.w + bd.ph;
      x = bd.cx + Math.cos(a) * bd.rx;
      z = bd.cz + Math.sin(a) * bd.rz;
      lift = bd.lift + Math.sin(t * 0.7 + bd.ph) * bd.amp;
      vx = -Math.sin(a) * bd.w;
    }
    const glide = bd.flap > 0 && Math.sin(t * 0.37 + bd.ph * 2) > 0.55 && bd.kind !== 'bat';
    const up = bd.flap > 0 && !glide && Math.sin(t * bd.flap + bd.ph) > 0;
    const frame = moving ? (up ? bd.up : bd.down) : bd.down;
    // a wing is wider than it is tall
    this.birds.set(bd.idx, x, ground(x, z) + lift, z, bd.size, bd.size * 0.75, frame, vx < 0, on, this.yaw);
  }
}

export const traffic = new Traffic();
