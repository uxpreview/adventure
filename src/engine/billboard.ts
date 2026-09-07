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
 */
let yaw = 0;
let cosYaw = 1;
let sinYaw = 0;

/** One uniform object shared by every StandeeField material. */
export const yawUniform = { value: 0 };

type Entry = { m: THREE.Object3D; base: number; keep: boolean };
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
  e.m.rotation.y = e.keep && cosYaw < 0 ? e.base + Math.PI - yaw : e.base - yaw;
}

/** Register a mesh that faces the camera. `base` is an authored tilt
 *  kept relative to the lens. */
export function billboard(m: THREE.Object3D, base = 0, mode: 'front' | 'keep' = 'front') {
  const e = { m, base, keep: mode === 'keep' };
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
export function billboardMode(m: THREE.Object3D, mode: 'front' | 'keep') {
  const e = list.find((x) => x.m === m);
  if (!e) return;
  e.keep = mode === 'keep';
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
