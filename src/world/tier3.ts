import { notebook } from './notebook';
import { npcs, type NpcState } from './npc';
import { knowledge } from './knowledge';
import { things } from './things';
import { toast } from '../ui/toast';
import { say, type Speaker } from '../ui/speech';
import { converse, conversing, type Page } from '../ui/converse'; /* A CONVERSATION */
import { SEA, ROW_REACH } from './layout';
import { ride, type RideOwner } from './ride';
import { towardLens, cameraRight } from '../engine/billboard';
import {
  AMOS_STAND, RAIN_TABLE, OASIS_BANK, flats,
  PYE_BEARING, PYE_PUSH, PYE_LAND, PAST_THE_SEVENTH, cove,
  PUNT_PATH, PUNT, PUNT_LAND, ALONGSIDE_AT, wideBlue,
} from './tier3-state';

/**
 * TIER 3: THE LIST IS WRONG (`design/foundation/08` §9, promises 7 to
 * 9). Amos and the rain, Pye and the eighth pot, Wren and the finish
 * line. Each with its turn, its choice, what it changes for good, and
 * what it shows — **how he left**: he knew the bridge would go the
 * night before and said he would see to it; he wrote a note he could
 * not leave and took it with him; and he rowed out past the mark and
 * was three years with the only people in the world he could not help.
 *
 * The jobs are in `jobs/tier3.ts`, hung on their lines of THE LIST.
 * This is what the three of them say while a promise is being kept, and
 * what they do about it: Amos down his own track for water in the
 * daytime, Pye rowing a bearing he has never rowed, Wren rowing a
 * second mark out to where the fleet comes home — and the last boat in
 * the race coming alongside, and knowing you.
 *
 * ONE VOICE AT A TIME: a talk is a conversation; a step is the
 * objective line; a choice is read back by the card's own voice.
 * Every `promise:` is silent. A line in a boat is a bark, and never the
 * only copy of what to do next.
 *
 * THE THREAD THROUGH ALL THREE is his own hand: a line in pencil on a
 * rain table, a note folded small in a coat, and a bench on a longship
 * that four men have kept empty for him.
 */

export const AMOS = 'job:amos';
export const PYE = 'job:pye';
export const WREN = 'job:wren';

/* ---- what is permanent (`promise:` is silent; `door:` is a door) ---- */
export const K = {
  /* 7. AMOS */
  amosFetches: 'promise:amos:fetches',
  amosSat: 'promise:amos:sat',
  tableLooked: 'promise:amos:table-looked',
  wet: 'promise:amos:wet',
  read: 'promise:amos:read',
  dated: 'door:the-rain-dated',
  rubbed: 'door:the-rain-rubbed',
  joanHeard: 'promise:amos:joan-heard',
  /* 8. PYE */
  pyeRows: 'promise:pye:rows',
  pyeSat: 'promise:pye:sat',
  atPot: 'promise:pye:at-pot',
  hauled: 'promise:pye:hauled',
  noteRead: 'door:the-note-read',
  noteDropped: 'door:the-note-dropped',
  pyeHome: 'promise:pye:home',
  /** The note is in his coat: the man at the crossing (Tier 4) is
   *  gated on it, and Joan reads it at the end if he has it (08 §14). */
  theNote: 'promise:pye:the-note',
  /* 9. WREN */
  wrenRows: 'promise:wren:rows',
  wrenSat: 'promise:wren:sat',
  known: 'promise:wren:known',
  atFinish: 'promise:wren:at-finish',
  markSet: 'promise:wren:mark-set',
  oldRules: 'door:the-old-rules',
  newRule: 'door:the-longship-in',
  wrenHome: 'promise:wren:home',
  theSea: 'promise:wren:the-sea',
} as const;

const has = (id: string) => knowledge.has(id);
const stepOf = (jobId: string): number => {
  const j = notebook.list().find((x) => x.id === jobId);
  return !j ? -1 : j.complete ? 99 : j.done;
};
export const amosStep = () => stepOf(AMOS);
export const pyeStep = () => stepOf(PYE);
export const wrenStep = () => stepOf(WREN);

/** THE RAIN TABLE, as the land draws it. */
export const tableState = (): 'faint' | 'wet' | 'dated' | 'rubbed' => (
  has(K.dated) ? 'dated' : has(K.rubbed) ? 'rubbed' : has(K.wet) ? 'wet' : 'faint');
