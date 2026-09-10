import type { RegionId } from './layout';

/**
 * THE LINES (VOICE). Everything anybody says, in one file: the twelve
 * named people by state, the unnamed folk by role and by land, what
 * every door does (for the card and for the read-back), and a plain
 * label for every piece of knowledge.
 *
 * Tone: short, plain, dry, a little funny. A person says what they
 * want in one line and why in a second.
 */

export type NpcPhase = 'idle' | 'met' | 'asked' | 'done';

export type LineSet = {
  idle: string[];
  met: string[];
  asked: string[];
  done: string[];
  /** `chose:<door id>` — what they say once that door is taken. */
  [k: `chose:${string}`]: string[];
};

export type PersonDef = {
  id: string;
  name: string;
  land: RegionId;
  lines: LineSet;
  /** The POI label the `asked` line names, so it can be pinned. */
  want?: string;
  /** Routine ids (`life.ts` Figures) this person is drawn by, if any.
   *  People drawn by hand in their land call `npcs.track` instead. */
  figures?: string[];
};

/* ---- THINGS: the eleven's `asked`/`done` lines match their jobs in `jobs/*.ts`; Nell's are FIRST HOUR's ---- */
export const PEOPLE: PersonDef[] = [
  {
    id: 'nell', name: 'NELL', land: 'meadow', want: 'THE CROSSROADS',
    /* FIRST HOUR: while the opening runs, Nell's lines come from
     * `opening.ts` by stage. These are what she says before it starts
     * (an old save) and after it is done. */
    lines: {
      idle: ['That bull is mine. It went for you because you looked at it. It does that.'],
      met: [
        'Three names on that signpost I could go to tomorrow. It\'s the fourth I want.',
        'The cart\'s been nearly loaded since the fence was a fence.',
        'Mind the bull. He minds you.',
      ],
      asked: [
        'Read the signpost at THE CROSSROADS. There\'s a fourth name on it, and it isn\'t a place. Bring it back.',
        'A time, not a place. The milestone on the south road is older than the signpost. See what it says about it.',
      ],
      done: ['North, then. I\'d have said north.', 'Keep the cap. I\'ve a hood in the cart.', 'Three roads, three people. I\'m not going to pick for you.'],
      'chose:door:the-cart-turned-north': ['8:15. Not a place. A time. Well — the cart goes north, then, and I go with it.'],
      'chose:door:the-cart-pushed': ['You pushed my cart to the edge of the world. Fine. It\'s a cart at a border now. That\'s a kind of answer.'],
    },
  },
  {
    id: 'marget', name: 'MARGET', land: 'kingdom', want: 'THE BELFRY',
    lines: {
      idle: ['Stall\'s shut. It\'s been shut since the argument. Don\'t ask which argument.'],
      met: [
        'Two hands on that belfry clock and they don\'t agree. Nobody here has a thing to check them against.',
        'I\'ll open when this town knows what o\'clock it is. Not before.',
      ],
      asked: ['Read the cross first, so you know what a market is for. Then sit under THE BELFRY till the lamps come on. One hand will agree with them. Come and tell me which.'],
      done: ['There. Was that so hard? Forty years.', 'Cloth\'s out. Take a yard of the red. It suits you.'],
      'chose:door:the-bell-rings-it': ['Let the bell say it. Fine. The bell says eight, so I\'m open at eight.'],
      'chose:door:the-clock-set-to-eight': ['Eight. Yes. I always said eight. Stall\'s open, then.'],
      'chose:door:the-clock-set-to-eleven': ['Eleven? Eleven is not an hour a market opens at. They can chalk the board all they like. I\'m not coming.'],
    },
  },
  {
    id: 'wick', name: 'WICK', land: 'castle', want: 'THE MOAT POOL', figures: ['wick', 'wick-evening'],
    lines: {
      idle: ['Four banners. There\'s meant to be five. Don\'t look at me, I only hang them.'],
      met: [
        'The king\'s off his plinth. Nobody pushed him. He was leaning for years.',
        'I do the poles, morning and evening. Somebody has to.',
      ],
      asked: ['There\'s a wet banner down by THE MOAT POOL. Carry it up to the loft and hang it on the peg. Mind — it\'s heavy. Then come and find me.'],
      done: ['Five. That\'s five. Brim\'s red on the fifth pole. I said it\'d be the red.', 'Twenty years of poles. You did one. It counts.'],
      'chose:door:the-king-restored': ['Back on his plinth. Then I\'m relieved. Twenty years of poles. I\'ll sit down now, if it\'s all the same.'],
      'chose:door:the-king-left': ['Leave him lying. He was heading that way anyway. I\'ll keep doing the poles.'],
    },
  },
  {
    id: 'pye', name: 'PYE', land: 'beach', want: 'THE MARK', figures: ['pye'],
    lines: {
      idle: ['Seven pots. They catch nothing much. I set them anyway. The tide\'s the one thing here you can count on.'],
      met: [
        'Out at the tide, back at the tide. That\'s the day.',
        'There\'s a mark out on the Wide Blue. Never rowed to it. Never learned its name.',
      ],
      asked: ['Walk the bar out to THE MARK. It\'s got a name. Read it and bring it back to the pot line.'],
      done: ['Eighth pot\'s out. On a bearing I never rowed. We\'ll see.', 'You walked to it. Nobody walks to it.'],
      'chose:door:the-eighth-pot': ['So that\'s its name. Right. Eighth pot goes out tomorrow, straight at it.'],
      'chose:door:the-pots-hauled': ['Hauled. All seven. Well — I\'ll sit here, then. Somebody has to watch the tide.'],
    },
  },
  {
    id: 'wren', name: 'WREN', land: 'ocean', want: 'THE SANDBAR', figures: ['wren', 'wren-afternoon'],
    lines: {
      idle: ['One mark. I ring it, I row back. The fleet calls it a race. They\'ve been calling it that for years.'],
      met: [
        'A race needs a finish. Nobody\'s set one.',
        'The bar goes out further than anyone\'s walked. That\'s all I know about it.',
      ],
      asked: ['Walk THE SANDBAR to the end, then come back to the punt and tell me what\'s there. Two marks make a line.'],
      done: ['Second mark\'s down. There\'s a line now. Whether they use it is their business.', 'Two ends. A race with two ends. Imagine.'],
      'chose:door:the-second-mark': ['Two marks. A line. I\'ll ring them both, then. Twice the rowing.'],
      'chose:door:the-fleet-finished': ['You called it. Finished. They\'ve stopped. I don\'t think they know what to do with their afternoons.'],
    },
  },
  {
    id: 'brack', name: 'BRACK', land: 'forest', want: 'THE TARN',
    lines: {
      idle: ['Don\'t stand between me and the water. I\'ve kept my eyes on it forty years.'],
      met: [
        'The road goes round. I go round. It\'s a circle.',
        'There\'s a boat by the round with an oar still in it. Eleven oars on the hall wall. Count them.',
      ],
      asked: ['Go down to THE TARN and stand at the water. Then come back up here and tell me nothing came out. Somebody should, and it isn\'t going to be me.'],
      done: ['You stood at it. Then I can turn round. Forty years. My neck.', 'There\'s a flat stone by the water now. Skim it. I won\'t look.'],
      'chose:door:the-water-stood': ['Nothing came up out of it, then. No. Right. I can turn my back on it now.'],
      'chose:door:the-oar-taken': ['Took the oar. The twelfth. Well, now I\'ve a reason to keep watching, haven\'t I.'],
    },
  },
  {
    id: 'holt', name: 'HOLT', land: 'canyon', want: 'THE RIVERHEAD',
    lines: {
      idle: ['River went. I stayed. The boat stayed. I oil it.'],
      met: [
        'Every mark on that wall is a year the water was lower.',
        'You came up a dry channel to tell me something. People don\'t, usually.',
      ],
      asked: ['Follow the dry bed back down to THE RIVERHEAD, where the water comes out. Then come back up and tell me if it\'s the same river.'],
      done: ['Forty units. Forty. I could have walked it in an afternoon.', 'Boat\'s the right way up. First time in years.'],
      'chose:door:the-boat-righted': ['Running forty units away. Then the boat comes off the trestles. Give me a hand with her.'],
      'chose:door:the-sea-has-no-bottom': ['No bottom. Then there\'s nothing to oil a boat for. Let the marks weather.'],
    },
  },
  {
    id: 'amos', name: 'AMOS', land: 'desert', want: 'THE CATCH',
    lines: {
      idle: ['Cistern\'s empty. Catch has never caught. Water\'s at the oasis, so that\'s where I walk.'],
      met: [
        'Down empty, back with two cans. All night. Every night.',
        'The water on this sheet comes from somewhere. I\'d like to know where.',
      ],
      asked: ['Come to THE CATCH after dark. Walk the track down to the oasis with me and back. Then tell me where the water comes from. The things are out at night. I know.'],
      done: ['Lid\'s off. Listen. That\'s rain going in. First time.', 'You walked it at night. With the things out. Fourteen years I did that alone.'],
      'chose:door:the-lid-off': ['Off. The lid. Fourteen years with the lid on. Don\'t say anything.'],
      'chose:door:the-cistern-yours': ['You filled it. By hand. From the oasis. Then I\'ll stop walking. The track can grow over.'],
    },
  },
  {
    id: 'joan', name: 'JOAN HARROW', land: 'downs', want: 'THE HEADLAND',
    lines: {
      idle: ['Field won\'t reap itself. Say what you want and say it walking.'],
      met: [
        'Table\'s laid at the headland. Two places. Has been for a while.',
        'I\'m not waiting for anyone. I just lay two.',
      ],
      asked: ['Cross the ford. There\'s a place laid at THE HEADLAND for nobody in particular. Sit in it. Then come and tell me you did.'],
      done: ['You sat. Good. A place kept for nobody was always a place kept for anybody.', 'Pass the bread, then.'],
      'chose:door:the-seat-taken': ['Sat down. Well. Pass the bread, then.'],
      'chose:door:the-setting-cleared': ['Cleared it. One place. That\'s honest, I suppose. Quieter.'],
    },
  },
  {
    id: 'val', name: 'VAL', land: 'neighborhood', want: 'THE KEEP',
    lines: {
      idle: ['Three chairs. One hedge. Don\'t ask. Everyone asks.'],
      met: [
        'There used to be a gap in that hedge. You could see the castle through it. Now you can see hedge.',
        'I leave the light on. Somebody should.',
      ],
      asked: ['Take the bicycle up the king\'s road to THE KEEP at Greyweather. Look at it. Then come back to the three chairs and tell me what you saw.'],
      done: ['There. Castle. Through the gap. I told June and June didn\'t believe me.', 'Sit down. That\'s what the chairs are for.'],
      'chose:door:the-gap-cut': ['Cut. You can see it from the chairs. Sit down. That\'s what they\'re for.'],
      'chose:door:the-light-off': ['Off. Fine. It\'s one less thing. The street\'ll go dark a house at a time, you watch.'],
    },
  },
  {
    id: 'the-man', name: 'THE MAN AT THE JUNCTION', land: 'city', want: 'THE JUNCTION',
    lines: {
      idle: ['You stopped. Nobody stops. Four green lights and nobody stops.'],
      met: [
        'I\'ve been here long enough to be geography.',
        'There\'s a bench twenty units off. Nobody\'s ever used it.',
      ],
      asked: ['Look down at THE PAVEMENT first. Then stand here with me. Four seconds. Just stand. That\'s all it is.'],
      done: ['You asked. That\'s all anyone had to do. I\'ll sit on the bench now.', 'Four seconds. Nobody had four seconds.'],
      'chose:door:the-stood-with': ['You stood with me. Right. Bench, then. It\'s been waiting longer than I have.'],
      'chose:door:the-walked-round': ['Round, like everyone. Fine. Wear a lane in it. Everybody else has.'],
    },
  },
  {
    id: 'dennis', name: 'DENNIS', land: 'office', want: 'THE 8:15 STOP',
    lines: {
      idle: ['8:15. It\'s on the board. It\'s been on the board. I don\'t need the board.'],
      met: [
        'Twelve names, twelve times. I have it by heart. I\'d be embarrassed for you if you didn\'t.',
        'The bench in the shelter has never been sat on. That\'s the only true thing about it.',
      ],
      asked: ['Read the timetable at THE 8:15 STOP. Twelve names. Stand in six of them so they mean something, then read it again. Then tell me which ones you\'ve met.'],
      done: ['It\'s a list. The twelve are on it. In order. Now you know what I know.', 'I folded the board into a plane. I don\'t need it. It flies better than it read.'],
      'chose:door:the-board-wiped': ['Wiped. Every line. I don\'t need it. I said I don\'t need it. I\'ll not go to it in the mornings.'],
      'chose:door:the-corner-pressed': ['Pressed the corner back. It\'ll lift again. They do. But thank you.'],
    },
  },
];

