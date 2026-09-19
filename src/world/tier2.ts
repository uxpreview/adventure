import { notebook } from './notebook';
import { npcs, type NpcState } from './npc';
import { knowledge } from './knowledge';
import { things } from './things';
import { toast } from '../ui/toast';
import { beckon, say, shout, type Speaker } from '../ui/speech';
import { converse } from '../ui/converse'; /* A CONVERSATION */
import {
  TARN, CATCH, CANYON_EDGE,
  splitrock, penwood, PRINTS_COMMON,
} from './tier2-state';

/** The middle of the cut, where the echo is heard from. */
const CUT_MIDDLE = { x: 303, z: -220 };

/**
 * TIER 2: THE CONSEQUENCES OF HIS METHODS (`design/foundation/08` §9,
 * promises 4 to 6). Val and the hedge, Brack and the lake, Holt and the
 * water. Each with its turn, its choice, what it changes for good, what
 * it shows — **that he left, on foot, on purpose** — and the call it
 * puts back.
 *
 * The jobs are in `jobs/tier2.ts`, hung on their lines of THE LIST.
 * This is what the three of them say while a promise is being kept, and
 * what they do about it: June coming up the road to hold the far end of
 * the hedge, Brack down as far as the last tree, Holt stopping dead at
 * his own border and having to be asked again.
 *
 * ONE VOICE AT A TIME: a talk is a conversation; a step is the
 * objective line; a choice is read back by the card's own voice.
 * Nothing here says the same thing two ways, and every `promise:` is
 * silent.
 *
 * THE THREAD THROUGH ALL THREE is the faded footprints. Val's gap opens
 * a sightline down onto the Common and the first of them are in it,
 * going west. They come out again on the bank of Brack's tarn, going
 * into the water and not coming back. Amos, at the end of Holt's walk,
 * is the man who saw him that morning and was told no.
 */

export const VAL = 'job:val';
export const BRACK = 'job:brack';
export const HOLT = 'job:holt';

/* ---- what is permanent (`promise:` is silent; `door:` is a door) ---- */
export const K = {
  /* 4. VAL */
  valWhy: 'promise:val:why',
  june: 'promise:val:june',
  juneRefused: 'promise:val:june-not-asked',
  gapCut: 'promise:val:gap-cut',
  clippers: 'promise:val:clippers',
  prints: 'promise:val:footprints',
  courtTakes: 'door:the-gap-cut',
  greenTakes: 'door:the-light-off',
  /* 5. BRACK */
  brackWhy: 'promise:brack:why',
  brackCame: 'promise:brack:came',
  looked: 'promise:brack:looked',
  onPurpose: 'promise:brack:on-purpose',
  lanternHung: 'door:the-lantern-hung',
  lanternKept: 'door:the-lantern-carried',
  lantern: 'promise:brack:lantern',
  /* 6. HOLT */
  holtSat: 'promise:holt:sat',
  channelMine: 'door:the-channel-rigged',
  holtWalks: 'door:the-lands-spoke',
  channelSet: 'promise:holt:set',
  holtArrived: 'promise:holt:arrived',
  amosSaw: 'promise:holt:amos-saw',
  water: 'promise:holt:water',
} as const;

const has = (id: string) => knowledge.has(id);
const stepOf = (jobId: string): number => {
  const j = notebook.list().find((x) => x.id === jobId);
  return !j ? -1 : j.complete ? 99 : j.done;
};

export const valStep = () => stepOf(VAL);
export const brackStep = () => stepOf(BRACK);
export const holtStep = () => stepOf(HOLT);

/** THE GAP IS CUT, by his hand or (for a page saved before Tier 2) by
 *  the card that used to do it. The hedge reads this. */
export const gapCut = () => has(K.gapCut) || has(K.courtTakes);
/** THE CLIPPERS ARE HIS: an overgrown way anywhere can be cut. */
export const clippersKept = () => has(K.clippers);
/** THE LANTERN AT THE WOOD GATE, lit every night from now on. */
export const lanternHung = () => has(K.lanternHung);
/** THE LANTERN IS IN HIS COAT: a light of his own, after dark. */
export const lanternCarried = () => has(K.lanternKept);
/** WATER IN SPLITROCK, by whichever hand. */
export const waterRuns = () => has(K.channelSet) || has(K.holtArrived);
/** June is up at the hedge holding the far end, and stays there. */
export const juneAtHedge = () => has(K.june);

