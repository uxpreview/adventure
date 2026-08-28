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
import { SPAWN, regionAt, type RegionSpec } from '../world/layout';
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

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(PAPER_HEX);
    this.ui.root.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 320);
    this.camera.position.set(SPAWN.x, 8.2, SPAWN.z + 10.4);
    // an open world lives on its sightlines: the keep from the meadow,
    // the towers from the downs. The fog is a horizon, not a curtain.
    this.scene.fog = new THREE.Fog(PAPER_HEX, 50, 175);

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
          this.snapCamera();
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
    if (this.terrain.nearBridge(x, z, 5)) zone = 'hollow';
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
    this.camera.fov = this.camera.aspect < 0.8 ? 54 : 42;
    this.camera.updateProjectionMatrix();
  }

  private snapCamera() {
    this.camTarget.copy(this.char.pos);
    const off = this.cameraOffset();
    this.camera.position.set(this.char.pos.x + off.x, off.y, this.char.pos.z + off.z);
    this.camera.lookAt(this.char.pos.x, 2.4, this.char.pos.z);
  }

  /**
   * Margins shot its pages steeply from above, and that camera decided
   * its staging; an open world is decided by its vistas instead — the
   * keep from the meadow, the towers across the downs. So the camera
   * sits lower and further back, with the look target lifted so the
   * frame keeps a band of horizon over the walker's head. Tall things
   * stay in frame at any distance; the fog is the skyline.
   */
  private cameraOffset() {
    if (!this.started) {
      // the poster framing: pulled back and up so the title shot reads
      // walker low, road climbing, Brim's wall and the keep in the haze
      return this.camera.aspect < 0.8
        ? new THREE.Vector3(0, 6.6, 16.2)
        : new THREE.Vector3(0, 6.0, 14.6);
    }
    return this.camera.aspect < 0.8
      ? new THREE.Vector3(0, 6.6, 13.6)
      : new THREE.Vector3(0, 5.6, 12.4);
  }

  private tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed += dt;

    this.input.update();
    this.char.frozen = this.ui.noteOpen || this.ui.mapOpen || !this.started;

    this.prevPos.copy(this.char.pos);
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

    // the Common's ambience: a lark somewhere up, and the well's one
    // joke if you stand close enough (Session 8 generalizes this)
    if (this.started) {
      this.ambientAcc -= dt;
      if (this.ambientAcc <= 0) {
        if (this.region.id === 'meadow') {
          const nearWell = Math.hypot(this.char.pos.x + 57, this.char.pos.z - 45) < 8;
          this.audio.event(nearWell && Math.random() > 0.45 ? 'well-plink' : 'lark');
          this.ambientAcc = 9 + Math.random() * 13;
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

    // damped follow with a little lead in the direction of travel
    const lead = 0.5;
    const tx = this.char.pos.x + this.char.vel.x * lead;
    const tz = this.char.pos.z + this.char.vel.z * lead;
    const k = 1 - Math.exp(-dt * 3.2);
    this.camTarget.x += (tx - this.camTarget.x) * k;
    this.camTarget.z += (tz - this.camTarget.z) * k;
    const off = this.cameraOffset();
    this.camera.position.x += (this.camTarget.x + off.x - this.camera.position.x) * k;
    this.camera.position.y += (off.y - this.camera.position.y) * k;
    this.camera.position.z += (this.camTarget.z + off.z - this.camera.position.z) * k;
    this.camera.lookAt(
      this.camTarget.x,
      this.started ? 2.4 : this.camera.aspect < 0.8 ? 5.4 : 4.6,
      this.camTarget.z
    );

    this.fx.render(dt);
  }
}
