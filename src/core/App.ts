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
import { Boat } from '../engine/Boat';
import {
  SPAWN, regionAt, coastX, barDist, roadCarryAt, rowableAt, BOAT_HOME,
  type RegionSpec,
} from '../world/layout';
import { clock as dayClock, LAMP_POOL, LAMP_EDGE } from '../world/daylight';
import { knowledge } from '../world/knowledge';
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
  private boat = new Boat();
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
  /** Distance rowed since the last oar stroke. */
  private oarAcc = 0;
  /** The mood intensity last sent to the mixer, and when. */
  private mixSent = -1;
  private mixAcc = 0;
  /** The horizon's colour, so it is only written when it changes. */
  private skyHex = -1;
  /** The ground the camera is standing on, damped. */
  private camGround = 0;
  /** How much higher the ground ahead is than the ground here, damped. */
  private camRise = 0;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
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
    /* The step's LEVEL is how hard the foot came down, which is the same
     * number the print is drawn with. Sprint as ink weight is not only a
     * visual: the walk cycle, the print and the step all agree, because
     * they are all readouts of one scalar (Character.effort). */
    this.char.onStep = () => {
      if (this.boat.aboard) return;
      this.audio.step(0.42 + 0.58 * this.char.effort);
    };
    this.scene.add(this.char.group);

    /* ---- THE ROWBOAT ------------------------------------------------ *
     * Found in the world and left in the world: on a fresh page it is
     * drawn up at the river mouth, and after that it is exactly where
     * the last walk left it. */
    const b = this.save.data.boat ?? BOAT_HOME;
    this.boat.setAt(b.x, b.z);
    this.scene.add(this.boat.group);

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
              /* A NOTE THAT NAMES A PLACE TELLS YOU ITS NAME. No
               * announcement, no chime: the next time the player opens
               * the map, it is written there in pencil. */
              for (const id of note.learns ?? []) knowledge.learn(id);
              this.ui.openNote(note.title, note.body);
            }
          : def.onInteract,
      });
    }

    /* THE OARS. No menu, ever (WORLD-SYSTEMS §4) — the boat is a place
     * you walk up to and a thing you take hold of, and it says so
     * through the same prompt every note in the world uses. The POI's
     * coordinates are read live, so it follows the boat around the
     * page for free. */
    this.poi.add({
      get x() { return self.boat.pos.x; },
      get z() { return self.boat.pos.y; },
      radius: 5.4,
      /* No label. A found object does not need a name plate, THE RIVER
       * MOUTH's own label is eleven units away and the two printed on
       * top of each other, and the prompt is the discovery: you walk up
       * to a boat and the world says TAKE THE OARS. */
      prompt: 'TAKE THE OARS',
      onInteract: () => this.toggleBoat(),
    } as unknown as WorldPOI);

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

    this.ui.onOpenMap = (width) =>
      renderMap({
        discovered: this.save.data.discovered,
        here: this.started ? [this.char.pos.x, this.char.pos.z] : null,
        walked: this.save.data.walked,
        width,
      });

    this.ui.onBegin = () => this.start(true);
    this.ui.onContinue = () => this.start(false);

    if (this.save.data.hour !== null) dayClock.set(this.save.data.hour);

    /* WHAT THE WALKER ALREADY KNOWS (Session 7, WORLD-SYSTEMS §6).
     * Loaded before the first frame and before the first map, because
     * the map is the record and a record that forgets is a decoration.
     * Every land already discovered is, by definition, a land whose
     * name you know — older saves get that for free. */
    knowledge.load(this.save.data.known, this.save.data.passed);
    for (const id of this.save.data.discovered) knowledge.learn(`name:${id}`);

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
        /* THE HOUR, for the harness. Every protected framing is shot at
         * two hours of the day now (QUALITY-BAR: the day cycle is not
         * done until dusk is as good as noon), and a shoot script cannot
         * wait forty real minutes for one. */
        clock: dayClock,
        setHour: (h: number, run = false) => {
          dayClock.set(h);
          dayClock.running = run;
          this.audio.setHour(h);
        },
        boat: this.boat,
        /* WHAT THE WALKER KNOWS, for the harness. The gate has to shoot
         * a wait at BOTH its states and the map at all three of its
         * registers, and neither is reachable in a shoot script's
         * lifetime by playing the game properly. */
        knowledge,
        learn: (id: string) => knowledge.learn(id),
        takeOars: () => this.toggleBoat(),
        /** Get out, wherever you are. The shoot harness needs this
         *  because `toggleBoat` correctly refuses mid-river. */
        stepOff: () => {
          if (!this.boat.aboard) return;
          this.boat.aboard = false;
          this.char.rowing = false;
          this.char.maxSpeed = App.WALK.max;
          this.char.runMult = App.WALK.run;
        },
        /** Put the boat somewhere, for the river framings. */
        putBoat: (x: number, z: number) => {
          this.boat.setAt(x, z);
          this.save.data.boat = { x, z };
        },
        carryAt: (x: number, z: number) => roadCarryAt(x, z),
        rowableAt: (x: number, z: number) => rowableAt(x, z),
        effort: () => this.char.effort,
        /** Hold a direction with the run on, the way a player would. */
        drive: (mx: number, mz: number, run = 0) => {
          this.input.hold = { x: mx, y: mz, run };
        },
        release: () => {
          this.input.hold = null;
        },
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
    knowledge.learn(`name:${this.region.id}`);
    this.ui.showRegionCard(this.region.kicker, this.region.name);
    if (fresh || newLand) {
      /* The hint IS the control list, and running is a control now
       * (WORLD-SYSTEMS §0 rule 1 forbids UI where the world can say
       * it — the world says how FAST you are going, in the trail, but
       * it cannot say which gesture produces it). */
      this.ui.showHint(
        'ontouchstart' in window
          ? 'drag to walk, further to run — tap things to look'
          : 'wasd to walk — shift to run — E to look — M for the map',
        6000
      );
    }
  }

  /* ================================================================ *
   * TAKING AND LEAVING THE OARS.
   *
   * The whole mount interface, and it is one prompt. Rule 1 of
   * WORLD-SYSTEMS §0 — no UI where the world can say it — plus §4's
   * "a mount is a place-feeling, never a menu": you walk up to a boat,
   * the world says TAKE THE OARS, and you are in it. There is nothing
   * to equip, nothing to summon and nothing to put away.
   * ================================================================ */
  private toggleBoat() {
    this.audio.init();
    if (this.boat.aboard) {
      const shore = this.landingNear(this.boat.pos.x, this.boat.pos.y);
      if (!shore) {
        // nowhere to put a foot: the world says so and says nothing else
        this.ui.showHint('nowhere to step out — row for a bank', 2600);
        return;
      }
      this.boat.aboard = false;
      this.char.rowing = false;
      this.char.maxSpeed = App.WALK.max;
      this.char.runMult = App.WALK.run;
      this.char.teleport(shore[0], shore[1], this.char.heading);
      this.char.setGround(
        this.terrain.heightAt(shore[0], shore[1]),
        this.terrain.normalAt(shore[0], shore[1])
      );
      this.audio.event('oar-ship');
      this.snapCamera();
    } else {
      if (!rowableAt(this.boat.pos.x, this.boat.pos.y)) {
        // she is up on the sand: shove her off first
        const w = this.launchNear(this.boat.pos.x, this.boat.pos.y);
        if (!w) return;
        this.boat.setAt(w[0], w[1]);
      }
      this.boat.aboard = true;
      this.char.rowing = true;
      this.char.maxSpeed = App.ROW.max;
      this.char.runMult = App.ROW.run;
      this.char.teleport(this.boat.pos.x, this.boat.pos.y, this.char.heading);
      this.oarAcc = 0;
      this.audio.event('oar');
      this.snapCamera();
    }
    this.save.data.boat = { x: this.boat.pos.x, z: this.boat.pos.y };
    this.save.persist();
  }

  /** The nearest place a foot can go, stepping out of the boat. Rings
   *  outward so you always land on the bank you rowed up to. */
  private landingNear(x: number, z: number): [number, number] | null {
    for (let rad = 2.4; rad <= 15; rad += 1.2) {
      for (let k = 0; k < 24; k++) {
        // start looking south — the camera looks north, so the bank the
        // player can actually SEE themselves stepping onto is behind
        const a = Math.PI / 2 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 12);
        const px = x + Math.cos(a) * rad;
        const pz = z + Math.sin(a) * rad;
        if (this.terrain.waterAt(px, pz) > 0.3) continue;
        if (this.terrain.blockedAt(px, pz)) continue;
        return [px, pz];
      }
    }
    return null;
  }

  /** And the nearest water deep enough to float her, shoving off. */
  private launchNear(x: number, z: number): [number, number] | null {
    for (let rad = 1.5; rad <= 16; rad += 1.0) {
      for (let k = 0; k < 28; k++) {
        const a = (k / 28) * Math.PI * 2;
        const px = x + Math.cos(a) * rad;
        const pz = z + Math.sin(a) * rad;
        if (rowableAt(px, pz)) return [px, pz];
      }
    }
    return null;
  }

  /** Region logic on every crossing: card, mood, discovery, the wave. */
  private crossInto(spec: RegionSpec) {
    this.region = spec;
    this.audio.setMood(spec.id);
    if (this.started) {
      this.ui.showRegionCard(spec.kicker, spec.name);
      this.save.discover(spec.id);
      // standing in a land is the strongest way to know its name, and
      // it is the one the map writes in ink
      knowledge.learn(`name:${spec.id}`);
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
    this.char.stamping = water < 0.12 && !this.boat.aboard;
    /* DAMP PAPER, which is not the same thing as wet paper. Wet refuses
     * the print outright (above, and it is older than this session);
     * damp takes it and lets it bloom. Running the tide line therefore
     * leaves a heavier, softer trail than running the king's road, for
     * one line of code and no new art. */
    this.char.damp = Math.max(0, Math.min(1, water / 0.12));
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
  /* ---- THE MOUNT'S NUMBERS ---------------------------------------- *
   * A rowboat is faster than a walk on its own ground and refuses
   * every other ground (WORLD-SYSTEMS §4). It is not MUCH faster —
   * a third again — because the point of the boat is that it opens a
   * route, not that it shortens one, and because the camera's follow
   * is what caps every speed in this game. */
  private static WALK = { max: 4.1, run: 1.5 };
  private static ROW = { max: 5.4, run: 1.3 };

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

  /** Height buys distance: the haze pulls back as you climb — and the
   *  hour takes some of it back, because a horizon you can see to is a
   *  daylight thing. Four-fifths at night: enough to feel, and not
   *  enough to take a vista away from anybody who climbed for it. */
  private applyFog() {
    const C = App.CAM;
    const lift = Math.max(0, this.camGround) * C.fogPerUnit;
    const fog = this.scene.fog as THREE.Fog;
    const day = dayClock.state.fogScale;
    fog.near = (C.fogNear + lift * 0.28) * day;
    fog.far = (C.fogFar + lift) * day;
    this.camera.far = Math.max(320, fog.far * 1.7);
    this.camera.updateProjectionMatrix();
  }

  private tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed += dt;

    /* ---- THE HOUR --------------------------------------------------- *
     * One advance, one grade, one fog. Everything else in the game that
     * cares what time it is — the mixer, the lamps in Brim, whatever
     * Session 7 hangs a routine on — reads `daylight.clock` directly and
     * never comes through here (see world/daylight.ts). */
    if (this.started) dayClock.advance(dt);
    const day = dayClock.state;
    this.fx.setDay(day.tint, day.value, day.lamp, LAMP_POOL, LAMP_EDGE);
    /* THE HAZE TAKES THE SUNSET (world/daylight.ts, `skyOf`). The fog
     * colour and the clear colour are the same colour and always have
     * been — the horizon is where the page stops and the light starts —
     * so setting it here tints the terrain shader's own fog, every
     * standee's fog and the sky, in one write. This is where an hour
     * declares itself from across a land. */
    if (day.fog !== this.skyHex) {
      this.skyHex = day.fog;
      (this.scene.fog as THREE.Fog).color.setHex(day.fog);
      this.renderer.setClearColor(day.fog);
    }

    this.input.update(dt);
    this.char.frozen = this.ui.noteOpen || this.ui.mapOpen || !this.started;
    this.char.runIntent = this.input.run;
    /* THE ROAD UNDER THE WALKER. Off the road it is zero and costs one
     * polyline query; on the water there is no road at all, because a
     * boat does not follow the king's road. */
    this.char.carry = this.boat.aboard
      ? { k: 0, tx: 0, tz: 0 }
      : roadCarryAt(this.char.pos.x, this.char.pos.z);

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

    /* WHAT THE PAGE REFUSES — and it refuses the exact opposite of
     * itself depending on what you are sitting in.
     *
     * On foot: deep water and ground too steep to climb, which is the
     * world's only traversal gating and which two proofs in
     * tools/check-terrain.mjs depend on (Greyweather's south scarp
     * refuses off the avenue; with the ledge fenced the Holdfast is
     * unreachable).
     *
     * Under oar: everything that is NOT the boat's own ground. That is
     * the mount rule stated as a collision test — fast on its own
     * ground, refuses every other ground — and it is what stops the boat
     * from being a key to the whole sheet. It also means the boat CANNOT
     * put anybody anywhere the walk could not already reach, because a
     * boat that grounds cannot climb out of the water; the only way out
     * of it is `landingNear`, which asks the same `blockedAt` a walker
     * does. */
    const refuses = this.boat.aboard
      ? (x: number, z: number) => !rowableAt(x, z)
      : (x: number, z: number) => this.terrain.blockedAt(x, z);
    if (refuses(this.char.pos.x, this.char.pos.z)) {
      const nx = this.char.pos.x;
      const nz = this.char.pos.z;
      if (!refuses(nx, this.prevPos.z)) {
        this.char.pos.z = this.prevPos.z;
        this.char.vel.z = 0;
      } else if (!refuses(this.prevPos.x, nz)) {
        this.char.pos.x = this.prevPos.x;
        this.char.vel.x = 0;
      } else {
        this.char.pos.copy(this.prevPos);
        this.char.vel.set(0, 0, 0);
      }
      this.char.group.position.copy(this.char.pos);
    }

    // and then stands on whatever the page does there — or sits a foot
    // down in the boat, which is where a person in a boat is
    this.char.setGround(
      this.terrain.heightAt(this.char.pos.x, this.char.pos.z) - (this.boat.aboard ? 0.34 : 0),
      this.boat.aboard ? [0, 1, 0] : this.terrain.normalAt(this.char.pos.x, this.char.pos.z)
    );

    const moved = Math.hypot(
      this.char.pos.x - this.prevPos.x,
      this.char.pos.z - this.prevPos.z
    );
    if (this.started) this.save.data.walked += moved;

    /* ---- THE BOAT ---------------------------------------------------- *
     * Aboard, the boat IS the walker's position — it is not following
     * them, it is under them. The oar stroke runs off distance travelled
     * exactly the way a footstep does, so rowing has a cadence and it is
     * the boat's own cadence: a stroke covers about four units, which is
     * three times a footfall. */
    if (this.boat.aboard) {
      this.boat.setAt(this.char.pos.x, this.char.pos.z);
      this.oarAcc += moved;
      if (this.oarAcc > 4.2) {
        this.oarAcc = 0;
        this.audio.event('oar');
      }
    }
    this.boat.update(
      dt,
      this.terrain.heightAt(this.boat.pos.x, this.boat.pos.y),
      this.char.heading,
      this.boat.aboard ? Math.hypot(this.char.vel.x, this.char.vel.z) : 0,
      this.boat.aboard || rowableAt(this.boat.pos.x, this.boat.pos.y)
    );

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

    /* ================================================================ *
     * THE SCORE ANSWERS THE PLAYER — WORLD-SYSTEMS §9, move 4.
     *
     * `Audio.setMoodIntensity` has existed since the engine was ported
     * and NOTHING IN THIS GAME HAS EVER CALLED IT. Session 6 owns
     * traversal, and traversal is the obvious caller: run and the score
     * leans in, stand still and it thins to almost nothing. The seam is
     * left exactly where Session 8 wants it — the mixer is told how hard
     * the player is going and what time it is, and it decides what to do
     * about both.
     *
     * Rate-limited on purpose: every call schedules a one-and-a-half
     * second ramp on an AudioParam, so sending one a frame would mean a
     * hundred and eighty overlapping ramps a second and a mixer that
     * never arrives anywhere. Twice a second, and only when the number
     * has actually moved, is inaudible as a step and free as a cost.
     * ================================================================ */
    if (this.started) {
      this.mixAcc += dt;
      if (this.mixAcc > 0.5) {
        this.mixAcc = 0;
        // 0.45 standing still, 1.35 flat out: the melody is a presence
        // that leans toward you rather than a level that jumps
        const want = 0.45 + 0.9 * this.char.effort;
        if (Math.abs(want - this.mixSent) > 0.04) {
          this.mixSent = want;
          this.audio.setMoodIntensity(want);
        }
        this.audio.setHour(day.hour);
      }
    }

    if (this.started) {
      // a card is up: the world's own writing stays behind it
      this.poi.suppressed = this.ui.noteOpen || this.ui.mapOpen;
      this.activePoi = this.poi.update(this.char.pos);
      /* THE ROUTES, WALKED (WORLD-SYSTEMS §6). A route is the one kind
       * of knowledge nobody in this world could tell you, because they
       * cannot cross a border and the line crosses eleven. So it is
       * marked off underfoot, on foot or under oar — rowing the river
       * IS walking it for this purpose, which is the whole point of a
       * mount. Nothing is announced when a route completes. */
      knowledge.travel(this.char.pos.x, this.char.pos.z);
      this.persistAcc += dt;
      if (this.persistAcc > 4 || knowledge.dirty) {
        this.persistAcc = 0;
        const k = knowledge.saved;
        knowledge.dirty = false;
        this.save.data.known = k.known;
        this.save.data.passed = k.passed;
        this.save.data.pos = { x: this.char.pos.x, z: this.char.pos.z };
        this.save.data.boat = { x: this.boat.pos.x, z: this.boat.pos.y };
        this.save.data.hour = dayClock.hour;
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