type Timer = { at: number; fn: () => void };

class Tier2 {
  private elapsed = 0;
  private timers: Timer[] = [];
  private walker: () => { x: number; z: number } = () => ({ x: 0, z: 0 });
  private installed = false;
  /** Amos's one line, said once in a talk and not three times. */
  private amosSaid = false;

  private after(sec: number, fn: () => void) {
    this.timers.push({ at: this.elapsed + sec, fn });
  }

  install(walker: () => { x: number; z: number }) {
    if (this.installed) return;
    this.installed = true;
    this.walker = walker;
    for (const [id, lines] of [
      ['val', (s: NpcState) => this.valLines(s)],
      ['brack', (s: NpcState) => this.brackLines(s)],
      ['holt', (s: NpcState) => this.holtLines(s)],
    ] as [string, (s: NpcState) => string[]][]) {
      const n = npcs.get(id);
      if (!n) continue;
      n.def.lines = lines;
      /* the old steps on these three lines go: their wants pointed at
       * the keep, the tarn and the riverhead, and none of those is the
       * task any more */
      n.def.want = undefined;
    }
    /* AMOS is Tier 3's, and says one thing here: the morning at the
     * bridge, when Holt is standing in front of him. */
    const amos = npcs.get('amos');
    if (amos) {
      const was = amos.def.lines;
      amos.def.lines = (s) => {
        /* one talk walks a stranger through three lines (`npc.ts`), so
         * a line that is the same every time is said three times over:
         * his is said once, and then his own. */
        if (splitrock.holt.arrived && !has(K.amosSaw) && !this.amosSaid) {
          this.amosSaid = true;
          return ['You two. Together. ...I offered, you know. That morning, at the bridge. Cans in the cart and both hands free. You said you\'d handle it.'];
        }
        return was(s);
      };
    }
  }

  private speaker(id: string): Speaker | null {
    return npcs.speakerOf(id);
  }

  private near(x: number, z: number, r: number): boolean {
    const w = this.walker();
    return Math.hypot(w.x - x, w.z - z) < r;
  }

  /* ================================================================ *
   * 4. VAL. THE GAP IN THE HEDGE.
   *
   * The court and the green argued about who would take the overflow
   * and he promised to settle it at three. He did not come, and the
   * hedge was planted closed rather than settled. Three chairs face it.
   * THE TURN: the gap is not a view. It is a sightline, and a sightline
   * is two streets being able to see each other argue. THE CHOICE:
   * which of them takes it — one side loses for good. THE REVEAL: from
   * the cut gap, down on the Common, the first faded footprints, going
   * west, on the night he left.
   * ================================================================ */
  private valLines(s: NpcState): string[] {
    const step = stepOf(VAL);
    const pick = (lines: string[]) => [lines[Math.min(s.said, lines.length - 1)]];
    switch (step) {
      case -1:
      case 0:
        return ['You. Three chairs and a hedge, and you\'re going to ask, like everybody asks. It was a gap. You were going to settle it at three. You didn\'t come, so we planted it shut.'];
      case 1:
        return pick(['The clippers are where they went down. In the grass by my steps. Three years of grass.',
          'By the steps. Nobody\'s picked them up. Nobody was going to.']);
      case 2:
        return pick(['Go on then. Cut it.', 'It won\'t cut itself. Nothing round here does.']);
      case 3:
        return ['Well. Now the green can see us and we can see the green, and the whole thing\'s back. Sit down in one of them and say which way it goes.'];
      case 4:
        return [has(K.greenTakes)
          ? 'The green takes it. Right. Then I\'ll not be the one with the light on.'
          : 'The court takes it. Good. I\'ll want that in front of June.'];
      default:
        break;
    }
    const out = [
      has(K.greenTakes)
        ? 'Light\'s off. It\'s one less thing. The street\'ll go dark a house at a time, you watch.'
        : 'There. Castle, through the gap. I told June and June didn\'t believe me.',
      has(K.june) ? 'June held the far end. She hasn\'t been up this road in three years.' : 'I did the far end myself. It\'s a hedge, not a piano.',
      'Sit down. That\'s what the chairs are for.',
    ];
    if (has(K.prints)) out.push('Those marks down on the green. They were there the morning after. Nobody\'s walked them out.');
    return [out[s.said % out.length]];
  }

