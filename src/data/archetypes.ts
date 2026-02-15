import type { ArchetypeId, ArchetypeInfo, ComboType, ComboTypeId, MirrorPair } from './types';

// ─── Primary Archetypes ───

export const ARCHETYPES: Record<ArchetypeId, ArchetypeInfo> = {
  pulse: {
    id: 'pulse',
    name: 'Pulse',
    emoji: '⚡',
    color: '#EC4899',
    hangout: 'The Rooftop',
    tagline: 'You bring the energy',
    description: 'The spark. You thrive on social energy, new connections, and momentum. Everything around you feels like it\'s about to pop off.',
  },
  glow: {
    id: 'glow',
    name: 'Glow',
    emoji: '🔥',
    color: '#22C55E',
    hangout: 'The Pitch',
    tagline: 'You don\'t stop',
    description: 'The drive. You\'re always leveling up - fitness, side hustles, yourself. Growth is how you connect with people.',
  },
  cozy: {
    id: 'cozy',
    name: 'Cozy',
    emoji: '🕯️',
    color: '#F97316',
    hangout: 'The Hearth',
    tagline: 'You make people feel at home',
    description: 'The warmth. Real conversations, good vibes, being someone\'s safe space. You read people like a book and people trust that.',
  },
  lore: {
    id: 'lore',
    name: 'Lore',
    emoji: '📚',
    color: '#3B82F6',
    hangout: 'The Lobby',
    tagline: 'You go deep',
    description: 'The depth. You go deep on the things you care about. Obsession is your love language, and you respect anyone who does the same.',
  },
};

// ─── Combo Types ───

