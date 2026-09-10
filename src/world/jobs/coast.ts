import { knowledge } from '../knowledge';
import { type JobSpec, reach, known, decided } from './triggers';

/**
 * THE JOBS OF THE COAST: Pye (Longshore) and Wren (the Wide Blue). Both
 * go out along the sandbar, which is the one thing out there that is
 * not water: the mark can be read from the bar's far bend, and the bar
 * has an end.
 */

export const PYE_JOB: JobSpec = {
  id: 'job:pye', land: 'beach', giver: 'pye', name: 'THE EIGHTH POT',
  pin: { x: -300, z: -8, label: 'THE MARK' },
  reward: 'AN EIGHTH POT ON A NEW BEARING',
  shout: 'OFF LONGSHORE, AN EIGHTH POT GOES OUT',
  steps: [
    { text: 'COUNT THE POTS AT THE POT LINE', when: reach(-216.4, -128.7, 7) },
    {
      text: 'WALK THE SANDBAR OUT TO THE MARK AND READ ITS NAME',
      when: reach(-300, -8, 13),
      onDone: () => { knowledge.learn('name:the-mark'); },
    },
    { text: 'BRING THE NAME BACK TO PYE AT THE POT LINE', when: decided('beach') },
  ],
  doorEnds: true,
};

export const WREN_JOB: JobSpec = {
  id: 'job:wren', land: 'ocean', giver: 'wren', name: 'THE SECOND MARK',
  pin: { x: -258, z: -24, label: 'THE END OF THE BAR' },
  reward: 'A LINE WITH TWO ENDS',
  shout: 'ON THE WIDE BLUE, A SECOND MARK GOES DOWN',
  steps: [
    { text: 'WALK THE SANDBAR TO ITS END', when: known('route:the-bar') },
    { text: 'TELL WREN AT THE PUNT WHAT IS THERE', when: decided('ocean') },
  ],
  doorEnds: true,
};

export const COAST_JOBS: JobSpec[] = [PYE_JOB, WREN_JOB];
