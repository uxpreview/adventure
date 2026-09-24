import { tier3, K } from '../tier3';
import {
  CATCH, RAIN_TABLE, OASIS_BANK, flats,
  COVE_BOAT, EIGHTH_POT, PUNT, FINISH_MARK,
} from '../tier3-state';
import { type JobSpec, talkedTo, known, any, all } from './triggers';

/**
 * TIER 3: THE LIST IS WRONG (`design/foundation/08` §9, promises 7 to
 * 9), hung on their lines of THE LIST. Each one shows, in its own way,
 * HOW HE LEFT — knowing, in writing, and out past the mark.
 *
 *   7. Amos. When did it last rain?
 *   8. Pye. Row the eighth pot out.
 *   9. Wren. Give the race a finish line.
 *
 * What the people say and do while these are kept is `../tier3.ts`;
 * what the lands draw is `regions/wilds.ts` (the Flats) and
 * `regions/coast.ts` (Longshore and the Wide Blue).
 *
 * Every task here is a played verb. You carry water uphill to wet a
 * board; you pull a boat out on a bearing and haul a pot up hand over
 * hand; you row a mark out and drop it where the fleet comes home.
 */

const has = (id: string) => known(id)();

/* ================================================================== *
 * 7. AMOS. WHEN DID IT LAST RAIN?
 * ================================================================== */
export const AMOS_JOB: JobSpec = {
  id: 'job:amos', line: 'amos', promise: true, firstTalkCounts: true,
  land: 'desert', giver: 'amos', name: 'THE RAIN TABLE',
  pin: { x: CATCH.x, z: CATCH.z, label: 'THE CATCH' },
  /* the table starts it as well as the man: a board ruled for rain in
   * a land that has none is a question whether or not you have met him */
  startsAt: { x: RAIN_TABLE.x, z: RAIN_TABLE.z, r: 5 },
  reward: 'THE LAST RAIN, IN YOUR OWN HAND',
  shout: () => (has(K.dated)
    ? 'ON THE FLATS, A BOARD GOES UP BY THE ROAD: IT RAINED ONCE. ON THE DOWNS, JOAN HARROW LOSES AN ARGUMENT.'
    : 'ON THE FLATS, A RAIN TABLE IS WIPED CLEAN, AND A MAN GOES ON ASKING'),
  offer: {
    line: 'Water brings pencil up. I go down that track every night of my life. I can go down it in the day.',
    while: () => !has(K.wet),
    yes: {
      label: 'GO DOWN FOR IT, THEN.', reply: 'Down empty, back full. Go and stand by the table.',
      run: () => { tier3.amosFetch(); },
    },
    mine: {
      reply: 'Suit yourself. Can\'s at the top of the track. It\'s uphill back. It\'s always uphill back.',
      what: 'THE WATER IS MINE TO CARRY',
      cost: 'AMOS SITS DOWN ON THE EDGE OF HIS APRON. HE DOES NOT GO DOWN THE TRACK AT NIGHT ANY MORE.',
      run: () => { tier3.amosSit(); },
    },
  },
  steps: [
    { text: 'ASK AMOS WHEN IT LAST RAINED', when: any(talkedTo('amos'), known(K.wet)), pin: { x: CATCH.x, z: CATCH.z, label: 'THE CATCH' } },
    { text: 'LOOK AT HIS RAIN TABLE', when: any(known(K.tableLooked), known(K.wet)), pin: { x: RAIN_TABLE.x, z: RAIN_TABLE.z, label: 'THE RAIN TABLE' } },
    {
      /* (gate round 8: "after filling the can, the objective still read
       * FILL THE CAN... I couldn't tell whether the can was full") */
      text: () => (has(K.amosFetches)
        ? 'AMOS HAS GONE DOWN HIS TRACK FOR WATER. WAIT BY THE TABLE.'
        : flats.can.full
          ? 'THE CAN IS FULL. CARRY IT UP AND WET THE TABLE.'
          : 'FILL THE CAN AT THE OASIS AND WET THE TABLE WITH IT'),
      when: known(K.wet),
      pin: () => (has(K.amosFetches) || flats.can.full
        ? { x: RAIN_TABLE.x, z: RAIN_TABLE.z, label: 'THE RAIN TABLE' }
        : { x: OASIS_BANK.x, z: OASIS_BANK.z, label: 'THE OASIS' }),
    },
    { text: 'READ WHAT CAME UP', when: known(K.read), pin: { x: RAIN_TABLE.x, z: RAIN_TABLE.z, label: 'THE RAIN TABLE' } },
    {
      text: 'READ AMOS THE DATE, OR RUB IT OUT',
      when: any(known(K.dated), known(K.rubbed)),
      pin: { x: RAIN_TABLE.x, z: RAIN_TABLE.z, label: 'THE RAIN TABLE' },
    },
  ],
};

/* ================================================================== *
 * 8. PYE. ROW THE EIGHTH POT OUT.
 * ================================================================== */
