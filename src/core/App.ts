import * as THREE from 'three';
import gsap from 'gsap';
import { Terrain } from '../world/terrain';
import { World } from '../world/regions';
import { Character } from '../engine/Character';
import { Footprints } from '../engine/Footprints';
import { POIManager } from '../engine/POI';
import { PaperFX } from '../postfx/PaperPass';
import { Input } from './Input';
import { Save } from './Save';
import { Audio, type StepZone } from './Audio';
import { UI } from '../ui/UI';
import { renderMap } from '../ui/map';
import { PAPER_HEX, INK_HEX } from '../engine/palette';
import { SPAWN, regionAt, coastX, barDist, type RegionSpec } from '../world/layout';
import { MEADOW_POIS } from '../world/regions/meadow';
import { FOREST_POIS, CANYON_POIS, DESERT_POIS, DOWNS_POIS } from '../world/regions/wilds';
import { OCEAN_POIS, BEACH_POIS } from '../world/regions/coast';
import {
  KINGDOM_POIS, CASTLE_POIS, NEIGHBORHOOD_POIS, CITY_POIS, OFFICE_POIS,
} from '../world/regions/civic';
import type { WorldPOI } from '../world/regions';

const ALL_POIS: WorldPOI[] = [
  ...MEADOW_POIS, ...FOREST_POIS, ...CANYON_POIS, ...DESERT_POIS, ...DOWNS_POIS,
  ...OCEAN_POIS, ...BEACH_POIS, ...KINGDOM_POIS, ...CASTLE_POIS,
  ...NEIGHBORHOOD_POIS, ...CITY_POIS, ...OFFICE_POIS,
];

/**
 * INKLANDS — one sheet, twelve lands, two verbs.
 *
 * The open-world rework of the margins engine: no chapters, no page
 * turns — one persistent page streaming its furniture in around the
 * walker. Crossing a border changes the music, the footstep, the card
 * and nothing else; the world is continuous because the sheet is.
 */
export class App {
  ui = new UI();
  save = new Save();
  audio = new Audio();

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private fx: PaperFX;
  private terrain = new Terrain();
  private world: World;
  private prints: Footprints;
  private char: Character;
  private input: Input;
  private poi: POIManager;

  private region: RegionSpec;
  private started = false;
  private elapsed = 0;
  private persistAcc = 0;
  private ambientAcc = 6;
  private camTarget = new THREE.Vector3();
  private clock = new THREE.Clock();
  private activePoi: ReturnType<POIManager['update']> = null;
  private prevPos = new THREE.Vector3();
  /** The ground the camera is standing on, damped. */
  private camGround = 0;
  /** How much higher the ground ahead is than the ground here, damped. */
  private camRise = 0;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(PAPER_HEX);
    this.ui.root.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(App.CAM.desktop.fov, 1, 0.1, 320);
    this.camera.position.set(SPAWN.x, 8.2, SPAWN.z + 10.4);
    // an open world lives on its sightlines: the keep from the meadow,
    // the towers from the downs. The fog is a horizon, not a curtain —
    // and since Session 4 it is a horizon that moves when you climb.
    this.scene.fog = new THREE.Fog(PAPER_HEX, App.CAM.fogNear, App.CAM.fogFar);

    this.scene.add(this.terrain.mesh);
    this.world = new World(this.scene, this.terrain);

    this.prints = new Footprints({ color: INK_HEX, fade: 90 });
    this.scene.add(this.prints.mesh);
    this.char = new Character(this.prints);
    this.char.setSkin(this.save.data.skin);
    this.char.onStep = () =>
      this.audio.step(Math.hypot(this.char.vel.x, this.char.vel.z) / this.char.maxSpeed);
    this.scene.add(this.char.group);

