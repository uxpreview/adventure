import { notebook } from './notebook';
import { THE_LIST } from './thelist';
import { toast } from '../ui/toast';
import { shout } from '../ui/speech';

/**
 * CROSSING A LINE OUT (the three verbs; story of record §8: "The player
 * can cross a line out. The notebook does not object. What the world
 * does about it is the content.")
 *
 * The line is struck in his own hand and stays struck. Its pin comes
 * off the map if he has never stood there. Nothing is locked: the
 * person is still where they were and their job can still be done.
 * Within the minute the world says what it did about it, and the next
 * time he talks to the person, they have heard.
 */

type Due = { at: number; text: string };

class CrossOut {
  private elapsed = 0;
  private due: Due[] = [];

  /** Whether a line can still be crossed out by hand. */
  can(id: string): boolean {
    const l = THE_LIST.find((x) => x.id === id);
    if (!l || l.kept || notebook.crossed.includes(id)) return false;
    return !notebook.list().some((j) => j.land === l.land && j.complete);
  }

  cross(id: string): boolean {
    const l = THE_LIST.find((x) => x.id === id);
    if (!l || !this.can(id) || !notebook.crossOut(id)) return false;
    notebook.unplace(l.pin.label);
    toast(`CROSSED OUT: ${l.who}. THE NOTEBOOK DOES NOT OBJECT.`, 'done');
    try { window.dispatchEvent(new CustomEvent('inklands:event', { detail: 'page' })); } catch { /* no ears */ }
    // read back within the minute: what he drops, the kid picks up
    this.due.push({ at: this.elapsed + 10 + (id.length % 4) * 3, text: `SOMEWHERE, MORROW WRITES ${l.who} INTO HIS OWN LIST` });
    return true;
  }

  /** The person's one line about it, if they have not said it yet. */
  lineFor(id: string, state: { crossedSaid?: boolean }): string | null {
    if (state.crossedSaid || !notebook.crossed.includes(id)) return null;
    return THE_LIST.find((x) => x.id === id)?.crossed ?? null;
  }

  tick(dt: number) {
    this.elapsed += dt;
    if (!this.due.length) return;
    const now = this.due.filter((d) => d.at <= this.elapsed);
    if (!now.length) return;
    this.due = this.due.filter((d) => d.at > this.elapsed);
    shout(now[0].text);
  }
}

export const crossout = new CrossOut();
