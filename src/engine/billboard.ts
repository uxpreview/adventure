import * as THREE from 'three';

/**
 * THE CAMERA'S YAW, SHARED BY EVERY DRAWING (the reset, pillar 1).
 *
 * The world is paper cutouts and the camera can orbit now, so every
 * cutout turns about its own feet to keep facing the lens — cylindrical
 * billboarding, Y only, so a standee stays vertical on a slope.
 *
 * Yaw is radians east of due north: the direction the camera LOOKS
 * along. A plane facing +Z (the default) faces a camera standing at
 * +Z, which is yaw 0; for a camera at yaw θ the plane's normal must
 * point back at it, which is `rotation.y = -θ`. Everything that turns
 * reads the number from here, and App writes it exactly once a frame.
 *
 * Two kinds of thing turn:
 *   · ONE-OFF MESHES (`billboard(mesh)`) — kept in one list and rotated
 *     when the yaw changes. Three recomputes every object's local
 *     matrix each frame anyway, so the assignment is the whole cost.
 *   · INSTANCED FIELDS — `StandeeField` rotates each instance in its
 *     vertex shader off the shared `yawUniform`; no CPU work per
 *     instance, no extra draw call.
 *
 * `'keep'` mode is for things that FACE a way (a person walking east,
 * the bull): seen from behind, the cutout shows its back — the same
 * drawing mirrored — so a figure facing east keeps facing east from
 * every side. Plain mode (a tree, a house, a sign) always shows its
 * front, which is what a sign wants.
 *
 * `'run'` mode is for a LONG, LOW drawing that stands for a line on
 * the ground — a fence, a wall, a hedge, a rail, a string of bunting.
 * Turned fully to the lens a run of them stacks up as a row of cards
 * with the walker standing inside one; held fixed they vanish edge-on
 * and the barrier they draw becomes an invisible wall. So a run turns
 * toward the lens by at most `RUN_TURN` from its authored line: seen
 * along its length it leans forty degrees off the lens and reads as a
 * fence receding, and it is never narrower than three quarters of
 * itself. Seen from behind it shows its back (the same drawing
 * mirrored), which is what the back of a fence looks like.
 */
/** How far a run may turn off its authored line toward the lens. */
export const RUN_TURN = (50 * Math.PI) / 180;
let yaw = 0;
let cosYaw = 1;
let sinYaw = 0;

/** One uniform object shared by every StandeeField material. */
export const yawUniform = { value: 0 };

export type BillboardMode = 'front' | 'keep' | 'run';
type Entry = { m: THREE.Object3D; base: number; keep: boolean; run: boolean };

const wrapPi = (a: number) => {
  a = a % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a <= -Math.PI) a += Math.PI * 2;
  return a;
};
const list: Entry[] = [];

export function cameraYaw() {
  return yaw;
}

/** Camera-right in world XZ: what "screen right" points along. */
export function cameraRight(): [number, number] {
  return [cosYaw, sinYaw];
}

/** Toward the lens in world XZ, unit length. */
export function towardLens(): [number, number] {
  return [-sinYaw, cosYaw];
}

/** The mirror a world-facing sign needs so `face` (−1 west, +1 east)
 *  still reads as west or east from where the camera is. */
export function mirrorFor(face: number) {
  return cosYaw < 0 ? -face : face;
}

/** How much of a world velocity crosses the frame (positive = screen
 *  right) — for a lean and a mirror that follow the picture. */
export function crossing(vx: number, vz: number) {
  return vx * cosYaw + vz * sinYaw;
}

function orient(e: Entry) {
  if (e.run) {
    // a plane is the same plane turned by π, so fold the turn into a
    // half circle and clamp it; past a right angle it shows its back
    let d = wrapPi(-yaw - e.base);
    if (d > Math.PI / 2) d -= Math.PI;
    else if (d <= -Math.PI / 2) d += Math.PI;
    e.m.rotation.y = e.base + Math.max(-RUN_TURN, Math.min(RUN_TURN, d));
    return;
  }
  e.m.rotation.y = e.keep && cosYaw < 0 ? e.base + Math.PI - yaw : e.base - yaw;
}

/** Register a mesh that faces the camera. `base` is an authored tilt
 *  kept relative to the lens (or, for a run, the line it stands on). */
export function billboard(m: THREE.Object3D, base = 0, mode: BillboardMode = 'front') {
  const e = { m, base, keep: mode === 'keep', run: mode === 'run' };
  list.push(e);
  orient(e);
  return m;
}

/** Register a mesh that turns exactly as another registered one does
 *  (a pencil ghost over a house). Falls back to facing the lens from
 *  `base` if the other is not registered. */
export function billboardLike(m: THREE.Object3D, of: THREE.Object3D, base = 0) {
  const src = list.find((x) => x.m === of);
  const e = src ? { m, base: src.base, keep: src.keep, run: src.run } : { m, base, keep: false, run: false };
  list.push(e);
  orient(e);
  return m;
}

/** Take a mesh out of the list (a disposed drawing). */
export function unbillboard(m: THREE.Object3D) {
  const i = list.findIndex((e) => e.m === m);
  if (i >= 0) list.splice(i, 1);
}

/** Switch a registered mesh's mode (a figure that faces a way). */
export function billboardMode(m: THREE.Object3D, mode: BillboardMode) {
  const e = list.find((x) => x.m === m);
  if (!e) return;
  e.keep = mode === 'keep';
  e.run = mode === 'run';
  orient(e);
}

/** App calls this once a frame, before the drawings update. */
export function setCameraYaw(v: number) {
  if (v === yaw) return;
  yaw = v;
  cosYaw = Math.cos(v);
  sinYaw = Math.sin(v);
  yawUniform.value = v;
  for (const e of list) orient(e);
}

/** How many one-off drawings are turning, for the harness. */
export function billboardCount() {
  return list.length;
}
