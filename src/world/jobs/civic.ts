import { knowledge } from '../knowledge';
import { worn } from '../worn';
import { toys } from '../toys';
import {
  type JobSpec, reach, talkedTo, holding, known, decided, any, namesKnown,
} from './triggers';

/**
 * THE JOBS OF THE CIVIC LANDS: Marget (Brim), Wick (Greyweather), Val
 * (Maple Court), the man at the junction (Greyline), Dennis (the Mile).
 * Each is the land's wait turned into something a player can do in a
 * few minutes, with the notebook showing the steps.
 */

export const MARGET_JOB: JobSpec = {
  id: 'job:marget', land: 'kingdom', giver: 'marget', name: 'THE HOUR OF BRIM',
  pin: { x: -64, z: -42, label: 'THE BELFRY' },
  reward: 'THE RED SCARF',
  shout: 'IN BRIM, A STALL OPENS FOR THE FIRST TIME IN FORTY YEARS',
  steps: [
    /* Gate round 1: each step pins its own place; the cross is east of
     * the fountain and was never found without one. */
    { text: 'READ THE MARKET CROSS', when: reach(-35, -71, 8), pin: { x: -35, z: -71, label: 'THE MARKET CROSS' } },
    { text: 'WAIT AT THE BELFRY TILL THE LAMPS COME ON', when: known('fact:brim-hour'), pin: { x: -64, z: -42, label: 'THE BELFRY' } },
    { text: 'SETTLE THE HOUR AT THE BELFRY', when: decided('kingdom') },
  ],
  doorEnds: true,
  onComplete: () => { worn.take('the-red-scarf'); },
};

export const WICK_JOB: JobSpec = {
  id: 'job:wick', land: 'castle', giver: 'wick', name: 'THE FIFTH BANNER',
  pin: { x: -100, z: -215, label: 'THE MOAT POOL' },
  reward: 'BRIM\'S RED ON THE FIFTH POLE',
  shout: 'AT GREYWEATHER, A FIFTH BANNER GOES UP',
  steps: [
    { text: 'FIND THE WET BANNER BY THE MOAT POOL (IT IS OUT BY DAY)', when: holding('the-wet-banner') },
    { text: 'CARRY IT UP TO THE LOFT AND HANG IT ON THE PEG', when: known('fact:a-banner-wet') },
    { text: 'TELL WICK', when: talkedTo('wick') },
  ],
  onComplete: () => { knowledge.learn('reason:the-fifth-banner'); },
};

export const VAL_JOB: JobSpec = {
  id: 'job:val', land: 'neighborhood', giver: 'val', name: 'THE GAP IN THE HEDGE',
  pin: { x: -45, z: -234, label: 'THE KEEP' },
  reward: 'A CHAIR THAT FACES SOMETHING',
  shout: 'IN MAPLE COURT, A HEDGE HAS A GAP AGAIN',
  steps: [
    { text: 'RIDE THE BICYCLE UP THE KING\'S ROAD TO GREYWEATHER', when: any(known('name:castle'), reach(-45, -234, 14)) },
    { text: 'COME BACK AND TELL HER AT THE THREE CHAIRS', when: decided('neighborhood') },
  ],
  doorEnds: true,
};

export const MAN_JOB: JobSpec = {
  id: 'job:the-man', land: 'city', giver: 'the-man', name: 'FOUR SECONDS',
  pin: { x: 139, z: 199.5, label: 'THE PAVEMENT' },
  reward: 'A MAN ON A BENCH',
  shout: 'IN GREYLINE, A MAN LEAVES THE JUNCTION',
  steps: [
    { text: 'LOOK DOWN AT THE PAVEMENT', when: known('fact:the-pavement') },
    { text: 'STAND WITH HIM. FOUR SECONDS. DO NOT MOVE.', when: any(known('fact:the-man-at-the-junction'), decided('city')) },
  ],
};

export const DENNIS_JOB: JobSpec = {
  id: 'job:dennis', land: 'office', giver: 'dennis', name: 'THE LIST',
  pin: { x: 252, z: 200.2, label: 'THE 8:15 STOP' },
  reward: 'THE PAPER PLANE',
  shout: 'IN THE MILE, A TIMETABLE IS FOLDED INTO A PLANE',
  steps: [
    { text: 'READ THE TIMETABLE AT THE STOP', when: reach(252, 200.2, 7) },
    { text: 'STAND IN SIX OF THE TWELVE LANDS, SO THE NAMES MEAN SOMETHING', when: namesKnown(6) },
    { text: 'READ IT AGAIN', when: known('fact:the-timetable') },
    { text: 'TELL DENNIS WHICH ONES YOU HAVE MET', when: talkedTo('dennis') },
  ],
  onComplete: () => { toys.unlock('office-plane'); },
};

export const CIVIC_JOBS: JobSpec[] = [MARGET_JOB, WICK_JOB, VAL_JOB, MAN_JOB, DENNIS_JOB];