    this.fx = new PaperFX(this.renderer, this.scene, this.camera);
    this.fx.setPaperSeed(3);
    this.input = new Input(this.renderer.domElement, this.ui.joyEl);
    this.poi = new POIManager(this.camera, this.ui.labelRoot, this.ui.promptEl);
    // a label is written over the place it names, and the place has a
    // height now
    this.poi.groundAt = (x, z) => this.terrain.heightAt(x, z);

    // every point of interest exists from the start; distance hides them
    for (const def of ALL_POIS) {
      const note = def.note;
      this.poi.add({
        ...def,
        onInteract: note
          ? () => {
              this.audio.init();
              this.audio.note();
              this.save.readNote(def.label ?? note.title);
              this.ui.openNote(note.title, note.body);
            }
          : def.onInteract,
      });
    }

    this.input.onInteract(() => {
      if (this.ui.noteOpen) {
        this.ui.closeNote();
        return;
      }
      if (this.ui.mapOpen) {
        this.ui.closeMap();
        return;
      }
      this.activePoi?.def.onInteract?.();
    });
    this.ui.onPromptClick = () => this.activePoi?.def.onInteract?.();

    this.ui.onToggleSound = () => {
      this.audio.init();
      const m = !this.audio.muted;
      this.audio.setMuted(m);
      this.save.data.muted = m;
      this.save.persist();
      return m;
    };
    this.audio.muted = this.save.data.muted;
    this.ui.setSoundLabel(this.audio.muted);

    this.ui.onOpenMap = () =>
      renderMap({
        discovered: this.save.data.discovered,
        here: this.started ? [this.char.pos.x, this.char.pos.z] : null,
        walked: this.save.data.walked,
      });

    this.ui.onBegin = () => this.start(true);
    this.ui.onContinue = () => this.start(false);

    // stand the walker somewhere sensible under the title
    const startPos = this.save.data.pos ?? SPAWN;
    this.char.teleport(startPos.x, startPos.z);
    this.region = regionAt(startPos.x, startPos.z);
    this.world.ensure(this.region.id);
    this.world.inkImmediate(this.region.id);
    this.snapCamera();

    // region builders speak to the mixer without a plumbing run:
    // proximity motions (pigeons put up, the rook parliament breaking)
    // fire their own one-shots through this bridge
    window.addEventListener('inklands:event', (e) => {
      if (this.started) this.audio.event((e as CustomEvent<string>).detail);
    });

    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.renderer.setAnimationLoop(() => this.tick());

    if (location.search.includes('debug')) {
      (window as unknown as Record<string, unknown>).__inklands = {
        char: this.char,
        cam: this.camera,
        input: this.input,
        audio: this.audio,
        save: this.save,
        terrain: this.terrain,
        scene: this.scene,
        renderer: this.renderer,
        region: () => this.region.id,
        goto: (x: number, z: number) => {
          this.char.teleport(x, z);
          this.char.setGround(
            this.terrain.heightAt(x, z), this.terrain.normalAt(x, z)
          );
          this.snapCamera();
        },
        /**
         * What one frame COSTS, in milliseconds, from here.
         *
         * The 60fps law (QUALITY-BAR §3) needs a number, and rAF cadence
         * cannot give one in a headless sandbox with no GPU — it reports
         * whatever the compositor felt like (it reported 1 fps). So this
         * renders n frames back to back and blocks on the pipeline so
         * the measurement includes the GPU, and reports draw calls and
         * triangles with it. The absolute figure is a software
         * rasteriser's, not a phone's; the RATIO between two builds, and
         * the counts beside it, are the useful numbers.
         */
        frameCost: (frames = 30) => {
          const gl = this.renderer.getContext();
          this.fx.render(0.016);
          gl.finish();
          const t0 = performance.now();
          for (let i = 0; i < frames; i++) this.fx.render(0.016);
          gl.finish();
          const ms = (performance.now() - t0) / frames;
          // the composer's last pass is a fullscreen quad, so read the
          // counts from a direct scene render instead of from it
          this.renderer.setRenderTarget(null);
          this.renderer.render(this.scene, this.camera);
          const r = this.renderer.info.render;
          return { ms, calls: r.calls, tris: r.triangles };
        },
        begin: () => this.start(this.save.data.pos === null),
      };
    }