/** Which named person speaks for a land's choice. */
export const WAIT_PERSON: Record<RegionId, string> = {
  meadow: 'nell', kingdom: 'marget', castle: 'wick', beach: 'pye', ocean: 'wren', forest: 'brack',
  canyon: 'holt', desert: 'amos', downs: 'joan', neighborhood: 'val', city: 'the-man', office: 'dennis',
};

/* ------------------------------------------------------------------ *
 * THE UNNAMED. A line by role (matched on the routine id's prefix),
 * else a line by land. Everybody says something.
 * ------------------------------------------------------------------ */
export const FOLK_BY_ROLE: [string, string[]][] = [
  ['the-lamplighter', ['Four lamps. I\'m always four behind.', 'They don\'t light themselves. People think they do.']],
  ['the-brim-sweeper', ['Swept it yesterday. Look at it.', 'Market\'s never opened. I sweep anyway.']],
  ['the-brim-delivery', ['Down to the well and back. Don\'t ask what\'s in it.', 'Mind the cart.']],
  ['the-wheelwright', ['Wheels. That\'s all I do. Wheels.']],
  ['the-dusk-walker', ['I walk at dusk. It\'s quieter. Was quieter.']],
  ['the-sentry', ['Nothing to report. There\'s never anything to report.', 'Four banners. Ask Wick.']],
  ['the-groom', ['Horses are fine. Better than the king, anyway.']],
  ['the-washerwoman', ['If you see a wet banner, that\'s mine. Or it was.']],
  ['the-pilgrims', ['We came to see the king. He\'s lying down.', 'Long way for a plinth with nothing on it.']],
  ['the-jogger', ['Can\'t stop. Can\'t stop.']],
  ['the-post', ['Nothing for you. Nothing for anyone, mostly.']],
  ['the-evening-walker', ['Have you seen the three chairs? Facing a hedge. I don\'t ask.']],
  ['the-watering', ['It\'s the sprinkler. Two streets over. Never found it.']],
  ['the-city-sweeper', ['Four green lights and a man in the middle. Every day.']],
  ['the-city-delivery', ['Round him. Everyone goes round him.']],
  ['the-window-cleaner', ['Same windows. Same pole. Same grey.']],
  ['the-busker', ['Requests? No. Nobody\'s ever had one.']],
  ['the-barista', ['Order for Wick. Wick? No. Didn\'t think so.', 'Eleven cups on the counter by six. Every day. Nobody collects.']],
  ['the-nine-oclock', ['Nine. In. Same as yesterday.']],
  ['the-five-oclock', ['Five. Out. Same as tomorrow.']],
  ['the-smoker', ['Week two of a two-week sprint. Has been for a while.']],
  ['the-courier', ['Sign here. Or don\'t. Nobody checks.']],
  ['the-office-cleaner', ['They wipe the board, I wipe the desks. Nothing changes.']],
  ['the-night-guard', ['The 8:15 never came, you know. I\'d have seen it.']],
  ['the-sprint-lead', ['We\'re aligned. We\'re very aligned.']],
  ['the-sprint-researcher', ['Dennis is our persona. He\'s real, actually. He\'s outside.']],
  ['the-sprint-maker', ['I make things. Nobody\'s asked what.']],
  ['the-beachcomber', ['Tide brings it in. I take it out. Fair.']],
  ['the-tideline-comber', ['Glass, mostly. Some rope.']],
  ['the-hut-owner', ['Hut\'s mine. Painted it myself. Don\'t touch it.']],
  ['the-hut-shut', ['Shutting up. Come back tomorrow. Or don\'t.']],
  ['the-bathers', ['We don\'t go in. Nobody on this coast has learned to swim.']],
  ['the-jetty-fisher', ['Caught nothing. Pye catches nothing too. It\'s a tradition.']],
  ['the-prom-walker', ['End to end at eight and at six. It\'s a promenade. You promenade.']],
  ['the-fire-folk', ['We light it. Nobody comes. We light it again.']],
  ['the-surfers', ['Board\'s racked. Sea\'s flat. Same as yesterday.']],
  ['the-moorings', ['Boat\'s tied. It\'s always tied. That\'s what a mooring is.']],
  ['the-oaks-argument', ['He started it.', 'No, HE started it.', 'We\'ve been at this since the oaks were saplings.']],
  ['the-riverbend-fisher', ['First light. Best light. Nothing biting.']],
  ['the-well-woman', ['Well\'s deep. Shout down it if you like. It answers, eventually.']],
  ['the-common-carter', ['Brim to the well and back. Every morning. Don\'t ask what\'s in the cart.']],
  ['the-ladder', ['Mind the ladder. Round the well. Mind it.']],
  ['the-cutters', ['Pines don\'t cut themselves.', 'Brack\'s still at it. Round and round.']],
  ['the-picker', ['Mushrooms. Don\'t eat the red ones.']],
  ['the-round-walked', ['Once round. That\'s the walk. Then home.']],
  ['the-hikers', ['Is this the way to the overlook? We\'ve been going up for an hour.']],
  ['the-overlook', ['You can see the whole cut from here. There\'s no river in it.']],
  ['the-far-rim', ['I can see you from here. I can\'t get to you.']],
  ['the-road-walker', ['Road stops out there. Just stops. Go and look.']],
  ['the-miller', ['Have you seen the mill? You\'re looking at it.']],
  ['the-downs-carter', ['Flour up, grain down. That\'s the whole economy.']],
  ['the-shepherd', ['Sheep are square. Nobody knows why. Don\'t make a thing of it.']],
  ['the-funeral', ['Not now.', 'We\'re walking. Walk with us or don\'t.']],
];

