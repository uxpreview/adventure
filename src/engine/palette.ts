export const PAPER = '#f5f2ea';
export const PAPER_BRIGHT = '#faf8f1';
export const INK = '#232633';
export const INK_SOFT = 'rgba(35,38,51,0.62)';

export const PAPER_HEX = 0xf5f2ea;
export const INK_HEX = 0x232633;

/*
 * The two blues. Contract (SESSIONS.md S1 / pacing §4a / RULINGS #2):
 * WARM_BLUE is Bea's 1996 Bic — violet-leaning, ≈10 L* LIGHTER than
 * COLD_BLUE (the 1999 forging pen, steel-leaning). Greyscale conversion
 * must still sort the two populations; the smudge pass (ink.ts) is the
 * structural second channel. Paling never converges them: warm dies
 * toward warm-grey, cold toward blue-grey. Warm saturation is capped
 * below full until Chapter 9's reveal. The art director owns these
 * values; chapters never write a blue hex.
 */
export const WARM_BLUE = '#5b6ee0'; // L* ≈ 50
export const WARM_BLUE_HEX = 0x5b6ee0;
export const COLD_BLUE = '#2f5f9e'; // L* ≈ 40
export const COLD_BLUE_HEX = 0x2f5f9e;
/**
 * Her ink at an opacity, from the one source.
 *
 * Art director round 2, Fix 4: "The standing rule 'black is his, warm
 * blue is hers' only lands if her blue is one recognizable substance the
 * player learns by sight in Chapter 1 and can still identify in Chapter
 * 10." The constants were already single; the drift was chapters mixing
 * their own rgba() by eye. **The only permitted variation is opacity.**
 * Nothing outside this file may write a blue.
 */
const rgbaOf = (hex: string, a: number) =>
  `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;
export const warmBlueA = (a: number) => rgbaOf(WARM_BLUE, a);
export const coldBlueA = (a: number) => rgbaOf(COLD_BLUE, a);

/**
 * The rules PRINTED on a sheet of paper by a machine, which are not ink
 * and must never be mistaken for it. Real ruled paper is faint blue;
 * this book cannot afford a third blue on the page, so its rules are the
 * grey of a worn press.
 */
export const PRINTED_RULE = 'rgba(150,148,142,0.42)';

/** What each blue pales toward — divergent by design, never a shared grey. */
export const WARM_BLUE_PALE = '#a89ba6';
export const WARM_BLUE_PALE_HEX = 0xa89ba6;
export const COLD_BLUE_PALE = '#6c7c94';
export const COLD_BLUE_PALE_HEX = 0x6c7c94;
/** Ink pales barely at all; the delta against blue is the story. */
export const INK_PALE_HEX = 0x2e3140;

/** Graphite. Exempt from all blue paling (ARCHITECTURE token list). */
export const PENCIL = '#6b6f76';
export const PENCIL_HEX = 0x6b6f76;

/** Kitchen light / the seam of dawn (Ch 7 seam, Ch 8 kitchen). */
export const DAWN_WARM = '#e3b878';
export const DAWN_WARM_HEX = 0xe3b878;

/** The grey heel-smear of a left hand following wet ink (smudge pass). */
export const SMUDGE_GREY = 'rgba(116,112,124,1)';

// Legacy v1 alias — B.'s doodle skin + old shared art still reference it.
// v2 narrative art must use WARM_BLUE / COLD_BLUE, never this.
export const BLUE = WARM_BLUE;
export const BLUE_SOFT = 'rgba(91,110,224,0.55)';
export const BLUE_HEX = WARM_BLUE_HEX;

// The Blot inverts the page: black ground, white (negative-space) marks.
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
