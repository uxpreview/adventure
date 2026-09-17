import { notebook } from './notebook';
import { npcs, type NpcState } from './npc';
import { knowledge } from './knowledge';
import { handle } from './handle';
import { clock } from './daylight';
import { say, type Speaker } from '../ui/speech';
import {
  greyweather, brim, ringBell, BELFRY, BRAZIERS, MARGET_STALL,
} from './tier1-state';

/**
 * TIER 1: THE CAPABLE HELPER (`design/foundation/08` §9, promises 1 to
 * 3). Wick and the old road, Nell and the bull, Marget and the debt.
 * Literal, funny, plainly good, and each one with its turn, its choice,
 * what it changes for good, and the call it puts back.
 *
 * The jobs themselves are in `jobs/tier1.ts`, hung on their lines of
 * THE LIST. This is what the people say while a promise is being kept
 * and what they do about it: Wick's fires at dusk, Marget's walk to the
 * bell, the well answering Nell. Nell's bull is the opening
 * (`opening.ts`); what is here of hers is the turn said on either road
 * and the Common's call.
 *
 * What a person says comes from here by the step their promise is on,
 * the way Nell's lines come from the opening by its stage.
 *
 * ONE VOICE AT A TIME: a talk is a bubble; a step is the objective
 * line; a choice is read back by the notebook's one toast. Nothing
 * here says the same thing two ways.
 */

export const WICK = 'job:wick';
export const MARGET = 'job:marget';

/* ---- what is permanent (all silent: `promise:` is never a toast) ---- */
export const K = {
  wickLit: 'promise:wick:lit',
  wickCall: 'promise:wick:call',
  chainDown: 'promise:wick:chain-down',
  wordCarried: 'promise:wick:word-carried',
  wickSat: 'promise:wick:sat',
  wickHeardBell: 'promise:wick:heard-bell',
  roadOpened: 'door:the-road-opened',
  roadLeft: 'door:the-road-left',
  hour: 'promise:marget:hour',
  rung: 'promise:marget:rung',
  margetSat: 'promise:marget:sat',
  covered: 'promise:marget:covered',
  eight: 'door:the-clock-set-to-eight',
  eleven: 'door:the-clock-set-to-eleven',
  wait: 'promise:verb-wait',
  wellHeard: 'promise:nell:well',
} as const;

const has = (id: string) => knowledge.has(id);
const stepOf = (jobId: string): number => {
  const j = notebook.list().find((x) => x.id === jobId);
  return !j ? -1 : j.complete ? 99 : j.done;
};

/** The market has been called, by this build's bell or an old save's. */
export const marketCalled = () => has(K.rung) || has('reason:brim');
/** Which hand Brim keeps, once somebody has said. */
export const brimHour = (): 0 | 8 | 11 => (has(K.eight) ? 8 : has(K.eleven) ? 11 : 0);
/** The hour on the day clock the bell rings at. */
const bellHour = () => (brimHour() === 11 ? 23 : 20);
const HOUR_WORD = { 0: '', 8: 'EIGHT', 11: 'ELEVEN' } as const;

/** He stood in the belfry yard while the lamps came on (an old save
 *  learned it as a fact). */
export const hourKnown = () => has(K.hour) || has('fact:brim-hour');
export const wickStep = () => stepOf(WICK);
export const margetStep = () => stepOf(MARGET);
/** Wick's line is kept: the hall is his to come home to. */
export const wickKept = () => stepOf(WICK) === 99;

/** The road is open: chain down, by whoever's hand. */
export const roadOpen = () => has(K.chainDown);
/** WAIT is his: T, or the button, passes the time anywhere. */
export const canWait = () => has(K.wait);

/** Whether Wick is out at the fires: from dusk, when he lights them,
 *  right through the night to his morning round. He has waited up for
 *  that bell every night for three years. */
export const duskAtTheFires = () => clock.hour >= 18.9 || clock.hour < 5.3;
/** Marget is kept at her stall past dusk: her own promise hangs on the
 *  hour, or Wick's word is on its way down the hill to her. */
export const margetStays = () => {
  const m = stepOf(MARGET);
  return (m >= 1 && m <= 4) || (stepOf(WICK) === 5 && has(K.roadLeft) && !has(K.wordCarried));
};

type Timer = { at: number; fn: () => void };

