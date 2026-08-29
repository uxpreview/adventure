export const PAPER = '#f5f2ea';
export const PAPER_BRIGHT = '#faf8f1';
export const INK = '#232633';
export const INK_SOFT = 'rgba(35,38,51,0.62)';

export const PAPER_HEX = 0xf5f2ea;
export const INK_HEX = 0x232633;

/*
 * ONE BLUE.
 *
 * Session 4's inheritance audit (WORLD-SYSTEMS, "The inheritance audit")
 * retired everything that used to live here. margins ran a two-blue
 * FORGERY CONTRACT — a warm 1996 Bic against a cold 1999 forging pen,
 * with divergent paling curves, a greyscale-separation requirement and a
 * standing law that nothing outside this file might write a blue. Every
 * clause of it encoded that book's plot. INKLANDS has no forger, no
 * paling registry and no second hand, so the contract is gone and the
 * commentary with it.
 *
 * What is kept is a colour: one blue, because a page of ballpoint wants
 * exactly one, and it is the walker's alternate skin.
 */
export const BLUE = '#5b6ee0';
export const BLUE_HEX = 0x5b6ee0;
export const BLUE_SOFT = 'rgba(91,110,224,0.55)';

/** Graphite: the under-drawing, the far register, the unfinished. */
export const PENCIL = '#6b6f76';
export const PENCIL_HEX = 0x6b6f76;

/**
 * The grey of ink dragged before it dried. margins made this a
 * left-handed character's heel and turned it on automatically for her
 * ink; Session 4 dropped the rule and kept the mark, because it is a
 * true ballpoint behaviour and because it is how this world will draw
 * rain (WORLD-SYSTEMS §7). Opt in per stroke.
 */
export const SMUDGE_GREY = 'rgba(116,112,124,1)';

// The Blot inverts the page: black ground, white (negative-space) marks.
// Parked by owner decision until a story gives caves a reason; kept
// because the inversion is spectacular and costs nothing to hold.
export const BLOT = '#15161d';
export const BLOT_HEX = 0x15161d;
export const WHITE_INK = '#efece2';
export const WHITE_INK_HEX = 0xefece2;

/* ------------------------------------------------------------------ *
 * INKLANDS — the wash box.
 *
 * The world stays a drawing: every silhouette is ballpoint. What makes
 * it feel like weather and distance instead of a diagram is a field of
 * MUTED watercolor washes under the line work — each biome one tint,
 * pre-mixed toward paper so the page always shows through. Nothing
 * outside this file may invent a wash.
 * ------------------------------------------------------------------ */

export const WASH = {
  seaShallow: '#8fb3bd',
  seaDeep: '#5c86a0',
  sand: '#e2cda3',
  meadow: '#b8c096',
  downs: '#c3c193',
  forest: '#93a389',
  canyon: '#cfa77e',
  desert: '#dcc294',
  kingdom: '#c8b899',
  castle: '#b0b0b4',
  suburb: '#b9c2a2',
  city: '#b3b2b0',
  office: '#a9b0b6',
  road: '#cfc3a7',
  foam: '#eeece3',
} as const;

export const WASH_HEX = {
  seaShallow: 0x8fb3bd,
  seaDeep: 0x5c86a0,
} as const;