  /** Val's part, taken: June comes up the road and holds the far end,
   *  and stays up the road from then on. */
  askJune() {
    if (has(K.june)) return;
    knowledge.learn(K.june);
    const who = this.speaker('val');
    if (who) this.after(1.2, () => converse([{ who, text: 'June! ...She\'s coming. She was only waiting to be asked.' }]));
  }
  /** And not taken: she does not ask, and June is at her own gate, and
   *  that is the cost and it is forty units long. */
  juneNotAsked() {
    knowledge.learn(K.juneRefused);
  }

  /** Whether CUT THE GAP is the thing the key does here and now. */
  get gapMine(): boolean {
    return stepOf(VAL) === 2 && things.held === 'the-clippers' && !has(K.gapCut);
  }
  /** E at the hedge, with the clippers in hand. */
  cutTheGap() {
    if (!this.gapMine) return;
    knowledge.learn(K.gapCut);
    /* the clippers go in the coat and stay there: an overgrown way
     * anywhere on the sheet can be cut from now on */
    things.consume('the-clippers');
    knowledge.learn(K.clippers);
    say('walker', 'Two feet of it. That\'s all it ever was.', { now: true });
    toast('YOURS: THE CLIPPERS', 'learned');
    /* THE REVEAL, and it is a place and not a line: through the gap,
     * down on the Common, somebody walked west in the wet. */
    this.after(3.4, () => this.showThePrints());
  }

  private showThePrints() {
    if (has(K.prints)) return;
    knowledge.learn(K.prints);
    notebook.place('THE FADED FOOTPRINTS', PRINTS_COMMON.x, PRINTS_COMMON.z);
    say('walker', 'Through there. On the green. Somebody walked west in the wet and nobody\'s walked it out.', { hold: 5 });
  }

  /* ================================================================ *
   * 5. BRACK. THE LAKE.
   *
   * The lantern at the wood gate had to be lit for the wood to come.
   * It was not. Brack has watched the water for forty years and will
   * not go within forty paces of it. THE TURN: the footprints go down
   * the shingle into the water and do not come back, and the lantern
   * is lying on the bank where it was set down to go on in the dark.
   * He did not drown. He went through the wood to the coast. THE
   * CHOICE: hang it at the gate and light it (the wood's call), or
   * keep it (a light of your own, and the wood stays dark).
   * ================================================================ */
  private brackLines(s: NpcState): string[] {
    const step = stepOf(BRACK);
    const pick = (lines: string[]) => [lines[Math.min(s.said, lines.length - 1)]];
    switch (step) {
      case -1:
      case 0:
        return ['Don\'t stand between me and the water. Forty years I\'ve had my eyes on it and I\'ll not be the one who looks away. Somebody should go down and look IN it. It isn\'t going to be me.'];
      case 1:
        return pick(has(K.brackCame)
          ? ['I\'m coming as far as the last tree. Don\'t tell me what\'s in it till I\'m back up here.', 'Last tree. Go on.']
          : ['Down the shingle at the north end. There\'s the old cut through the bramble if you\'ve anything to cut with, or go round by the boat.',
            'The bank. North end. I\'ll be here.']);
      case 2:
        return ['A lantern. On my bank. Three years and nobody picked it up, because nobody goes down there, because I don\'t.'];
      case 3:
        return pick(['That\'s the wood gate\'s lantern. Its bracket\'s been empty since the night it should have been lit.',
          'Carry it up. It\'s a long road. It was a long road for him.']);
      case 4:
        return ['Hang it and light it, or put it in your coat. One of those is for the wood and one of them is for you.'];
      default:
        break;
    }
    const out = [
      has(K.lanternKept)
        ? 'You kept it. Well. The gate stays dark and you can see in it. That\'s one of us sorted.'
        : 'Lit. At the gate. The wood can call again and I can turn my back on the water, which I have wanted to do for forty years.',
      has(K.onPurpose) ? 'His marks go in and they don\'t come out. And there\'s no man in that water. So he walked out the far side and through my wood in the dark. On purpose.' : 'Nothing came up out of it. Right.',
      has(K.brackCame) ? 'I stood at the last tree. Forty paces. I\'ll go the forty-one next time.' : 'I didn\'t come down. You didn\'t ask twice.',
    ];
    return [out[s.said % out.length]];
  }

