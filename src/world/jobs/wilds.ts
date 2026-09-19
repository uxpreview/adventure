import { toys } from '../toys';
import {
  type JobSpec, reach, talkedTo, known, decided, any, all, atNight, takeDoor,
} from './triggers';

/**
 * THE JOBS OF THE WILD LANDS still to be rebuilt: Amos (the Flats —
 * and it needs the night) and Joan Harrow (the Downs), Tiers 3 and 4.
 * Brack and Holt are Tier 2 and live in `tier2.ts`.
 */

export const AMOS_JOB: JobSpec = {
  id: 'job:amos', land: 'desert', giver: 'amos', line: 'amos', name: 'THE NIGHT WALK',
  pin: { x: 305, z: 55, label: 'THE OASIS' },
  reward: 'THE LID OFF THE CISTERN',
  shout: 'ON THE FLATS, A LID COMES OFF',
  steps: [
    { text: 'COME TO THE CATCH AFTER DARK. THE MONSTERS ARE OUT. HE KNOWS.', when: all(atNight, reach(302, 95, 12)) },
    { text: 'WALK THE TRACK DOWN TO THE OASIS WITH HIM', when: all(atNight, reach(305, 55, 12)) },
    { text: 'WALK IT BACK UP AND TELL HIM WHERE THE WATER COMES FROM', when: talkedTo('amos') },
  ],
  onComplete: () => { takeDoor('desert', 'door:the-lid-off', 'TOLD AMOS TO TAKE THE LID OFF'); },
};

export const JOAN_JOB: JobSpec = {
  id: 'job:joan', land: 'downs', giver: 'joan', line: 'joan', name: 'THE SECOND PLACE',
  pin: { x: 134.5, z: 12.5, label: 'THE HEADLAND' },
  reward: 'BREAD, PASSED',
  shout: 'ON THE DOWNS, A SECOND PLACE IS TAKEN',
  steps: [
    { text: 'CROSS THE FORD ON THE STONES', when: reach(139, 19, 7) },
    { text: 'SIT IN THE PLACE LAID FOR NOBODY, AT THE HEADLAND', when: any(known('fact:the-place-kept'), decided('downs')) },
    { text: 'TELL JOAN YOU SAT', when: talkedTo('joan') },
  ],
};

export const WILDS_JOBS: JobSpec[] = [AMOS_JOB, JOAN_JOB];
