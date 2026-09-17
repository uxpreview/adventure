/**
 * THE LIST — the notebook's first page, in the walker's own hand,
 * written the week before the gathering (`design/foundation/08` §8).
 * Twelve lines, twelve people, twelve places. One is crossed out.
 *
 * No imports, on purpose: the notebook page draws it and the opening
 * pins it, and neither may pull the other in at module time.
 */

export type ListLine = {
  /** The npc id of the person the line is to. */
  id: string;
  who: string;
  /** The line, verbatim, as he wrote it. */
  line: string;
  /** Crossed out already: the one promise he kept. */
  kept?: boolean;
  /** Where the map pins the person. */
  pin: { x: number; z: number; label: string };
  /** The person's land, which is what a kept line is counted by. */
  land: string;
  /** What they say, once, the next time he talks to them after he has
   *  crossed their line out himself. The notebook does not object. */
  crossed?: string;
};

export const LIST_HEAD = 'TWELVE THINGS. THEN I CAN GO HOME.';

export const THE_LIST: ListLine[] = [
  { id: 'wick', who: 'WICK', line: 'Wick. Find out why the old road is closed. Don\'t let him tell you it\'s nothing.', pin: { x: -45, z: -190, label: 'THE AVENUE' }, land: 'castle', crossed: 'Crossed me off? Good. It\'s nothing. I told you it was nothing.' },
  { id: 'nell', who: 'NELL', line: 'Nell. Get the bull home.', pin: { x: -13.2, z: 82.2, label: 'THE FIELD GATE' }, land: 'meadow', crossed: 'Crossed me out, and the bull still in the field. Suit yourself.' },
  { id: 'marget', who: 'MARGET', line: 'Marget. I owe her. Pay it.', pin: { x: -45, z: -82, label: 'BRIM SQUARE' }, land: 'kingdom', crossed: 'I hear I\'m crossed out. The debt isn\'t. Ink\'s cheap.' },
  { id: 'val', who: 'VAL', line: 'Val. Cut the gap in the hedge.', pin: { x: -61, z: 139, label: 'THE THREE CHAIRS' }, land: 'neighborhood', crossed: 'Off the list, am I. The hedge hasn\'t heard.' },
  { id: 'brack', who: 'BRACK', line: 'Brack. Go and look in the lake.', pin: { x: 150, z: -195, label: 'THE TARN' }, land: 'forest', crossed: 'You crossed the lake out. Sensible. I would.' },
  { id: 'holt', who: 'HOLT', line: 'Holt. Find out how much water.', pin: { x: 301, z: -106, label: 'THE RIVERHEAD' }, land: 'canyon', crossed: 'Crossed out. Water doesn\'t read.' },
  { id: 'amos', who: 'AMOS', line: 'Amos. When did it last rain?', pin: { x: 306, z: 97, label: 'THE CATCH' }, land: 'desert', crossed: 'Struck me off? It still hasn\'t rained. Put that down instead.' },
  { id: 'pye', who: 'PYE', line: 'Pye. Row the eighth pot out.', pin: { x: -221, z: -134, label: 'SHELTER COVE' }, land: 'beach', crossed: 'Your book, your pen. The pot\'s still out there.' },
  { id: 'wren', who: 'WREN', line: 'Wren. Give the race a finish line.', pin: { x: -263.6, z: 70.4, label: 'THE PUNT' }, land: 'ocean', crossed: 'Crossed off. The race goes round anyway. It always goes round.' },
  { id: 'joan', who: 'JOAN', line: 'Joan. Be there for the harvest.', kept: true, pin: { x: 176, z: -22, label: 'THE HOME FIELD' }, land: 'downs' },
  { id: 'the-man', who: 'THE MAN AT THE CROSSING', line: 'The man at the crossing. Come back.', pin: { x: 148, z: 203, label: 'THE JUNCTION' }, land: 'city', crossed: 'Crossed out. I\'ll be here.' },
  { id: 'dennis', who: 'DENNIS', line: 'Dennis. The 8:15. Don\'t miss it.', pin: { x: 252, z: 200.2, label: 'THE 8:15 STOP' }, land: 'office', crossed: 'You\'ve struck the 8:15. The board still says 8:15.' },
];
