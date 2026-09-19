import { toys } from '../toys';
import {
  type JobSpec, reach, talkedTo, known, decided, any, namesKnown,
} from './triggers';

/**
 * THE JOBS OF THE CIVIC LANDS still to be rebuilt: the man at the
 * junction (Greyline) and Dennis (the Mile), both Tier 4. Each hangs on
 * its line of THE LIST; the steps are the ones from before the story of
 * record until its tier's session. Marget and Wick are Tier 1
 * (`tier1.ts`); Val is Tier 2 (`tier2.ts`).
 */

export const MAN_JOB: JobSpec = {
  id: 'job:the-man', land: 'city', giver: 'the-man', line: 'the-man', name: 'FOUR SECONDS',
  pin: { x: 139, z: 199.5, label: 'THE PAVEMENT' },
  reward: 'A MAN ON A BENCH',
  shout: 'IN GREYLINE, A MAN LEAVES THE JUNCTION',
  steps: [
    { text: 'LOOK DOWN AT THE PAVEMENT', when: known('fact:the-pavement') },
    { text: 'STAND WITH HIM. FOUR SECONDS. DO NOT MOVE.', when: any(known('fact:the-man-at-the-junction'), decided('city')) },
  ],
};

export const DENNIS_JOB: JobSpec = {
  id: 'job:dennis', land: 'office', giver: 'dennis', line: 'dennis', name: 'THE LIST',
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

export const CIVIC_JOBS: JobSpec[] = [MAN_JOB, DENNIS_JOB];
