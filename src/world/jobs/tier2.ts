import { tier2, K } from '../tier2';
import {
  CHAIRS, HEDGE, CLIPPERS, VAL_GATE, BANK, WOOD_GATE, TARN,
  TRESTLES, CHANNEL, CATCH,
} from '../tier2-state';
import { toys } from '../toys';
import { type JobSpec, talkedTo, known, holding, carried, reach, any } from './triggers';

/**
 * TIER 2: THE CONSEQUENCES OF HIS METHODS (`design/foundation/08` §9,
 * promises 4 to 6), hung on their lines of THE LIST. Each one shows, in
 * its own way, THAT HE LEFT — on foot, on purpose.
 *
 *   4. Val. Cut the gap in the hedge.
 *   5. Brack. Go and look in the lake.
 *   6. Holt. Find out how much water.
 *
 * What the people say and do while these are kept is `../tier2.ts`;
 * what the lands draw is `regions/civic.ts` and `regions/wilds.ts`.
 *
 * Every task here is a played verb. You pick the clippers up and cut
 * with them; you carry a lantern four hundred units up a wood road;
 * you walk a man out of his own land. Nothing in this tier is a wait.
 */

const has = (id: string) => known(id)();

/* ================================================================== *
 * 4. VAL. THE GAP IN THE HEDGE.
 * ================================================================== */
export const VAL_JOB: JobSpec = {
  id: 'job:val', line: 'val', promise: true, firstTalkCounts: true,
  land: 'neighborhood', giver: 'val', name: 'THE GAP IN THE HEDGE',
  pin: { x: CHAIRS.x, z: CHAIRS.z, label: 'THE THREE CHAIRS' },
  /* the chairs start it as well as the woman: three chairs facing a
   * hedge is a question whether or not you have met her */
  startsAt: { x: CHAIRS.x, z: CHAIRS.z, r: 7 },
  reward: 'THE CLIPPERS',
  shout: () => (has(K.greenTakes)
    ? 'IN MAPLE COURT, A HEDGE HAS A GAP, AND A PORCH LIGHT GOES OFF'
    : 'IN MAPLE COURT, A HEDGE HAS A GAP AGAIN'),
  offer: {
    line: 'I\'d have it out myself if somebody held the far end. June would. I\'ll go and ask her.',
    while: () => !has(K.gapCut),
    yes: {
      label: 'ASK JUNE.', reply: 'She\'ll be glad of it. Nobody\'s asked her for anything in years.',
      run: () => { tier2.askJune(); },
    },
    mine: {
      reply: 'Of course you will.',
      what: 'THE HEDGE IS MINE',
      cost: 'VAL DOES NOT ASK JUNE. JUNE STAYS AT HER OWN GATE.',
      run: () => { tier2.juneNotAsked(); },
    },
  },
  steps: [
    /* or cut it first and ask her after, which is exactly what he would
     * do: the step takes the cut as its answer */
    { text: 'ASK VAL WHY THREE CHAIRS FACE A HEDGE', when: any(talkedTo('val'), known(K.gapCut)), pin: { x: VAL_GATE.x, z: VAL_GATE.z, label: 'MAPLE COURT' } },
    { text: 'THE CLIPPERS ARE IN THE GRASS BY HER STEPS. PICK THEM UP.', when: holding('the-clippers'), pin: { x: CLIPPERS.x, z: CLIPPERS.z, label: 'THE CLIPPERS' } },
    { text: 'CUT THE GAP, AT THE HEDGE BELOW THE THREE CHAIRS', when: known(K.gapCut), pin: { x: HEDGE.x, z: HEDGE.z, label: 'THE HEDGE' } },
    {
      text: 'SIT AND SAY WHO TAKES THE OVERFLOW: THE COURT, OR THE GREEN',
      when: any(known(K.courtTakes), known(K.greenTakes)),
      pin: { x: CHAIRS.x, z: CHAIRS.z, label: 'THE THREE CHAIRS' },
    },
    { text: 'TELL VAL', when: talkedTo('val'), pin: { x: VAL_GATE.x, z: VAL_GATE.z, label: 'MAPLE COURT' } },
  ],
};

/* ================================================================== *
 * 5. BRACK. THE LAKE.
 * ================================================================== */