/** Amos sat down and watched you carry his water, and does not go
 *  down the track at night any more. */
export const amosSits = () => has(K.amosSat);
/** The date is up on a board by the Downs road, and his lamp is lit. */
export const rainDated = () => has(K.dated);
/** The eighth pot is up, for good, and its lamp with it. */
export const eighthPotUp = () => has(K.noteRead);
/** Pye watched his boat go out without him, and does not row at
 *  evening any more. */
export const pyeSits = () => has(K.pyeSat);
/** Pye blows the horn on the point at dusk: the call, put back. */
export const pyeCalls = () => stepOf(PYE) === 99;
/** THE SECOND MARK is down. */
export const markDown = () => has(K.markSet);
/** The fleet finished under the old rules, and lies at anchor. */
export const fleetFinished = () => has(K.oldRules);
/** A new rule: the longship is let in over the line. */
export const longshipIn = () => has(K.newRule);
/** Wren watched the punt go out without them and did not ring the
 *  mark at noon, and does not any more. */
export const wrenSits = () => has(K.wrenSat);

type Timer = { at: number; fn: () => void };

/** A path, measured. */
type Measured = { pts: [number, number][]; cum: number[]; len: number };
function measure(pts: [number, number][]): Measured {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, len: cum[cum.length - 1] };
}
function along(m: Measured, s: number): { x: number; z: number; dx: number; dz: number } {
  const u = Math.max(0, Math.min(m.len, s));
  let i = 1;
  while (i < m.pts.length - 1 && m.cum[i] < u) i++;
  const [ax, az] = m.pts[i - 1];
  const [bx, bz] = m.pts[i];
  const seg = m.cum[i] - m.cum[i - 1] || 1;
  const f = (u - m.cum[i - 1]) / seg;
  return { x: ax + (bx - ax) * f, z: az + (bz - az) * f, dx: (bx - ax) / seg, dz: (bz - az) / seg };
}
const BEARING = measure(PYE_BEARING);
const COURSE_OUT = measure(PUNT_PATH);

/** How fast a boat goes on a bearing: rowed for you, or pulled. */
const ROWED = 3.1;
const PULLED = 3.9;

/** The longship, as a voice: wherever it is lying alongside. */
const SHIP: Speaker = {
  name: 'THE LONGSHIP',
  get x() { return wideBlue.alongside.x; },
  get z() { return wideBlue.alongside.z; },
};

function event(name: string) {
  try { window.dispatchEvent(new CustomEvent('inklands:event', { detail: name })); } catch { /* no ears */ }
}

class Tier3 {
  private elapsed = 0;
  private timers: Timer[] = [];
  private walker: () => { x: number; z: number } = () => ({ x: 0, z: 0 });
  private installed = false;

  /* the ride under way */
  private path: Measured = BEARING;
  private s = 0;
  private dir: 1 | -1 = 1;
  private pause = 0;
  private stroke = 0;
  private oarAt = 0;
  private seventhSaid = false;
  private turned = false;
  /** Whoever is rowing, where the boat is: their lines follow it. */
  private rower: { name: string; x: number; z: number } = { name: 'PYE', x: 0, z: 0 };

  private after(sec: number, fn: () => void) {
    this.timers.push({ at: this.elapsed + sec, fn });
  }

  install(walker: () => { x: number; z: number }) {
    if (this.installed) return;
    this.installed = true;
    this.walker = walker;
    for (const [id, lines] of [
      ['amos', (s: NpcState) => this.amosLines(s)],
      ['pye', (s: NpcState) => this.pyeLines(s)],
      ['wren', (s: NpcState) => this.wrenLines(s)],
    ] as [string, (s: NpcState) => string[]][]) {
      const n = npcs.get(id);
      if (!n) continue;
      n.def.lines = lines;
      /* the old steps on these three lines go: their wants pointed at
       * a night walk, the mark's name and the end of the bar, and none
       * of those is the task any more */
      n.def.want = undefined;
    }
    /* JOAN is Tier 4's, and says one thing here: the Downs has lost an
     * argument it has been winning for three years. Once, in a talk. */
    const joan = npcs.get('joan');
    if (joan) {
      const was = joan.def.lines;
      joan.def.lines = (s) => {
        if (has(K.dated) && !has(K.joanHeard)) {
          knowledge.learn(K.joanHeard);
          return ['Amos has a board up by the east road. It rained once, it says, and it was on my barley, and I have said at every market for three years that it never has. ...I said a lot of things that week.'];
        }
        return was(s);
      };
    }
  }

