export type SkinId = 'pip' | 'b';

export type SaveData = {
  /** Where the walker was left standing, null on a fresh page. */
  pos: { x: number; z: number } | null;
  /** Region ids the walker has set foot in, in first-visit order. */
  discovered: string[];
  /** Notes read at least once (their cards mark themselves on the map). */
  readNotes: string[];
  skin: SkinId;
  muted: boolean;
  /** Total walked distance, in world units — the map brags with it. */
  walked: number;
  /**
   * WHERE THE ROWBOAT IS. Mounts are found in the world and left in the
   * world (WORLD-SYSTEMS §4) — yours is where you left it, which is a
   * promise that only means anything if it survives closing the tab.
   * Null until the first walk touches it.
   */
  boat: { x: number; z: number } | null;
  /**
   * WHAT TIME IT IS. The day cycle runs while you play and stops when
   * you stop, so coming back tomorrow morning does not mean coming back
   * to the middle of last night's dusk.
   */
  hour: number | null;
  /**
   * WHAT THE WALKER KNOWS. Names, facts, routes and reasons, as
   * readable ids (`fact:brim-hour`, `route:the-line`) — the content
   * system in one array, because the content system is knowledge and
   * not collection (WORLD-SYSTEMS §6, `src/world/knowledge.ts`).
   *
   * `boat` and `hour` were added last session without ceremony and
   * this goes the same way. Note there is no count kept anywhere and
   * nothing reads `.length` — QUESTS §7 refuses the player a tally,
   * and the cheapest way to keep that promise is to never compute one.
   */
  known: string[];
  /**
   * ROUTE POSTS ALREADY PASSED. A route is the one kind of knowledge
   * nobody can tell you, so it is walked off a line of authored points
   * — and the walking has to survive closing the tab, or the river is
   * a thing you have to row in one sitting.
   */
  passed: string[];
  /**
   * WHETHER ANYBODY HAS EVER TOLD THIS PLAYER ABOUT THE RUN.
   *
   * Session 12, and it is a save field rather than a session flag on
   * purpose: a control you are taught twice is a control the game
   * thinks you are stupid about, and a control you are taught once, in
   * a six-second toast, on the frame where you first walk into a new
   * land and are looking at the land, is a control nobody has been
   * taught at all. That was the defect (the owner, having played the
   * game: "the keyboard controls lack the ability to run" — they do
   * not; Shift works, and has since Session 6). So it is taught ONCE,
   * EVER, and at the moment it becomes useful rather than at the
   * moment the player arrives somewhere.
   */
  taughtRun: boolean;
};

const KEY = 'inklands-save-v1';

const DEFAULTS: SaveData = {
  pos: null,
  discovered: [],
  readNotes: [],
  skin: 'pip',
  muted: false,
  walked: 0,
  boat: null,
  hour: null,
  known: [],
  passed: [],
  taughtRun: false,
};

export class Save {
  data: SaveData;

  constructor() {
    this.data = { ...DEFAULTS };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.data = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<SaveData>) };
    } catch {
      // a browser that refuses storage still gets a walk
    }
  }

  persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch {
      /* same */
    }
  }

  discover(id: string): boolean {
    if (this.data.discovered.includes(id)) return false;
    this.data.discovered.push(id);
    this.persist();
    return true;
  }

  readNote(id: string) {
    if (!this.data.readNotes.includes(id)) {
      this.data.readNotes.push(id);
      this.persist();
    }
  }
}