export const BRACK_JOB: JobSpec = {
  id: 'job:brack', line: 'brack', promise: true, firstTalkCounts: true,
  land: 'forest', giver: 'brack', name: 'THE LAKE',
  pin: { x: TARN.x, z: TARN.z, label: 'THE TARN' },
  startsAt: { x: BANK.x, z: BANK.z, r: 7 },
  reward: 'THE LANTERN',
  shout: () => (has(K.lanternKept)
    ? 'IN THE PENWOOD, A LANTERN GOES UP THE ROAD AND THE WOOD GATE STAYS DARK'
    : 'IN THE PENWOOD, THE LANTERN AT THE WOOD GATE IS LIT'),
  offer: {
    line: 'I\'ll come down with you. As far as the last tree. That\'s forty paces and it\'s further than I\'ve been in three years.',
    while: () => !has(K.looked),
    yes: {
      label: 'COME AS FAR AS YOU CAN.', reply: 'Right. The last tree, then. Don\'t tell me what\'s in it till I\'m back up.',
      run: () => { tier2.brackComes(); },
    },
    mine: {
      reply: 'Good. I didn\'t want to.',
      what: 'THE WATER IS MINE TO LOOK IN',
      cost: 'BRACK STAYS ON THE ROAD WITH HIS BACK TO THE WATER.',
      run: () => { tier2.brackStays(); },
    },
  },
  steps: [
    { text: 'ASK BRACK WHY HE WILL NOT GO NEAR THE WATER', when: talkedTo('brack') },
    { text: 'GO DOWN TO THE BANK AND LOOK IN THE WATER', when: known(K.looked), pin: { x: BANK.x, z: BANK.z, label: 'THE BANK' } },
    { text: 'THE LANTERN IS ON THE SHINGLE WHERE HE PUT IT DOWN. TAKE IT.', when: holding('the-lantern'), pin: { x: BANK.x, z: BANK.z, label: 'THE BANK' } },
    {
      text: 'CARRY IT UP THE ROAD TO THE WOOD GATE',
      when: carried('the-lantern', WOOD_GATE.x, WOOD_GATE.z, 9),
      pin: { x: WOOD_GATE.x, z: WOOD_GATE.z, label: 'THE WOOD GATE' },
    },
    {
      text: 'HANG IT AND LIGHT IT, OR KEEP IT',
      when: any(known(K.lanternHung), known(K.lanternKept)),
      pin: { x: WOOD_GATE.x, z: WOOD_GATE.z, label: 'THE WOOD GATE' },
    },
    { text: 'TELL BRACK WHAT WAS AT THE WATER', when: talkedTo('brack'), pin: { x: TARN.x, z: TARN.z + 42, label: 'THE ROUND' } },
  ],
  /* he can turn his back on the water at last, and the flat stone by
   * it is a toy from then on (kept from the old steps) */
  onComplete: () => { toys.unlock('tarn-stone'); },
};

/* ================================================================== *
 * 6. HOLT. THE WATER.
 * ================================================================== */
export const HOLT_JOB: JobSpec = {
  id: 'job:holt', line: 'holt', promise: true, firstTalkCounts: true,
  land: 'canyon', giver: 'holt', name: 'HOW MUCH WATER',
  pin: { x: TRESTLES.x, z: TRESTLES.z, label: 'THE TRESTLES' },
  startsAt: { x: CHANNEL.x, z: CHANNEL.z, r: 7 },
  reward: 'THE BOAT OFF ITS TRESTLES, AND WATER UNDER IT',
  shout: () => (has(K.channelMine)
    ? 'IN SPLITROCK, WATER COMES DOWN A CHANNEL NOBODY ELSE CAN MEND'
    : 'IN SPLITROCK, THE ECHO COMES BACK RIGHT. THE FLATS ANSWERED IT.'),
  offer: {
    line: 'I\'d go at it myself. I would. I\'ve had three years to and I haven\'t, but I would.',
    while: () => !has(K.channelSet) && !has(K.holtArrived),
    yes: {
      label: 'GO ON, THEN.', reply: 'Right. I\'ll be up at the head, then. Come and find me.',
      run: () => { tier2.holtCarries(); },
    },
    mine: {
      reply: 'Course you will.',
      what: 'THE WATER IS MINE',
      cost: 'HOLT SITS DOWN ON THE END OF THE TRESTLE AND STOPS OILING THE BOAT.',
      run: () => { tier2.holtSits(); },
    },
  },
  steps: [
    { text: 'ASK HOLT WHAT HE WANTS DONE ABOUT THE WATER', when: talkedTo('holt') },
    { text: 'GO UP THE DRY BED TO THE HEAD OF HIS CHANNEL', when: reach(CHANNEL.x, CHANNEL.z, 8), pin: { x: CHANNEL.x, z: CHANNEL.z, label: 'THE CHANNEL HEAD' } },
    { text: 'TELL HOLT WHAT IS LEFT OF IT', when: talkedTo('holt'), pin: { x: TRESTLES.x, z: TRESTLES.z, label: 'THE TRESTLES' } },
    {
      text: 'RIG IT YOURSELF, OR WALK HOLT DOWN TO AMOS ON THE FLATS',
      when: any(known(K.channelMine), known(K.holtWalks)),
      pin: { x: CHANNEL.x, z: CHANNEL.z, label: 'THE CHANNEL HEAD' },
    },
    {
      text: () => (has(K.channelMine)
        ? 'SET THE BOARD IN THE CHANNEL HEAD'
        : tier2.holtAtEdge
          ? 'HOLT HAS STOPPED AT HIS OWN BORDER. ASK HIM AGAIN.'
          : 'WALK HOLT OUT OF THE CANYON AND ACROSS TO THE CATCH'),
      when: any(known(K.channelSet), known(K.holtArrived)),
      pin: () => (has(K.channelMine)
        ? { x: CHANNEL.x, z: CHANNEL.z, label: 'THE CHANNEL HEAD' }
        : { x: CATCH.x, z: CATCH.z, label: 'THE CATCH' }),
    },
  ],
};

export const TIER2_JOBS: JobSpec[] = [VAL_JOB, BRACK_JOB, HOLT_JOB];