  /** Brack's part, taken: he comes down as far as the last tree and
   *  stands there, with his back to nothing for the first time. */
  brackComes() { knowledge.learn(K.brackCame); }
  brackStays() { /* he was already on the road; the cost is the toast */ }

  /** Whether LOOK IN THE WATER is the thing the key does at the bank. */
  get bankMine(): boolean {
    const st = stepOf(BRACK);
    /* the bank starts the promise as well as the man, so looking in
     * the water is the verb here from the first step, not the second:
     * a walker who came down the shingle before meeting him is not
     * sent forty paces back up the road to be allowed to look */
    return st >= -1 && st <= 1 && !has(K.looked);
  }
  /** E on the shingle. THE REVEAL of the whole tier. */
  lookInTheWater() {
    if (has(K.looked)) return;
    knowledge.learn(K.looked);
    knowledge.learn(K.onPurpose);
    say('walker', 'Nothing in it. The marks go in at the shingle and they don\'t come out — and there\'s nobody down there. I went across.', { hold: 6 });
    notebook.heard('YOU', 'The marks go into the water and do not come out, and there is nobody in it.');
  }

  /** Whether the choice at the wood gate is live: the lantern is in
   *  hand and the promise is at the bracket. */
  get gateMine(): boolean {
    return stepOf(BRACK) === 4 && things.held === 'the-lantern' && !has(K.lanternHung) && !has(K.lanternKept);
  }
  /** The card writes a door and nothing else, so what the door DOES is
   *  done here, the frame after: the lantern leaves the hand for good,
   *  onto a bracket or into a coat. */
  private tickLantern() {
    if (things.held !== 'the-lantern') return;
    if (has(K.lanternHung)) {
      things.consume('the-lantern');
      penwood.lantern.lit = true;
      say('walker', 'There. It only ever wanted somebody to be here at the right hour.', { hold: 4 });
      return;
    }
    if (has(K.lanternKept)) {
      things.consume('the-lantern');
      knowledge.learn(K.lantern);
      toast('YOURS: THE LANTERN', 'learned');
      say('walker', 'In the coat, then. The gate can stay dark.', { hold: 4 });
    }
  }

  /* ================================================================ *
   * 6. HOLT. THE WATER.
   *
   * He rigged the canyon a channel so it could spare water for the
   * feast. It was his alone; when he went, nobody could keep it, and
   * the canyon dried. THE TURN: what the canyon needs is the Flats,
   * who have the oasis, and the two lands have not spoken in three
   * years. THE CHOICE: rig it yourself — it works, and nobody learns
   * it — or walk Holt down to Amos, which takes an hour and puts two
   * men in front of each other. THE REVEAL is Amos's: he offered, that
   * morning, at the bridge, and was told no.
   * ================================================================ */
  private holtLines(s: NpcState): string[] {
    const step = stepOf(HOLT);
    const pick = (lines: string[]) => [lines[Math.min(s.said, lines.length - 1)]];
    const H = splitrock.holt;
    if (H.goal === 'walk' && H.atEdge) {
      return ['That\'s my line. Canyon stops there. I\'ve not been over it.'];
    }
    if (H.goal === 'walk' && !H.arrived) {
      return pick(['Walk on. I\'m behind you.', 'Keep going. I\'ll not lose you.']);
    }
    switch (step) {
      case -1:
      case 0:
        return ['River went. I stayed. You rigged me a channel once and it ran for a summer. Then you went, and nobody here knew which board went where, and it dried. Go up and look at what\'s left of it.'];
      case 1:
        return pick(['The head. Top of the dry bed, under the head wall.', 'Up. Keep the wall on your right.']);
      case 2:
        return ['Well?'];
      case 3:
        return ['Water. From the Flats. They\'ve an oasis and we\'ve a hole in the ground and neither of us has said a word to the other since the year you left. So: rig it yourself, or walk me down there.'];
      case 4:
        if (has(K.channelMine)) return pick(['Board\'s at the trestles. Same board.', 'Set it, then. You know where.']);
        return pick(['Then walk. I\'ll keep up.', 'Go on.']);
      default:
        break;
    }
    const out = [
      has(K.channelMine)
        ? 'Running. And I still don\'t know which board went where. Same as last time.'
        : 'Water\'s coming down from the Flats. I shouted up the cut this morning and it came back right. First time in three years.',
      has(K.amosSaw) ? 'He offered you a hand at that bridge. You said no to him and all.' : 'Boat\'s off the trestles. First time in years.',
      'Forty units of channel. I could have walked it in an afternoon.',
    ];
    return [out[s.said % out.length]];
  }