    this.bootLoader();
  }

  private bootLoader() {
    const state = { t: 0 };
    gsap.to(state, {
      t: 1,
      duration: 1.9,
      ease: 'power2.inOut',
      onUpdate: () => this.ui.setProgress(state.t),
      onComplete: () => {
        // sequence, don't overlap: the loader lets go of the page
        // completely before the title is lettered onto it
        this.ui.hideLoader();
        gsap.delayedCall(0.75, () => this.ui.showTitle(this.save.data.pos !== null));
      },
    });
  }

  private start(fresh: boolean) {
    this.audio.init();
    this.ui.hideTitle();
    if (fresh) {
      this.char.teleport(SPAWN.x, SPAWN.z);
      this.snapCamera();
    }
    this.started = true;
    this.region = regionAt(this.char.pos.x, this.char.pos.z);
    this.audio.setMood(this.region.id);
    const newLand = this.save.discover(this.region.id);
    this.ui.showRegionCard(this.region.kicker, this.region.name);
    if (fresh || newLand) {
      this.ui.showHint(
        'ontouchstart' in window
          ? 'drag to walk — tap things to look'
          : 'wasd to walk — E to look — M for the map',
        6000
      );
    }
  }

  /** Region logic on every crossing: card, mood, discovery, the wave. */
  private crossInto(spec: RegionSpec) {
    this.region = spec;
    this.audio.setMood(spec.id);
    if (this.started) {
      this.ui.showRegionCard(spec.kicker, spec.name);
      this.save.discover(spec.id);
    }
  }

  /** What the ground does to a step, and whether it takes the mark. */
  private surfaceTick() {
    const x = this.char.pos.x;
    const z = this.char.pos.z;
    const water = this.terrain.waterAt(x, z);
    let zone: StepZone;
    if (this.terrain.onPlanks(x, z, -1)) zone = 'hollow';
    else if (water > 0.12) zone = 'wet';
    else if (this.terrain.roadAt(x, z)) zone = 'paper';
    else zone = this.region.step;
    this.audio.setStepZone(zone);
    // wet paper takes no ink
    this.char.stamping = water < 0.12;
  }

  private resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
    this.fx.setSize(w, h, dpr);
    this.camera.aspect = w / h;
    this.camera.fov = this.camRig().fov;
    this.camera.updateProjectionMatrix();
  }

  /* ================================================================ *
   * THE CAMERA — a designed system (Session 4).
   *
   * Session 3 discovered the FRAME-TOP CEILING: at 33 units out the
   * shipping camera showed about ten units of height, so any tall near
   * thing filled the upper frame and hid everything behind it. That
   * ceiling was never chosen — it fell out of three constants in an
   * offset function. Elevation broke it outright: a keep standing on a
   * ridge thirteen units up is simply not in frame under those numbers.
   *
   * So the camera has parameters now, and each one is a design decision
   * with a reason:
   *
   *   back / up / look   the resting framing. `look` is the height the
   *                      camera aims at ABOVE THE WALKER'S GROUND, and
   *                      it is what sets the ceiling: the shallower the
   *                      declination, the more sky-side frame there is
   *                      for tall things to occupy.
   *   rise{Back,Up,Look} RISING GROUND MUST REVEAL MORE — and the way
   *                      to reveal more is DISTANCE, not pitch. Pitching
   *                      up to catch a keep on a ridge throws the walker
   *                      out of the bottom of the frame; pulling BACK
   *                      and up raises the frame top at every distance
   *                      while keeping the same angle down to the
   *                      walker. So the camera reads the ground ahead
   *                      and, when a landform is up there, retreats: the
   *                      vista shot is a wider shot, which is what it is
   *                      in every film ever made. All three terms are
   *                      zero on flat ground, which is what protects the
   *                      WOWED compositions of Sessions 2 and 3.
   *   fogPerUnit         HEIGHT BUYS DISTANCE. Climb and the haze pulls
   *                      back: the curled rim and the castle ridge are
   *                      vistas because you can see further from them.
   *
   * And it must not make anyone seasick. Three dampers do that: the
   * ground is sampled as a small disc average rather than a point, the
   * vertical follow runs slower than the horizontal one, and the rise
   * term is damped slower still so cresting a fold is a swell, not a
   * jolt.
   * ================================================================ */
  private static CAM = {
    /** Resting framing: how far back, how high, and what height it aims
     *  at over the walker's own ground. Portrait is NOT desktop with a
     *  wider lens — a tall frame wants the camera further back and its
     *  aim higher, or a vista arrives as a strip of ground and haze. */
    desktop: { back: 13.0, up: 6.0, look: 3.4, fov: 42 },
    portrait: { back: 14.4, up: 6.9, look: 4.0, fov: 54 },
    /** The poster, before you set out. */
    posterDesktop: { back: 15.2, up: 6.4, look: 5.0, fov: 42 },
    posterPortrait: { back: 16.6, up: 7.0, look: 5.8, fov: 54 },
    /** Where the camera looks for ground worth revealing. */
    aheadNear: 34,
    aheadMid: 60,
    aheadFar: 88,
    riseCap: 14,
    /** Per unit of ground rising ahead: how far the camera retreats,
     *  how much it climbs, and how much its aim climbs. Solved, not
     *  guessed — see design/critiques/critique-art-3.md: they put the
     *  walker a quarter up the frame and Greyweather's keep two-thirds
     *  up it from the foot of the banner avenue. */
    riseBack: 0.90,
    riseUp: 0.52,
    riseLook: 0.38,
    /** Never let the camera end up inside a scarp it is climbing. */
    clearance: 2.8,
    /** The horizon, and what a climb adds to it. */
    fogNear: 50,
    fogFar: 175,
    fogPerUnit: 3.6,
  };

  private camRig() {
    const C = App.CAM;
    const portrait = this.camera.aspect < 0.8;
    if (!this.started) return portrait ? C.posterPortrait : C.posterDesktop;
    return portrait ? C.portrait : C.desktop;
  }

  private snapCamera() {
    this.camTarget.copy(this.char.pos);
    this.camGround = this.terrain.smoothHeightAt(this.char.pos.x, this.char.pos.z);
    this.camRise = this.riseAhead(this.char.pos.x, this.char.pos.z, this.camGround);
    const rig = this.camRig();
    const C = App.CAM;
    this.camera.position.set(
      this.char.pos.x,
      this.camGround + rig.up + this.camRise * C.riseUp,
      this.char.pos.z + rig.back + this.camRise * C.riseBack
    );
    this.camera.lookAt(
      this.char.pos.x,
      this.camGround + rig.look + this.camRise * C.riseLook,
      this.char.pos.z
    );
    this.applyFog();
  }

  /**
   * How much higher the page gets in front of you. The camera always
   * looks north, so "ahead" is three probes up the −Z axis: near enough
   * to answer a fold, far enough to answer a ridge. Only rises count —
   * walking toward a hole should not tip the camera into the ground.
   */
  private riseAhead(x: number, z: number, here: number) {
    const C = App.CAM;
    const t = this.terrain;
    const up = Math.max(
      t.smoothHeightAt(x, z - C.aheadNear),
      t.smoothHeightAt(x, z - C.aheadMid),
      t.smoothHeightAt(x, z - C.aheadFar)
    );
    return Math.max(0, Math.min(C.riseCap, up - here));
  }

  /** Height buys distance: the haze pulls back as you climb. */
  private applyFog() {
    const C = App.CAM;
    const lift = Math.max(0, this.camGround) * C.fogPerUnit;
    const fog = this.scene.fog as THREE.Fog;
    fog.near = C.fogNear + lift * 0.28;
    fog.far = C.fogFar + lift;
    this.camera.far = Math.max(320, fog.far * 1.7);
    this.camera.updateProjectionMatrix();
  }

  private tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed += dt;

    this.input.update();
    this.char.frozen = this.ui.noteOpen || this.ui.mapOpen || !this.started;

    this.prevPos.copy(this.char.pos);
    // the grade the walker is about to climb, read BEFORE the step so
    // the cost applies to the step that pays it
    const spd = Math.hypot(this.char.vel.x, this.char.vel.z);
    if (spd > 0.2) {
      const ax = this.char.pos.x + (this.char.vel.x / spd) * 2.2;
      const az = this.char.pos.z + (this.char.vel.z / spd) * 2.2;
      this.char.grade = (this.terrain.heightAt(ax, az) - this.char.pos.y) / 2.2;
    } else {
      this.char.grade = 0;
    }
    this.char.update(dt, this.input.move);

    // deep water refuses the walker: slide along the shore if we can
    if (this.terrain.blockedAt(this.char.pos.x, this.char.pos.z)) {
      const nx = this.char.pos.x;
      const nz = this.char.pos.z;
      if (!this.terrain.blockedAt(nx, this.prevPos.z)) {
        this.char.pos.z = this.prevPos.z;
        this.char.vel.z = 0;
      } else if (!this.terrain.blockedAt(this.prevPos.x, nz)) {
        this.char.pos.x = this.prevPos.x;
        this.char.vel.x = 0;
      } else {
        this.char.pos.copy(this.prevPos);
        this.char.vel.set(0, 0, 0);
      }
      this.char.group.position.copy(this.char.pos);
    }

    // and then stands on whatever the page does there
    this.char.setGround(
      this.terrain.heightAt(this.char.pos.x, this.char.pos.z),
      this.terrain.normalAt(this.char.pos.x, this.char.pos.z)
    );

    const moved = Math.hypot(
      this.char.pos.x - this.prevPos.x,
      this.char.pos.z - this.prevPos.z
    );
    if (this.started) this.save.data.walked += moved;

    this.prints.update(dt);
    this.terrain.update(dt);
    this.world.tick(dt, this.elapsed, this.char.pos.x, this.char.pos.z, this.region.id);

    const here = regionAt(this.char.pos.x, this.char.pos.z);
    if (here.id !== this.region.id) this.crossInto(here);
    this.surfaceTick();

    // land ambience: each land gets its one voice (Session 8 will
    // generalize this into the score)
    if (this.started) {
      this.ambientAcc -= dt;
      if (this.ambientAcc <= 0) {
        if (this.region.id === 'meadow') {
          const nearWell = Math.hypot(this.char.pos.x + 57, this.char.pos.z - 45) < 8;
          this.audio.event(nearWell && Math.random() > 0.45 ? 'well-plink' : 'lark');
          this.ambientAcc = 9 + Math.random() * 13;
        } else if (this.region.id === 'kingdom') {
          const nearSquare = Math.hypot(this.char.pos.x + 45, this.char.pos.z + 82) < 16;
          if (nearSquare && Math.random() > 0.35) {
            this.audio.event('market-murmur');
            this.ambientAcc = 10 + Math.random() * 10;
          } else {
            this.audio.event('brim-bell');
            this.ambientAcc = 26 + Math.random() * 22;
          }
        } else if (this.region.id === 'castle') {
          if (Math.random() < 0.7) {
            this.audio.event('banner-snap');
            this.ambientAcc = 6 + Math.random() * 8;
          } else {
            this.audio.event('rook-caw');
            this.ambientAcc = 15 + Math.random() * 15;
          }
        } else if (this.region.id === 'beach') {
          /* THE SEA GETS LOUDER AS YOU APPROACH IT, and that is the
           * cheapest and truest place-sound available to this game: the
           * gap between breakers is a function of how far the walker is
           * from the water. On the dune it is a distant hush every nine
           * seconds; standing in the wrack it is every three. */
          const toSea = Math.max(0, this.char.pos.x - coastX(this.char.pos.z));
          const near = Math.max(0, Math.min(1, 1 - toSea / 46));
          if (Math.random() > 0.82) {
            this.audio.event('gull-cry');
            this.ambientAcc = 5 + Math.random() * 9;
          } else {
            this.audio.event('surf-break');
            this.ambientAcc = 3.0 + (1 - near) * 6.5 + Math.random() * 2.6;
          }
        } else if (this.region.id === 'ocean') {
          /* Out on the bar the surf is BEHIND you, so it comes at long
           * gaps; what is close is the mark's bell and, off the
           * moorings, somebody's halyards. */
          const onBar = barDist(this.char.pos.x, this.char.pos.z) < 22;
          const toMark = Math.hypot(this.char.pos.x + 308, this.char.pos.z + 36);
          const roll = Math.random();
          if (onBar && toMark < 62 && roll > 0.42) {
            this.audio.event('bell-buoy');
            this.ambientAcc = 7 + Math.random() * 8;
          } else if (roll > 0.24) {
            this.audio.event('halyard');
            this.ambientAcc = 8 + Math.random() * 11;
          } else {
            this.audio.event('surf-break');
            this.ambientAcc = 9 + Math.random() * 9;
          }
        } else {
          this.ambientAcc = 5;
        }
      }
    }

    if (this.started) {
      this.activePoi = this.poi.update(this.char.pos);
      this.persistAcc += dt;
      if (this.persistAcc > 4) {
        this.persistAcc = 0;
        this.save.data.pos = { x: this.char.pos.x, z: this.char.pos.z };
        this.save.persist();
      }
    }

    /* ---- the follow ------------------------------------------------ *
     * Horizontal: damped, with a little lead in the direction of travel.
     * Vertical: slower, off a disc-averaged ground, so cockle never
     * reaches the frame. Rise: slower still, so cresting the castle
     * ramp opens the frame as a swell rather than a jolt. */
    const lead = 0.5;
    const tx = this.char.pos.x + this.char.vel.x * lead;
    const tz = this.char.pos.z + this.char.vel.z * lead;
    const k = 1 - Math.exp(-dt * 3.2);
    this.camTarget.x += (tx - this.camTarget.x) * k;
    this.camTarget.z += (tz - this.camTarget.z) * k;

    const C = App.CAM;
    const rig = this.camRig();
    const groundNow = this.terrain.smoothHeightAt(this.camTarget.x, this.camTarget.z);
    this.camGround += (groundNow - this.camGround) * (1 - Math.exp(-dt * 2.0));
    const riseNow = this.riseAhead(this.camTarget.x, this.camTarget.z, groundNow);
    this.camRise += (riseNow - this.camRise) * (1 - Math.exp(-dt * 1.1));

    const camX = this.camTarget.x;
    const camZ = this.camTarget.z + rig.back + this.camRise * C.riseBack;
    // never inside the hill: on the scarp the ground behind the walker
    // can be higher than the walker is
    const camY = Math.max(
      this.camGround + rig.up + this.camRise * C.riseUp,
      this.terrain.heightAt(camX, camZ) + C.clearance
    );
    this.camera.position.x += (camX - this.camera.position.x) * k;
    this.camera.position.y += (camY - this.camera.position.y) * (1 - Math.exp(-dt * 2.4));
    this.camera.position.z += (camZ - this.camera.position.z) * k;
    this.camera.lookAt(
      this.camTarget.x,
      this.camGround + rig.look + this.camRise * C.riseLook,
      this.camTarget.z
    );
    this.applyFog();

    this.fx.render(dt);
  }
}