export const FOLK_BY_LAND: Record<RegionId, string[]> = {
  meadow: ['Mind the bull.', 'Nell\'s at the gate. She\'s always at the gate.', 'Four roads from the crossroads. One of them isn\'t.'],
  kingdom: ['Market\'s never opened. Ask Marget. Don\'t ask Marget.', 'Two hands on that clock and they don\'t agree.'],
  castle: ['Five poles, four banners. Wick counts them every morning.', 'The king\'s down. Nobody pushed him.'],
  beach: ['Pye rows out at the tide. Rows back at the tide.', 'Nobody here swims. It\'s not a rule. It\'s just true.'],
  ocean: ['One mark out there. Wren rings it.', 'The bar goes further than you think.'],
  forest: ['Brack\'s round the tarn. He\'s always round the tarn.', 'Count the oars in the hall. Eleven.'],
  canyon: ['River went. Holt didn\'t.', 'Every mark on the wall is a year.'],
  desert: ['Amos walks at night. Two cans. Every night.', 'The catch has never caught anything.'],
  downs: ['Joan lays two places. Nobody comes.', 'Have you seen the mill?'],
  neighborhood: ['Three chairs facing a hedge. Val\'s idea.', 'The sprinkler\'s two streets over. Nobody\'s found it.'],
  city: ['Man in the junction. Go round him. Everyone does.', 'The 8:15 never came, you know.'],
  office: ['Dennis is at the stop. He\'s always at the stop.', 'Week two of the sprint. Has been for months.'],
};

