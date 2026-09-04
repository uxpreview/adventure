import type { Rect } from './layout';

/**
 * COMPANY — anybody who travels near the walker, and the one rule they
 * all obey.
 *
 * Session 16, and it is `critique-story-2.md` MANDATORY 1 built as a
 * rule instead of as a beat. Act I's second and third facts (*nobody
 * here can leave; you can*) were taught by exactly one scripted moment
 * — Nell walking north beside you and stopping at Brim's gate — which a
 * player who left the crossroads east or west never saw. The critic's
 * fix, verbatim: *make it a rule of the world rather than a scripted
 * beat: anybody the walker is travelling near stops at their own
 * border, on any road out of any land.*
 *
 * So this is the rule, and it is the only place it lives:
 *
 *   A COMPANION HAS A LAND. IT FOLLOWS THE WALKER INSIDE THAT LAND AND
 *   STOPS DEAD AT ITS EDGE, ON EVERY ROAD, IN EVERY DIRECTION. NOTHING
 *   IN THIS FILE CAN GIVE A COMPANION A POSITION OUTSIDE ITS RECT.
 *
 * `Follower.tick` clamps before it moves, exactly the way `things.ts`
 * clamps a cart before it rolls: a companion is never *checked* at the
 * border, it simply cannot be given a position past one. The goat on
 * the Common is the first; a dog on a road, a child on a green and a
 * gull along a beach are the same class with different numbers, and
 * Session 17 adds them without re-deriving any of this.
 *
 * A companion is not a person with a wait. It has no name on a card,
 * no note and no knowledge; it is a thing that walks with you and then
 * does not, and the player works the rule out on the second one, which
 * is the correct number (`THE-LINE` §1, I.7).
 */

export type FollowerDef = {
  id: string;
  /** The land it is drawn in, and cannot leave. */
  rect: Rect;
  /** Where it stands on a fresh page. */
  home: { x: number; z: number };
  /** How far behind the walker it likes to be, and how far away it
   *  will be before it bothers to follow at all. */
  gap: number;
  notice: number;
  /** Its walk and its trot, in units a second. */
  walk: number;
  trot: number;
  /** How far inside its border it stops: two units, like a cart — a
   *  goat against a border you can see from both sides. */
  margin?: number;
  /** Ground inside its land it will not set foot on and will not
   *  follow a walker into: the bull's field, for the goat. A companion
   *  that walks into a field with a bull in it through a gate that is
   *  about to be shut is a companion shut in with a bull. */
  keepOut?: Rect;
};

export type FollowerPose = 'stand' | 'walk' | 'trot' | 'stopped';

export class Follower {
  x: number;
  z: number;
  /** Which way it is facing, so a land can mirror the drawing: −1
   *  west, +1 east. */
  face = 1;
  pose: FollowerPose = 'stand';
  /** True on the frame it arrived at its border and could go no
   *  further while the walker went on — the moment the rule is SEEN.
   *  A land makes its sound off this and nothing else. */
  justStopped = false;
  /** Whether it is standing at its border, held there by the rule. */
  atBorder = false;
  /** Whether it has noticed the walker at all. Once it has, it keeps
   *  following until the walker leaves its land. */
  following = false;
  private stoppedFor = 0;

  constructor(readonly def: FollowerDef) {
    this.x = def.home.x;
    this.z = def.home.z;
  }

  private get margin() {
    return this.def.margin ?? 2;
  }

  /** Inside its own land, with the margin. Everything that moves it
   *  goes through here first. */
  private clampX(x: number) {
    return Math.max(this.def.rect.minX + this.margin, Math.min(this.def.rect.maxX - this.margin, x));
  }
  private clampZ(z: number) {
    return Math.max(this.def.rect.minZ + this.margin, Math.min(this.def.rect.maxZ - this.margin, z));
  }

  /** Whether (x, z) is inside its land — and not on ground it keeps
   *  out of. */
  inLand(x: number, z: number) {
    const r = this.def.rect;
    if (!(x >= r.minX && x < r.maxX && z >= r.minZ && z < r.maxZ)) return false;
    const k = this.def.keepOut;
    if (k && x >= k.minX && x < k.maxX && z >= k.minZ && z < k.maxZ) return false;
    return true;
  }

  /**
   * One frame. `px, pz` is the walker; `blocked` is what the page
   * refuses a foot, so a companion does not wade a river to keep up.
   */
  tick(dt: number, px: number, pz: number, blocked: (x: number, z: number) => boolean) {
    this.justStopped = false;
    const d = Math.hypot(px - this.x, pz - this.z);
    const walkerIn = this.inLand(px, pz);

    if (!this.following) {
      if (walkerIn && d < this.def.notice) this.following = true;
      else {
        this.pose = 'stand';
        this.atBorder = false;
        return;
      }
    }
    /* THE WALKER HAS CROSSED, AND IT CANNOT. It goes on toward them as
     * far as its land allows — which is the border — and the clamp
     * below holds it there, and it stands and looks, and it stays
     * until they come back. A walker forty units into the next land
     * still has a goat at the edge of this one, facing them. */
    if (!walkerIn && this.atBorder) {
      this.stoppedFor += dt;
      this.pose = this.stoppedFor < 6 ? 'stopped' : 'stand';
      return;
    }
    if (walkerIn) this.atBorder = false;

    // close the gap: walk when near, trot when it is being left behind
    const want = this.def.gap;
    if (d <= want + 0.4) {
      this.pose = 'stand';
      return;
    }
    const speed = d > want * 3.2 ? this.def.trot : this.def.walk;
    this.pose = speed === this.def.trot ? 'trot' : 'walk';
    const step = Math.min(d - want, speed * dt);
    const ux = (px - this.x) / d;
    const uz = (pz - this.z) / d;
    let nx = this.clampX(this.x + ux * step);
    let nz = this.clampZ(this.z + uz * step);
    /* The page's own refusals, per axis, so it slides along a bank the
     * way a cart does rather than sticking to it. */
    if (blocked(nx, this.z) || !this.inLand(nx, this.z)) nx = this.x;
    if (blocked(this.x, nz) || !this.inLand(this.x, nz)) nz = this.z;
    /* THE BORDER, SEEN. If the clamp held it while the walker went on,
     * it has arrived at the one line in this world it cannot cross —
     * before the walker has even crossed it. The walker sees it stop,
     * and then sees themself keep going. */
    const held = Math.hypot(nx - this.x, nz - this.z) < step * 0.35 && d > want + 1;
    const edge = Math.min(
      this.x - this.def.rect.minX, this.def.rect.maxX - this.x,
      this.z - this.def.rect.minZ, this.def.rect.maxZ - this.z
    ) <= this.margin + 0.05;
    if (held && (edge || !walkerIn)) {
      if (!this.atBorder) {
        this.atBorder = true;
        this.justStopped = true;
        this.stoppedFor = 0;
      }
      this.stoppedFor += dt;
      this.pose = this.stoppedFor < 6 ? 'stopped' : 'stand';
      return;
    }
    if (Math.abs(nx - this.x) > 1e-4) this.face = nx > this.x ? 1 : -1;
    this.x = nx;
    this.z = nz;
  }

  /** Put it back where it lives, for a fresh page or the harness. */
  reset() {
    this.x = this.def.home.x;
    this.z = this.def.home.z;
    this.following = false;
    this.atBorder = false;
    this.pose = 'stand';
  }
}