  private speaker(id: string): Speaker | null {
    return npcs.speakerOf(id);
  }

  /* ================================================================ *
   * 7. AMOS. WHEN DID IT LAST RAIN?
   *
   * For the feast he had asked whether the ground would hold. Now he
   * wants the date it last rained, to win an argument with the Downs:
   * Joan Harrow says it never has. THE TURN: his rain table has one
   * entry, and it is in the walker's own hand, and it is the night
   * before the gathering — the only rain in memory, the one that took
   * the east bridge. He was here. He knew the ground would not hold.
   * He wrote "I'll see to it" on a board, and did not tell Amos. THE
   * CHOICE: give Amos the date (he wins; Joan loses, at every market)
   * or rub it out, which the water has made easy (nobody ever knows).
   * The verb is the water: pencil comes up wet, and that board has
   * never been wet in its life, because it is for rain.
   * ================================================================ */
  private amosLines(s: NpcState): string[] {
    const step = stepOf(AMOS);
    const pick = (lines: string[]) => [lines[Math.min(s.said, lines.length - 1)]];
    const A = flats.amos;
    if (A.leg === 'down' || A.leg === 'fill') return pick(['Down empty, back full. I know the way.', 'Go on up. I\'ll not be long. I\'m never long.']);
    if (A.leg === 'back') return ['You read it. My eyes are for weather.'];
    if (A.leg === 'up' || A.leg === 'pour') return ['Uphill. It\'s always uphill back.'];
    switch (step) {
      case -1:
      case 0:
        return ['It rained once. I\'d like the date. Joan Harrow says it never has — says her barley\'s never been rained on in its life, and says it at every market. There\'s one line on my table I can\'t read. Pencil. Gone white.'];
      case 1:
        return pick(['The table. Off the corner of the apron. Bottom of the first column.', 'Go on. Read it if you can. I can\'t.']);
      case 2:
        if (has(K.amosSat)) return pick(['Oasis is at the bottom of the track. Can\'s at the top.', 'Uphill back. It\'s always uphill back.']);
        return pick(['Water. Pencil comes up wet. That board\'s never been wet in its life. It\'s for rain.', 'Water on the rain table. I\'d never have thought of it.']);
      case 3:
        return ['Something\'s come up. I can see that much. You read it. My eyes are for weather.'];
      case 4:
        return ['Whose hand is that? ...No. Don\'t tell me. I can see your face.'];
      default:
        break;
    }
    const out = has(K.dated)
      ? ['The night before the gathering. It rained, and I was right, and the Downs was wrong. ...And you knew the ground wouldn\'t hold. You knew it the night before, and you wrote you\'d see to it.',
        'Board\'s up by the road, facing the Downs. Let her read it.',
        'I light the lamp over the catch at night now. So the Downs can see where the argument was won.']
      : ['Nothing? Water and all, and nothing on it. ...Then I\'ll keep asking. Somebody\'ll know.',
        'Clean board. It\'s never been so clean.',
        'It rained once. I\'d still like the date.'];
    if (has(K.amosSat)) out.push('I sat down and watched you carry my water. First night off in fourteen years. Didn\'t care for it.');
    return [out[s.said % out.length]];
  }

  /** Amos's part, let: he goes down his own track in the daytime for
   *  the one thing out here nobody ever thought to put on that board. */
  amosFetch() {
    if (has(K.wet) || flats.amos.leg) return;
    knowledge.learn(K.amosFetches);
    const A = flats.amos;
    A.leg = 'down';
    A.x = AMOS_STAND.x;
    A.z = AMOS_STAND.z;
  }
  /** And not let: he sits down on the edge of his apron and watches you
   *  carry it, and does not go down the track at night any more. */
  amosSit() { knowledge.learn(K.amosSat); }

