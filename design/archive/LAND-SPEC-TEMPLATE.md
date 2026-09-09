# Land spec — required format

You are the environment designer + technical artist for ONE land of
INKLANDS. Read first, in this order:

1. `design/QUALITY-BAR.md` — binding, especially §4.
2. `src/world/layout.ts` — your land's rect, roads, river, step zone,
   mood. The rect is law; everything inside it is yours.
3. `src/world/regions/<your land>.ts` + `src/world/textures.ts` — what
   exists today (assume it is a scatter draft to be replaced, not kept).
4. `src/engine/ink.ts`, `StandeeField.ts`, `props.ts` — the primitives
   you design for.

Write the spec to `design/specs/<land>.md` with EXACTLY these sections:

## 1. THE SHOT
The one screenshot people share unprompted. Exact composition: where the
walker stands, what is foreground / subject / far silhouette, where the
accent color sits, what is moving. The whole land is staged around this.

## 2. PLACES
4–7 named places: name, center (x,z), radius, purpose, and what makes
each one worth the walk. ASCII map of the land showing places, roads,
water, and the deliberate voids. Border seams with neighbor lands are
places too if a road or the river crosses there.

## 3. COMPOSITION PLAN
How the land defeats the array-look: cluster rules (what groups with
what, at what spacing jitter), occlusion layers, density gradient across
the rect, where emptiness is composed rest. State what gets CUT from the
current draft.

## 4. INK TECHNIQUE
The land's signature ink behavior (not just its props): e.g. the
Penwood's darkness is layered hatch density, the Flats' heat is paling
line weight. Every texture: name, canvas size, seed strategy, ink.ts
primitives used, variant count (repeated silhouettes in frame are a
bar violation — state how many variants each field needs).

## 5. MOTION & LIFE
The land's idle motions (≥2) and its one player-responsive motion.
Which are per-frame updates vs shader time.

## 6. SOUND
Mood tweaks if any (Audio MOODS), step zones, and the land's ambient
events: name, trigger, synthesis sketch (Audio.event / new one-shots).

## 7. POIS & NOTES
Table of POIs (label, position, prompt, on/off the road) and note ids.
Note bodies stay in the land module in the established wry voice.

## 8. PERFORMANCE BUDGET
Draw calls (fields vs unique standees), texture memory, build-time cost
at stream-in (must stay one frame), dispose plan. 60fps mobile or a
stated degradation strategy.

## 9. NEW ENGINE NEEDS
Reusable primitives this land needs that the engine lacks. Minimal,
named generically; consolidated across lands before building.
