import * as THREE from 'three';
import type { StepZone } from '../core/Audio';

export type SurfaceZoneDef = {
  /** Point test in world XZ. */
  test: (x: number, z: number) => boolean;
  /** Does the page take a mark here? (ch05 whiteout: it does not.) */
  prints?: 'normal' | 'suppressed';
  /** Step-synthesis preset while inside. */
  step?: StepZone;
  onEnter?: () => void;
  onExit?: () => void;
};

/** Rectangular zone test. */
export function aabb(minX: number, maxX: number, minZ: number, maxZ: number) {
  return (x: number, z: number) => x >= minX && x <= maxX && z >= minZ && z <= maxZ;
}

/**
 * Zone test from a poured alpha mask — the whiteout's edges are hand-
 * poured, not rectangular, so the dead ground has to follow the pour.
 * The canvas is sampled ONCE at build; the copy is what runs at stamp time.
 */
export function maskZone(
  canvas: HTMLCanvasElement,
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
  threshold = 0.5
) {
  const w = canvas.width;
  const h = canvas.height;
  const data = canvas.getContext('2d')!.getImageData(0, 0, w, h).data;
  const cut = threshold * 255;
  return (x: number, z: number) => {
    const u = (x - bounds.minX) / (bounds.maxX - bounds.minX);
    const v = (z - bounds.minZ) / (bounds.maxZ - bounds.minZ);
    if (u < 0 || u > 1 || v < 0 || v > 1) return false;
    const px = Math.min(w - 1, Math.floor(u * w));
    const py = Math.min(h - 1, Math.floor(v * h));
    return data[(py * w + px) * 4 + 3] > cut;
  };
}

/**
 * Footstep surface zones (ARCHITECTURE #9 / ch03 §5C / ch05 §5C): ground
 * regions that override how the page answers a step — its timbre, and
 * whether it takes a mark at all. Chapters register zones and tick this;
 * it drives `char.stamping` and the audio step preset. One system serves
 * Ch3's tear and wash, Ch5's dead whiteout, Ch7's markless tundra.
 */
export class SurfaceZones {
  private zones: (SurfaceZoneDef & { inside: boolean })[] = [];
  private lastStep: StepZone = 'paper';

  constructor(
    private defaults: { step: StepZone; prints: 'normal' | 'suppressed' } = {
      step: 'paper',
      prints: 'normal',
    }
  ) {}

  add(def: SurfaceZoneDef) {
    this.zones.push({ ...def, inside: false });
    return this;
  }

  /** Innermost matching zone wins (later registrations are more specific). */
  update(
    pos: THREE.Vector3,
    char: { stamping: boolean },
    audio: { setStepZone(id: StepZone): void }
  ) {
    let step = this.defaults.step;
    let prints = this.defaults.prints;
    for (const z of this.zones) {
      const now = z.test(pos.x, pos.z);
      if (now !== z.inside) {
        z.inside = now;
        (now ? z.onEnter : z.onExit)?.();
      }
      if (now) {
        if (z.step) step = z.step;
        if (z.prints) prints = z.prints;
      }
    }
    char.stamping = prints !== 'suppressed';
    if (step !== this.lastStep) {
      this.lastStep = step;
      audio.setStepZone(step);
    }
  }

  /** Hand the page back exactly as it was found. */
  release(char: { stamping: boolean }, audio: { setStepZone(id: StepZone): void }) {
    char.stamping = true;
    audio.setStepZone('paper');
  }
}