export const COMBO_TYPES: Record<ComboTypeId, ComboType> = {
  pulse_glow: {
    id: 'pulse_glow',
    primary: 'pulse',
    secondary: 'glow',
    name: 'The Main Character',
    emoji: '⚡🔥',
    tagline: 'You don\'t just attend - you become the story',
    description: 'You\'re the friend who makes going out a competitive sport - and you\'re winning. You\'ve got energy that makes people feel alive just by being near you. You remember conversations, you know what\'s next, and somehow people just follow you. Going out isn\'t just what you do - it\'s what you do best.',
    hangoutLine: 'Already planning which bar is next while everyone else is on round one.',
    mirrorId: 'glow_pulse',
    clickWith: [
      'Pulse/Cozy, Pulse/Lore - Your Pulse cousins get the social vibe',
      'Glow/Pulse - You mirror each other\'s chaos energy',
      'Lore/Pulse - They know where to go, you know how to make it happen',
    ],
    clashWith: [
      'Cozy/Lore, Lore/Cozy - Too slow, too in-your-head',
      'Glow/Lore, Lore/Glow - Too much talking, not enough doing',
    ],
    profilePrompts: [
      'My main character moment',
      'The fit that goes hardest',
      'My face when I realise everyone\'s watching',
      'A night out that went completely off-script',
      'The energy I bring to the group',
    ],
  },
  pulse_cozy: {
    id: 'pulse_cozy',
    primary: 'pulse',
    secondary: 'cozy',
    name: 'The Golden Hour',
    emoji: '⚡🕯️',
    tagline: 'Everyone\'s invited, and everyone\'s welcome',
    description: 'You make every room feel like home without even trying. You\'re the one people gravitate toward because you genuinely care AND you\'re fun. You\'ll be at the party but you\'re the one making sure nobody feels left out. You\'re not performing - you just naturally create spaces where people feel seen.',
    hangoutLine: 'Making sure the quiet person at the party is having a good time.',
    mirrorId: 'cozy_pulse',
    clickWith: [
      'Pulse/Glow, Pulse/Lore - Your Pulse cousins understand social life',
      'Cozy/Pulse, Cozy/Glow, Cozy/Lore - Your Cozy cousins get your values',
      'Glow/Cozy - You\'re both doing the warm growth thing',
    ],
    clashWith: [
      'Lore/Glow, Glow/Lore - Too much analyzing, they overthink your warmth',
      'Lore/Lore - The super cerebral types find your vibe exhausting',
    ],
    profilePrompts: [
      'Me with close friends vs me with strangers',
      'Golden hour energy looks like this',
      'Comfort food that hits different',
      'My face when plans get cancelled (not mad about it)',
      'The vibe when it\'s just the close friends',
    ],
  },
  pulse_lore: {
    id: 'pulse_lore',
    primary: 'pulse',
    secondary: 'lore',
    name: 'The Tastemaker',
    emoji: '⚡📚',
    tagline: 'The person who always knows the best thing first',
    description: 'You\'re out constantly and it shows - not in a flex way, just in how you move through the world with authority about what\'s good. You know the restaurant that\'s about to blow up, the DJ everyone will be obsessed with, the neighborhood that\'s becoming something. Your knowledge feels like you lived it, not studied it.',
    hangoutLine: 'Texting "we need to go here" six months before everyone else finds it.',
    mirrorId: 'lore_pulse',
    clickWith: [
      'Pulse/Glow, Pulse/Cozy - Your Pulse cousins understand the social arena',
      'Lore/Pulse, Lore/Glow, Lore/Cozy - Your Lore cousins speak knowledge',
      'Glow/Lore - You\'re both researching the path to better',
    ],
    clashWith: [
      'Cozy/Cozy - Deeply introverted types find your constant motion exhausting',
      'Lore/Lore - You\'ll probably compete over who discovered it first',
    ],
    profilePrompts: [
      'Something I was into before everyone else',
      'Rate my taste',
      'The find that nobody knows about yet',
      'My most controversial take, visualised',
      'The aesthetic I\'m locked into right now',
    ],
  },
  glow_pulse: {
    id: 'glow_pulse',
    primary: 'glow',
    secondary: 'pulse',
    name: 'The Captain',
    emoji: '🔥⚡',
    tagline: 'We go together',
    description: 'You don\'t just have goals - you have a crew. You\'re the person who turns personal growth into a team sport. Marathon training becomes a group text. Meal prep becomes content. You lead by example and people follow because your energy is contagious. You\'re competitive but you want everyone to win.',
    hangoutLine: 'Organizing the group fitness challenge nobody asked for but everyone joins.',
    mirrorId: 'pulse_glow',
    clickWith: [
      'Glow/Cozy, Glow/Lore - Your Glow cousins understand goal orientation',
      'Pulse/Glow, Pulse/Cozy - Your Pulse cousins get the social energy',
      'Lore/Glow - They research the path, you recruit people for it',
    ],
    clashWith: [
      'Cozy/Lore, Lore/Cozy - Too slow, too in-their-head about things',
      'Lore/Lore - Academic energy without the action',
    ],
    profilePrompts: [
      'The squad photo that needs no context',
      'My pre-game energy',
      'Me rallying the group when everyone wants to bail',
      'The plan that actually came together',
      'The thing I will not shut up about',
    ],
  },
  glow_cozy: {
    id: 'glow_cozy',
    primary: 'glow',
    secondary: 'cozy',
    name: 'The Anchor',
    emoji: '🔥🕯️',
    tagline: 'Steady wins',
    description: 'You\'re the friend who actually gets better AND makes everyone around you better too. You don\'t just grow - you grow with intention and warmth. Your self-improvement doesn\'t feel like a hustle, it feels like care. You meal prep because you love yourself. You check in on friends because you love them. You\'re consistent and people trust that.',
    hangoutLine: 'The one who shows up early, stays late, and remembers what you said last time.',
    mirrorId: 'cozy_glow',
    clickWith: [
      'Other Glow types - They speak your language about getting better',
      'Other Cozy types - They understand the warmth piece',
      'Pulse/Cozy - Warm and social like you, just less focused on the growth thing',
    ],
    clashWith: [
      'Lore/Lore - All thinking, no doing',
      'Pulse/Lore - Too scattered for what you\'re trying to build',
    ],
    profilePrompts: [
      'My non-negotiable morning ritual',
      'The small change that made everything better',
      'Progress I\'m quietly proud of',
      'Me checking in without being weird about it',
      'The habit I\'ll defend to the death',
    ],
  },
  glow_lore: {
    id: 'glow_lore',
    primary: 'glow',
    secondary: 'lore',
    name: 'The Optimizer',
    emoji: '🔥📚',
    tagline: 'I don\'t just do it - I study the meta',
    description: 'You figured out the cheat code and now you\'re just executing it perfectly. You don\'t just work out - you\'ve researched the optimal program. You don\'t just cook - you\'ve optimized your macros. Knowledge isn\'t just interesting to you, it\'s a tool for getting better faster. You\'re the friend people text "what\'s the best X" because you always know.',
    hangoutLine: 'Has a spreadsheet for everything and it actually works.',
    mirrorId: 'lore_glow',
    clickWith: [
      'Other Glow types - Get the ambition',
      'Other Lore types - Get the research obsession',
      'Pulse/Lore - They\'re discovering, you\'re optimizing. Natural pair.',
    ],
    clashWith: [
      'Cozy/Cozy (and deeply non-ambitious anyone) - They exhaust you',
      'Pulse/Pulse - All energy, no strategy. Potential wasted.',
    ],
    profilePrompts: [
      'My most optimised setup',
      'The system I\'m unreasonably proud of',
      'Me going down a research rabbit hole at 3am',
      'Something I researched way too long before doing',
      'The spreadsheet that would impress you',
    ],
  },
  cozy_pulse: {
    id: 'cozy_pulse',
    primary: 'cozy',
    secondary: 'pulse',
    name: 'The Host',
    emoji: '🕯️⚡',
    tagline: 'Come in, I saved you a seat',
    description: 'You\'re the one throwing the dinner party, lighting the candles, somehow knowing exactly what people need before they ask. Your superpower is making spaces feel safe. You\'re generous with your time and your energy and your emotional real estate. You just invite people in. You turn moments into experiences. Your friends text you when they need to feel held.',
    hangoutLine: 'Already has snacks out and the playlist going before anyone arrives.',
    mirrorId: 'pulse_cozy',
    clickWith: [
      'People who value depth and belonging',
      'Anyone grateful for being actually cared for',
      'People into ritual and intention',
    ],
    clashWith: [
      'People who see intimacy as intrusive',
      'Very transactional people',
      'Anyone uncomfortable with vulnerability',
    ],
    profilePrompts: [
      'What I bring to the table (literally)',
      'My place five minutes before everyone arrives',
      'The dish everyone always requests',
      'POV: you just walked into my space',
      'How I make people feel at home',
    ],
  },
  cozy_glow: {
    id: 'cozy_glow',
    primary: 'cozy',
    secondary: 'glow',
    name: 'The Slow Burn',
    emoji: '🕯️🔥',
    tagline: 'Better every day, but never in a rush',
    description: 'You\'re the friend who somehow makes self-improvement look chill. You do yoga, you read, you\'re slowly making your apartment actually nice - but none of it feels like grinding. You just live intentionally and people notice. You\'re comfortable with where you are right now AND excited about where you\'re going. That\'s rare.',
    hangoutLine: 'Suggests the walk that turns into the best conversation you\'ve had all month.',
    mirrorId: 'glow_cozy',
    clickWith: [
      'Other Cozy types - They get the warmth',
      'Other Glow types - They get the intention',
      'Glow/Cozy - Your mirror, you\'ll click immediately',
    ],
    clashWith: [
      'Pulse/Glow - Too much chaos for your pace',
      'Lore/Glow - Too intense about mastery',
    ],
    profilePrompts: [
      'My Sunday in one photo',
      'The thing I\'m slowly getting really good at',
      'My comfort zone (and I\'m not leaving)',
      'A glow-up I\'m proud of',
      'The routine that keeps me sane',
    ],
  },
  cozy_lore: {
    id: 'cozy_lore',
    primary: 'cozy',
    secondary: 'lore',
    name: 'The Storyteller',
    emoji: '🕯️📚',
    tagline: 'A curator of worlds - taste as a form of hospitality',
    description: 'You\'re building worlds, one perfectly chosen thing at a time. Your bookshelf is a vibe. Your playlist is a journey. You don\'t just consume culture - you arrange it into something that means something. People walk into your space and feel the intention behind every choice. You share what you love like you\'re giving someone a gift.',
    hangoutLine: 'Their room tells a story even when they\'re not in it.',
    mirrorId: 'lore_cozy',
    clickWith: [
      'Other Cozy types - Kindred warmth',
      'Other Lore types - Kindred depth',
      'Lore/Cozy - Your mirror, you\'ll have the deepest conversations',
    ],
    clashWith: [
      'Pulse/Glow - Too fast, too surface for you',
      'Glow/Pulse - All ambition, no aesthetic',
    ],
    profilePrompts: [
      'The corner of my room that tells you everything',
      'Currently reading/watching/listening to',
      'My whole aesthetic in one image',
      'The object on my shelf with the best story',
      'Me about to explain why this is a masterpiece',
    ],
  },
  lore_pulse: {
    id: 'lore_pulse',
    primary: 'lore',
    secondary: 'pulse',
    name: 'The Showrunner',
    emoji: '📚⚡',
    tagline: 'I\'m running a campaign, you\'re all invited',
    description: 'You\'re the person who turns obsession into a social event. You don\'t just watch the show - you host the watch party. You don\'t just play the game - you run the Discord. Your knowledge isn\'t locked in your head, it\'s out in the world building community. People show up because your enthusiasm is that powerful.',
    hangoutLine: 'Running a tournament nobody asked for but everyone showed up to.',
    mirrorId: 'pulse_lore',
    clickWith: [
      'Other Lore types - They speak your language',
      'Pulse types - They match your social energy',
      'Cozy/Pulse - Their warmth complements your events',
    ],
    clashWith: [
      'Cozy/Glow - Too quiet for your energy',
      'Glow/Cozy - They\'d rather grow privately',
    ],
    profilePrompts: [
      'Something I built from scratch',
      'My most niche obsession',
      'The event or space I\'m proudest of',
      'Me converting someone to my interests',
      'The thing I made that got people talking',
    ],
  },
  lore_glow: {
    id: 'lore_glow',
    primary: 'lore',
    secondary: 'glow',
    name: 'The Completionist',
    emoji: '📚🔥',
    tagline: 'If I\'m doing it, I\'m doing it right',
    description: 'Mastery is the move. You don\'t just like things - you need to understand them completely. Every game gets 100%\'d. Every topic gets a deep dive. You\'re not doing this for clout, you\'re doing it because incomplete knowledge feels wrong. People respect your commitment even if they don\'t always get it.',
    hangoutLine: 'Can tell you the lore of literally anything they\'ve ever been into.',
    mirrorId: 'glow_lore',
    clickWith: [
      'Other Lore types - They understand the depth',
      'Glow/Lore - Your mirror, mutual respect for mastery',
      'Pulse/Lore - They discover, you complete',
    ],
    clashWith: [
      'Pulse/Glow - Too surface, too chaotic',
      'Cozy/Pulse - They think you\'re intimidating',
    ],
    profilePrompts: [
      'My most impressive achievement unlocked',
      'The thing I know embarrassingly well',
      'Rate my collection',
      'My notes when I go deep on something',
      'Me when someone asks about my special interest',
    ],
  },
  lore_cozy: {
    id: 'lore_cozy',
    primary: 'lore',
    secondary: 'cozy',
    name: 'The Sage',
    emoji: '📚🕯️',
    tagline: 'Pull up a chair, this is a good one',
    description: 'You feel things through stories. Knowledge hits different when it hits your heart. You\'re not collecting facts - you\'re finding wisdom. The show that changed your worldview, the book that made you cry, the game that taught you something about yourself. You go deep because depth is where meaning lives.',
    hangoutLine: 'Will talk about one scene from a show for literally an hour and you\'ll love it.',
    mirrorId: 'cozy_lore',
    clickWith: [
      'Other Lore types - They respect the depth',
      'Cozy/Lore - Your mirror, instant understanding',
      'Cozy/Glow - They appreciate your wisdom',
    ],
    clashWith: [
      'Pulse/Glow - Way too fast, too surface',
      'Glow/Pulse - All action, no reflection',
    ],
    profilePrompts: [
      'The book/movie/album that changed everything',
      'My comfort rewatch when nothing else works',
      'Where I go to think',
      'The thing I could talk about for five hours',
      'Me about to give you a life-changing recommendation',
    ],
  },
};