/* ------------------------------------------------------------------ *
 * THE DOORS: what the card says will happen, and what the world says
 * afterwards when nobody is near enough to say it themselves.
 * ------------------------------------------------------------------ */
export const CONSEQUENCES: Record<string, { hint: string; shout: string }> = {
  'door:the-cart-turned-north': { hint: 'the cart is loaded and goes north; Nell goes with it', shout: 'ON THE COMMON, A CART TURNS NORTH' },
  'door:the-cart-pushed': { hint: 'the cart is yours; push it to a border and it stays', shout: 'A CART STANDS AT THE EDGE OF THE COMMON' },
  'door:the-bell-rings-it': { hint: 'the bell settles the hour; Marget opens', shout: 'IN BRIM, THE BELL RINGS EIGHT' },
  'door:the-clock-set-to-eight': { hint: 'market called at eight; Marget opens', shout: 'IN BRIM, A MARKET IS CALLED FOR EIGHT' },
  'door:the-clock-set-to-eleven': { hint: 'market called at eleven; Marget never opens', shout: 'IN BRIM, A MARKET IS CALLED, AND ONE STALL STAYS SHUT' },
  'door:the-king-restored': { hint: 'Wick is relieved of his poles', shout: 'AT GREYWEATHER, THE KING IS BACK ON HIS PLINTH' },
  'door:the-king-left': { hint: 'nothing changes; Wick keeps hanging banners', shout: 'AT GREYWEATHER, THE KING STAYS DOWN' },
  'door:the-eighth-pot': { hint: 'an eighth pot goes out on a new bearing', shout: 'OFF LONGSHORE, AN EIGHTH POT GOES OUT' },
  'door:the-pots-hauled': { hint: 'the pots come in; Pye sits on the shore', shout: 'OFF LONGSHORE, SEVEN POTS COME IN FOR GOOD' },
  'door:the-second-mark': { hint: 'two marks make a line; the fleet may use it', shout: 'ON THE WIDE BLUE, A SECOND MARK GOES DOWN' },
  'door:the-fleet-finished': { hint: 'the race ends; the fleet stops', shout: 'ON THE WIDE BLUE, THE RACE IS OVER' },
  'door:the-water-stood': { hint: 'Brack can turn his back on the tarn', shout: 'IN THE PENWOOD, A MAN TURNS ROUND' },
  'door:the-oar-taken': { hint: 'the oar leaves the boat; the hall has twelve', shout: 'IN THE PENWOOD, THE TWELFTH OAR GOES ON THE WALL' },
  'door:the-boat-righted': { hint: 'the boat comes off the trestles', shout: 'IN SPLITROCK, A BOAT COMES OFF ITS TRESTLES' },
  'door:the-sea-has-no-bottom': { hint: 'Holt stops oiling; the marks weather', shout: 'IN SPLITROCK, NOBODY OILS THE BOAT ANY MORE' },
  'door:the-lid-off': { hint: 'the catch catches; Amos stops walking at night', shout: 'ON THE FLATS, A LID COMES OFF' },
  'door:the-cistern-yours': { hint: 'you fill it by hand; the track grows over', shout: 'ON THE FLATS, A TRACK BEGINS TO GROW OVER' },
  'door:the-seat-taken': { hint: 'you sit; the place was kept for you', shout: 'ON THE DOWNS, A SECOND PLACE IS TAKEN' },
  'door:the-setting-cleared': { hint: 'one place at the table from now on', shout: 'ON THE DOWNS, A TABLE IS LAID FOR ONE' },
  'door:the-gap-cut': { hint: 'the castle shows through the hedge', shout: 'IN MAPLE COURT, A HEDGE HAS A GAP AGAIN' },
  'door:the-light-off': { hint: 'the street goes dark a house a day', shout: 'IN MAPLE COURT, A LIGHT GOES OFF' },
  'door:the-stood-with': { hint: 'he is asked; he goes to the bench', shout: 'IN GREYLINE, A MAN LEAVES THE JUNCTION' },
  'door:the-walked-round': { hint: 'you wear your own lane; he stays', shout: 'IN GREYLINE, A LANE WEARS INTO THE STONE' },
  'door:the-board-wiped': { hint: 'the timetable is gone; Dennis keeps it by heart', shout: 'IN THE MILE, A BOARD IS WIPED CLEAN' },
  'door:the-corner-pressed': { hint: 'the corner holds, for now', shout: 'IN THE MILE, A CORNER IS PRESSED BACK' },
};

