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
import { Eight15 } from '../engine/Eight15';
import {
  SPAWN, POSTER, regionAt, districtAt, coastX, barDist, roadCarryAt, rowableAt, BOAT_HOME,
  LINE_STOPS, LINE_STOP_S, LINE_LENGTH,
  type RegionSpec, type District,
} from '../world/layout';
import { barriers } from '../world/barriers';
import { clock as dayClock, LAMP_POOL, LAMP_EDGE } from '../world/daylight';
import { tearX } from '../world/elevation';
import { knowledge } from '../world/knowledge';
import { things } from '../world/things';
import { events, routines, routineAt } from '../world/events';
import { drawn } from '../world/life';
import { weather, PRESETS, type WeatherKind } from '../world/weather';
import { fistStoneTexture } from '../world/textures-common';
import { MEADOW_POIS, common } from '../world/regions/meadow';
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
  /* THE 8:15 (Session 14, `THE-LINE` §4). It exists from the first
   * frame, standing in a car park at the end of the world with its
   * doors shut, and it does not move until the walker has walked the
   * line and answered enough of the twelve. Nothing announces it. */
  private train = new Eight15();
  private input: Input;
  private poi: POIManager;

  private region: RegionSpec;
  /** THE DISTRICT the walker is in, if any (Session 16), so a crossing
   *  between two districts of one land deals its own smaller card. */
  private district: District | null = null;
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
  /** The rig's commanded trail distance — see `bearing().back`. */
  private camBack = 0;
  /* ---- THE BEARING (Session 9) ------------------------------------- *
   * Radians east of due north, damped, and hard-clamped by the rig's own
   * envelope; and how much of the walker's travel is coming AT the lens,
   * damped, 0..1. Both are exactly zero for a walker standing still, and
   * `setBearing(false)` pins both at zero for the regression harness. */
  private camYaw = 0;
  private camAstern = 0;
  private bearingOn = true;
  /* ---- the harness's clock (see __inklands.step) ------------------- *
   * Null in the shipping game: `held` is only ever set from `?debug`. */
  private held = false;
  private forceDt = 0;
  private noRender = false;

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
    this.scene.add(this.train.group);

    this.fx = new PaperFX(this.renderer, this.scene, this.camera);
    this.fx.setPaperSeed(3);
    this.input = new Input(this.renderer.domElement, this.ui.joyEl);
    this.poi = new POIManager(this.camera, this.ui.labelRoot, this.ui.promptEl);
    // a label is written over the place it names, and the place has a
    // height now
    this.poi.groundAt = (x, z) => this.terrain.heightAt(x, z);
    // and how tall the page is there, so a name clears the thing it
    // names rather than printing across it (Session 9)
    this.poi.skylineAt = (x, z, r) => this.world.skylineAt(x, z, r);
    // and the chrome is in the picture too: a name may not be lettered
    // through the map button or across a region card
    this.poi.reserved = this.ui.chrome;

    // every point of interest exists from the start; distance hides them
    for (const def of ALL_POIS) {
      const verb = def.choice || def.note || def.touch || def.sit;
      /* A POI whose x/z are getters (the cart, the stone) must keep
       * them: a spread copies the VALUE at construction and the thing
       * would be nailed to where it started. So the def is handed over
       * as itself and only the interact is wrapped. */
      if (verb) {
        def.onInteract = () => this.act(def);
        if (def.sit) {
          const p = def.prompt;
          def.prompt = () => (this.seat === def ? 'STAND UP' : (typeof p === 'function' ? p() : p) ?? 'sit');
        }
      }
      this.poi.add(def);
    }

    /* THE THING IN HAND, as a place: wherever the walker is, weakly, so
     * every real place in reach beats it. Its prompt is the throw or
     * the set-down, and the key does whichever the prompt says. */
    this.poi.add({
      get x() { return self.char.pos.x; },
      get z() { return self.char.pos.z; },
      radius: 1,
      weak: true,
      get enabled() { return things.held !== null && !self.seat; },
      set enabled(_v: boolean) { /* the hand decides */ },
      prompt: () => {
        const t = things.holding;
        const name = t?.def.name ?? 'IT';
        const sp = Math.hypot(this.char.vel.x, this.char.vel.z);
        return sp < 0.6 ? `PUT DOWN ${name}` : `THROW ${name}`;
      },
      onInteract: () => this.throwHeld(),
    } as unknown as WorldPOI);

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

    /* THE SEAT. The whole of the last mount's interface, and it is one
     * prompt at an open door — the same sentence the rowboat has been
     * saying since Session 6, in the same place, for the same reason:
     * *a mount is a place-feeling, never a menu* (WORLD-SYSTEMS §4).
     * It is only ever offered while the doors are open, because that is
     * what a train is. */
    this.poi.add({
      /* `boardingPos`, never `pos`: a train you cannot board is not a
       * place you can stand, and the head of the line is the castle
       * gate. See the note on it in Eight15.ts — `diff-sheets` found
       * this one in a land this session never opened. */
      get x() { return self.train.boardingPos.x; },
      get z() { return self.train.boardingPos.z; },
      radius: 7,
      prompt: 'TAKE A SEAT',
      onInteract: () => this.toggleTrain(),
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
      // a choice card is closed by choosing, or by walking away
      if (this.ui.choiceOpen) return;
      if (this.seat) {
        this.standUp();
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
    dayClock.day = this.save.data.day ?? 0;

    /* THE HOUR, THE DAY AND THE WEATHER FROM THE ADDRESS BAR (Session
     * 17). The play sheet asks the owner to play ten minutes at three
     * hours of the day, and forty real minutes is a long wait for a
     * dusk: `?hour=19.4`, `?day=1`, `?weather=storm` set the page up
     * before the title. The weather pin is the harness's own, and it
     * holds for the whole visit; the hour and the day are the clock's
     * and run on from there. */
    {
      const q = new URLSearchParams(location.search);
      const hour = Number(q.get('hour'));
      if (q.has('hour') && Number.isFinite(hour)) dayClock.set(hour);
      const day = Number(q.get('day'));
      if (q.has('day') && Number.isFinite(day)) dayClock.day = Math.max(0, Math.floor(day));
      const w = q.get('weather');
      if (w && w in PRESETS) weather.pin(w as WeatherKind);
    }
    weather.tick();

    /* WHAT THE WALKER ALREADY KNOWS (Session 7, WORLD-SYSTEMS §6).
     * Loaded before the first frame and before the first map, because
     * the map is the record and a record that forgets is a decoration.
     * Every land already discovered is, by definition, a land whose
     * name you know — older saves get that for free. */
    knowledge.load(this.save.data.known, this.save.data.passed);
    for (const id of this.save.data.discovered) knowledge.learn(`name:${id}`);
    /* AND WHERE THE THINGS ARE (Session 15). A pushed cart is where it
     * was left; a thrown stone is where it landed; a stone down the
     * well is gone until the morning. */
    things.load(this.save.data.things ?? {});

    /* Stand the walker under the title: where the last walk left them,
     * or — on a fresh page — at THE POSTER, which is the composition the
     * title has been since Session 2 and is not where they wake
     * (`layout.POSTER` and `SPAWN`, and `start` below). */
    const startPos = this.save.data.pos ?? POSTER;
    this.char.teleport(startPos.x, startPos.z);
    this.region = regionAt(startPos.x, startPos.z);
    this.district = districtAt(startPos.x, startPos.z);
    this.world.ensure(this.region.id);
    this.world.inkImmediate(this.region.id);
    this.snapCamera();

    // region builders speak to the mixer without a plumbing run:
    // proximity motions (pigeons put up, the rook parliament breaking)
    // fire their own one-shots through this bridge
    window.addEventListener('inklands:event', (e) => {
      if (this.started) this.audio.event((e as CustomEvent<string>).detail);
    });

    /* THE RUN, TAUGHT BY NECESSITY (Session 16). The bull's charge is
     * the first time the game asks the walker to run somewhere
     * specific, so the one hint the game is allowed to print prints
     * NOW, if this player has never been told — and Session 12's rule
     * (six seconds of walking, once ever) stays for a save that wakes
     * somewhere else. */
    window.addEventListener('inklands:run-now', () => {
      if (!this.started || this.save.data.taughtRun || this.input.hold !== null) return;
      this.save.data.taughtRun = true;
      this.save.persist();
      this.ui.showHint('ontouchstart' in window ? 'drag further to run' : 'hold shift to run', 3400);
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
        /* THE WORLD, and specifically its SKYLINE (Session 9's grid of
         * how tall the page is at a point). Session 13 needs it from
         * outside: `THE-LINE.md` §3.2 protects a two-hundred-unit
         * sightline up the king's road, and the only way to assert that
         * nothing tall is standing in it is to ask the world how tall
         * it is along it — which it already knows, for free, because
         * every one-off standee in the game records its top as it is
         * built. `tools/check-sightline.mjs` is the assertion. */
        world: this.world,
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
        /* THE 8:15, FOR THE HARNESS. The ending is knowledge plus an
         * hour, and neither is reachable in a shoot script's lifetime by
         * playing the game properly: the gate has to see the train
         * arrive, the doors open, a platform with somebody on it and a
         * platform without. `run` starts it from the gate; `warp` puts
         * it at a stop with a load in its windows. Nothing here is
         * reachable from the game. */
        train: this.train,
        runTheLine: () => {
          this.train.s = -40;
          this.train.stop = 0;
          this.train.carrying = 0;
          this.train.phase = 'running';
        },
        warpTrain: (stop: number, carrying = 0) => {
          this.train.stop = Math.max(0, Math.min(LINE_STOPS.length - 1, stop));
          this.train.s = LINE_STOP_S[this.train.stop];
          this.train.carrying = carrying;
          this.train.phase = 'dwelling';
          (this.train as unknown as { dwellLeft: number }).dwellLeft = 9999;
        },
        rideTheLine: () => this.toggleTrain(),
        /** Put it back where it was before it ever came, and put the
         *  walker back on their feet. A shoot list has to be able to
         *  un-spend the reveal between framings. */
        hideTrain: () => {
          if (this.train.aboard) {
            this.train.aboard = false;
            this.char.rowing = false;
            this.char.maxSpeed = App.WALK.max;
            this.char.runMult = App.WALK.run;
          }
          this.train.phase = 'away';
          this.train.s = 0;
          this.train.stop = 0;
          this.train.carrying = 0;
        },
        /** And park it at the end of the line with its doors shut. */
        parkTrain: () => {
          this.train.phase = 'ended';
          this.train.stop = LINE_STOPS.length;
          this.train.s = LINE_LENGTH;
        },
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
          this.standUp();
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
        begin: () => this.start(this.save.data.pos === null, false),
        /* THE OPENING (Session 16): the bull, the gate, Nell and the
         * goat, for `check-verbs` and the proofs sheet. */
        common,
        barriers,
        districtAt,
        /* THE WEATHER, FOR THE HARNESS (Session 17). `setWeather('rain')`
         * pins a preset; `setWeather(null)` gives it back to the clock.
         * Every existing sheet shoots on day zero at noon or at 19.6,
         * which the clock keeps calm, so nothing that was pinned before
         * this session moved. */
        weather,
        /* EVERYTHING ALIVE, for `check-fields` (Session 17): every
         * figure and creature reports whether it should be on the page
         * and whether it is, and every routine says where it should
         * be, so the tool can drive the hours a drawing changes at. */
        life: { drawn: () => drawn.map((d) => d.report()), routines, routineAt },
        setWeather: (k: WeatherKind | null) => weather.pin(k),
        setDay: (d: number) => { dayClock.day = d; weather.tick(); },

        /* ================================================================ *
         * THE HARNESS OWNS THE CLOCK (Session 9).
         *
         * Every contact sheet in this project has been shot by waiting a
         * number of MILLISECONDS and pressing the shutter, and that was
         * always a lie: this sandbox renders at about three and a half
         * frames a second, so a 650 ms settle is four frames, and four
         * frames is a tenth of a second of game time. Two shots of the
         * same framing a week apart were never the same picture, which is
         * exactly why "unregressed" has meant a person looking at two
         * pictures rather than a number.
         *
         * FIVE things move on their own between two shutter presses and
         * every one of them is in every pixel — and the last two were
         * found by the diff itself rather than before it:
         *   · the paper pass's grain and its hand-drawn wobble, which are
         *     hashed off `uTime` and re-seeded three times a second — a
         *     one-pixel random resample of every ink edge in the frame;
         *   · the standee wind, which is `sin(uTime · f)` in the vertex
         *     stage of every field in the world;
         *   · the ink-in cascade, which travels 34 units a second from
         *     wherever the walker first stood in a land, so a frame shot
         *     early catches the page half drawn;
         *   · the walker's own quiet breath, eight parts in a thousand
         *     of its height — a third of a pixel, and exactly enough to
         *     redraw an outline;
         *   · and the WATER, the one animation in the sheet's own
         *     shader, which made the four coast framings the only ones
         *     in the regression set that could not be reproduced.
         *
         * So the harness stops asking for wall clock and asks for GAME
         * TIME instead: pin the clock to a stated instant, step the
         * simulation a stated number of fixed ticks, and render only the
         * last one. The settle costs one frame instead of hundreds — a
         * twelve-second settle is now cheaper than the old 650 ms one —
         * and, far more usefully, two runs of the same framing on two
         * builds are the SAME PICTURE, which is what makes
         * `tools/diff-sheets.mjs` a gate instead of an opinion.
         * ================================================================ */
        setTime: (t: number) => {
          this.elapsed = t;
          this.fx.setTime(t);
          this.char.setClock(t);
          this.terrain.setTime(t);
        },
        /** Step the world `n` times at a fixed dt, rendering only the
         *  last. The animation loop holds the frame afterwards. */
        step: (dt: number, n: number) => {
          this.held = true;
          for (let i = 0; i < n; i++) {
            this.noRender = i < n - 1;
            this.forceDt = dt;
            this.tick();
          }
          this.noRender = false;
        },
        /** Give the clock back to the animation loop. */
        resume: () => {
          this.held = false;
          this.clock.getDelta();
        },

        /* ---- THE BEARING, PINNED ------------------------------------ *
         * WORLD-SYSTEMS §2: "the shoot harness pins yaw to zero, every
         * existing contact sheet re-shoots unchanged, and a regression is
         * a diff and not an opinion." This is that pin, and
         * `tools/shoot-lib.mjs` sets it for every sheet that does not
         * explicitly ask for the bearing. Every protected framing in this
         * project is therefore reproducible for as long as the pin
         * exists, whatever a later session does to the camera. */
        setBearing: (on: boolean) => {
          this.bearingOn = on;
          if (!on) {
            this.camYaw = 0;
            this.camAstern = 0;
          }
        },
        /** Sweep the transient chrome — see UI.quiet. */
        quiet: () => this.ui.quiet(),
        /* ---- THE VERBS, for the harness (Session 15) ------------------ */
        things,
        events,
        /** The key, exactly as the player presses it: a note closes, a
         *  seat stands, and otherwise the nearest prompt's verb. The
         *  first version called the verb directly and the session's
         *  contact sheet photographed a note that a press had left
         *  open three framings earlier. */
        press: () => this.input.fireInteract(),
        promptText: () => {
          const p = this.activePoi?.def.prompt;
          return typeof p === 'function' ? p() : p ?? null;
        },
        seated: () => this.seat !== null,
        standUp: () => this.standUp(),
        /** Pick option `i` on an open choice card, as a thumb would. */
        choose: (i: number) => {
          const btns = document.querySelectorAll<HTMLButtonElement>('.choice-btn');
          btns[i]?.click();
        },
        choiceOpen: () => this.ui.choiceOpen,
        /** Open the longest card in the game, for the chrome sheet. */
        openChoice: (title: string, body: string, options: string[]) =>
          this.ui.openChoice(title, body, options, () => {}),
        holding: () => things.held,
        /** Hold a peek, for the bearing sheet: −1 hard left, +1 right. */
        peek: (v: number | null) => {
          this.input.holdPeek = v;
        },
        /** What the camera is actually doing, in degrees off north and in
         *  0..1 of astern. The proof that a stopped walker comes home. */
        bearing: () => ({
          yaw: (this.camYaw * 180) / Math.PI,
          astern: this.camAstern,
          peek: this.input.peek,
          /* HOW FAR THE RIG IS TRAILING (Session 12). The distinction
           * is the whole of the dolly assertion: the camera orbits the
           * aim point, and the aim point leads the walker, so a peek
           * moves the camera nearer to and further from the WALKER
           * without the rig dollying at all, and the LEAD lurches the
           * camera-to-aim-point distance on every change of direction.
           * Measured either of those ways a turn reads as a dolly, and
           * a check that
           * cannot tell a turn from a dolly cannot hold a ceiling on
           * either. So this is the rig's own COMMANDED trail distance —
           * `rig.back` plus the rise retreat plus the astern retreat —
           * which is the dolly and nothing but. */
          back: this.camBack,
        }),
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

  private start(fresh: boolean, blink = true) {
    this.ui.hideTitle();
    if (fresh) {
      /* YOU WAKE IN LONG GRASS. The poster is one place and the spawn is
       * another (`layout.POSTER`, `SPAWN`), and the cut between them is
       * a blink of paper so it reads as eyes shutting and opening rather
       * than the world jumping. The harness skips the blink and cuts. */
      const wake = () => {
        this.char.teleport(SPAWN.x, SPAWN.z);
        this.snapCamera();
        this.region = regionAt(SPAWN.x, SPAWN.z);
        this.district = districtAt(SPAWN.x, SPAWN.z);
      };
      if (blink) {
        this.ui.blink(wake);
        // the walker holds still until the eyes are open
        this.char.frozen = true;
      } else wake();
    }
    this.started = true;
    this.region = regionAt(this.char.pos.x, this.char.pos.z);
    this.district = districtAt(this.char.pos.x, this.char.pos.z);
    /* THE MOOD BEFORE THE CONTEXT, and the order matters from Session 8.
     * `setMood` with no context yet just records which land this is;
     * `init` then builds THAT land's room. The other way round, a save
     * loaded in Greyweather opens with three and a half seconds of the
     * Common's room fading out — a place the player is not in, as the
     * first thing they hear. */
    this.audio.setMood(this.region.id);
    this.audio.init();
    const newLand = this.save.discover(this.region.id);
    knowledge.learn(`name:${this.region.id}`);
    this.ui.showRegionCard(this.region.kicker, this.region.name,
      { sub: this.district?.name.toLowerCase() });
    if (fresh || newLand) {
      /* THE HINT IS THE CONTROL LIST AND IT WAS TOO LONG TO BE ONE.
       * Session 12 took the run out of it: five items fired once for
       * six seconds on the frame a player walks into a new land is a
       * list nobody reads, and the owner proved it by not finding the
       * run at all. The run is taught on its own, at the moment it is
       * worth having (`teachTheRun`); what is left here is what you
       * need in the first ten seconds of a place, and it is four
       * things instead of five. */
      this.ui.showHint(
        'ontouchstart' in window
          ? 'drag to walk — two fingers to lean — tap to look'
          : 'wasd to walk — E to look — , . to lean — M for the map',
        6000
      );
    }
  }

  /* ================================================================ *
   * THE VERBS ON ONE KEY (Session 15, `THE-FUN-PASS` §5).
   *
   * The key that looks is the key that touches, carries, sits and
   * throws. What it does depends on what is in reach, and the prompt
   * says which; this is the dispatch, in the order a place's fields
   * are read: a CHOICE not yet taken, then a NOTE, then a TOUCH, then a
   * SIT. A player who never touches anything walks up to the same
   * places, reads the same prompts, and opens the same notes as they
   * did in Session 14 — nothing here changes a look.
   * ================================================================ */
  private seat: WorldPOI | null = null;
  private seatDy = 0;
  private handShown = false;
  /** The stone's drawing, for the hand. */
  private handTex = fistStoneTexture(452);

  private act(def: WorldPOI) {
    this.audio.init();
    if (def.choice) {
      const taken = def.choice.options.some((o) => knowledge.has(o.door));
      if (!taken) {
        const c = def.choice;
        this.audio.note();
        this.ui.openChoice(
          def.note?.title ?? (def.label ?? '').toLowerCase(), c.body,
          c.options.map((o) => o.label),
          (i) => {
            /* THE DOOR IS A PIECE OF KNOWLEDGE and nothing else: one id,
             * readable, permanent, read back by the land every frame.
             * No announcement, no chime, no "you chose". */
            knowledge.learn(c.options[i].door);
            for (const id of c.learns ?? []) knowledge.learn(id);
            this.save.readNote(def.label ?? '');
          }
        );
        return;
      }
    }
    const note = def.note;
    if (note) {
      this.audio.note();
      this.save.readNote(def.label ?? note.title);
      /* A NOTE THAT NAMES A PLACE TELLS YOU ITS NAME. No announcement,
       * no chime: the next time the player opens the map, it is
       * written there in pencil. */
      for (const id of note.learns ?? []) knowledge.learn(id);
      this.ui.openNote(note.title, typeof note.body === 'function' ? note.body() : note.body);
      return;
    }
    if (def.touch) {
      // seen as well as heard: the figure rocks back on every touch
      this.char.recoil();
      def.touch(this.char.pos.x, this.char.pos.z);
      return;
    }
    if (def.sit) this.sitDown(def);
  }

  /* ================================================================ *
   * SIT. The walker is put on the seat, facing the camera, and holds
   * still; THE CAMERA DOES NOT MOVE — a seated walker is a stopped
   * walker and a stopped walker is due north by contract (`check-
   * camera`, and `check-verbs` asserts it for this state too). Time
   * passes: the day runs at six times its walking pace while you sit,
   * so Joan comes to the table in twenty seconds instead of two
   * minutes and dusk arrives on the king while you watch. Any step, or
   * the key again, stands you up.
   * ================================================================ */
  private static SIT_TIME = 6;
  private sitDown(def: WorldPOI) {
    if (!def.sit || this.boat.aboard || this.train.aboard) return;
    const sx = def.sit.x;
    const sz = def.sit.z;
    this.char.teleport(sx, sz, this.char.heading);
    this.char.setGround(this.terrain.heightAt(sx, sz), this.terrain.normalAt(sx, sz));
    this.char.setSitting(true);
    this.seat = def;
    for (const id of def.sit.learns ?? []) knowledge.learn(id);
  }

  private standUp() {
    if (!this.seat) return;
    this.char.setSitting(false);
    this.seat = null;
  }

  /* ================================================================ *
   * THROW — or set down, which is a throw at a standing walker. The
   * one thing in hand goes underarm along the heading: a stride and a
   * bit standing still, six units at a run. Continuous, like the run,
   * and no second control. The landing is the world's to answer:
   * `things.ts` clamps it inside the thing's own land before it flies.
   * ================================================================ */
  private throwHeld() {
    const t = things.holding;
    if (!t) return;
    const sp = Math.hypot(this.char.vel.x, this.char.vel.z);
    const dist = 1.6 + 4.6 * Math.min(1, sp / (this.char.maxSpeed * this.char.runMult));
    things.throw_(
      this.char.pos.x, this.char.pos.z, this.char.pos.y + 0.8, this.char.heading, dist,
      (x, z) => this.terrain.heightAt(x, z)
    );
  }

  /* ================================================================ *
   * TEACHING THE RUN — AND WHY THIS IS THE ONE THING IN THE GAME THAT
   * IS ALLOWED TO BE TOLD.
   *
   * Session 12. The owner played the game and could not run. Shift
   * works and has worked since Session 6 — driven on the harness clock
   * it is 4.84 units a second against 7.07, a real 1.46× — so nothing
   * was broken. What was broken is that the game said Shift existed
   * exactly once, for six seconds, in a five-item list, fired on the
   * frame the player walks into a new land, which is the one frame
   * they are certainly looking at the land instead of at a line of
   * type.
   *
   * WORLD-SYSTEMS §0 rule 1 is no UI where the WORLD can say it, and
   * the world cannot say "Shift". It can say how fast you are going —
   * that is the trail, the stride, the lean, the step and the score,
   * and Session 12 measured that the trail alone could not, because
   * the prints are laid behind the walker and the frame's bottom edge
   * is three and a half units behind them. But no drawing anywhere on
   * this page can name a key. That is why a hint exists at all, and it
   * is the whole of the licence.
   *
   * So the fix is not a louder hint, a longer hint or a legend in the
   * corner. It is TIMING: teach one control, once, at the moment it
   * becomes worth having — the first time this player has walked
   * without stopping for long enough to want to be going faster.
   *
   *  · once EVER, not once per land (`save.taughtRun`);
   *  · never if they already found it, because holding Shift at any
   *    point clears the flag without a word being printed;
   *  · never to the harness, which is not a player and does not need
   *    teaching — and which would otherwise print chrome into a
   *    protected contact sheet.
   * ================================================================ */
  private walkHeld = 0;
  private teachTheRun(dt: number) {
    if (this.save.data.taughtRun || !this.started || this.char.frozen) return;
    // the harness drives with `hold`; a player does not
    if (this.input.hold !== null) return;
    if (this.input.run > 0.15) {
      // they found it on their own. Nothing is printed, ever.
      this.save.data.taughtRun = true;
      this.save.persist();
      return;
    }
    const moving = Math.hypot(this.char.vel.x, this.char.vel.z) > 1.2;
    this.walkHeld = moving ? this.walkHeld + dt : 0;
    /* SIX SECONDS OF UNBROKEN WALKING. Long enough that this is a
     * journey and not a step off a kerb, short enough that it lands
     * inside the first minute for anybody who sets out and keeps
     * going. */
    if (this.walkHeld < 6) return;
    this.save.data.taughtRun = true;
    this.save.persist();
    this.ui.showHint(
      'ontouchstart' in window ? 'drag further to run' : 'hold shift to run',
      3400
    );
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

  /* ================================================================ *
   * GETTING ON, AND GETTING OFF.
   *
   * `THE-LINE` §4.4: **getting on is allowed, and getting on is not an
   * ending.** It is a mount — fast on its own ground and refusing every
   * other — and at the far end you step off into the car park and the
   * world is still there and you can still walk.
   *
   * The refusal is structural rather than checked: the 8:15 runs a
   * polyline and cannot leave it, so *everywhere the line is not drawn*
   * is everywhere it does not go. And getting off is only possible at a
   * stop, with the doors open, because that is what a train is.
   * ================================================================ */
  private toggleTrain() {
    this.audio.init();
    if (this.train.aboard) {
      if (!this.train.canAlight()) {
        this.ui.showHint('the doors are shut', 2200);
        return;
      }
      const p = this.train.pos;
      const shore = this.stepOffNear(p.x, p.z);
      if (!shore) return;
      this.train.aboard = false;
      this.char.rowing = false;
      this.char.maxSpeed = App.WALK.max;
      this.char.runMult = App.WALK.run;
      this.char.teleport(shore[0], shore[1], this.char.heading);
      this.char.setGround(
        this.terrain.heightAt(shore[0], shore[1]),
        this.terrain.normalAt(shore[0], shore[1])
      );
      this.snapCamera();
      return;
    }
    if (!this.train.canBoard(this.char.pos.x, this.char.pos.z)) return;
    this.train.aboard = true;
    /* The walker sits, which is the same posture the boat gave them and
     * the same reason: the carriage draws over their legs. */
    this.char.rowing = true;
    const p = this.train.pos;
    this.char.teleport(p.x, p.z, this.char.heading);
    this.snapCamera();
  }

  /** The nearest place a foot can go, stepping down onto a verge. */
  private stepOffNear(x: number, z: number): [number, number] | null {
    for (let rad = 3.4; rad <= 14; rad += 1.1) {
      for (let k = 0; k < 24; k++) {
        // south first: the camera looks north, so the ground the player
        // can see themselves stepping onto is behind them
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
      const d = districtAt(this.char.pos.x, this.char.pos.z);
      this.district = d;
      this.ui.showRegionCard(spec.kicker, spec.name, { sub: d?.name.toLowerCase() });
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
    // and a passenger leaves no prints either
    this.char.stamping = water < 0.12 && !this.boat.aboard && !this.train.aboard;
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
     *  aim higher, or a vista arrives as a strip of ground and haze.
     *
     *  `yaw` and `lead` are Session 9's, and they are per-rig for the
     *  same reason everything else here is: see THE BEARING below. */
    desktop: { back: 13.0, up: 6.0, look: 3.4, fov: 42, peekYaw: 26, lead: 4.2 },
    portrait: { back: 14.4, up: 6.9, look: 4.0, fov: 54, peekYaw: 12, lead: 2.0 },
    /** The poster, before you set out. The bearing is dead here: nobody
     *  is walking, and the poster is a composition. */
    posterDesktop: { back: 15.2, up: 6.4, look: 5.0, fov: 42, peekYaw: 0, lead: 0 },
    posterPortrait: { back: 16.6, up: 7.0, look: 5.8, fov: 54, peekYaw: 0, lead: 0 },
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

    /* ================================================================ *
     * THE BEARING (Session 9) — and the whole of it is two numbers and
     * one sentence:
     *
     *   THE PART OF YOUR TRAVEL THAT CROSSES THE FRAME TURNS THE CAMERA.
     *   THE PART THAT COMES AT THE LENS OPENS THE GROUND AT YOUR FEET.
     *
     * The owner's complaint was exact: the camera only ever looks north,
     * so walking east or west you cross the frame, and walking SOUTH you
     * walk backwards out of it into ground you cannot see — and the
     * king's road runs north–south for four hundred and eighty units.
     *
     * ---- 1. WHY THE ENVELOPE IS A NUMBER AND NOT A TUNING KNOB ------
     *
     * STANDEES ARE NOT BILLBOARDS. `makeStandee` builds a plane with a
     * fixed rotation.y and nothing in this engine turns to face the
     * camera; at the shipped bearing every cutout is square to the lens,
     * and that is the entire reason the paper metaphor reads. Turn the
     * camera and a cutout narrows by its cosine:
     *
     *   yaw    apparent width   verdict
     *    0°        100%         the shipped page
     *   12°         98%         PORTRAIT'S ENVELOPE
     *   20°         94%         free
     *   26°         90%         DESKTOP'S ENVELOPE
     *   30°         87%         survivable
     *   35°         82%         the wall — past here the paper metaphor
     *                           does not degrade, it FAILS, and it fails
     *                           looking exactly like a bug
     *   45°         71%         the world is a stack of card seen sideways
     *
     * So a free orbit is fatal and a bounded one is not, and 26° is nine
     * degrees clear of the wall.
     *
     * ---- 2. WHY PORTRAIT'S IS HALF OF IT ----------------------------
     *
     * Not for the standees — 12° costs nothing there. Because the two
     * viewports do not have the same frame to spend a turn in. Desktop
     * is 42° vertical at 16:9, which is 68.6° ACROSS. Portrait is 54°
     * vertical at 390×844, which is 26.5° across — a third of it. A yaw
     * of φ slides a distant thing across the page by tan φ / tan(½ hfov):
     *
     *   desktop, 26°:   36% of the frame's width
     *   portrait, 26°:  the whole of it, and out the side
     *   portrait, 12°:  45% of the frame's width
     *
     * And WORLD-SYSTEMS §8: the joystick must never sit under the thing
     * the player is steering toward. A tall screen's lower band belongs
     * to the thumb and its top band is the vista; a turn that carries
     * the subject off the page has taken the vista away to show you the
     * turn.
     *
     * ---- 3. WHAT ANSWERS THE WALK SOUTH, WHICH IS NOT THE YAW -------
     *
     * WORLD-SYSTEMS §2 said a bounded yaw would let you "see what is
     * coming" walking south. IT CANNOT, and the geometry is not close.
     * The camera trails the walker on the +Z side; yawing the rig 26°
     * about the walker leaves it on the +Z side. Southward travel is
     * travel AT THE LENS, and no bounded rotation puts a lens behind
     * itself.
     *
     * What you can actually see ahead of you walking south is the strip
     * of page between the walker and the bottom of the frame, and it is
     * measurable: with the camera 6 up and 13 back aiming at 3.4, the
     * frame's bottom edge meets the ground 9.5 units in front of the
     * lens — THREE AND A HALF UNITS in front of the walker. At walking
     * pace that is eight tenths of a second of warning. THAT is the
     * defect, stated as a number.
     *
     * So the answer is not a rotation, it is a RETREAT AND A DROP: when
     * travel is toward the lens the camera gives ground — it trails
     * further back and lowers its aim, which pitches the page up and
     * puts the walker high in the frame with the road they are walking
     * into laid out below them. It is the same trick as `riseBack`
     * (reveal by distance, never by pitching the subject out of frame)
     * pointed the other way. With the terms below: 9.5 units of visible
     * page ahead on desktop, 11.6 in portrait, against 3.5 and 5.7 — the
     * ground you can see yourself walking into roughly TRIPLES.
     *
     * ---- 4. AND WHY THERE IS NO COIN TOSS AT DUE SOUTH --------------
     *
     * The obvious way to write "ease toward travel" is to point the
     * camera at the travel bearing and clamp it. Do that and due south
     * is a coin toss between +26° and −26°, and a walker wobbling either
     * side of it flips a fifty-two-degree pan back and forth. That is
     * the wobble, and it is not a tuning problem, it is a discontinuity.
     *
     * Splitting travel into its two components removes it outright:
     * the yaw runs off the CROSSING component and the retreat off the
     * TOWARD-THE-LENS one. Both are continuous everywhere on the circle,
     * both are odd or even in the right way, and both are exactly zero
     * for a walker standing still — which is the clause that keeps six
     * WOWED verdicts valid, the same clause that protected them through
     * Session 4's rebuild.
     * ================================================================ */
    /* ================================================================ *
     * SESSION 12 — AND THE OWNER PLAYED IT AND IT MADE THEM SICK.
     *
     * The feel gate above was owed from Session 9 and was run for the
     * first time on 2026-08-31. It returned NOT YET, in four words:
     * "makes me kind of sick". Every check in check-camera.mjs was
     * green while that was true, because no check asked the question
     * the owner was answering — HOW FAST DOES THE FRAME TURN.
     *
     * Measured tick by tick, driving a normal circuit (north, north-
     * east, east, south-east, south, west, stop):
     *
     *                        swing    rotation   dolly    east    south
     *   as shipped          51.2°    34.7°/s   5.3 u/s   +3.2    +6.0
     *   the astern alone     0.0°     0.0°/s   5.3 u/s   +0.0    +6.0
     *   the yaw alone       51.2°    34.7°/s   2.1 u/s   +3.2    +0.0
     *
     * ("east" and "south" are the extra units of PAGE the component
     * puts in front of the walker on that heading, over a rig with the
     * bearing pinned. The 2.1 u/s left in the yaw-alone row is camRise
     * on the terrain and belongs to Session 4.)
     *
     * SO THE TWO COMPONENTS SEPARATE CLEANLY AND THE VERDICT IS
     * ARITHMETIC. The yaw is a hundred per cent of the rotation and
     * twelve per cent of the gain it was built for — it bought 3.2 more
     * units of page walking east, on top of 27 the pinned rig already
     * had, and charged a fifty-one degree swing at thirty-five degrees
     * a second for them. The astern is a hundred per cent of the walk
     * south — five units of warning to eleven, which is the defect
     * Session 9 existed to close — and it does not rotate the frame at
     * all.
     *
     * THE YAW IS THE SICKNESS AND THE ASTERN IS THE GAIN. So:
     *
     *   1. THE AUTOMATIC YAW COMES OFF BOTH RIGS. Not reduced: a small
     *      unrequested rotation is a small dose of the same thing, and
     *      at 8° it would still be buying under a unit of page. The
     *      envelope BELOW SURVIVES WHOLE — it is the PEEK'S envelope
     *      now, and every reason it is 26° and 12° is unchanged.
     *      Rotation in this game is a thing the player ASKS FOR. That
     *      is the distinction the sickness actually turns on: a large
     *      field rotating because you pressed a walking key is vection;
     *      the same rotation, at the same rate, because you are holding
     *      the key that means "look", is a head turn.
     *   2. THE ASTERN STAYS, and its ease is slowed so the rig can
     *      never give ground faster than the walker covers it —
     *      5.3 u/s to 3.4, against a walk of 4.1.
     *
     * WHAT IS LOST, STATED SO NOBODY HAS TO GUESS: the lean. Walking
     * east or west the frame no longer leans into the crossing, and
     * critique-camera-1 praised that lean. It is worth 3.2 units of
     * page out of 30.2, and it is still available on `,` and `.` — the
     * peek reaches the same 26°, from any heading, whenever a hand asks
     * for it. What is NOT lost is the walk south, which was the other
     * half of that verdict and the whole of the defect.
     * ================================================================ */
    /** Degrees off north, per rig — the table in §1 above is the reason,
     *  and it is not a knob. Since Session 12 nothing but THE PEEK ever
     *  reaches it, and nothing in this game may exceed it. */
    yawEase: 2.2,
    /** A stopped walker is in the SHIPPED composition, not asymptotically
     *  near it. Under this much the bearing is set to exactly zero. */
    yawSnap: 0.0026,
    /** How long the aim runs ahead of the walker, capped per rig by
     *  `lead` above: a lead is free, it helps east–west, and in portrait
     *  the frame is 3.4 units wide at the walker so it must be small. */
    leadSec: 0.9,
    /** Travel at the lens: how far the camera gives ground, and how far
     *  its aim drops to lay that ground out. §3 above is the reason. */
    asternBack: 5.5,
    asternLook: -1.6,
    /** SESSION 12: 1.4 GAVE GROUND FASTER THAN THE WALKER COVERED IT.
     *  At 1.4 the rig recedes at 5.3 units a second against a walk of
     *  4.1, so turning south the ground flowed backwards under a walker
     *  who was going forwards — the one part of the astern opening that
     *  was a motion nobody asked for. The ceiling is the walk itself,
     *  and 0.85 measures 3.35 on desktop and 3.38 in portrait. It costs nothing that matters:
     *  the opening is measured after six seconds of southward travel
     *  and its steady state is untouched, so the walk south still sees
     *  the same page it earned its verdict on. */
    asternEase: 0.85,
  };

  private camRig() {
    const C = App.CAM;
    const portrait = this.camera.aspect < 0.8;
    if (!this.started) return portrait ? C.posterPortrait : C.posterDesktop;
    return portrait ? C.portrait : C.desktop;
  }

  private snapCamera() {
    // a teleport has no travel, so it has no bearing: the snapped frame
    // is always the shipped composition, due north
    this.camYaw = 0;
    this.camAstern = 0;
    this.camTarget.copy(this.char.pos);
    this.camGround = this.terrain.smoothHeightAt(this.char.pos.x, this.char.pos.z);
    this.camRise = this.riseAhead(this.char.pos.x, this.char.pos.z, this.camGround, 0);
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
   * How much higher the page gets in front of you: three probes up the
   * camera's own bearing, near enough to answer a fold and far enough to
   * answer a ridge. Only rises count — walking toward a hole should not
   * tip the camera into the ground.
   *
   * SESSION 9 ANSWERED "AHEAD OF WHAT?". Until the camera could turn,
   * "ahead" was the −Z axis and the two readings were the same one. They
   * are not any more, and the probes belong to the LENS and not to the
   * walker: the rise term exists to get a landform into the frame, so
   * the ground it must read is the ground the frame is pointed at. Probe
   * up the walker's travel instead and a walker crossing a valley
   * sideways under a ridge retreats from a hill that is off-camera.
   */
  private riseAhead(x: number, z: number, here: number, yaw: number) {
    const C = App.CAM;
    const t = this.terrain;
    const s = Math.sin(yaw);
    const c = Math.cos(yaw);
    const up = Math.max(
      t.smoothHeightAt(x + C.aheadNear * s, z - C.aheadNear * c),
      t.smoothHeightAt(x + C.aheadMid * s, z - C.aheadMid * c),
      t.smoothHeightAt(x + C.aheadFar * s, z - C.aheadFar * c)
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
    /* FOG CLOSES THE VISTAS (Session 17). The haze comes in to a third
     * of its reach at the thickest, which takes every far silhouette
     * off the page — the keep from the Common, the towers from the
     * Downs — and the four lures go with it, by their own hand (the
     * Common's builder reads the same number). Rain brings it in a
     * little too, the way rain does. */
    const w = weather.state;
    const close = 1 - 0.68 * w.fog - 0.22 * w.rain * (1 - w.fog);
    fog.near = (C.fogNear + lift * 0.28) * day * close;
    fog.far = (C.fogFar + lift) * day * close;
    this.terrain.setFogCap(0.74 + 0.26 * Math.max(w.fog, w.rain * 0.5));
    this.camera.far = Math.max(320, fog.far * 1.7);
    this.camera.updateProjectionMatrix();
  }

  /* ---- THE WEATHER'S VOICES (Session 17) ---------------------------- *
   * The patter and the wind are BEDS (`Audio.setWeather`), ramped from
   * the same state the frame reads. The thunder is a crossing: one
   * strike, one thunder, a second or two after it, and never twice for
   * one flash. The gusts are the only one-shot the wind makes, and only
   * once it is up. */
  private lastFlash = -1;
  private gustAcc = 4;
  private weatherVoices(dt: number) {
    if (!this.started) return;
    const w = weather.state;
    this.audio.setWeather(w.rain, w.wind);
    if (w.flashId !== this.lastFlash) {
      this.lastFlash = w.flashId;
      if (w.flashId >= 0) this.audio.event('thunder', 0.5 + Math.random() * 1.8);
    }
    this.gustAcc -= dt;
    if (this.gustAcc <= 0) {
      this.gustAcc = 7 + Math.random() * 9;
      if (w.wind > 0.7) this.audio.event('wind-gust');
    }
  }

  private tick() {
    const real = Math.min(this.clock.getDelta(), 0.05);
    /* THE HARNESS'S CLOCK, and nothing else may touch it. Held, the
     * animation loop re-presents the frame it already drew rather than
     * advancing anything: a screenshot taken between two `step` calls is
     * the frame the last step produced, to the pixel. */
    if (this.held && this.forceDt <= 0) {
      this.fx.render(0);
      return;
    }
    const dt = this.forceDt > 0 ? this.forceDt : real;
    this.forceDt = 0;
    this.elapsed += dt;

    /* ---- THE HOUR --------------------------------------------------- *
     * One advance, one grade, one fog. Everything else in the game that
     * cares what time it is — the mixer, the lamps in Brim, whatever
     * Session 7 hangs a routine on — reads `daylight.clock` directly and
     * never comes through here (see world/daylight.ts). */
    if (this.started) dayClock.advance(dt * (this.seat ? App.SIT_TIME : 1));
    const day = dayClock.state;
    /* THE WORLD'S BUSINESS (Session 15): what is happening this hour,
     * whether or not the walker is there to see it. */
    if (this.started) events.tick(this.char.pos.x, this.char.pos.z);
    /* AND THE WEATHER (Session 17, `world/weather.ts`): one read a
     * frame, a pure function of the day and the hour, and everything
     * that answers it — the haze, the smudge pass, the fields' sway,
     * the voices — reads the same state. */
    weather.tick();
    const W = weather.state;
    this.fx.setDay(day.tint, day.value, day.lamp, LAMP_POOL, LAMP_EDGE);
    this.fx.setWeather(W.rain, W.flash);
    this.weatherVoices(dt);
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
    this.char.frozen = this.ui.noteOpen || this.ui.mapOpen || this.ui.choiceOpen || !this.started
      || this.ui.blinking;
    // a step stands you up; the prompt says so, and so does a thumb
    if (this.seat && Math.hypot(this.input.move.x, this.input.move.y) > 0.3) {
      this.standUp();
    }
    /* A SEAT THAT MOVES: the swing's plank is on a pendulum, and a
     * figure sitting rigid beside its arc was the wrong picture. The
     * seat says where it is this frame and the figure is put there. */
    if (this.seat?.sit?.follow) {
      const f = this.seat.sit.follow(this.elapsed);
      this.char.pos.x = this.seat.sit.x + f.dx;
      this.char.pos.z = this.seat.sit.z;
      this.char.sway = f.rot;
      this.seatDy = f.dy;
    } else this.seatDy = 0;
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
    /* ABOARD THE 8:15 THE WALKER DOES NOT STEER, and that is not a
     * cutscene — it is a train (`THE-LINE` §3.4 forbids a cutscene and
     * §4.4 licenses the ride). Nothing is taken: the camera is the
     * camera, the map opens, the notes open, and the doors open again
     * in half a minute at the next stop. */
    if (this.train.aboard) this.input.move.set(0, 0);
    this.char.update(dt, this.input.move);
    this.teachTheRun(dt);

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
    /* AND A FENCE (Session 16, `barriers.ts`): the long fence on the
     * Common refuses a foot everywhere but the stile and the gate, and
     * the gate shuts. Every barrier is a drawing standing in the same
     * place; there are no invisible walls. */
    const refuses = this.boat.aboard
      ? (x: number, z: number) => !rowableAt(x, z)
      : (x: number, z: number) => this.terrain.blockedAt(x, z) || barriers.blocks(x, z);
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
      this.terrain.heightAt(this.char.pos.x, this.char.pos.z) - (this.boat.aboard ? 0.34 : 0)
        + (this.seat?.sit?.lift ?? 0) + this.seatDy,
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

    /* ---- THE 8:15 --------------------------------------------------- *
     * It runs on the hour and on nothing else. Aboard, it IS the
     * walker's position, exactly the way the boat is — it is not
     * following them, they are in it. */
    this.train.update(
      dt,
      (x, z) => this.terrain.heightAt(x, z),
      this.char.pos.x, this.char.pos.z
    );
    if (this.train.aboard) {
      const tp = this.train.pos;
      this.char.teleport(tp.x, tp.z, this.char.heading);
      this.char.setGround(this.terrain.heightAt(tp.x, tp.z) - 0.15, [0, 1, 0]);
    }
    /* THE DOORS, and it is the only sound this thing makes anywhere in
     * the world. There is no announcement: a world organised around a
     * timetable does not need one (`THE-LINE` §4.2). */
    if (this.train.justOpened && this.started) {
      const tp = this.train.pos;
      if (Math.hypot(this.char.pos.x - tp.x, this.char.pos.z - tp.z) < 60) {
        this.audio.event('door-hiss');
      }
    }

    /* ---- THE THINGS THE WALKER HAS MOVED (Session 15) --------------- *
     * The registry rolls the cart and flies the stone; the lands draw
     * them; this is where the world answers a landing, and the only
     * place that decides what the ground under a landing is. */
    things.tick(dt);
    for (const l of things.landed) {
      const water = this.terrain.waterAt(l.x, l.z);
      const t = things.get(l.id);
      if (l.caught) {
        // the well has it; the Common answers on its own delay
      } else if (water > 0.12) {
        this.audio.event('stone-plop');
      } else {
        this.audio.event('stone-land');
      }
      /* Somewhere a foot cannot go — deep water, the steep — is
       * somewhere the morning will take it back from. */
      if (t) t.stranded = water > 0.3 || this.terrain.blockedAt(l.x, l.z);
    }
    things.landed.length = 0;
    // and what is in the hand is drawn in the hand
    const held = things.holding;
    if ((held !== null) !== this.handShown) {
      this.handShown = held !== null;
      this.char.hold(held ? this.handTex : null, 0.42, 0.42);
    }

    this.prints.update(dt);
    this.terrain.update(dt);
    this.world.tick(dt, this.elapsed, this.char.pos.x, this.char.pos.z, this.region.id, weather.windK);

    const here = regionAt(this.char.pos.x, this.char.pos.z);
    if (here.id !== this.region.id) this.crossInto(here);
    /* THE DISTRICTS (Session 16): crossing from one to another inside a
     * land is a smaller arrival than a border, and gets a smaller card
     * — the land's name in the quiet hand, the district's under it.
     * Walking out of a district onto the land's own ground says
     * nothing. */
    const dist = districtAt(this.char.pos.x, this.char.pos.z);
    if (dist !== this.district) {
      const was = this.district;
      this.district = dist;
      if (this.started && dist && dist.land === this.region.id && (was === null || was.land === dist.land) && here.id === this.region.id) {
        this.ui.showRegionCard(this.region.name.toLowerCase(), dist.name, { small: true });
      }
    }
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
          /* THE AVENUE GOES QUIET once the king is back on his plinth
           * (Session 15, the second door): there is no cloth on the
           * poles for the wind to crack, and the only voice left in the
           * land is the rooks'. */
          const quiet = knowledge.has('door:the-king-restored');
          if (!quiet && Math.random() < 0.7) {
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
        } else if (this.region.id === 'downs') {
          /* THE HARROW DOWNS. Everything this land makes is a machine, an
           * animal, or a tool going into the ground, and the mill's
           * creak is louder the nearer you are to it, the way the sea
           * is on the coast. NO VOICES anywhere in it: nobody in the
           * Downs is talking, and that is the loudest thing about the
           * land. */
          const toMill = Math.hypot(this.char.pos.x - 150, this.char.pos.z + 8);
          const toDrove = Math.hypot(this.char.pos.x - 100, this.char.pos.z - 76);
          const roll = Math.random();
          if (toMill < 42 && roll > 0.34) {
            this.audio.event('mill-creak');
            this.ambientAcc = 11 + (toMill / 42) * 9 + Math.random() * 5;
          } else if (toDrove < 34 && roll > 0.3) {
            this.audio.event('sheep');
            this.ambientAcc = 6 + Math.random() * 8;
          } else {
            this.audio.event('field-work');
            this.ambientAcc = 13 + Math.random() * 13;
          }
        } else if (this.region.id === 'forest') {
          /* THE PENWOOD, and its one silence.
           *
           * Everything the wood makes comes from above you or from a
           * long way off. **Inside twenty units of Brack nothing fires
           * but the bed** — it is the only place in the game where the
           * ambient stops, it is not stated anywhere, and a player who
           * notices it has noticed the same thing the road is saying. */
          const toTarn = Math.hypot(this.char.pos.x - 150, this.char.pos.z + 195);
          const toBrack = Math.hypot(this.char.pos.x - 150, this.char.pos.z + 153);
          /* THE DEEP PINES AFTER DARK (Session 17, `THE-FUN-PASS` §9 item
           * 4, §10 THE MONSTERS): the pine-tick stops. Inside the deep
           * stand at night nothing fires but the bed, the way it stops
           * near Brack — and once in a long while, a long way off, a
           * branch goes, and nothing is ever drawn to have done it. The
           * rest of the wood gets an owl. */
          const toDeep = Math.hypot(this.char.pos.x - 188, this.char.pos.z + 246);
          const night = dayClock.phase === 'night';
          if (toBrack < 20) {
            this.ambientAcc = 2.5;
          } else if (night && toDeep < 34) {
            if (Math.random() < 0.18) this.audio.event('branch-crack');
            this.ambientAcc = 14 + Math.random() * 22;
          } else if (night && Math.random() < 0.4) {
            this.audio.event('owl-hoot');
            this.ambientAcc = 12 + Math.random() * 14;
          } else {
            const roll = Math.random();
            if (toTarn < 30 && roll > 0.45) {
              this.audio.event('tarn-drip');
              this.ambientAcc = 9 + Math.random() * 7;
            } else if (roll > 0.6) {
              this.audio.event('axe-far');
              this.ambientAcc = 16 + Math.random() * 14;
            } else {
              this.audio.event('pine-tick');
              this.ambientAcc = 5 + Math.random() * 6;
            }
          }
        } else if (this.region.id === 'canyon') {
          /* SPLITROCK CANYON, and the room is the point.
           *
           * The canyon is the only land in the game with a TAIL on it
           * (Audio.TAILS, mix 0.55) and the quietest bed in the mix, so
           * everything it makes comes back and there is nothing under it
           * to cover the coming back. Three voices, and which one you
           * get is entirely a question of where you are standing:
           *
           *  · ON THE FLOOR, the slot breathes — a pipe with one end
           *    open, and the only land in the game where the wind has a
           *    NOTE rather than a hiss;
           *  · NEAR THE BOAT, a rag on a hull, which is the only made
           *    sound out here and the only evidence at forty units that
           *    anybody is doing anything;
           *  · and A ROCKFALL YOU HEAR AND DO NOT SEE (THE-STRANGERS
           *    C19), which fires around the middle of the day, because
           *    that is when a rock face lets go, and is never once
           *    drawn.
           */
          const { x, z } = this.char.pos;
          const inSlot = Math.abs(x - tearX(z)) < 13 && z < -132 && z > -258;
          const toBoat = Math.hypot(x - 306, z + 234);
          const h = dayClock.hour;
          const roll = Math.random();
          if (toBoat < 34 && h > 5.8 && h < 20.4 && roll > 0.45) {
            this.audio.event('hull-rag');
            this.ambientAcc = 7 + (toBoat / 34) * 8 + Math.random() * 5;
          } else if (h > 10.5 && h < 15 && roll > 0.72) {
            this.audio.event('stone-fall');
            this.ambientAcc = 26 + Math.random() * 30;
          } else if (inSlot) {
            this.audio.event('slot-wind');
            this.ambientAcc = 8 + Math.random() * 7;
          } else {
            this.audio.event('stone-fall');
            this.ambientAcc = 30 + Math.random() * 34;
          }
        } else if (this.region.id === 'desert') {
          /* THE BLEACH FLATS, and NOTHING OUT HERE COMES BACK.
           *
           * The canyon repeats you; this land has nothing to repeat you
           * off. Every voice in it arrives from one side and leaves by
           * the other, and the bed is the highest and thinnest in the
           * game — the top of the page, moving, with nothing under it.
           *
           * Two of the three are about the two places worth walking to.
           * The palms rattle from twenty-six units out, so **you hear
           * the oasis before you can see the water**, which is what
           * makes it arrive rather than appear; and on the track, at
           * night, there is somebody carrying cans.
           */
          const { x, z } = this.char.pos;
          const toOasis = Math.hypot(x - 305, z - 55);
          const onTrack = Math.abs(x - 303.5) < 14 && z > 50 && z < 100;
          const h = dayClock.hour;
          const night = h > 20.5 || h < 4.5;
          const roll = Math.random();
          if (toOasis < 26 && roll > 0.3) {
            this.audio.event('palm-rattle');
            this.ambientAcc = 5 + (toOasis / 26) * 6 + Math.random() * 4;
          } else if (onTrack && night && roll > 0.4) {
            this.audio.event('can-knock');
            this.ambientAcc = 9 + Math.random() * 9;
          } else {
            this.audio.event('grit-run');
            this.ambientAcc = 11 + Math.random() * 13;
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
      this.poi.suppressed = this.ui.noteOpen || this.ui.mapOpen || this.ui.choiceOpen;
      this.activePoi = this.poi.update(this.char.pos);
      /* THE ROUTES, WALKED (WORLD-SYSTEMS §6). A route is the one kind
       * of knowledge nobody in this world could tell you, because they
       * cannot cross a border and the line crosses eleven. So it is
       * marked off underfoot, on foot or under oar — rowing the river
       * IS walking it for this purpose, which is the whole point of a
       * mount. Nothing is announced when a route completes. */
      knowledge.travel(this.char.pos.x, this.char.pos.z);
      this.persistAcc += dt;
      if (this.persistAcc > 4 || knowledge.dirty || things.dirty) {
        this.persistAcc = 0;
        const k = knowledge.saved;
        knowledge.dirty = false;
        things.dirty = false;
        this.save.data.things = things.saved(this.char.pos.x, this.char.pos.z);
        this.save.data.known = k.known;
        this.save.data.passed = k.passed;
        this.save.data.pos = { x: this.char.pos.x, z: this.char.pos.z };
        this.save.data.boat = { x: this.boat.pos.x, z: this.boat.pos.y };
        this.save.data.hour = dayClock.hour;
        this.save.data.day = dayClock.day;
        this.save.persist();
      }
    }

    const C = App.CAM;
    const rig = this.camRig();

    /* ---- THE BEARING, in two components and no coin toss ------------ *
     *
     *   the part of your travel that CROSSES the frame turns the camera;
     *   the part that comes AT THE LENS opens the ground at your feet.
     *
     * That is the whole rule (see App.CAM, THE BEARING, for why it is
     * that and not "point at the travel bearing and clamp it" — the
     * short version is that clamping makes due south a coin toss between
     * ±26° and a walker wobbling either side of it flips a fifty-two
     * degree pan back and forth). Both terms are the walker's own
     * velocity over their own top speed, so both are zero standing still
     * and both scale honestly with the boat, which is faster.
     *
     * THE PEEK DOES NOT ADD, IT TAKES OVER. Adding would let a peek and
     * a turn stack past the envelope, and the envelope is the one number
     * in this system that is not allowed to be exceeded — so a full peek
     * IS the envelope, from any bearing, and letting go hands the camera
     * back to the walk. */
    const vmax = Math.max(1e-3, this.char.maxSpeed);
    let yawWant = 0;
    let asternWant = 0;
    if (this.bearingOn && this.started && !this.char.frozen) {
      /* THE ONLY THING THAT TURNS THE FRAME IS A HAND ON A KEY. Session
       * 12: `this.input.peek` is already clamped to ±1 and already
       * ramped, so the whole of the yaw is one multiply now, and there
       * is no term in it that a walk can reach. */
      yawWant = ((rig.peekYaw * Math.PI) / 180) * this.input.peek;
      asternWant = Math.max(0, Math.min(1, this.char.vel.z / vmax));
    }
    this.camYaw += (yawWant - this.camYaw) * (1 - Math.exp(-dt * C.yawEase));
    this.camAstern += (asternWant - this.camAstern) * (1 - Math.exp(-dt * C.asternEase));
    /* AND IT ARRIVES, rather than approaching. An exponential ease never
     * reaches zero, and "a stopped walker is always in the composition
     * the land was authored for" is a contract, not a limit.
     *
     * The test is on what the camera is being ASKED for, not on the
     * asking being nothing: a walker letting go of the keys decelerates
     * exponentially too, so their velocity never becomes exactly zero
     * either, and a snap that waited for it would never fire. Under a
     * sixth of a degree of ask is a shuffle, not a turn. */
    if (Math.abs(yawWant) < C.yawSnap && Math.abs(this.camYaw) < C.yawSnap) this.camYaw = 0;
    if (asternWant < 0.004 && this.camAstern < 0.004) this.camAstern = 0;

    /* ---- the follow ------------------------------------------------ *
     * Horizontal: damped, with a lead in the direction of travel — free,
     * and the one term that helps east–west travel without costing a
     * standee a degree. It is capped in UNITS per rig rather than held at
     * a number of seconds, because portrait's frame is only three and a
     * half units wide where the walker stands and a lead written in
     * seconds walks them off the side of it at a run.
     * Vertical: slower, off a disc-averaged ground, so cockle never
     * reaches the frame. Rise: slower still, so cresting the castle
     * ramp opens the frame as a swell rather than a jolt. */
    const sp = Math.hypot(this.char.vel.x, this.char.vel.z);
    const lead = sp > 1e-3 ? Math.min(C.leadSec, rig.lead / sp) : 0;
    const tx = this.char.pos.x + this.char.vel.x * lead;
    const tz = this.char.pos.z + this.char.vel.z * lead;
    const k = 1 - Math.exp(-dt * 3.2);
    this.camTarget.x += (tx - this.camTarget.x) * k;
    this.camTarget.z += (tz - this.camTarget.z) * k;

    const groundNow = this.terrain.smoothHeightAt(this.camTarget.x, this.camTarget.z);
    this.camGround += (groundNow - this.camGround) * (1 - Math.exp(-dt * 2.0));
    const riseNow = this.riseAhead(
      this.camTarget.x, this.camTarget.z, groundNow, this.camYaw
    );
    this.camRise += (riseNow - this.camRise) * (1 - Math.exp(-dt * 1.1));

    /* The rig, swung. The camera orbits the AIM POINT, so the thing it
     * is aimed at never moves on the page when the bearing changes —
     * only what is around it does. */
    const dBack = rig.back + this.camRise * C.riseBack + this.camAstern * C.asternBack;
    /* HOW FAR THE RIG IS ASKING TO SIT, kept for the harness. Session 12
     * asserts a ceiling on how fast this may CHANGE — the rig may not
     * give ground faster than the walker covers it — and neither of the
     * two distances you can measure from outside will do. Camera to
     * WALKER moves when a peek swings the camera round a lead-offset
     * aim point, which is a turn and not a dolly; camera to AIM POINT
     * moves when the lead itself lurches on a change of direction,
     * which is the frame translating and not a dolly either. This is
     * the dolly: the two terms that retreat, and nothing else. */
    this.camBack = dBack;
    const sy = Math.sin(this.camYaw);
    const cy = Math.cos(this.camYaw);
    const camX = this.camTarget.x - dBack * sy;
    const camZ = this.camTarget.z + dBack * cy;
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
      this.camGround + rig.look + this.camRise * C.riseLook
        + this.camAstern * C.asternLook,
      this.camTarget.z
    );
    this.applyFog();

    if (!this.noRender) this.fx.render(dt);
  }
}
