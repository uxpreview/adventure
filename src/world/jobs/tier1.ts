import { knowledge } from '../knowledge';
import { tier1, K } from '../tier1';
import { CHAIN, BRAZIERS, BELFRY, MARGET_STALL } from '../tier1-state';
import { type JobSpec, talkedTo, known, any } from './triggers';

/**
 * TIER 1: THE CAPABLE HELPER (`design/foundation/08` §9, promises 1 to
 * 3), hung on their lines of THE LIST.
 *
 *   1. Wick. Find out why the old road is closed. Don't let him tell
 *      you it's nothing.
 *   2. Nell. Get the bull home.          (the opening: `opening.ts`)
 *   3. Marget. I owe her. Pay it.
 *
 * What the people say and do while these are kept is `../tier1.ts`;
 * what the lands draw is `regions/civic.ts`. Nell's job is given and
 * ticked by the opening and hangs on her line there.
 */

const has = (id: string) => known(id)();

export const WICK_JOB: JobSpec = {
  id: 'job:wick', line: 'wick', promise: true, firstTalkCounts: true,
  land: 'castle', giver: 'wick', name: 'THE OLD ROAD',
  pin: { x: BRAZIERS.x, z: BRAZIERS.z, label: 'THE BRAZIERS' },
  /* reading the chain is a way into it, as well as the man */
  startsAt: { x: CHAIN.x, z: CHAIN.z, r: 6.5 },
  reward: 'THE HALL AT GREYWEATHER, TO COME HOME TO',
  shout: () => (has(K.roadLeft)
    ? 'AT GREYWEATHER, THE ROAD STAYS CHAINED. THE CASTLE\'S WORD GOES BY YOU, ON FOOT.'
    : 'AT GREYWEATHER, A CHAIN COMES OFF THE KING\'S ROAD'),
  steps: [
    { text: 'ASK WICK, UP AT THE CASTLE GATE, WHY THE ROAD IS CHAINED', when: talkedTo('wick') },
    { text: 'HE SAYS IT IS NOTHING. ASK HIM AGAIN.', when: talkedTo('wick') },
    { text: 'BE AT THE BRAZIERS WHEN HE LIGHTS THEM, AT DUSK', when: known(K.wickLit) },
    { text: 'ASK WICK WHO THE FIRES ARE FOR', when: talkedTo('wick'), onDone: () => { knowledge.learn(K.wickCall); } },
    { text: 'THE ROAD: OPEN IT, OR LEAVE IT CHAINED. TELL WICK.', when: any(known(K.roadOpened), known(K.roadLeft)) },
    {
      text: () => (has(K.roadLeft) ? 'CARRY WICK\'S WORD DOWN TO MARGET, IN BRIM SQUARE'
        : has(K.wickSat) ? 'TAKE THE CHAIN DOWN YOURSELF, AT THE CHAIN'
          : tier1.wickGoing ? 'WICK IS WALKING DOWN TO UNHOOK THE CHAIN'
            : 'THE CHAIN COMES DOWN. ANSWER WICK.'),
      when: any(known(K.chainDown), known(K.wordCarried)),
      pin: () => (has(K.roadLeft) ? { x: MARGET_STALL.x, z: MARGET_STALL.z - 7, label: 'BRIM SQUARE' } : { x: CHAIN.x, z: CHAIN.z, label: 'THE CHAIN' }),
    },
  ],
};

export const MARGET_JOB: JobSpec = {
  id: 'job:marget', line: 'marget', promise: true,
  land: 'kingdom', giver: 'marget', name: 'THE DEBT',
  pin: { x: BELFRY.x, z: BELFRY.z, label: 'THE BELFRY' },
  reward: 'WAIT: T PASSES THE TIME, ANYWHERE',
  shout: 'IN BRIM, THE COVERS COME OFF THE STALLS FOR THE FIRST TIME IN THREE YEARS',
  steps: [
    { text: 'PAY MARGET', when: talkedTo('marget'), pin: { x: MARGET_STALL.x, z: MARGET_STALL.z, label: 'MARGET\'S STALL' } },
    { text: 'WAIT IN THE BELFRY YARD TILL THE LAMPS COME ON', when: any(known(K.hour), known('fact:brim-hour')), pin: { x: BELFRY.x, z: BELFRY.z, label: 'THE BELFRY' } },
    { text: 'SAY WHICH HAND IS RIGHT, AT THE BELFRY', when: any(known(K.eight), known(K.eleven)) },
    { text: 'TELL MARGET THE HOUR', when: () => tier1.bellAnswered(), pin: { x: MARGET_STALL.x, z: MARGET_STALL.z, label: 'MARGET\'S STALL' } },
    {
      text: () => (has(K.margetSat) ? 'RING THE BELL YOURSELF, IN THE BELFRY YARD' : 'MARGET IS WALKING TO THE BELFRY TO RING IT'),
      when: known(K.rung), pin: { x: BELFRY.x, z: BELFRY.z, label: 'THE BELFRY' },
    },
  ],
};

export const TIER1_JOBS: JobSpec[] = [WICK_JOB, MARGET_JOB];
