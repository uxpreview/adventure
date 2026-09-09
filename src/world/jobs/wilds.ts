import { toys } from '../toys';
import {
  type JobSpec, reach, talkedTo, known, decided, any, all, atNight, takeDoor,
} from './triggers';

/**
 * THE JOBS OF THE WILD LANDS: Brack (the Penwood), Holt (Splitrock),
 * Amos (the Flats — and it needs the night), Joan Harrow (the Downs).
 */

export const BRACK_JOB: JobSpec = {
  id: 'job:brack', land: 'forest', giver: 'brack', name: 'THE STILL WATER',
  pin: { x: 150, z: -195, label: 'THE TARN' },
  reward: 'A STONE THAT SKIMS, AT THE TARN',
  shout: 'IN THE PENWOOD, A MAN TURNS ROUND',
  steps: [
    { text: 'GO DOWN TO THE TARN AND STAND AT THE WATER', when: any(known('fact:the-tarn'), decided('forest')) },
    { text: 'COME BACK UP AND TELL BRACK', when: talkedTo('brack') },
  ],
  onComplete: () => { toys.unlock('tarn-stone'); },
};

export const HOLT_JOB: JobSpec = {
  id: 'job:holt', land: 'canyon', giver: 'holt', name: 'THE RIVERHEAD',
  pin: { x: 301, z: -106, label: 'THE RIVERHEAD' },
  reward: 'A BOAT THE RIGHT WAY UP',
  shout: 'IN SPLITROCK, A BOAT COMES OFF ITS TRESTLES',
  steps: [
    { text: 'FOLLOW THE DRY BED DOWN TO THE RIVERHEAD, WHERE THE WATER COMES OUT', when: reach(301, -106, 10) },
    { text: 'COME BACK UP TO THE TRESTLES', when: reach(300, -232, 13) },
    { text: 'TELL HOLT IT IS THE SAME RIVER', when: talkedTo('holt') },
  ],
  onComplete: () => { takeDoor('canyon', 'door:the-boat-righted', 'TOLD HOLT ABOUT THE RIVER'); },
};

export const AMOS_JOB: JobSpec = {
  id: 'job:amos', land: 'desert', giver: 'amos', name: 'THE NIGHT WALK',
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
  id: 'job:joan', land: 'downs', giver: 'joan', name: 'THE SECOND PLACE',
  pin: { x: 134.5, z: 12.5, label: 'THE HEADLAND' },
  reward: 'BREAD, PASSED',
  shout: 'ON THE DOWNS, A SECOND PLACE IS TAKEN',
  steps: [
    { text: 'CROSS THE FORD ON THE STONES', when: reach(139, 19, 7) },
    { text: 'SIT IN THE PLACE LAID FOR NOBODY, AT THE HEADLAND', when: any(known('fact:the-place-kept'), decided('downs')) },
    { text: 'TELL JOAN YOU SAT', when: talkedTo('joan') },
  ],
};

export const WILDS_JOBS: JobSpec[] = [BRACK_JOB, HOLT_JOB, AMOS_JOB, JOAN_JOB];
