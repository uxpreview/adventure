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

/* ------------------------------------------------------------------ *
 * THE LIGHT ON THE PAGE — the day cycle's colour box (Session 6).
 *
 * WORLD-SYSTEMS §7 gives time of day the highest return of anything in
 * the file, and the constraint that decides how it is built is already
 * law: **washes come only from palette.ts**. So the hour does not
 * invent a colour and does not touch the wash field — it MODULATES the
 * finished page with one of these, and every one of them lives here
 * with every other colour in the game.
 *
 * They are used as MULTIPLIERS over the whole frame, so each is
 * normalised to its own brightest channel before it is applied and the
 * darkening is carried separately (see `world/daylight.ts`). What each
 * one encodes is therefore the light's COLOUR, never its strength.
 *
 * And one rule sets the whole curve: **eight in the morning to three in
 * the afternoon is the shipped look, exactly.** Four lands earned a
 * WOWED under a neutral page and a day cycle that re-graded them would
 * be a regression wearing a feature's clothes. The day departs from
 * neutral at the two ends and nowhere else.
 */
export const LIGHT = {
  /** Before the sun: the page is lit by the sky and nothing else. */
  earlyDawn: '#8f9cc0',
  /** The one warm minute at the top of the morning. */
  dawn: '#e7bda6',
  /** Neutral, and EXACTLY neutral: pure white is the identity for a
   *  multiplier, so between eight in the morning and four in the
   *  afternoon the grade is a no-op and the page is bit-for-bit the
   *  page four lands earned their WOWED on. That is not a rounding
   *  convenience, it is the promise this whole file makes. */
  day: '#ffffff',
  /** The afternoon leans a quarter-step warm and no further. */
  afternoon: '#fff6e6',
  /** Dusk, which is the hour this whole system is for. Warm, and no
   *  more saturated than a wash in `WASH` is: the sheet is paper and a
   *  page under evening light goes cream-gold, not tangerine. */
  dusk: '#e8b184',
  /** After it. The sky after sunset goes blue-violet, not brown — the
   *  first pass had a mauve here and eight in the evening came out
   *  muddy, which is the one thing an evening must not be. */
  lateDusk: '#9a95bb',
  /** Night, away from the lamp — a page in a room, not a page in a cave. */
  night: '#7e8bb2',
  /** THE DESK LAMP. The middle of its pool, and the cold outside it. */
  lampPool: '#ffe3b4',
  lampEdge: '#8592b8',
  /** What a lit window or a lamp flame is, on paper, at night. */
  flame: '#ffd79a',
} as const;
