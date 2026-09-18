import { say, hush, type Speaker } from '../ui/speech';
import { openReplies, closeReplies } from '../ui/replies';
import { converse } from '../ui/converse';
import { toast } from '../ui/toast';
import { notebook } from './notebook';

/**
 * "I'LL HANDLE IT." (the three verbs; story of record §2.)
 *
 * Somebody offers to do their part, and there are two things to say
 * back: let them, or I'LL HANDLE IT. It always works: the part is yours
 * and you can do it. It always costs somebody something you can see:
 * the person who offered stops offering, sits down, or waits. The
 * notebook keeps the count, and an offer's cost is handed the count so
 * it can rise.
 *
 * An offer is put on the table with `offer()`. Nothing stops while it
 * is up. Unanswered, it expires into the person doing their part, which
 * is what they would have done anyway.
 */

export const HANDLE_LABEL = 'I\'LL HANDLE IT.';

export type Offer = {
  id: string;
  /** Who is offering: the name for the notebook, the speaker for the bubble. */
  who: string;
  speaker: Speaker | null;
  /** What they say, offering. Null if they have just said it. */
  line: string | null;
  /** Letting them. */
  yes: { label: string; said?: string; reply?: string; run?: () => void };
  /** I'LL HANDLE IT: what they say back, what it is that is now yours,
   *  what it cost (for the notebook), and the cost itself, seen. */
  mine: { reply: string; what: string; cost: string; run: (count: number) => void };
  /** Asked on the move (a bull behind you, a boy who does not stop): a
   *  line over their head and answers on a clock. Otherwise an offer is
   *  a conversation: the walker stops and the answers wait. */
  live?: boolean;
  /** How long a live offer's answers stay up. */
  seconds?: number;
  /** Unanswered: they do their part (the default), or nothing happens
   *  and the offer can be made again. */
  unanswered?: 'yes' | 'nothing';
};

class Handle {
  /** Offers answered, so nobody offers the same thing twice. */
  private answered = new Set<string>();

  get count() {
    return notebook.handled.length;
  }

  /** Whether an offer has been answered either way (or expired). */
  done(id: string) {
    return this.answered.has(id) || notebook.handled.some((h) => h.what === id);
  }

  offer(o: Offer) {
    if (this.done(o.id)) return;
    if (o.line) notebook.heard(o.who, o.line);
    /* what is said back, and what they say to that: over heads on the
     * move, or the next lines of the conversation standing still */
    const back = (said: string | undefined, reply: string | undefined) => {
      if (reply) notebook.heard(o.who, reply);
      if (o.live) {
        if (said) say('walker', said);
        if (reply && o.speaker) say(o.speaker, reply, { now: true });
        else if (o.speaker) hush(o.speaker);
        return;
      }
      if (reply && o.speaker) converse([{ who: o.speaker, text: reply }]);
    };
    const yes = () => {
      this.answered.add(o.id);
      back(o.yes.said, o.yes.reply);
      o.yes.run?.();
    };
    const mine = () => {
      this.answered.add(o.id);
      back('I\'ll handle it.', o.mine.reply);
      notebook.handle(o.who, o.id, o.mine.cost);
      notebook.chose(`handled:${o.id}`, `I'LL HANDLE IT — ${o.mine.what}`, o.mine.cost);
      toast(o.mine.cost, 'plain');
      o.mine.run(this.count);
    };
    const replies = [
      { label: o.yes.label, pick: yes },
      /* gate round 5: "handle what?" The answer names what becomes yours */
      { label: `${HANDLE_LABEL} (${o.mine.what})`, pick: mine },
    ];
    if (!o.live && o.speaker) {
      converse([{ who: o.speaker, text: o.line ?? 'Well?' }], { replies });
      return;
    }
    if (o.line && o.speaker) say(o.speaker, o.line, { hold: Math.max(4, (o.seconds ?? 10) * 0.6) });
    openReplies(replies, o.seconds ?? 10, () => {
      if (o.unanswered === 'nothing') return;
      this.answered.add(o.id);
      o.yes.run?.();
    });
  }

  /** Take the answers off the page (the moment has gone). */
  withdraw() {
    closeReplies();
  }
}

export const handle = new Handle();