  /** Holt's part, let: he goes at the water himself, which is three
   *  years late and is still him going at it. */
  /** Holt's part, let: he goes at the water himself. What that looks
   *  like is him up at the head of his own channel once the way to do
   *  it has been settled — not before, because before that neither of
   *  you knows what it wants. */
  holtCarries() { knowledge.learn('promise:holt:channel-his'); }
  /** And not let: he sits down on the end of the trestle and stops
   *  oiling the boat, and stays there. */
  holtSits() { knowledge.learn(K.holtSat); }

  /** Whether SET THE BOARD is the verb at the channel head. */
  get boardMine(): boolean {
    return stepOf(HOLT) === 4 && has(K.channelMine) && !has(K.channelSet);
  }
  setTheBoard() {
    if (!this.boardMine) return;
    knowledge.learn(K.channelSet);
    knowledge.learn(K.water);
    say('walker', 'That one, across, and the short one under it. Nobody else is ever going to know that.', { hold: 5 });
  }

  /** He has stopped dead at his own border, and is waiting to be asked
   *  a second time. Every companion in this world stops there. */
  get holtAtEdge(): boolean { return splitrock.holt.atEdge; }

  /** The choice, taken at the trestles' card: he comes with you. */
  walkHolt() {
    if (has(K.holtWalks)) return;
    knowledge.learn(K.holtWalks);
    const H = splitrock.holt;
    H.goal = 'walk';
    H.atEdge = false;
    H.crossed = false;
    H.arrived = false;
  }

  /** Asked again, at the line. The one companion in this world that
   *  anybody has ever asked twice. */
  private askAgain() {
    const H = splitrock.holt;
    if (!H.atEdge) return;
    H.atEdge = false;
    H.crossed = true;
    const who = this.speaker('holt');
    if (who) { beckon(who, false); converse([{ who, text: 'Right. Well. You\'re asking, so.' }]); }
  }

  /** A talk with one of the three has just happened (`jobs.ts`). */
  talked(id: string) {
    if (id === 'holt') {
      if (splitrock.holt.atEdge) { this.askAgain(); return; }
      if (stepOf(HOLT) === 2) {
        const who = this.speaker('holt');
        const t = 'It isn\'t a board. It\'s water. There isn\'t any up here and there never was: I took it off the Flats, and you were the one who asked them.';
        if (who) { converse([{ who, text: t }]); notebook.heard('HOLT', t); }
      }
    }
    if (id === 'amos') this.amosSaid = false;
    if (id === 'amos' && splitrock.holt.arrived && !has(K.amosSaw)) {
      knowledge.learn(K.amosSaw);
      const holt = this.speaker('holt');
      if (holt) this.after(2.4, () => converse([{ who: holt, text: 'You never said that. Either of you.' }]));
    }
    if (id === 'val' && stepOf(VAL) < 1 && !has(K.valWhy)) {
      const who = this.speaker('val');
      const t = 'It isn\'t the view. It\'s that with a gap in it the green can see us and we can see the green, and then it has to be settled. That\'s why it\'s shut.';
      if (who) { converse([{ who, text: t }]); notebook.heard('VAL', t); }
      knowledge.learn(K.valWhy);
    }
    if (id === 'brack' && stepOf(BRACK) < 1 && !has(K.brackWhy)) {
      const who = this.speaker('brack');
      const t = 'The lantern at the wood gate should have been lit that night and it wasn\'t, and the wood didn\'t come, and I\'ve watched this water ever since in case it was in there.';
      if (who) { converse([{ who, text: t }]); notebook.heard('BRACK', t); }
      knowledge.learn(K.brackWhy);
    }
  }