// ─── Mirror Pairs ───

export const MIRROR_PAIRS: MirrorPair[] = [
  {
    id: 'pulse_glow',
    typeA: 'pulse_glow',
    typeB: 'glow_pulse',
    nameA: 'The Main Character',
    nameB: 'The Captain',
    difference: 'Main Character leads with charisma; Captain leads with effort',
  },
  {
    id: 'pulse_cozy',
    typeA: 'pulse_cozy',
    typeB: 'cozy_pulse',
    nameA: 'The Golden Hour',
    nameB: 'The Host',
    difference: 'Golden Hour brings warmth to rooms; Host creates warmth in their space',
  },
  {
    id: 'pulse_lore',
    typeA: 'pulse_lore',
    typeB: 'lore_pulse',
    nameA: 'The Tastemaker',
    nameB: 'The Showrunner',
    difference: 'Tastemaker absorbs knowledge effortlessly; Showrunner geeks out and builds community',
  },
  {
    id: 'glow_cozy',
    typeA: 'glow_cozy',
    typeB: 'cozy_glow',
    nameA: 'The Anchor',
    nameB: 'The Slow Burn',
    difference: 'Anchor grows through conscious effort; Slow Burn grows through cozy routines',
  },
  {
    id: 'glow_lore',
    typeA: 'glow_lore',
    typeB: 'lore_glow',
    nameA: 'The Optimizer',
    nameB: 'The Completionist',
    difference: 'Optimizer researches the best path; Completionist dives deep because they love mastering it',
  },
  {
    id: 'cozy_lore',
    typeA: 'cozy_lore',
    typeB: 'lore_cozy',
    nameA: 'The Storyteller',
    nameB: 'The Sage',
    difference: 'Storyteller curates aesthetic worlds; Sage finds emotional wisdom in what they explore',
  },
];

// ─── Helper Functions ───

export function getComboType(primary: ArchetypeId, secondary: ArchetypeId): ComboType {
  const id = `${primary}_${secondary}` as ComboTypeId;
  return COMBO_TYPES[id];
}

export function getMirrorType(comboId: ComboTypeId): ComboType {
  return COMBO_TYPES[COMBO_TYPES[comboId].mirrorId];
}

export function getArchetypeColor(id: ArchetypeId): string {
  return ARCHETYPES[id].color;
}