import { toys } from '../toys';
import {
  type JobSpec, reach, talkedTo, known, decided, any, all, atNight, takeDoor,
} from './triggers';

/**
 * THE JOBS OF THE WILD LANDS still to be rebuilt: Joan Harrow (the
 * Downs), Tier 4. Brack and Holt are Tier 2 (`tier2.ts`); Amos is Tier
 * 3 (`tier3.ts`).
 */

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

export const WILDS_JOBS: JobSpec[] = [JOAN_JOB];