  /** Amos's promise is given and not kept yet. */
  get amosOpen(): boolean { const st = stepOf(AMOS); return st >= 0 && st < 99; }
  /** Whether the can is the verb: the promise is at the water, and the
   *  water is not already on its way up in somebody else's hand. */
  get canMine(): boolean {
    const st = stepOf(AMOS);
    return st >= 0 && st <= 2 && !has(K.wet) && !flats.amos.leg && !has(K.amosFetches);
  }
  /** Whether WET THE TABLE is the key at the table: the can full, in
   *  hand. */
  get wetMine(): boolean {
    return this.canMine && things.held === 'the-can' && flats.can.full;
  }
  /** Whether the card at the table is live: the line read, and no
   *  answer given yet. */
  get datedMine(): boolean {
    return stepOf(AMOS) === 4 && !has(K.dated) && !has(K.rubbed);
  }
  /** E at the table, with a full can. */
  wetTheTable() {
    if (has(K.wet)) return;
    knowledge.learn(K.wet);
    say('walker', 'It\'s coming up. A line of it, near the bottom.', { now: true });
  }

  private tickAmos(dt: number) {
    const A = flats.amos;
    if (!A.leg) { A.moving = false; return; }
    /* down the track to the water, a wait while it fills, back up, and
     * he pours it over the board himself: the land draws him at (x, z) */
    const go = (tx: number, tz: number, pace: number): boolean => {
      const dx = tx - A.x;
      const dz = tz - A.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.3) { A.moving = false; return true; }
      const step = Math.min(d, pace * dt);
      A.x += (dx / d) * step;
      A.z += (dz / d) * step;
      A.face = dx >= 0 ? 1 : -1;
      A.moving = true;
      return false;
    };
    if (A.leg === 'down' && go(OASIS_BANK.x, OASIS_BANK.z + 1.4, 3.4)) { A.leg = 'fill'; A.t = 0; event('can-fill'); }
    else if (A.leg === 'fill') { A.t += dt; if (A.t > 3) A.leg = 'up'; }
    else if (A.leg === 'up' && go(RAIN_TABLE.x + 2.4, RAIN_TABLE.z - 1.6, 2.6)) { A.leg = 'pour'; A.t = 0; event('can-pour'); }
    else if (A.leg === 'pour') {
      A.t += dt;
      if (A.t > 1.4) {
        knowledge.learn(K.wet);
        const who: Speaker = { name: 'AMOS', x: A.x, z: A.z };
        const t = 'There. First water that board\'s had in its life. ...Something\'s come up. You read it. My eyes are for weather.';
        /* said to somebody standing there; to nobody, the board says it */
        const w = this.walker();
        if (Math.hypot(w.x - A.x, w.z - A.z) < 30) { converse([{ who, text: t }]); notebook.heard('AMOS', t); }
        /* and back to his tank, on foot */
        A.leg = 'back';
      }
    } else if (A.leg === 'back' && go(AMOS_STAND.x, AMOS_STAND.z, 2.2)) A.leg = '';
  }

  /* ================================================================ *
   * 8. PYE. ROW THE EIGHTH POT OUT.
   *
   * The eighth was to be a marker further out than the seven, so that
   * guests coming by sea could find the cove. That night his boat was
   * taken. Now the pot is set, on a bearing Pye does not row. THE TURN:
   * it holds the walker's coat, and in the coat the note he could not
   * leave: I'M NOT COMING BACK, in his handwriting. And Pye's line, at
   * the end: he found him past the mark, coming in, not going out. THE
   * CHOICE: read it, or drop it back in.
   * ================================================================ */
  private pyeLines(s: NpcState): string[] {
    const step = stepOf(PYE);
    const pick = (lines: string[]) => [lines[Math.min(s.said, lines.length - 1)]];
    switch (step) {
      case -1:
      case 0:
        return ['Seven pots, seven bearings, and I row them. There\'s an eighth. I set it last week, out past the seventh, on a bearing I don\'t row. What\'s in it is yours. I didn\'t look.'];
      case 1:
        if (has(K.pyeRows)) return pick(['Bow end. I\'ll push her off.', 'In you get. Bow end.']);
        if (has(K.pyeSat)) return pick(['Oars are in her. She pulls left.', 'She knows the way out. It\'s the way back she\'s never done.']);
        return ['It\'s your pot.'];
      case 2:
      case 3:
        return ['Haul it. It\'s not heavy. It was heavy going in.'];
      case 4:
        return ['I found you past the mark. Coming in, not going out. Half drowned in my own boat, rowing the wrong way for a man who\'s leaving. I thought you\'d want to know which way you were facing.'];
      default:
        break;
    }
    const out = has(K.noteRead)
      ? ['Pot\'s up. Coat\'s yours. I never read it. Don\'t tell me.',
        'I blow the horn on the point at dusk now. Something out past the mark answers. It always has.']
      : ['Back down it went. It\'ll keep. Pots do.',
        'The lamp\'s still on it at night. I\'ll keep the lamp.',
        'I blow the horn on the point at dusk now. Something out past the mark answers. It always has.'];
    if (has(K.pyeSat)) out.push('I sat where she was and watched her go out without me. Three years she waited on this sand. I\'d forgotten what it looks like, going.');
    return [out[s.said % out.length]];
  }
  pyeRows() { knowledge.learn(K.pyeRows); }
  pyeSit() { knowledge.learn(K.pyeSat); }

  /** Whether GET IN is the key at Pye's boat: the promise is at the
   *  row, and his part has been answered either way. */
  get boardPye(): boolean {
    /* (steps 2 and 3 too: a page closed out on the bearing wakes on the
     * sand, and the pot is still out there to be hauled) */
    const st = stepOf(PYE);
    return st >= 1 && st <= 3 && !ride.on && (has(K.pyeRows) || has(K.pyeSat));
  }
  getInPyes() {
    if (!this.boardPye) return;
    this.startRide('pye', has(K.pyeRows) ? 'them' : 'you');
  }
  /** Whether HAUL IT UP is the key: out on the bearing, at the pot. */
  get haulMine(): boolean {
    return ride.on && ride.who === 'pye' && has(K.atPot) && !has(K.hauled);
  }
  haul() {
    if (!this.haulMine) return;
    knowledge.learn(K.hauled);
    event('rope-haul');
    say('walker', 'A coat. Mine. Rolled up tight, and something folded in the pocket.', { now: true, hold: 5 });
  }
  /** Whether the card at the pot is live. */
  get noteMine(): boolean {
    return ride.on && ride.who === 'pye' && has(K.hauled) && !has(K.noteRead) && !has(K.noteDropped);
  }
  /** The card writes a door and nothing else, so what the door DOES is
   *  done here, the frame after. */
  private noteSaid = false;
  private tickNote() {
    if (this.noteSaid || !(has(K.noteRead) || has(K.noteDropped))) return;
    this.noteSaid = true;
    const pages: Page[] = [];
    const pye: Speaker = this.rower;
    if (has(K.noteRead)) {
      knowledge.learn(K.theNote);
      const t = '"I\'M NOT COMING BACK." In my hand. Written to be left somewhere, and I never left it.';
      pages.push({ who: 'walker', text: t });
      notebook.heard('YOU', 'I\'M NOT COMING BACK. In my hand. Written to be left somewhere, and never left.');
      if (ride.rower === 'them') pages.push({ who: pye, text: 'I never read it. I don\'t read other people\'s letters.' });
    } else {
      pages.push({ who: 'walker', text: 'Back down it goes. Whatever it says, it\'s said it for three years without me.' });
      if (ride.rower === 'them') pages.push({ who: pye, text: 'Your pot now. It\'ll keep.' });
    }
    converse(pages, { then: () => this.turnForHome() });
  }

  /* ================================================================ *
   * 9. WREN. GIVE THE RACE A FINISH LINE.
   *
   * The race was to finish at 8:15, and the Vikings were promised they
   * could land for the first time in four hundred years. Nobody called
   * it; the fleet went round; the Vikings roared at nothing. Now Wren
   * wants a finish. THE TURN: rowing the second mark out, the last boat
   * in the race comes alongside, and the Vikings know him. He rowed
   * with them for three years. THE CHOICE: finish it under the old
   * rules (the fleet has a winner and stops; the longship stays out
   * past the mark for good) or write a new one — the last boat over the
   * line has finished too — and let the longship in.
   * ================================================================ */
  private wrenLines(s: NpcState): string[] {
    const step = stepOf(WREN);
    const pick = (lines: string[]) => [lines[Math.min(s.said, lines.length - 1)]];
    switch (step) {
      case -1:
      case 0:
        return ['A race needs a finish. A race needs a finish. One mark\'s a turn, not a finish. Two marks make a line. The second mark\'s in the punt. Three years in the punt.'];
      case 1:
        if (has(K.wrenRows)) return pick(['Get in the bow. Get in the bow.', 'I\'ll row. I row every day.']);
        if (has(K.wrenSat)) return pick(['Punt\'s yours. Punt\'s yours.', 'Mind the fleet. They don\'t look.']);
        return ['It\'s in the punt.'];
      case 2:
        return ['Drop it where the course comes home. Where it comes home.'];
      case 3:
        return ['Old rules, or a new one. Old rules, or a new one.'];
      case 4:
        return ['Well? Well?'];
      default:
        break;
    }
    const out = has(K.oldRules)
      ? ['Finished. Somebody won. They\'ve stopped. They\'ve stopped.',
        'The long boat\'s out past the mark still. Where the rules put it.',
        'Second mark rings nothing. Nothing to ring for.']
      : ['Last boat in finishes too. They came over it roaring. They came over it roaring.',
        'The long boat lies inside the mark now, off the bar, like it lives here. Four hundred years.',
        'The fleet don\'t like it. The fleet\'ll get used to it.'];
    if (has(K.known)) out.push('They knew you. Three summers, they said. I\'d have said it twice, if I were them.');
    if (has(K.wrenSat)) out.push('I didn\'t ring the mark today. First noon in years. The swell rang it, nearly.');
    return [out[s.said % out.length]];
  }
  wrenRows() { knowledge.learn(K.wrenRows); }
  wrenSit() { knowledge.learn(K.wrenSat); }

  get boardPunt(): boolean {
    const st = stepOf(WREN);
    return st >= 1 && st <= 3 && !ride.on && (has(K.wrenRows) || has(K.wrenSat));
  }
  getInPunt() {
    if (!this.boardPunt) return;
    this.startRide('wren', has(K.wrenRows) ? 'them' : 'you');
  }
  /** Whether DROP THE MARK is the key: at the finish, mark still aboard. */
  get dropMine(): boolean {
    return ride.on && ride.who === 'wren' && has(K.atFinish) && !has(K.markSet);
  }
  dropTheMark() {
    if (!this.dropMine) return;
    knowledge.learn(K.markSet);
    event('bell-buoy');
    say('walker', 'Down. Two marks, and a line between them, across where they come home.', { now: true, hold: 5 });
  }
  /** Whether the card at the second mark is live. */
  get rulesMine(): boolean {
    return ride.on && ride.who === 'wren' && has(K.markSet) && !has(K.oldRules) && !has(K.newRule);
  }
  private rulesSaid = false;
  private tickRules() {
    if (this.rulesSaid || !(has(K.oldRules) || has(K.newRule))) return;
    this.rulesSaid = true;
    const ship = SHIP;
    const pages: Page[] = has(K.newRule)
      ? [{ who: ship, text: 'THE LAST BOAT HOME HAS FINISHED TOO? ...THEN WE ARE COMING IN, OAR-BROTHER. WE ARE COMING IN.' }]
      : [{ who: ship, text: 'THE OLD RULES. THE OLD RULES. ...WE KNOW THEM. WE HAVE KEPT THEM LONGER THAN YOU.' }];
    wideBlue.alongside.roar = 1.6;
    event('viking-roar');
    converse(pages, { then: () => { wideBlue.alongside.on = false; this.turnForHome(); } });
  }

  /** THE LAST BOAT COMES ALONGSIDE, and knows him. */
  private alongside() {
    if (has(K.known)) return;
    const A = wideBlue.alongside;
    A.on = true;
    A.roar = 1.6;
    event('viking-roar');
    const ship = SHIP;
    const pages: Page[] = [
      { who: ship, text: 'OAR-BROTHER!' },
      { who: ship, text: 'FOURTH BENCH, STEERBOARD SIDE. THREE SUMMERS YOU PULLED WITH US, AND NOT ONCE DID YOU SAY YOU WOULD SEE TO ANYTHING.' },
      { who: ship, text: 'THEN A BELL ASHORE AT THE WRONG HOUR, AND YOU WENT OVER THE SIDE TOWARD IT. WE LOOKED FOR THREE DAYS.' },
      { who: ship, text: 'WE ARE STILL LAST. WE ARE GAINING.' },
      { who: 'walker', text: 'I rowed with them. Three years, out past the mark, where nobody goes. That\'s where I was.' },
    ];
    notebook.heard('THE LONGSHIP', 'Fourth bench, steerboard side. Three summers you pulled with us.');
    notebook.heard('YOU', 'I rowed with them. Three years, out past the mark. That is where I was.');
    converse(pages, { then: () => knowledge.learn(K.known) });
  }

  /* ---- the ride --------------------------------------------------- */
  private startRide(who: RideOwner, rower: 'them' | 'you') {
    this.path = who === 'pye' ? BEARING : COURSE_OUT;
    this.s = 0;
    this.dir = 1;
    this.pause = 0.8;
    this.stroke = 0;
    this.turned = false;
    this.seventhSaid = false;
    ride.who = who;
    ride.rower = rower;
    ride.home = who === 'pye' ? { ...PYE_LAND } : { ...PUNT_LAND };
    ride.on = true;
    this.place();
    this.rower.name = who === 'pye' ? 'PYE' : 'WREN';
    if (rower === 'them') this.after(0.6, () => say(this.rower, who === 'pye' ? 'Bow end. Hold on.' : 'Hold on. Hold on.', { hold: 3 }));
  }

  /** A stroke: the key on PULL. */
  pull() {
    if (!this.pullMine) return;
    this.stroke = 1.1;
  }
  /** Whether PULL is the key: in the bow of somebody's boat with the
   *  oars in your hands, and nothing at this end to do but go. */
  get pullMine(): boolean {
    return ride.on && ride.rower === 'you' && !this.atFarEnd() && !conversing();
  }
  private atFarEnd(): boolean {
    return this.dir === 1 && this.s >= this.path.len - 0.01;
  }

  private turnForHome() {
    this.after(1.2, () => {
      this.dir = -1;
      this.turned = true;
      this.pause = 0.4;
      if (ride.rower === 'them') say(this.rower, ride.who === 'pye' ? 'In, then.' : 'Home. Home.', { hold: 2.5 });
    });
  }

  /** Where the boat and the walker in it are, from `s`. */
  private place() {
    const p = along(this.path, this.s);
    const fx = p.dx * this.dir;
    const fz = p.dz * this.dir;
    /* rowed for you, you sit in the bow, ahead of whoever is rowing;
     * rowing, you are the one amidships */
    const bow = ride.rower === 'them' ? 1.1 : 0;
    ride.x = p.x + fx * bow;
    ride.z = p.z + fz * bow;
    ride.heading = Math.atan2(fx, fz);
    const boat = ride.who === 'pye' ? cove.boat : wideBlue.punt;
    this.rower.x = p.x;
    this.rower.z = p.z;
    boat.out = true;
    boat.x = p.x;
    boat.z = p.z;
    boat.fx = fx;
    boat.fz = fz;
  }

  private tickRide(dt: number) {
    if (!ride.on) return;
    const talking = conversing();
    this.pause = Math.max(0, this.pause - dt);
    this.stroke = Math.max(0, this.stroke - dt);
    let v = 0;
    const waiting = this.atFarEnd() && !this.turned;
    if (!talking && this.pause <= 0 && !waiting) {
      v = ride.rower === 'them' ? ROWED : PULLED * Math.max(ride.pull, this.stroke > 0 ? 1 : 0);
    }
    ride.moving = v > 0.05;
    this.s = Math.max(0, Math.min(this.path.len, this.s + v * this.dir * dt));
    this.place();
    if (ride.moving && this.elapsed - this.oarAt > 1.15) { this.oarAt = this.elapsed; event('oar'); }

    const u = this.s / this.path.len;
    if (ride.who === 'pye' && this.dir === 1) {
      /* HE STOPS AT HIS SEVENTH, if he is rowing: the last pot on the
       * bearing he rows, and the first yard of the one he doesn't */
      if (ride.rower === 'them' && !this.seventhSaid && u >= PAST_THE_SEVENTH) {
        this.seventhSaid = true;
        this.pause = 3.2;
        say(this.rower, 'That\'s my seventh.', { hold: 1.6, then: () => say(this.rower, '...Past it, then.', { hold: 2 }) });
      }
      if (this.atFarEnd() && !has(K.atPot)) {
        knowledge.learn(K.atPot);
        if (ride.rower === 'them') {
          this.after(0.8, () => say(this.rower, 'Eighth pot. Haul it.', { hold: 2.5 }));
        }
      }
    }
    if (ride.who === 'wren' && this.dir === 1) {
      const A = wideBlue.alongside;
      /* the last boat in the race comes up out of the west to meet the
       * punt, and lies alongside it, seaward */
      if (!has(K.known) && u >= ALONGSIDE_AT - 0.18 && !A.on) {
        /* it comes up out of the west, from past the mark */
        A.on = true;
        A.x = ride.x - 34;
        A.z = ride.z - 22;
      }
      if (!has(K.known) && u >= ALONGSIDE_AT && !talking && !this.knownAsked) {
        this.knownAsked = true;
        this.pause = 99;
        this.after(1.4, () => { this.pause = 0; this.alongside(); });
      }
      if (this.atFarEnd() && !has(K.atFinish)) knowledge.learn(K.atFinish);
    }
    /* the longship keeps station on the punt while it is alongside: on
     * the far side of it from the lens, a little to the left, so it is
     * in the frame on a phone held upright at any bearing */
    if (wideBlue.alongside.on && ride.who === 'wren') {
      const A = wideBlue.alongside;
      const [lx, lz] = towardLens();
      const [rx, rz] = cameraRight();
      const tx = ride.x - lx * 10 - rx * 2.5;
      const tz = ride.z - lz * 10 - rz * 2.5;
      const k = 1 - Math.exp(-dt * 0.9);
      A.x += (tx - A.x) * k;
      A.z += (tz - A.z) * k;
      A.face = this.dir === 1 ? -1 : 1;
      A.roar = Math.max(0, A.roar - dt);
    }
    /* home: put the walker on the sand beside where they went out from */
    if (this.dir === -1 && this.s <= 0) {
      const who = ride.who;
      const land = who === 'pye' ? PYE_LAND : PUNT_LAND;
      ride.on = false;
      ride.moving = false;
      ride.x = land.x;
      ride.z = land.z;
      if (who === 'pye') { cove.boat.out = false; knowledge.learn(K.pyeHome); }
      else { wideBlue.punt.out = false; wideBlue.alongside.on = false; knowledge.learn(K.wrenHome); }
    }
  }
  private knownAsked = false;

  /** A talk with one of the three has just happened (`jobs.ts`). */
  talked(_id: string) { /* every turn in this tier is a place or a boat, not a talk */ }

  /* ---- the frame -------------------------------------------------- */
  tick(dt: number) {
    this.elapsed += dt;
    if (this.timers.length) {
      const due = this.timers.filter((t) => t.at <= this.elapsed);
      if (due.length) {
        this.timers = this.timers.filter((t) => t.at > this.elapsed);
        for (const t of due) t.fn();
      }
    }
    this.tickAmos(dt);
    this.tickRide(dt);
    this.tickNote();
    this.tickRules();
    /* a page closed on the way in wakes on the sand it went out from:
     * it is home */
    if (!ride.on) {
      if ((has(K.noteRead) || has(K.noteDropped)) && !has(K.pyeHome)) knowledge.learn(K.pyeHome);
      if ((has(K.oldRules) || has(K.newRule)) && !has(K.wrenHome)) knowledge.learn(K.wrenHome);
    }
    /* THE SEA, opened by a race with a finish (08 §9.9: "Unlocks: the
     * sea"): the rowboat goes past the mark from now on */
    SEA.reach = has(K.theSea) ? 400 : ROW_REACH;
  }

  /** WREN'S LINE KEPT: the sea is open. Said once, the way a thing
   *  that is yours now is said. */
  openTheSea() {
    if (has(K.theSea)) return;
    knowledge.learn(K.theSea);
    toast('YOURS: THE SEA, PAST THE MARK', 'learned');
  }

  /** Where the rides start, for the lands' prompts. */
  readonly pushAt = PYE_PUSH;
  readonly puntAt = PUNT;
  readonly tableAt = RAIN_TABLE;
}

export const tier3 = new Tier3();