/** An option's label with its consequence, when the label is opaque. */
export function withHint(label: string, door: string): string {
  const c = CONSEQUENCES[door];
  if (!c) return label;
  return `${label} — ${c.hint}`;
}

/* ------------------------------------------------------------------ *
 * KNOWLEDGE, IN PLAIN ENGLISH — one line per id `knowledge.learn` is
 * ever called with. `name:<land>` and `wear:<thing>` are derived.
 * ------------------------------------------------------------------ */
export const KNOWLEDGE_LABELS: Record<string, string> = {
  'reason:brim': 'WHY BRIM\'S MARKET NEVER OPENED',
  'reason:the-fifth-banner': 'WHY THE FIFTH POLE STOOD EMPTY',
  'fact:brim-hour': 'WHICH HAND ON THE BELFRY IS RIGHT',
  'fact:brim-red': 'BRIM\'S COLOUR IS RED',
  'fact:a-banner-wet': 'WHAT A WET BANNER WEIGHS',
  'fact:the-old-name': 'THE KING\'S OLD NAME',
  'fact:the-crate-was-empty': 'THE CRATE WAS EMPTY',
  'fact:the-board-racked': 'THE BOARD IS BACK ON ITS RACK',
  'fact:the-line-did-not-reach': 'THE LINE DID NOT REACH THE MARK',
  'name:the-mark': 'THE MARK\'S NAME',
  'fact:the-tarn': 'THE TARN IS WHERE THE ROAD GOES',
  'fact:the-twelfth-oar': 'THE HALL HAS TWELVE OARS NOW',
  'fact:how-deep': 'HOW DEEP THE CUT GOES',
  'fact:odds-line': 'THE FLEET\'S ODDS ARE CHALKED ON A LINE',
  'fact:the-fold': 'THE CREASE HAS TWO FACES',
  'fact:the-oasis-a-hand-deep': 'THE OASIS IS A HAND DEEP',
  'fact:the-cistern-filled': 'THE CISTERN IS FULL',
  'fact:the-place-kept': 'A PLACE KEPT FOR NOBODY IS KEPT FOR ANYBODY',
  'fact:the-man-at-the-junction': 'THE MAN WAS WAITING TO BE ASKED',
  'fact:the-pavement': 'THE PAVEMENT IS WORN IN A RING',
  'fact:your-lane': 'YOU HAVE WORN YOUR OWN LANE',
  'fact:the-bin-righted': 'THE BIN IS BACK ON ITS FEET',
  'fact:the-timetable': 'THERE IS A LIST, AND THE TWELVE ARE ON IT',
  'fact:the-8-15-ran': 'THE 8:15 RAN',
  'route:the-line': 'THE LINE, END TO END',
  'route:the-river': 'THE RIVER, SALT TO SOURCE',
  'route:the-bar': 'THE SANDBAR, TO ITS END',
};

/** A readable line for any id: the table, or the slug in caps. */
export function knowledgeLabel(id: string, landName: (rid: string) => string): string {
  const k = KNOWLEDGE_LABELS[id];
  if (k) return k;
  if (id.startsWith('fact:the-light-went-off-on-day-')) return `THE DAY VAL\'S LIGHT WENT OFF`;
  if (id.startsWith('name:')) return `WHERE ${landName(id.slice(5))} IS`;
  if (id.startsWith('wear:')) return id.slice(5).replace(/-/g, ' ').toUpperCase();
  const slug = id.slice(id.indexOf(':') + 1);
  return slug.replace(/-/g, ' ').toUpperCase();
}
