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
};

const KEY = 'inklands-save-v1';

const DEFAULTS: SaveData = {
  pos: null,
  discovered: [],
  readNotes: [],
  skin: 'pip',
  muted: false,
  walked: 0,
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