class Tier1 {
  private elapsed = 0;
  private timers: Timer[] = [];
  private walker: () => { x: number; z: number } = () => ({ x: 0, z: 0 });
  private installed = false;
  private duskSaid = false;
  private hobDue = -1;
  private lastHour = -1;

  private after(sec: number, fn: () => void) {
    this.timers.push({ at: this.elapsed + sec, fn });
  }

  install(walker: () => { x: number; z: number }) {
    if (this.installed) return;
    this.installed = true;
    this.walker = walker;
    const wick = npcs.get('wick');
    if (wick) {
      wick.def.lines = (s) => this.wickLines(s);
      wick.def.want = undefined;
    }
    const marget = npcs.get('marget');
    if (marget) {
      marget.def.lines = (s) => this.margetLines(s);
      marget.def.want = undefined;
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
   * 1. WICK. THE OLD ROAD.
   *
   * The king's road is chained below the avenue and a board on the
   * chain says it is nothing. It is not nothing: he lights the two
   * fires at the gate every dusk and stands in front of them facing
   * Brim, waiting for a bell that has not rung in three years, and he
   * chained the road so nobody would come up it and see him do it.
   * THE TURN: the fires are not for the king. They are the castle's
   * call. THE CHOICE: open the road (and he is seen), or leave it
   * chained and carry his word down yourself, the old way.
   * ================================================================ */
  private wickLines(s: NpcState): string[] {
    const step = stepOf(WICK);
    const pick = (lines: string[]) => [lines[Math.min(s.said, lines.length - 1)]];
    switch (step) {
      case -1:
      case 0:
        /* the first thing he says to him is the job (the registry gives
         * it on this talk); it is also the first step's answer */
        return ['You. Well. The road? It\'s nothing. Roads close. Go back down.'];
      case 1:
        return ['I said it\'s nothing. ...You\'re not going to leave it, are you. You never did. Be at the fires at dusk, then, and see how much nothing it is.'];
      case 2:
        return pick(duskAtTheFires()
          ? ['Stand there. Don\'t help.', 'Watch, if you\'re watching.']
          : ['Dusk. At the fires. I light them at dusk.', 'Not yet. Dusk. Wait by the fires if you\'ve nothing to do, which would be a first.']);
      case 3:
        /* THE TURN, in two breaths (`talked` queues the second) */
        return ['They\'re not for the king. King\'s not coming. They\'re for Brim. I light, the bell rings back, and everyone knows the castle\'s coming down the hill. Your arrangement.'];
      case 4:
        return ['Well? The chain. It\'s your road as much as mine.'];
      case 5:
        if (has(K.roadLeft)) return pick(['Tell Marget the castle\'s lit. Same as every night. She\'ll not have heard it from anybody in three years.', 'Marget. In Brim. The castle\'s lit. Go on.']);
        if (has(K.wickSat)) return pick(['Your chain. You said. It\'s on a hook, west post.', 'West post. Lift it off the hook. I\'m sat.']);
        return pick(['I\'m going. I put it up, I\'ll take it down.', 'Walk down with me or don\'t.']);
      default:
        break;
    }
    // kept
    const cycle = (lines: string[]) => [lines[s.said % lines.length]];
    if (has(K.roadLeft)) {
      return cycle([
        'Lit again tonight. You\'ll tell her. You always told her.',
        'Hall\'s open. Fire\'s in. It was yours before and nobody else has the nerve.',
        'Chain\'s still up. Nobody sees a thing. That\'s how I like it. I think.',
      ]);
    }
    return cycle([
      has(K.wickSat) ? 'You took it down yourself. Course you did. I watched from here.' : 'There. Let them look.',
      'Hall\'s open. Fire\'s in. It was yours before and nobody else has the nerve.',
      'Two pilgrims came up at four and watched me light them. One of them clapped.',
      marketCalled() ? `It rang. Did you hear it? ${HOUR_WORD[brimHour()] || 'The hour'}, and it rang.` : 'Bell still hasn\'t rung. But they can see me not hearing it now. Progress.',
    ]);
  }

  /** The fires, watched: what he says out loud to nobody. */
  private tickDusk() {
    if (stepOf(WICK) !== 2 || has(K.wickLit) || this.duskSaid) return;
    const w = greyweather.wick;
    if (!w.watching || !w.present || !this.near(BRAZIERS.x, BRAZIERS.z, 20)) return;
    this.duskSaid = true;
    const who = this.speaker('wick');
    if (!who) return;
    /* one line at a time, each after the last has gone (he may still
     * be finishing what he said when he was asked), and the step is
     * ticked when he has said the last of it */
    const line = (t: string, then: () => void) => { say(who, t, { then }); notebook.heard('WICK', t); };
    this.after(1.2, () => line('There. Lit.', () =>
      this.after(1.6, () => line('Now the bell.', () =>
        this.after(4.5, () => line('...No. Well. Not tonight.', () => knowledge.learn(K.wickLit)))))));
  }

  /** The door is taken at him (a card, `regions/civic.ts`): what he
   *  does about it, and the part he offers to do himself. */
  private roadDecided = false;
  private tickRoad() {
    if (this.roadDecided || stepOf(WICK) !== 5) return;
    this.roadDecided = true;
    const who = this.speaker('wick');
    if (has(K.roadLeft)) {
      if (who) this.after(1.0, () => { say(who, 'Chained, then. Then it goes by you, like it always did. Tell Marget the castle\'s lit.', { now: true }); notebook.heard('WICK', 'Tell Marget the castle\'s lit.'); });
      notebook.place('BRIM SQUARE', MARGET_STALL.x, MARGET_STALL.z - 7, { quiet: true });
      return;
    }
    if (has(K.chainDown)) return;
    if (has(K.wickSat)) return; // a reload: the chain is already his
    /* THE THREE VERBS: his part is the chain, and he offers it */
    this.after(1.0, () => handle.offer({
      id: 'wick-chain', who: 'WICK', speaker: who,
      line: 'Open, then. I\'ll walk down and unhook it. I put it up.',
      yes: { label: 'YOU TAKE IT DOWN, WICK.', said: 'You take it down, Wick.', run: () => { greyweather.wick.goal = 'out'; greyweather.wick.arrived = false; } },
      mine: {
        reply: 'Course you will.',
        what: 'I TAKE THE CHAIN DOWN MYSELF',
        cost: 'WICK SITS DOWN ON THE MOUNTING BLOCK. THE CHAIN IS YOURS.',
        run: () => { knowledge.learn(K.wickSat); },
      },
      seconds: 10,
    }));
  }

  /** He has walked down to it: off the hook it comes. */
  private tickChain() {
    const w = greyweather.wick;
    if (w.goal !== 'out' || !w.arrived || has(K.chainDown)) return;
    /* what he says about it is the job's read-back (`jobs.ts`), once */
    knowledge.learn(K.chainDown);
    this.after(6, () => { w.goal = 'home'; w.arrived = false; });
  }

  /** E at the chain, when the chain is his. */
  takeChainDown() {
    if (has(K.chainDown)) return;
    knowledge.learn(K.chainDown);
    say('walker', 'Off the hook. It was never locked.', { now: true });
  }
  /** Whether the chain is the walker's to take down, here and now. */
  get chainMine(): boolean {
    return stepOf(WICK) === 5 && has(K.wickSat) && !has(K.chainDown);
  }

  /* ================================================================ *
   * 3. MARGET. THE DEBT.
   *
   * She fronted five stalls for the gathering and they have stood set
   * and covered for three years. She wants paying and he has half a
   * sandwich. Paid the other way: get the market called, which needs
   * an hour, which needs somebody to stand in the belfry yard while
   * the lamps come on and say which hand agrees with them. THE CHOICE:
   * which hand is right; one person in Brim is wrong for good. THE
   * TURN is never hers to say: she covered for him the week before,
   * and Hob says so after.
   * ================================================================ */
  private margetLines(s: NpcState): string[] {
    const step = stepOf(MARGET);
    const pick = (lines: string[]) => [lines[Math.min(s.said, lines.length - 1)]];
    /* Wick's word, carried down the hill the old way */
    if (stepOf(WICK) === 5 && has(K.roadLeft) && !has(K.wordCarried)) {
      return ['Lit, is it. He could open his road and I\'d see it from my own stall. But no. You, on foot. Same as ever.'];
    }
    switch (step) {
      case -1:
        return ['You. Three years, and in you walk like it\'s Tuesday. You owe me for five stalls.'];
      case 0:
        return ['Turn your pockets out, then. ...Half a sandwich. Course.'];
      case 1:
        return pick(['THE BELFRY yard, till the lamps come on. One hand on that clock agrees with them, and nobody here ever stood still long enough to see which.', 'Go and wait. You used to be good at everything but that.']);
      case 2:
        return ['You saw it. Then go back and say which, at THE BELFRY. Somebody\'ll be wrong. Somebody\'s been wrong for years.'];
      case 3:
        return [`${HOUR_WORD[brimHour()]}. Right.`];
      case 4:
        if (has(K.margetSat)) return pick(['Your bell. You said. The rope\'s in the belfry yard.', 'Go on. I\'m sat.']);
        return ['I\'m going, I\'m going.'];
      default:
        break;
    }
    const out = [
      has(K.margetSat) ? 'You rang it yourself. Course. We\'re square.' : 'There. I rang it. We\'re square.',
      has(K.covered) ? 'Hob talks. It wasn\'t money. It was never money. Don\'t make a thing of it.' : 'Cloth\'s out. Take a yard of the red. It suits you.',
      brimHour() === 8 ? 'Dorrie bakes for eleven. She\'ll bake for eleven till she dies. Buy a loaf at eight anyway; it\'s yesterday\'s.' : 'Eleven. Fenn lights his lamps at four in the afternoon now. Nobody\'s told him. Don\'t.',
    ];
    if (roadOpen()) out.push('You can see his fires from the square now. Every night. Daft old man.');
    return [out[s.said % out.length]];
  }

  /** A talk with her has just happened (`jobs.ts` tells us). */
  talked(id: string) {
    if (id === 'wick' && stepOf(WICK) === 3) {
      const who = this.speaker('wick');
      const t = 'Three years I\'ve lit them. It\'s never rung. So I chained the road. A man lighting fires at nobody: you don\'t want that seen.';
      if (who) { say(who, t, { hold: 7 }); notebook.heard('WICK', t); }
    }
    if (id === 'marget' && stepOf(MARGET) === 0) {
      const who = this.speaker('marget');
      const t = 'Pay it the other way: get my market called. Wait in THE BELFRY yard till the lamps come on. One hand on that clock will agree with them.';
      if (who) { say(who, t, { hold: 7 }); notebook.heard('MARGET', t); }
    }
    if (id === 'marget') {
      const step = stepOf(MARGET);
      if (stepOf(WICK) === 5 && has(K.roadLeft) && !has(K.wordCarried)) {
        knowledge.learn(K.wordCarried);
        return;
      }
      if (step === 3 && !handle.done('marget-bell')) this.offerBell();
    }
  }

  private offerBell() {
    const who = this.speaker('marget');
    handle.offer({
      id: 'marget-bell', who: 'MARGET', speaker: who,
      line: 'I\'ll go and ring it, then. It\'s my bell as much as anyone\'s.',
      yes: { label: 'YOU RING IT, MARGET.', said: 'You ring it, Marget.', run: () => { brim.marget.goal = 'out'; brim.marget.arrived = false; } },
      mine: {
        reply: 'Course you will.',
        what: 'I RING THE BELL MYSELF',
        cost: 'MARGET SITS DOWN BEHIND HER STALL. THE ROPE IS YOURS.',
        run: () => { knowledge.learn(K.margetSat); },
      },
      seconds: 10,
    });
  }
  /** Whether the offer has been answered, for the job's step. */
  bellAnswered = () => handle.done('marget-bell') || has(K.margetSat) || has(K.rung) || brim.marget.goal === 'out';

  /** Whether the rope is the walker's to pull, here and now. */
  get ropeMine(): boolean {
    return stepOf(MARGET) === 4 && has(K.margetSat) && !has(K.rung) && !this.ringing;
  }

  /** The bell, rung for the first time at an hour somebody knows. The
   *  strokes have the page to themselves; what it changes comes when
   *  they have finished (one voice at a time). */
  private ringing = false;
  ring(byHim: boolean) {
    if (this.ringing || has(K.rung)) return;
    this.ringing = true;
    void byHim;
    this.strike();
    this.after(4.8, () => {
      knowledge.learn(K.rung);
      knowledge.learn(K.wait);
      this.hobDue = this.elapsed + 9;
    });
  }

  private strike() {
    const n = brimHour() || 8;
    ringBell(n);
    const bell: Speaker = { name: 'THE BELL', x: BELFRY.x, z: BELFRY.z, y: 9 };
    say(bell, `${'BONG. '.repeat(3)}— ${HOUR_WORD[n as 8 | 11]}.`, { hold: 4.5 });
  }

  private tickMarget() {
    const m = brim.marget;
    /* a reloaded page: she had said she would go, and had not got there */
    if (stepOf(MARGET) === 4 && !has(K.margetSat) && !has(K.rung) && m.goal === 'home') { m.goal = 'out'; m.arrived = false; }
    if (m.goal === 'out' && m.arrived && !has(K.rung) && !this.ringing) {
      this.ring(false);
      this.after(7, () => { m.goal = 'home'; m.arrived = false; });
    }
    /* THE TURN, from somebody else: Hob, when she has finished */
    if (this.hobDue > 0 && this.elapsed > this.hobDue && !has(K.covered)) {
      const hob = brim.folk.hob;
      if (hob && hob.present && this.near(hob.x, hob.z, 16)) {
        this.hobDue = -1;
        knowledge.learn(K.covered);
        const who = this.speaker('hob');
        const t = 'She did your rounds the week before, you know. The ones you couldn\'t get to. Never said. That\'s the debt.';
        if (who) { say(who, t, { hold: 6.5 }); notebook.heard('HOB', t); }
      }
    }
    if (has(K.rung) && !has(K.covered) && this.hobDue < 0) this.hobDue = this.elapsed + 4; // a reload
  }

  /** THE BELL, AT A KNOWN HOUR, every day from now on: and if the
   *  road is open or he has told you what the fires are for, Wick
   *  hears it. The castle to Brim, by ear and by sight. */
  private tickBell() {
    if (!marketCalled()) return;
    const h = clock.hour;
    const at = bellHour();
    const crossed = this.lastHour >= 0 && this.lastHour < at && h >= at && h - this.lastHour < 2;
    this.lastHour = h;
    if (!crossed) return;
    const w = this.walker();
    if (Math.hypot(w.x - BELFRY.x, w.z - BELFRY.z) < 230) this.strike();
    if (has(K.wickCall) && !has(K.wickHeardBell) && this.near(BRAZIERS.x, BRAZIERS.z, 45) && greyweather.wick.present) {
      knowledge.learn(K.wickHeardBell);
      const who = this.speaker('wick');
      const t = 'That\'s the bell. At an hour. ...Right. Well. Good.';
      if (who) this.after(5, () => { say(who, t); notebook.heard('WICK', t); });
    }
  }

  /* ================================================================ *
   * 2. NELL. The bull is the opening. What is here is the Common's
   * call: the well answers a shout, late, where you can read it, and
   * once the bull is home Nell answers it too.
   * ================================================================ */
  private wellSaid = 0;
  /** The land says the well has been shouted down. */
  wellShouted(x: number, z: number) {
    say('walker', 'HELLO?', { now: true, hold: 1.6 });
    void x; void z;
  }
  /** The land says the well has answered. */
  wellAnswered(x: number, z: number) {
    const well: Speaker = { name: 'THE WELL', x, z, y: 1.6 };
    say(well, '. . . hello?', { hold: 2.6 });
    const bullHome = notebook.list().some((j) => j.id === 'get-it-home' && j.complete);
    if (!bullHome) return;
    const nell = this.speaker('nell');
    if (!nell) return;
    const lines = [
      'I heard that. The whole Common heard that. That\'s what it\'s for.',
      'Shout down it and everybody on the green knows you want them. Takes its time. So did you.',
      'Heard you.',
    ];
    const t = lines[Math.min(this.wellSaid++, lines.length - 1)];
    knowledge.learn(K.wellHeard);
    this.after(3.2, () => { say(nell, t); notebook.heard('NELL', t); });
  }

  /* ---- the frame ---------------------------------------------------- */
  tick(dt: number) {
    this.elapsed += dt;
    if (this.timers.length) {
      const due = this.timers.filter((t) => t.at <= this.elapsed);
      if (due.length) {
        this.timers = this.timers.filter((t) => t.at > this.elapsed);
        for (const t of due) t.fn();
      }
    }
    this.tickDusk();
    this.tickRoad();
    this.tickChain();
    this.tickMarget();
    this.tickBell();
  }
}

export const tier1 = new Tier1();