  /* ---- Holt's walk ------------------------------------------------ *
   * He has no pace of his own. He keeps up with whoever is walking him,
   * which is what walking somebody somewhere is, and he stops dead at
   * his own border, which is what every companion in this world does
   * (`company.ts`). The difference is that this one can be asked again.
   * -------------------------------------------------------------- */
  private tickHolt(dt: number) {
    const H = splitrock.holt;
    /* the door is taken on the trestles' card, which writes a piece of
     * knowledge and nothing else: the walk starts from reading it */
    if (has(K.holtWalks) && H.goal !== 'walk' && !has(K.holtArrived)) {
      H.goal = 'walk';
      H.atEdge = false;
      H.crossed = false;
      H.arrived = false;
    }
    if (has(K.holtArrived)) { H.goal = 'walk'; H.crossed = true; H.arrived = true; H.x = CATCH.x - 7.2; H.z = CATCH.z + 3.4; }
    if (H.goal !== 'walk' || H.arrived) return;
    const w = this.walker();
    const dx = w.x - H.x;
    const dz = w.z - H.z;
    const d = Math.hypot(dx, dz);
    H.moving = false;
    if (d > 2.8) {
      /* he keeps up, and a little faster than a walk when he is behind,
       * so he is never the reason you are standing still */
      const pace = Math.min(9.5, 3.2 + (d - 2.8) * 0.9);
      const step = Math.min(d - 2.4, pace * dt);
      if (step > 0) {
        H.x += (dx / d) * step;
        H.z += (dz / d) * step;
        H.face = dx >= 0 ? 1 : -1;
        H.moving = true;
      }
    }
    /* THE LINE. Nothing in this world can give a companion a position
     * outside its own land, so he does not cross it; he is held at it,
     * and he says so, and he waits to be asked. */
    if (!H.crossed && H.z > CANYON_EDGE) {
      H.z = CANYON_EDGE;
      H.moving = false;
      if (!H.atEdge && this.near(H.x, H.z, 26)) {
        H.atEdge = true;
        const who = this.speaker('holt');
        const t = 'That\'s my line. I\'ve not been over it.';
        if (who) { say(who, t, { hold: 4 }); beckon(who, true); notebook.heard('HOLT', t); }
      }
    }
    if (H.atEdge && !this.near(H.x, H.z, 40)) return;
    if (H.crossed && Math.hypot(H.x - CATCH.x, H.z - CATCH.z) < 9) {
      H.arrived = true;
      H.moving = false;
      knowledge.learn(K.holtArrived);
      knowledge.learn(K.water);
      const who = this.speaker('holt');
      if (who) { beckon(who, false); this.after(1.2, () => converse([{ who, text: 'So that\'s an oasis. ...Right. We\'ll want a word about a pipe.' }])); }
    }
  }

  /** THE CALLS, PUT BACK. The lantern burns at the wood gate every
   *  night from the night it is hung; the porch lights show from the
   *  green once the gap is cut; the echo comes back right once the
   *  Flats have answered. None of them is a system switched on: each is
   *  a side effect of a promise kept, and the lands draw them. */
  private echoSaid = false;
  private tickCalls(dt: number) {
    penwood.lantern.lit = has(K.lanternHung);
    penwood.lantern.t += dt;
    /* the echo, heard once, by anybody standing in the cut after it */
    if (!this.echoSaid && waterRuns() && this.near(CUT_MIDDLE.x, CUT_MIDDLE.z, 60) && stepOf(HOLT) === 99) {
      this.echoSaid = true;
      shout('THE CUT ANSWERS YOU BACK, ON THE BEAT');
    }
  }

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
    this.tickHolt(dt);
    this.tickLantern();
    this.tickCalls(dt);
  }
}

export const tier2 = new Tier2();