export const PYE_JOB: JobSpec = {
  id: 'job:pye', line: 'pye', promise: true, firstTalkCounts: true,
  land: 'beach', giver: 'pye', name: 'THE EIGHTH POT',
  pin: { x: COVE_BOAT.x, z: COVE_BOAT.z, label: 'SHELTER COVE' },
  reward: 'WHICH WAY YOU WERE FACING',
  shout: () => (has(K.noteRead)
    ? 'OFF LONGSHORE, AN EIGHTH POT COMES UP FOR GOOD. AT DUSK THE HORN ON THE POINT IS BLOWN, AND ANSWERED.'
    : 'OFF LONGSHORE, AN EIGHTH POT GOES BACK DOWN WITH ITS LAMP ON. AT DUSK THE HORN ON THE POINT IS BLOWN, AND ANSWERED.'),
  offer: {
    line: 'I\'ll row you. I\'ve not rowed that bearing, not once. But I\'ll row you.',
    while: () => !has(K.atPot),
    yes: {
      label: 'ROW ME OUT, THEN.', reply: 'Right. ...Right. Bow end.',
      run: () => { tier3.pyeRows(); },
    },
    mine: {
      reply: 'Oars are in her. She pulls left.',
      what: 'THE BOAT IS MINE TO ROW',
      cost: 'PYE SITS DOWN WHERE HIS BOAT WAS. HE DOES NOT ROW HIS POTS AT EVENING ANY MORE.',
      run: () => { tier3.pyeSit(); },
    },
  },
  steps: [
    { text: 'ASK PYE ABOUT THE EIGHTH POT', when: talkedTo('pye') },
    {
      text: () => (has(K.pyeRows)
        ? 'GET IN PYE\'S BOAT, AT THE WATER\'S EDGE. HE\'LL ROW YOU OUT.'
        : 'GET IN PYE\'S BOAT AND ROW IT OUT TO THE EIGHTH POT'),
      when: known(K.atPot),
      pin: { x: EIGHTH_POT.x, z: EIGHTH_POT.z, label: 'THE EIGHTH POT' },
    },
    { text: 'HAUL IT UP', when: known(K.hauled), pin: { x: EIGHTH_POT.x, z: EIGHTH_POT.z, label: 'THE EIGHTH POT' } },
    {
      text: 'READ WHAT IS IN THE COAT, OR DROP IT BACK IN',
      when: any(known(K.noteRead), known(K.noteDropped)),
      pin: { x: EIGHTH_POT.x, z: EIGHTH_POT.z, label: 'THE EIGHTH POT' },
    },
    {
      text: () => (has(K.pyeRows) ? 'PYE ROWS YOU IN. TELL HIM.' : 'ROW BACK IN AND TELL PYE'),
      when: all(known(K.pyeHome), talkedTo('pye')),
      pin: { x: COVE_BOAT.x, z: COVE_BOAT.z, label: 'SHELTER COVE' },
    },
  ],
};

/* ================================================================== *
 * 9. WREN. GIVE THE RACE A FINISH LINE.
 * ================================================================== */
export const WREN_JOB: JobSpec = {
  id: 'job:wren', line: 'wren', promise: true, firstTalkCounts: true,
  land: 'ocean', giver: 'wren', name: 'THE FINISH LINE',
  pin: { x: PUNT.x, z: PUNT.z, label: 'THE PUNT' },
  reward: 'THE SEA',
  shout: () => (has(K.newRule)
    ? 'ON THE WIDE BLUE, THE LAST BOAT HOME FINISHES TOO, AND A LONGSHIP LIES INSIDE THE MARK'
    : 'ON THE WIDE BLUE, THE RACE IS OVER. A LONGSHIP LIES OUT PAST THE MARK, WHERE THE RULES PUT IT.'),
  offer: {
    line: 'I\'ll row it out. I row out every day. I can row out with something in the boat.',
    while: () => !has(K.atFinish),
    yes: {
      label: 'ROW IT OUT, THEN. I\'LL COME.', reply: 'Get in the bow. Get in the bow.',
      run: () => { tier3.wrenRows(); },
    },
    mine: {
      reply: 'Punt\'s yours. Mind the fleet. They don\'t look.',
      what: 'THE MARK IS MINE TO SET',
      cost: 'WREN SITS DOWN ON THE BAR AND DOES NOT ROW OUT TO RING THE MARK AT NOON ANY MORE.',
      run: () => { tier3.wrenSit(); },
    },
  },
  steps: [
    { text: 'ASK WREN WHAT A RACE NEEDS', when: talkedTo('wren') },
    {
      text: () => (has(K.wrenRows)
        ? 'GET IN THE PUNT. WREN WILL ROW THE SECOND MARK OUT.'
        : 'GET IN THE PUNT AND ROW THE SECOND MARK OUT'),
      when: known(K.atFinish),
      pin: { x: FINISH_MARK.x, z: FINISH_MARK.z, label: 'WHERE THE FLEET COMES HOME' },
    },
    { text: 'DROP THE SECOND MARK', when: known(K.markSet), pin: { x: FINISH_MARK.x, z: FINISH_MARK.z, label: 'THE SECOND MARK' } },
    {
      text: 'SAY WHICH RULES THE FINISH IS RUN UNDER',
      when: any(known(K.oldRules), known(K.newRule)),
      pin: { x: FINISH_MARK.x, z: FINISH_MARK.z, label: 'THE SECOND MARK' },
    },
    {
      text: () => (has(K.wrenRows) ? 'WREN ROWS YOU BACK. TELL WREN.' : 'ROW BACK TO THE BAR AND TELL WREN'),
      when: all(known(K.wrenHome), talkedTo('wren')),
      pin: { x: PUNT.x, z: PUNT.z, label: 'THE PUNT' },
    },
  ],
  /* a race with a finish: the sea past the mark is somewhere a boat goes */
  onComplete: () => { tier3.openTheSea(); },
};

export const TIER3_JOBS: JobSpec[] = [AMOS_JOB, PYE_JOB, WREN_JOB];
