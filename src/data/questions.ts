// ─── Stem + Pool Content System ───
// New question architecture: pithy stems × answer pools
// Runtime assembles: stem → pool → 2 options from different archetypes

import type { ArchetypeId } from './types';

// ─── New Types ───

export interface AnswerOption {
  id: string;            // e.g., "music_artists_1"
  text: string;          // Display text (short, pithy)
  emoji: string;         // Emoji prefix
  weights: Record<ArchetypeId, number>; // -1.0 to 1.0 per archetype
}

export interface AnswerPool {
  id: string;            // e.g., "pool_music_artists"
  stemId: string;        // Which stem this pool belongs to
  category: PoolCategory;
  label: string;         // Short description for debugging: "Music artists"
  options: AnswerOption[];
}

export type PoolCategory =
  | 'tiktok_genz'
  | 'music'
  | 'tv_film'
  | 'gaming'
  | 'worldviews'
  | 'friendships'
  | 'nights_out'
  | 'work_school'
  | 'exercise_selfcare'
  | 'dating_romance'
  | 'spicy'
  | 'humor';

export interface QuestionStem {
  id: string;            // e.g., "stem_better_flex"
  text: string;          // Primary phrasing: "Better flex?"
  variants: string[];    // Alt phrasings: ["Which hits harder?", "More impressive?"]
  pools: string[];       // Pool IDs associated with this stem
}

// ─── Helper: weight shorthand ───
// For readability: w(pulse, glow, cozy, lore)
function w(pulse: number, glow: number, cozy: number, lore: number): Record<ArchetypeId, number> {
  return { pulse, glow, cozy, lore };
}

// ═══════════════════════════════════════════════════════════════════
// QUESTION STEMS (25)
// ═══════════════════════════════════════════════════════════════════

export const QUESTION_STEMS: QuestionStem[] = [
  // ── Preference / Taste ──
  {
    id: 'stem_better',
    text: 'Which is better?',
    variants: ['Pick one.', 'Choose your fighter.'],
    pools: ['pool_music_artists', 'pool_shows_movies', 'pool_games', 'pool_social_platforms', 'pool_vibes', 'pool_date_spots', 'pool_celebrities'],
  },
  {
    id: 'stem_flex',
    text: 'Better flex?',
    variants: ['Which hits harder?', 'More impressive?'],
    pools: ['pool_flex_life', 'pool_flex_social', 'pool_flex_skills'],
  },
  {
    id: 'stem_cringe',
    text: 'More cringe?',
    variants: ['Ugh:', 'Bigger ick?'],
    pools: ['pool_cringe_social', 'pool_cringe_dating', 'pool_cringe_online'],
  },
  {
    id: 'stem_red_flag',
    text: 'Red flag?',
    variants: ['Dealbreaker?', 'Um, no,'],
    pools: ['pool_redflag_dating', 'pool_redflag_friendship', 'pool_redflag_vibes'],
  },
  {
    id: 'stem_green_flag',
    text: 'Green flag?',
    variants: ['Love to see it,', 'Instant yes?'],
    pools: ['pool_greenflag_dating', 'pool_greenflag_friendship'],
  },
  // ── Hot Takes / Opinion ──
  {
    id: 'stem_hot_take',
    text: 'Hot take!',
    variants: ['Unpopular opinion:', 'Controversial but:'],
    pools: ['pool_hottake_life', 'pool_hottake_social', 'pool_hottake_dating', 'pool_hottake_culture', 'pool_hottake_gen', 'pool_hottake_self'],
  },
  {
    id: 'stem_overrated',
    text: 'Overrated or underrated?',
    variants: ['Overhyped?', 'Actually good or nah?'],
    pools: ['pool_rated_activities', 'pool_rated_trends', 'pool_rated_food'],
  },
  {
    id: 'stem_valid',
    text: 'Valid or unhinged?',
    variants: ['Normal or psycho?', 'Reasonable or chaotic?'],
    pools: ['pool_valid_habits', 'pool_valid_social', 'pool_valid_dating'],
  },
  // ── Scenario / "Would You Rather" ──
  {
    id: 'stem_rather',
    text: 'Would you rather...',
    variants: ['Pick your reality:', 'You have to choose:'],
    pools: ['pool_rather_social', 'pool_rather_life', 'pool_rather_night', 'pool_superpowers'],
  },
  {
    id: 'stem_friday',
    text: 'Friday night:',
    variants: ['It\'s 8pm, you\'re:', 'Weekend mode:'],
    pools: ['pool_friday_plans', 'pool_friday_energy'],
  },
  {
    id: 'stem_vibe_check',
    text: 'Vibe check:',
    variants: ['Energy right now:', 'Mood:'],
    pools: ['pool_vibe_moods', 'pool_vibe_aesthetics', 'pool_vibe_seasons'],
  },
  // ── Identity / Self ──
  {
    id: 'stem_more_you',
    text: 'More you?',
    variants: ['Which one are you?', 'Be honest:'],
    pools: ['pool_you_social', 'pool_you_conflict', 'pool_you_friend', 'pool_you_energy', 'pool_you_mornings'],
  },
  {
    id: 'stem_guilty',
    text: 'Guilty pleasure?',
    variants: ['No judgement:', 'Secretly love it?'],
    pools: ['pool_guilty_media', 'pool_guilty_habits'],
  },
  {
    id: 'stem_toxic_trait',
    text: 'Your toxic trait?',
    variants: ['We all have one:', 'Own it:'],
    pools: ['pool_toxic_social', 'pool_toxic_dating', 'pool_toxic_habits'],
  },
  // ── Social / Friendship ──
  {
    id: 'stem_friend_group',
    text: 'In your friend group you\'re:',
    variants: ['Your role:', 'You\'re the one who:'],
    pools: ['pool_role_group', 'pool_role_planning', 'pool_role_drama'],
  },
  {
    id: 'stem_group_chat',
    text: 'In the group chat:',
    variants: ['Group chat energy:', 'Your DMs say:'],
    pools: ['pool_gc_behavior', 'pool_gc_content'],
  },
  // ── Spicy / Dating ──
  {
    id: 'stem_ick',
    text: 'Instant ick?',
    variants: ['Turned off by:', 'Nope:'],
    pools: ['pool_ick_dating', 'pool_ick_social'],
  },
  {
    id: 'stem_rizz',
    text: 'More rizz?',
    variants: ['Better move:', 'Smoother:'],
    pools: ['pool_rizz_moves', 'pool_rizz_energy'],
  },
  {
    id: 'stem_date_night',
    text: 'Ideal date:',
    variants: ['Take me here:', 'Best date energy:'],
    pools: ['pool_date_plans', 'pool_date_vibes'],
  },
  // ── Work / Ambition ──
  {
    id: 'stem_grind',
    text: 'Grind or chill?',
    variants: ['Hustle mode:', 'Work ethic:'],
    pools: ['pool_grind_work', 'pool_grind_goals'],
  },
  {
    id: 'stem_main_quest',
    text: 'Main quest or side quest?',
    variants: ['Priority check:', 'What matters more?'],
    pools: ['pool_quest_life', 'pool_quest_goals'],
  },
  // ── Culture / Taste ──
  {
    id: 'stem_era',
    text: 'What era are you in?',
    variants: ['Current era:', 'Your chapter:'],
    pools: ['pool_era_life', 'pool_era_aesthetic'],
  },
  {
    id: 'stem_romanticize',
    text: 'Romanticize this:',
    variants: ['Make it aesthetic:', 'This but beautiful:'],
    pools: ['pool_romanticize_mundane', 'pool_romanticize_chaos'],
  },
  {
    id: 'stem_core',
    text: 'Your core?',
    variants: ['___core:', 'Aesthetic:'],
    pools: ['pool_core_aesthetic', 'pool_core_lifestyle'],
  },
  {
    id: 'stem_ratio',
    text: 'W or L?',
    variants: ['Win or loss?', 'Based or cringe?'],
    pools: ['pool_wl_takes', 'pool_wl_choices', 'pool_wl_habits'],
  },
];

// ═══════════════════════════════════════════════════════════════════
// ANSWER POOLS (73)
// ═══════════════════════════════════════════════════════════════════

export const ANSWER_POOLS: AnswerPool[] = [

  // ────────────────────────────────────────
  // MUSIC (stem: better)
  // ────────────────────────────────────────
  {
    id: 'pool_music_artists',
    stemId: 'stem_better',
    category: 'music',
    label: 'Music artists',
    options: [
      { id: 'ma_1', text: 'Kendrick', emoji: '🎤', weights: w(0.3, 0.8, -0.1, 0.5) },
      { id: 'ma_2', text: 'Charli XCX', emoji: '💿', weights: w(0.9, 0.2, 0.0, 0.3) },
      { id: 'ma_3', text: 'Billie Eilish', emoji: '🖤', weights: w(0.0, -0.1, 0.7, 0.6) },
      { id: 'ma_4', text: 'Tyler, the Creator', emoji: '🌺', weights: w(0.4, 0.3, 0.1, 0.9) },
      { id: 'ma_5', text: 'Doja Cat', emoji: '🐱', weights: w(0.8, 0.4, 0.1, 0.2) },
      { id: 'ma_6', text: 'Frank Ocean', emoji: '🌊', weights: w(-0.1, 0.0, 0.8, 0.7) },
      { id: 'ma_7', text: 'Dua Lipa', emoji: '💃', weights: w(0.7, 0.5, 0.2, -0.1) },
      { id: 'ma_8', text: 'Steve Lacy', emoji: '🎸', weights: w(0.2, 0.1, 0.6, 0.7) },
      { id: 'ma_9', text: 'Taylor Swift', emoji: '🎶', weights: w(0.4, 0.2, 0.7, 0.2) },
      { id: 'ma_10', text: 'Chappell Roan', emoji: '💋', weights: w(0.7, 0.1, 0.3, 0.5) },
      { id: 'ma_11', text: 'SZA', emoji: '🦋', weights: w(0.2, 0.0, 0.8, 0.4) },
      { id: 'ma_12', text: 'Bad Bunny', emoji: '🐰', weights: w(0.8, 0.3, 0.1, 0.1) },
      { id: 'ma_13', text: 'Hozier', emoji: '🍃', weights: w(-0.1, 0.0, 0.6, 0.8) },
      { id: 'ma_14', text: 'Ice Spice', emoji: '🧊', weights: w(0.9, 0.3, 0.0, 0.0) },
      { id: 'ma_15', text: 'Radiohead', emoji: '📻', weights: w(-0.2, 0.1, 0.3, 0.9) },
      { id: 'ma_16', text: 'Beyoncé', emoji: '👑', weights: w(0.5, 0.7, 0.2, 0.1) },
    ],
  },

  // ────────────────────────────────────────
  // TV/FILM (stem: better)
  // ────────────────────────────────────────
  {
    id: 'pool_shows_movies',
    stemId: 'stem_better',
    category: 'tv_film',
    label: 'Shows and movies',
    options: [
      { id: 'sm_1', text: 'Love Island', emoji: '🏝️', weights: w(0.7, 0.2, 0.5, -0.3) },
      { id: 'sm_2', text: 'Squid Game', emoji: '🔴', weights: w(0.4, 0.6, -0.1, 0.5) },
      { id: 'sm_3', text: 'Gilmore Girls', emoji: '☕', weights: w(0.0, -0.2, 0.9, 0.4) },
      { id: 'sm_4', text: 'Black Mirror', emoji: '📱', weights: w(-0.1, 0.3, 0.0, 0.9) },
      { id: 'sm_5', text: 'Euphoria', emoji: '✨', weights: w(0.6, 0.1, 0.4, 0.3) },
      { id: 'sm_6', text: 'The Bear', emoji: '🐻', weights: w(0.1, 0.8, 0.3, 0.4) },
      { id: 'sm_7', text: 'Studio Ghibli', emoji: '🌿', weights: w(-0.2, 0.0, 0.7, 0.8) },
      { id: 'sm_8', text: 'Succession', emoji: '💰', weights: w(0.3, 0.7, -0.1, 0.6) },
      { id: 'sm_9', text: 'Bridgerton', emoji: '💐', weights: w(0.4, 0.0, 0.8, 0.2) },
      { id: 'sm_10', text: 'Stranger Things', emoji: '🔦', weights: w(0.5, 0.2, 0.3, 0.6) },
      { id: 'sm_11', text: 'The White Lotus', emoji: '🌺', weights: w(0.3, 0.2, 0.1, 0.8) },
      { id: 'sm_12', text: 'One Piece', emoji: '🏴‍☠️', weights: w(0.6, 0.4, 0.3, 0.5) },
      { id: 'sm_13', text: 'Heartstopper', emoji: '💛', weights: w(0.0, 0.0, 0.9, 0.2) },
      { id: 'sm_14', text: 'Last of Us', emoji: '🍄', weights: w(0.1, 0.5, 0.4, 0.7) },
      { id: 'sm_15', text: 'RuPaul\'s Drag Race', emoji: '👠', weights: w(0.8, 0.2, 0.3, 0.1) },
      { id: 'sm_16', text: 'Shogun', emoji: '⚔️', weights: w(0.0, 0.6, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // GAMING (stem: better)
  // ────────────────────────────────────────
  {
    id: 'pool_games',
    stemId: 'stem_better',
    category: 'gaming',
    label: 'Games',
    options: [
      { id: 'gm_1', text: 'Fortnite', emoji: '🎮', weights: w(0.8, 0.4, 0.1, -0.1) },
      { id: 'gm_2', text: 'Stardew Valley', emoji: '🌾', weights: w(-0.2, 0.1, 0.9, 0.4) },
      { id: 'gm_3', text: 'Elden Ring', emoji: '⚔️', weights: w(0.1, 0.7, 0.0, 0.8) },
      { id: 'gm_4', text: 'Mario Kart', emoji: '🏎️', weights: w(0.7, 0.3, 0.5, 0.0) },
      { id: 'gm_5', text: 'Minecraft', emoji: '⛏️', weights: w(0.2, 0.2, 0.5, 0.7) },
      { id: 'gm_6', text: 'FIFA/EA FC', emoji: '⚽', weights: w(0.5, 0.8, 0.2, -0.1) },
      { id: 'gm_7', text: 'Animal Crossing', emoji: '🏝️', weights: w(0.1, -0.1, 0.9, 0.2) },
      { id: 'gm_8', text: 'Baldur\'s Gate 3', emoji: '🐉', weights: w(0.0, 0.3, 0.2, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // SOCIAL PLATFORMS (stem: better)
  // ────────────────────────────────────────
  {
    id: 'pool_social_platforms',
    stemId: 'stem_better',
    category: 'tiktok_genz',
    label: 'Social platforms',
    options: [
      { id: 'sp_1', text: 'TikTok', emoji: '📱', weights: w(0.7, 0.3, 0.2, 0.3) },
      { id: 'sp_2', text: 'BeReal', emoji: '📸', weights: w(0.3, 0.1, 0.8, 0.0) },
      { id: 'sp_3', text: 'Letterboxd', emoji: '🎬', weights: w(0.0, 0.1, 0.2, 0.9) },
      { id: 'sp_4', text: 'Strava', emoji: '🏃', weights: w(0.2, 0.9, 0.0, 0.2) },
      { id: 'sp_5', text: 'Pinterest', emoji: '📌', weights: w(0.1, 0.2, 0.6, 0.7) },
      { id: 'sp_6', text: 'Discord', emoji: '💬', weights: w(0.4, 0.1, 0.3, 0.8) },
    ],
  },

  // ────────────────────────────────────────
  // VIBES (stem: better)
  // ────────────────────────────────────────
  {
    id: 'pool_vibes',
    stemId: 'stem_better',
    category: 'worldviews',
    label: 'Vibes',
    options: [
      { id: 'vb_1', text: 'Chaos', emoji: '🌪️', weights: w(0.9, 0.3, -0.3, 0.2) },
      { id: 'vb_2', text: 'Peace', emoji: '🕊️', weights: w(-0.3, 0.0, 0.9, 0.3) },
      { id: 'vb_3', text: 'Ambition', emoji: '🔥', weights: w(0.3, 0.9, 0.0, 0.3) },
      { id: 'vb_4', text: 'Curiosity', emoji: '🔍', weights: w(0.1, 0.2, 0.2, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // DATE SPOTS (stem: better)
  // ────────────────────────────────────────
  {
    id: 'pool_date_spots',
    stemId: 'stem_better',
    category: 'dating_romance',
    label: 'Date spots',
    options: [
      { id: 'ds_1', text: 'Rooftop bar', emoji: '🍸', weights: w(0.8, 0.3, 0.2, 0.0) },
      { id: 'ds_2', text: 'Hiking trail', emoji: '🥾', weights: w(0.1, 0.9, 0.2, 0.3) },
      { id: 'ds_3', text: 'Cozy café', emoji: '☕', weights: w(0.0, 0.0, 0.9, 0.3) },
      { id: 'ds_4', text: 'Museum after dark', emoji: '🖼️', weights: w(0.2, 0.1, 0.3, 0.9) },
      { id: 'ds_5', text: 'Street food market', emoji: '🍜', weights: w(0.6, 0.4, 0.4, 0.5) },
      { id: 'ds_6', text: 'Concert', emoji: '🎵', weights: w(0.8, 0.2, 0.3, 0.5) },
    ],
  },

  // ────────────────────────────────────────
  // FLEX - LIFE (stem: flex)
  // ────────────────────────────────────────
  {
    id: 'pool_flex_life',
    stemId: 'stem_flex',
    category: 'worldviews',
    label: 'Life flexes',
    options: [
      { id: 'fl_1', text: 'Knowing everyone at the party', emoji: '👑', weights: w(0.9, 0.2, 0.3, -0.1) },
      { id: 'fl_2', text: '5am gym before work', emoji: '💪', weights: w(0.0, 0.9, 0.0, 0.1) },
      { id: 'fl_3', text: 'Your friend group trusts you with everything', emoji: '🤝', weights: w(0.1, 0.1, 0.9, 0.1) },
      { id: 'fl_4', text: 'Being the person who always has the reference', emoji: '🧠', weights: w(0.0, 0.2, 0.1, 0.9) },
      { id: 'fl_5', text: 'Never needing an alarm clock', emoji: '⏰', weights: w(-0.1, 0.8, 0.3, 0.1) },
      { id: 'fl_6', text: 'Your Spotify Wrapped is actually interesting', emoji: '🎧', weights: w(0.4, 0.0, 0.2, 0.8) },
    ],
  },

  // ────────────────────────────────────────
  // FLEX - SOCIAL (stem: flex)
  // ────────────────────────────────────────
  {
    id: 'pool_flex_social',
    stemId: 'stem_flex',
    category: 'friendships',
    label: 'Social flexes',
    options: [
      { id: 'fs_1', text: 'Turning strangers into friends in 10 minutes', emoji: '🤙', weights: w(0.9, 0.2, 0.4, -0.1) },
      { id: 'fs_2', text: 'Your group always does what you suggest', emoji: '📣', weights: w(0.4, 0.8, 0.1, 0.2) },
      { id: 'fs_3', text: 'People tell you things they don\'t tell anyone', emoji: '🔒', weights: w(0.0, 0.0, 0.9, 0.3) },
      { id: 'fs_4', text: 'You predicted that trend 6 months ago', emoji: '🔮', weights: w(0.2, 0.2, 0.0, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // FLEX - SKILLS (stem: flex)
  // ────────────────────────────────────────
  {
    id: 'pool_flex_skills',
    stemId: 'stem_flex',
    category: 'work_school',
    label: 'Skill flexes',
    options: [
      { id: 'fk_1', text: 'Can talk to literally anyone', emoji: '🗣️', weights: w(0.9, 0.3, 0.3, -0.2) },
      { id: 'fk_2', text: 'Finishing what you start', emoji: '✅', weights: w(-0.1, 0.9, 0.2, 0.3) },
      { id: 'fk_3', text: 'Making people feel seen', emoji: '👁️', weights: w(0.1, 0.0, 0.9, 0.2) },
      { id: 'fk_4', text: 'Having a take on everything', emoji: '💡', weights: w(0.3, 0.3, -0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // CRINGE - SOCIAL (stem: cringe)
  // ────────────────────────────────────────
  {
    id: 'pool_cringe_social',
    stemId: 'stem_cringe',
    category: 'tiktok_genz',
    label: 'Social cringe',
    options: [
      { id: 'cs_1', text: 'Making everything a competition', emoji: '🏆', weights: w(0.3, 0.8, 0.0, 0.1) },
      { id: 'cs_2', text: 'Posting every meal', emoji: '📷', weights: w(0.7, 0.1, 0.3, 0.0) },
      { id: 'cs_3', text: 'Trauma dumping on the first hangout', emoji: '😬', weights: w(0.1, -0.1, 0.6, 0.3) },
      { id: 'cs_4', text: 'Correcting people at parties', emoji: '🤓', weights: w(-0.2, 0.2, -0.1, 0.7) },
      { id: 'cs_5', text: 'Being on your phone the whole dinner', emoji: '📱', weights: w(0.5, 0.0, -0.3, 0.4) },
    ],
  },

  // ────────────────────────────────────────
  // CRINGE - DATING (stem: cringe)
  // ────────────────────────────────────────
  {
    id: 'pool_cringe_dating',
    stemId: 'stem_cringe',
    category: 'dating_romance',
    label: 'Dating cringe',
    options: [
      { id: 'cd_1', text: 'Mirror selfies with flash', emoji: '🤳', weights: w(0.6, 0.3, -0.2, -0.1) },
      { id: 'cd_2', text: '"I\'m not like other people"', emoji: '🙄', weights: w(0.0, 0.2, 0.3, 0.6) },
      { id: 'cd_3', text: 'Love bombing on day one', emoji: '💕', weights: w(0.4, 0.1, 0.5, -0.1) },
      { id: 'cd_4', text: 'Only talking about your grind', emoji: '📈', weights: w(0.1, 0.7, -0.2, 0.2) },
      { id: 'cd_5', text: 'Playing hard to get in 2026', emoji: '🏃', weights: w(0.5, 0.3, -0.2, 0.0) },
    ],
  },

  // ────────────────────────────────────────
  // CRINGE - ONLINE (stem: cringe)
  // ────────────────────────────────────────
  {
    id: 'pool_cringe_online',
    stemId: 'stem_cringe',
    category: 'tiktok_genz',
    label: 'Online cringe',
    options: [
      { id: 'co_1', text: 'LinkedIn hustle posts', emoji: '💼', weights: w(0.2, 0.7, -0.1, 0.0) },
      { id: 'co_2', text: 'Subtweeting', emoji: '🐦', weights: w(0.6, 0.0, 0.2, 0.3) },
      { id: 'co_3', text: 'Posting your therapy homework', emoji: '📝', weights: w(0.0, 0.1, 0.6, 0.2) },
      { id: 'co_4', text: 'Rating everything on Letterboxd', emoji: '⭐', weights: w(-0.1, 0.1, 0.1, 0.8) },
    ],
  },

  // ────────────────────────────────────────
  // RED FLAGS - DATING (stem: red_flag)
  // ────────────────────────────────────────
  {
    id: 'pool_redflag_dating',
    stemId: 'stem_red_flag',
    category: 'dating_romance',
    label: 'Dating red flags',
    options: [
      { id: 'rd_1', text: 'They never ask you questions back', emoji: '🚩', weights: w(0.5, 0.3, -0.3, 0.0) },
      { id: 'rd_2', text: 'They cancel plans but post stories', emoji: '🚩', weights: w(0.6, 0.1, 0.0, 0.1) },
      { id: 'rd_3', text: 'They say "I don\'t do labels"', emoji: '🚩', weights: w(0.4, -0.1, -0.3, 0.2) },
      { id: 'rd_4', text: 'They have zero hobbies', emoji: '🚩', weights: w(0.2, -0.2, 0.1, -0.4) },
      { id: 'rd_5', text: 'They keep score in the relationship', emoji: '🚩', weights: w(0.0, 0.6, -0.3, 0.2) },
      { id: 'rd_6', text: 'They make fun of things you like', emoji: '🚩', weights: w(0.1, 0.2, -0.4, 0.3) },
    ],
  },

  // ────────────────────────────────────────
  // RED FLAGS - FRIENDSHIP (stem: red_flag)
  // ────────────────────────────────────────
  {
    id: 'pool_redflag_friendship',
    stemId: 'stem_red_flag',
    category: 'friendships',
    label: 'Friendship red flags',
    options: [
      { id: 'rf_1', text: 'Only texts when they need something', emoji: '🚩', weights: w(0.3, 0.5, -0.3, 0.0) },
      { id: 'rf_2', text: 'Makes everything about themselves', emoji: '🚩', weights: w(0.6, 0.2, -0.2, 0.0) },
      { id: 'rf_3', text: 'Never remembers what you told them', emoji: '🚩', weights: w(0.2, 0.0, -0.4, -0.2) },
      { id: 'rf_4', text: 'Always "too busy" but never for them', emoji: '🚩', weights: w(0.1, 0.5, -0.2, 0.0) },
      { id: 'rf_5', text: 'Talks about you differently behind your back', emoji: '🚩', weights: w(0.4, 0.1, -0.3, 0.1) },
    ],
  },

  // ────────────────────────────────────────
  // RED FLAGS - VIBES (stem: red_flag)
  // ────────────────────────────────────────
  {
    id: 'pool_redflag_vibes',
    stemId: 'stem_red_flag',
    category: 'worldviews',
    label: 'General red flags',
    options: [
      { id: 'rv_1', text: 'No close friends, only "connections"', emoji: '🚩', weights: w(0.5, 0.3, -0.5, 0.0) },
      { id: 'rv_2', text: 'Can\'t be alone for five minutes', emoji: '🚩', weights: w(0.6, 0.0, 0.1, -0.4) },
      { id: 'rv_3', text: 'Never wrong, always a victim', emoji: '🚩', weights: w(0.1, 0.2, 0.0, 0.1) },
      { id: 'rv_4', text: 'Judges people for their taste', emoji: '🚩', weights: w(-0.1, 0.1, -0.2, 0.6) },
    ],
  },

  // ────────────────────────────────────────
  // GREEN FLAGS - DATING (stem: green_flag)
  // ────────────────────────────────────────
  {
    id: 'pool_greenflag_dating',
    stemId: 'stem_green_flag',
    category: 'dating_romance',
    label: 'Dating green flags',
    options: [
      { id: 'gd_1', text: 'They hype you up in front of their friends', emoji: '💚', weights: w(0.7, 0.3, 0.3, 0.0) },
      { id: 'gd_2', text: 'They have their own goals and chase them', emoji: '💚', weights: w(0.0, 0.9, 0.1, 0.3) },
      { id: 'gd_3', text: 'They remember the small things', emoji: '💚', weights: w(0.0, 0.1, 0.9, 0.2) },
      { id: 'gd_4', text: 'They send you stuff you\'d actually like', emoji: '💚', weights: w(0.1, 0.1, 0.4, 0.8) },
      { id: 'gd_5', text: 'They plan actual dates, not just "hang"', emoji: '💚', weights: w(0.3, 0.6, 0.4, 0.1) },
    ],
  },

  // ────────────────────────────────────────
  // GREEN FLAGS - FRIENDSHIP (stem: green_flag)
  // ────────────────────────────────────────
  {
    id: 'pool_greenflag_friendship',
    stemId: 'stem_green_flag',
    category: 'friendships',
    label: 'Friendship green flags',
    options: [
      { id: 'gf_1', text: 'Always down for a spontaneous plan', emoji: '💚', weights: w(0.9, 0.2, 0.2, -0.1) },
      { id: 'gf_2', text: 'Shows up when it actually matters', emoji: '💚', weights: w(0.1, 0.7, 0.5, 0.1) },
      { id: 'gf_3', text: 'Comfortable silence together', emoji: '💚', weights: w(-0.2, 0.0, 0.8, 0.5) },
      { id: 'gf_4', text: 'Shares random articles/memes that remind them of you', emoji: '💚', weights: w(0.2, 0.0, 0.4, 0.8) },
      { id: 'gf_5', text: 'Calls you out when you\'re wrong', emoji: '💚', weights: w(0.2, 0.7, 0.2, 0.3) },
    ],
  },

  // ────────────────────────────────────────
  // HOT TAKES - LIFE (stem: hot_take)
  // ────────────────────────────────────────
  {
    id: 'pool_hottake_life',
    stemId: 'stem_hot_take',
    category: 'worldviews',
    label: 'Life hot takes',
    options: [
      { id: 'hl_1', text: 'Most "self care" is just avoiding your problems', emoji: '🔥', weights: w(0.2, 0.7, -0.3, 0.4) },
      { id: 'hl_2', text: 'Your 20s are for chaos, not planning', emoji: '🔥', weights: w(0.8, -0.2, 0.2, 0.0) },
      { id: 'hl_3', text: 'Loyalty matters more than honesty', emoji: '🔥', weights: w(0.3, 0.0, 0.8, -0.2) },
      { id: 'hl_4', text: 'Being obsessive is a strength', emoji: '🔥', weights: w(0.0, 0.5, 0.0, 0.8) },
      { id: 'hl_5', text: 'You should ghost more often, not less', emoji: '🔥', weights: w(0.5, 0.2, -0.5, 0.1) },
      { id: 'hl_6', text: 'Discipline beats motivation every time', emoji: '🔥', weights: w(-0.1, 0.9, -0.1, 0.3) },
    ],
  },

  // ────────────────────────────────────────
  // HOT TAKES - SOCIAL (stem: hot_take)
  // ────────────────────────────────────────
  {
    id: 'pool_hottake_social',
    stemId: 'stem_hot_take',
    category: 'friendships',
    label: 'Social hot takes',
    options: [
      { id: 'hs_1', text: 'Big friend groups are a flex', emoji: '🔥', weights: w(0.8, 0.3, 0.0, -0.2) },
      { id: 'hs_2', text: 'Your inner circle should be tiny', emoji: '🔥', weights: w(-0.3, 0.1, 0.7, 0.5) },
      { id: 'hs_3', text: 'Accountability partners > therapists', emoji: '🔥', weights: w(0.1, 0.8, 0.2, 0.0) },
      { id: 'hs_4', text: 'You can tell everything about someone by their bookshelf', emoji: '🔥', weights: w(-0.1, 0.0, 0.2, 0.9) },
      { id: 'hs_5', text: 'Flaking is underrated', emoji: '🔥', weights: w(0.3, -0.4, 0.4, 0.3) },
    ],
  },

  // ────────────────────────────────────────
  // HOT TAKES - DATING (stem: hot_take)
  // ────────────────────────────────────────
  {
    id: 'pool_hottake_dating',
    stemId: 'stem_hot_take',
    category: 'spicy',
    label: 'Dating hot takes',
    options: [
      { id: 'hd_1', text: 'Situationships are valid', emoji: '🔥', weights: w(0.7, -0.1, -0.2, 0.2) },
      { id: 'hd_2', text: 'If they wanted to, they would', emoji: '🔥', weights: w(0.2, 0.6, 0.3, 0.0) },
      { id: 'hd_3', text: 'Emotional availability is the hottest trait', emoji: '🔥', weights: w(0.0, 0.1, 0.9, 0.1) },
      { id: 'hd_4', text: 'Intelligence is the real rizz', emoji: '🔥', weights: w(-0.1, 0.3, 0.1, 0.8) },
      { id: 'hd_5', text: 'The talking stage should have a deadline', emoji: '🔥', weights: w(0.3, 0.7, 0.1, 0.0) },
    ],
  },

  // ────────────────────────────────────────
  // HOT TAKES - CULTURE (stem: hot_take)
  // ────────────────────────────────────────
  {
    id: 'pool_hottake_culture',
    stemId: 'stem_hot_take',
    category: 'tiktok_genz',
    label: 'Culture hot takes',
    options: [
      { id: 'hc_1', text: 'Main character energy is just confidence', emoji: '🔥', weights: w(0.8, 0.3, 0.0, 0.0) },
      { id: 'hc_2', text: 'Grind culture is toxic positivity', emoji: '🔥', weights: w(0.1, -0.4, 0.6, 0.3) },
      { id: 'hc_3', text: 'Your music taste says more than your Myers-Briggs', emoji: '🔥', weights: w(0.3, 0.0, 0.2, 0.8) },
      { id: 'hc_4', text: 'Everyone should compete at something', emoji: '🔥', weights: w(0.3, 0.8, 0.0, 0.1) },
    ],
  },

  // ────────────────────────────────────────
  // OVERRATED - ACTIVITIES (stem: overrated)
  // ────────────────────────────────────────
  {
    id: 'pool_rated_activities',
    stemId: 'stem_overrated',
    category: 'nights_out',
    label: 'Activities rated',
    options: [
      { id: 'ra_1', text: 'Clubbing', emoji: '🪩', weights: w(0.8, 0.2, -0.2, -0.1) },
      { id: 'ra_2', text: 'Gym selfies', emoji: '💪', weights: w(0.3, 0.7, -0.1, -0.2) },
      { id: 'ra_3', text: 'Movie nights in', emoji: '🍿', weights: w(-0.2, -0.1, 0.8, 0.4) },
      { id: 'ra_4', text: 'Book clubs', emoji: '📖', weights: w(-0.1, 0.1, 0.4, 0.8) },
      { id: 'ra_5', text: 'Brunch', emoji: '🥞', weights: w(0.5, 0.1, 0.6, 0.0) },
      { id: 'ra_6', text: 'Running', emoji: '🏃', weights: w(0.1, 0.8, 0.0, 0.2) },
    ],
  },

  // ────────────────────────────────────────
  // OVERRATED - TRENDS (stem: overrated)
  // ────────────────────────────────────────
  {
    id: 'pool_rated_trends',
    stemId: 'stem_overrated',
    category: 'tiktok_genz',
    label: 'Trends rated',
    options: [
      { id: 'rt_1', text: 'Manifesting', emoji: '✨', weights: w(0.5, -0.1, 0.4, -0.2) },
      { id: 'rt_2', text: 'Dopamine detoxes', emoji: '🧘', weights: w(-0.2, 0.7, 0.2, 0.4) },
      { id: 'rt_3', text: 'Matching couple fits', emoji: '👫', weights: w(0.4, 0.1, 0.6, -0.1) },
      { id: 'rt_4', text: 'Having a "brand"', emoji: '™️', weights: w(0.3, 0.5, -0.1, 0.6) },
      { id: 'rt_5', text: 'Hot girl walks', emoji: '🚶‍♀️', weights: w(0.4, 0.6, 0.3, 0.0) },
    ],
  },

  // ────────────────────────────────────────
  // OVERRATED - FOOD (stem: overrated)
  // ────────────────────────────────────────
  {
    id: 'pool_rated_food',
    stemId: 'stem_overrated',
    category: 'worldviews',
    label: 'Food rated',
    options: [
      { id: 'rfo_1', text: 'Aesthetically plated food', emoji: '🍽️', weights: w(0.3, 0.1, 0.3, 0.7) },
      { id: 'rfo_2', text: 'Protein shakes', emoji: '🥤', weights: w(0.0, 0.9, -0.1, 0.1) },
      { id: 'rfo_3', text: 'Homemade everything', emoji: '🏠', weights: w(-0.1, 0.2, 0.8, 0.3) },
      { id: 'rfo_4', text: 'Trying every new restaurant', emoji: '🍴', weights: w(0.7, 0.3, 0.1, 0.4) },
    ],
  },

  // ────────────────────────────────────────
  // VALID - HABITS (stem: valid)
  // ────────────────────────────────────────
  {
    id: 'pool_valid_habits',
    stemId: 'stem_valid',
    category: 'humor',
    label: 'Habits: valid or unhinged?',
    options: [
      { id: 'vh_1', text: 'Triple-texting', emoji: '📱', weights: w(0.7, 0.2, 0.3, -0.1) },
      { id: 'vh_2', text: 'Scheduling your free time', emoji: '📅', weights: w(-0.1, 0.8, 0.1, 0.3) },
      { id: 'vh_3', text: 'Stalking someone\'s following list', emoji: '👀', weights: w(0.4, 0.1, 0.3, 0.5) },
      { id: 'vh_4', text: 'Crying at ads', emoji: '😢', weights: w(0.0, -0.2, 0.8, 0.2) },
      { id: 'vh_5', text: 'Having a spreadsheet for everything', emoji: '📊', weights: w(-0.2, 0.5, 0.0, 0.8) },
    ],
  },

  // ────────────────────────────────────────
  // VALID - SOCIAL (stem: valid)
  // ────────────────────────────────────────
  {
    id: 'pool_valid_social',
    stemId: 'stem_valid',
    category: 'friendships',
    label: 'Social: valid or unhinged?',
    options: [
      { id: 'vs_1', text: 'Leaving a party without telling anyone', emoji: '🚪', weights: w(0.1, -0.1, 0.5, 0.6) },
      { id: 'vs_2', text: 'Making friends with the DJ', emoji: '🎧', weights: w(0.9, 0.2, 0.1, 0.0) },
      { id: 'vs_3', text: 'Saying "I love you" to friends daily', emoji: '💗', weights: w(0.3, 0.0, 0.8, 0.0) },
      { id: 'vs_4', text: 'Keeping a notes app list of restaurant recs', emoji: '📝', weights: w(0.1, 0.4, 0.2, 0.8) },
    ],
  },

  // ────────────────────────────────────────
  // VALID - DATING (stem: valid)
  // ────────────────────────────────────────
  {
    id: 'pool_valid_dating',
    stemId: 'stem_valid',
    category: 'spicy',
    label: 'Dating: valid or unhinged?',
    options: [
      { id: 'vd_1', text: 'Checking their Spotify before replying', emoji: '🎵', weights: w(0.2, 0.0, 0.2, 0.8) },
      { id: 'vd_2', text: 'Having a dating spreadsheet', emoji: '📊', weights: w(-0.1, 0.8, 0.0, 0.4) },
      { id: 'vd_3', text: 'Falling in love with their vibe before their face', emoji: '🫠', weights: w(0.1, 0.0, 0.7, 0.5) },
      { id: 'vd_4', text: 'Already planning the first date while matching', emoji: '🗓️', weights: w(0.6, 0.5, 0.2, 0.0) },
    ],
  },

  // ────────────────────────────────────────
  // WOULD YOU RATHER - SOCIAL (stem: rather)
  // ────────────────────────────────────────
  {
    id: 'pool_rather_social',
    stemId: 'stem_rather',
    category: 'friendships',
    label: 'Social dilemmas',
    options: [
      { id: 'wrs_1', text: 'Be the life of the party', emoji: '🎉', weights: w(0.9, 0.2, 0.1, -0.2) },
      { id: 'wrs_2', text: 'Have one deep conversation', emoji: '🌙', weights: w(-0.2, 0.0, 0.8, 0.5) },
      { id: 'wrs_3', text: 'Win the argument', emoji: '🏆', weights: w(0.2, 0.7, -0.1, 0.5) },
      { id: 'wrs_4', text: 'Keep the peace', emoji: '☮️', weights: w(0.0, -0.1, 0.8, 0.1) },
    ],
  },

  // ────────────────────────────────────────
  // WOULD YOU RATHER - LIFE (stem: rather)
  // ────────────────────────────────────────
  {
    id: 'pool_rather_life',
    stemId: 'stem_rather',
    category: 'worldviews',
    label: 'Life dilemmas',
    options: [
      { id: 'wrl_1', text: 'Be famous for a year', emoji: '⭐', weights: w(0.8, 0.3, -0.2, 0.0) },
      { id: 'wrl_2', text: 'Be excellent at one thing forever', emoji: '🎯', weights: w(-0.1, 0.7, 0.1, 0.7) },
      { id: 'wrl_3', text: 'Have unlimited social energy', emoji: '⚡', weights: w(0.9, 0.3, 0.2, -0.2) },
      { id: 'wrl_4', text: 'Have unlimited alone time', emoji: '🏔️', weights: w(-0.3, 0.1, 0.5, 0.8) },
    ],
  },

  // ────────────────────────────────────────
  // WOULD YOU RATHER - NIGHT (stem: rather)
  // ────────────────────────────────────────
  {
    id: 'pool_rather_night',
    stemId: 'stem_rather',
    category: 'nights_out',
    label: 'Night out dilemmas',
    options: [
      { id: 'wrn_1', text: 'Spontaneous night that goes till 4am', emoji: '🌃', weights: w(0.9, 0.2, 0.1, 0.0) },
      { id: 'wrn_2', text: 'Perfectly planned evening', emoji: '📋', weights: w(0.0, 0.7, 0.3, 0.5) },
      { id: 'wrn_3', text: 'Small group, big conversation', emoji: '🕯️', weights: w(-0.2, 0.0, 0.9, 0.4) },
      { id: 'wrn_4', text: 'New spot nobody knows about yet', emoji: '🗺️', weights: w(0.3, 0.1, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // FRIDAY - PLANS (stem: friday)
  // ────────────────────────────────────────
  {
    id: 'pool_friday_plans',
    stemId: 'stem_friday',
    category: 'nights_out',
    label: 'Friday plans',
    options: [
      { id: 'fp_1', text: 'Already three plans deep', emoji: '🗓️', weights: w(0.9, 0.3, 0.1, 0.0) },
      { id: 'fp_2', text: 'Gym then early night', emoji: '💪', weights: w(-0.1, 0.9, 0.1, 0.1) },
      { id: 'fp_3', text: 'Cooking for friends', emoji: '🍝', weights: w(0.1, 0.0, 0.9, 0.2) },
      { id: 'fp_4', text: 'Deep in a rabbit hole', emoji: '🕳️', weights: w(0.0, 0.0, 0.2, 0.9) },
      { id: 'fp_5', text: 'Wherever the group chat leads', emoji: '📱', weights: w(0.7, 0.2, 0.4, 0.0) },
    ],
  },

  // ────────────────────────────────────────
  // FRIDAY - ENERGY (stem: friday)
  // ────────────────────────────────────────
  {
    id: 'pool_friday_energy',
    stemId: 'stem_friday',
    category: 'nights_out',
    label: 'Friday energy',
    options: [
      { id: 'fe_1', text: 'Peak social battery', emoji: '🔋', weights: w(0.9, 0.3, 0.2, -0.1) },
      { id: 'fe_2', text: 'Recovery mode', emoji: '🧘', weights: w(-0.2, 0.3, 0.6, 0.4) },
      { id: 'fe_3', text: 'Competitive edge activated', emoji: '🏆', weights: w(0.3, 0.9, 0.0, 0.1) },
      { id: 'fe_4', text: 'Creative brain unlocked', emoji: '🎨', weights: w(0.2, 0.0, 0.3, 0.8) },
    ],
  },

  // ────────────────────────────────────────
  // VIBE - MOODS (stem: vibe_check)
  // ────────────────────────────────────────
  {
    id: 'pool_vibe_moods',
    stemId: 'stem_vibe_check',
    category: 'worldviews',
    label: 'Mood vibes',
    options: [
      { id: 'vm_1', text: 'Main character moment', emoji: '✨', weights: w(0.9, 0.2, 0.1, 0.0) },
      { id: 'vm_2', text: 'Locked in', emoji: '🔒', weights: w(0.0, 0.9, 0.0, 0.3) },
      { id: 'vm_3', text: 'Soft hours', emoji: '🌸', weights: w(0.0, -0.1, 0.9, 0.2) },
      { id: 'vm_4', text: 'Lore dump incoming', emoji: '📚', weights: w(0.0, 0.1, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // VIBE - AESTHETICS (stem: vibe_check)
  // ────────────────────────────────────────
  {
    id: 'pool_vibe_aesthetics',
    stemId: 'stem_vibe_check',
    category: 'tiktok_genz',
    label: 'Aesthetic vibes',
    options: [
      { id: 'va_1', text: 'City at night', emoji: '🌃', weights: w(0.8, 0.3, 0.0, 0.2) },
      { id: 'va_2', text: 'Golden hour anywhere', emoji: '🌅', weights: w(0.3, 0.2, 0.7, 0.3) },
      { id: 'va_3', text: 'Library with rain sounds', emoji: '🌧️', weights: w(-0.2, 0.0, 0.5, 0.9) },
      { id: 'va_4', text: 'Starting line of a race', emoji: '🏁', weights: w(0.3, 0.9, 0.0, 0.0) },
      { id: 'va_5', text: 'Bonfire with close friends', emoji: '🔥', weights: w(0.2, 0.0, 0.9, 0.1) },
    ],
  },

  // ────────────────────────────────────────
  // VIBE - SEASONS (stem: vibe_check)
  // ────────────────────────────────────────
  {
    id: 'pool_vibe_seasons',
    stemId: 'stem_vibe_check',
    category: 'worldviews',
    label: 'Season vibes',
    options: [
      { id: 'vss_1', text: 'Summer festival', emoji: '☀️', weights: w(0.9, 0.3, 0.2, 0.0) },
      { id: 'vss_2', text: 'January reset', emoji: '❄️', weights: w(-0.1, 0.9, 0.1, 0.2) },
      { id: 'vss_3', text: 'Autumn cozy season', emoji: '🍂', weights: w(0.0, 0.0, 0.9, 0.4) },
      { id: 'vss_4', text: 'Spring deep clean (your whole life)', emoji: '🌱', weights: w(0.1, 0.5, 0.3, 0.6) },
    ],
  },

  // ────────────────────────────────────────
  // MORE YOU - SOCIAL (stem: more_you)
  // ────────────────────────────────────────
  {
    id: 'pool_you_social',
    stemId: 'stem_more_you',
    category: 'friendships',
    label: 'Social style',
    options: [
      { id: 'ys_1', text: 'The one rallying people to go out', emoji: '📢', weights: w(0.9, 0.3, 0.1, -0.1) },
      { id: 'ys_2', text: 'The one who showed up prepared', emoji: '📋', weights: w(0.0, 0.8, 0.2, 0.4) },
      { id: 'ys_3', text: 'The one everyone opens up to', emoji: '💛', weights: w(0.1, 0.0, 0.9, 0.1) },
      { id: 'ys_4', text: 'The one with the unexpected knowledge', emoji: '🤔', weights: w(0.0, 0.1, 0.2, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // MORE YOU - CONFLICT (stem: more_you)
  // ────────────────────────────────────────
  {
    id: 'pool_you_conflict',
    stemId: 'stem_more_you',
    category: 'worldviews',
    label: 'Conflict style',
    options: [
      { id: 'yc_1', text: 'Address it immediately, in person', emoji: '🗣️', weights: w(0.7, 0.5, 0.1, 0.0) },
      { id: 'yc_2', text: 'Make a plan to fix it', emoji: '🛠️', weights: w(0.0, 0.8, 0.2, 0.4) },
      { id: 'yc_3', text: 'Check in on how everyone\'s feeling first', emoji: '❤️', weights: w(0.1, 0.0, 0.9, 0.1) },
      { id: 'yc_4', text: 'Need time to process before responding', emoji: '🧠', weights: w(-0.1, 0.1, 0.3, 0.8) },
    ],
  },

  // ────────────────────────────────────────
  // MORE YOU - FRIEND ROLE (stem: more_you)
  // ────────────────────────────────────────
  {
    id: 'pool_you_friend',
    stemId: 'stem_more_you',
    category: 'friendships',
    label: 'Friend type',
    options: [
      { id: 'yf_1', text: 'The connector - knows someone for every situation', emoji: '🔗', weights: w(0.9, 0.3, 0.2, 0.0) },
      { id: 'yf_2', text: 'The coach - pushes you to be better', emoji: '📣', weights: w(0.1, 0.9, 0.1, 0.2) },
      { id: 'yf_3', text: 'The safe space - no judgement zone', emoji: '🫂', weights: w(0.0, 0.0, 0.9, 0.2) },
      { id: 'yf_4', text: 'The curator - always has a rec', emoji: '📋', weights: w(0.1, 0.2, 0.2, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // MORE YOU - ENERGY (stem: more_you)
  // ────────────────────────────────────────
  {
    id: 'pool_you_energy',
    stemId: 'stem_more_you',
    category: 'worldviews',
    label: 'Energy style',
    options: [
      { id: 'ye_1', text: 'Recharged by people', emoji: '⚡', weights: w(0.9, 0.2, 0.3, -0.2) },
      { id: 'ye_2', text: 'Recharged by progress', emoji: '📈', weights: w(0.1, 0.9, 0.0, 0.3) },
      { id: 'ye_3', text: 'Recharged by comfort', emoji: '🛋️', weights: w(-0.1, -0.1, 0.9, 0.2) },
      { id: 'ye_4', text: 'Recharged by learning something new', emoji: '💡', weights: w(0.0, 0.2, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // MORE YOU - MORNINGS (stem: more_you)
  // ────────────────────────────────────────
  {
    id: 'pool_you_mornings',
    stemId: 'stem_more_you',
    category: 'exercise_selfcare',
    label: 'Morning style',
    options: [
      { id: 'ym_1', text: 'Immediately checking what everyone\'s up to', emoji: '📱', weights: w(0.8, 0.1, 0.3, 0.0) },
      { id: 'ym_2', text: 'Workout before anything else', emoji: '🏋️', weights: w(0.0, 0.9, 0.0, 0.1) },
      { id: 'ym_3', text: 'Slow start, don\'t rush me', emoji: '☕', weights: w(0.0, -0.2, 0.8, 0.3) },
      { id: 'ym_4', text: 'Already reading or listening to something', emoji: '🎧', weights: w(0.0, 0.2, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // GUILTY PLEASURE - MEDIA (stem: guilty)
  // ────────────────────────────────────────
  {
    id: 'pool_guilty_media',
    stemId: 'stem_guilty',
    category: 'tv_film',
    label: 'Guilty pleasure media',
    options: [
      { id: 'gpm_1', text: 'Reality TV deep dives', emoji: '📺', weights: w(0.6, 0.0, 0.5, 0.2) },
      { id: 'gpm_2', text: 'Watching your own content back', emoji: '🤳', weights: w(0.5, 0.4, 0.0, 0.2) },
      { id: 'gpm_3', text: 'Fan fiction', emoji: '📖', weights: w(0.0, 0.0, 0.5, 0.8) },
      { id: 'gpm_4', text: 'ASMR', emoji: '🎧', weights: w(-0.1, 0.0, 0.8, 0.3) },
      { id: 'gpm_5', text: 'True crime podcasts', emoji: '🔍', weights: w(0.2, 0.2, 0.3, 0.7) },
    ],
  },

  // ────────────────────────────────────────
  // GUILTY PLEASURE - HABITS (stem: guilty)
  // ────────────────────────────────────────
  {
    id: 'pool_guilty_habits',
    stemId: 'stem_guilty',
    category: 'humor',
    label: 'Guilty pleasure habits',
    options: [
      { id: 'gph_1', text: 'Online shopping at 2am', emoji: '🛒', weights: w(0.5, 0.1, 0.3, 0.3) },
      { id: 'gph_2', text: 'Competitive about everything', emoji: '🏆', weights: w(0.3, 0.8, 0.0, 0.2) },
      { id: 'gph_3', text: 'Comfort rewatching the same show', emoji: '🔄', weights: w(0.0, -0.1, 0.9, 0.2) },
      { id: 'gph_4', text: 'Wikipedia rabbit holes at midnight', emoji: '🐰', weights: w(0.0, 0.0, 0.1, 0.9) },
      { id: 'gph_5', text: 'Stalking old group chat messages', emoji: '👀', weights: w(0.4, 0.0, 0.5, 0.3) },
    ],
  },

  // ────────────────────────────────────────
  // TOXIC TRAIT - SOCIAL (stem: toxic_trait)
  // ────────────────────────────────────────
  {
    id: 'pool_toxic_social',
    stemId: 'stem_toxic_trait',
    category: 'friendships',
    label: 'Social toxic traits',
    options: [
      { id: 'ts_1', text: 'Making plans and immediately regretting it', emoji: '😅', weights: w(0.5, 0.0, 0.5, 0.3) },
      { id: 'ts_2', text: 'Turning everything into a bit', emoji: '🎭', weights: w(0.7, 0.2, 0.0, 0.4) },
      { id: 'ts_3', text: 'Not texting back for days then acting normal', emoji: '📱', weights: w(0.2, 0.3, -0.1, 0.6) },
      { id: 'ts_4', text: 'Taking charge when nobody asked', emoji: '👆', weights: w(0.3, 0.8, 0.0, 0.1) },
      { id: 'ts_5', text: 'Absorbing everyone else\'s problems', emoji: '🧽', weights: w(0.0, 0.0, 0.8, 0.2) },
    ],
  },

  // ────────────────────────────────────────
  // TOXIC TRAIT - DATING (stem: toxic_trait)
  // ────────────────────────────────────────
  {
    id: 'pool_toxic_dating',
    stemId: 'stem_toxic_trait',
    category: 'spicy',
    label: 'Dating toxic traits',
    options: [
      { id: 'td_1', text: 'Catching feelings too fast', emoji: '💘', weights: w(0.4, 0.0, 0.7, 0.1) },
      { id: 'td_2', text: 'Treating dating like a strategy game', emoji: '♟️', weights: w(0.1, 0.6, 0.0, 0.7) },
      { id: 'td_3', text: 'Losing yourself in the other person', emoji: '🫠', weights: w(0.3, -0.1, 0.6, 0.1) },
      { id: 'td_4', text: 'Already planning the future on date two', emoji: '🗓️', weights: w(0.2, 0.7, 0.3, 0.0) },
      { id: 'td_5', text: 'Liking the chase more than the catch', emoji: '🏃', weights: w(0.7, 0.3, -0.2, 0.2) },
    ],
  },

  // ────────────────────────────────────────
  // TOXIC TRAIT - HABITS (stem: toxic_trait)
  // ────────────────────────────────────────
  {
    id: 'pool_toxic_habits',
    stemId: 'stem_toxic_trait',
    category: 'humor',
    label: 'Habit toxic traits',
    options: [
      { id: 'th_1', text: 'Saying yes to everything then burning out', emoji: '🔥', weights: w(0.7, 0.3, 0.2, 0.0) },
      { id: 'th_2', text: 'Perfectionism disguised as standards', emoji: '✨', weights: w(0.0, 0.7, 0.0, 0.6) },
      { id: 'th_3', text: 'Avoiding conflict until it explodes', emoji: '🌋', weights: w(0.1, 0.0, 0.6, 0.3) },
      { id: 'th_4', text: 'Researching a purchase for longer than using it', emoji: '🔍', weights: w(-0.1, 0.3, 0.0, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // FRIEND GROUP ROLE (stem: friend_group)
  // ────────────────────────────────────────
  {
    id: 'pool_role_group',
    stemId: 'stem_friend_group',
    category: 'friendships',
    label: 'Group roles',
    options: [
      { id: 'rg_1', text: 'The hype person', emoji: '📣', weights: w(0.9, 0.3, 0.2, -0.1) },
      { id: 'rg_2', text: 'The one keeping everyone on track', emoji: '🗂️', weights: w(0.1, 0.9, 0.2, 0.2) },
      { id: 'rg_3', text: 'The therapist friend', emoji: '🛋️', weights: w(0.0, 0.0, 0.9, 0.2) },
      { id: 'rg_4', text: 'The walking Wikipedia', emoji: '🧠', weights: w(0.0, 0.1, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // FRIEND GROUP - PLANNING (stem: friend_group)
  // ────────────────────────────────────────
  {
    id: 'pool_role_planning',
    stemId: 'stem_friend_group',
    category: 'friendships',
    label: 'Planning roles',
    options: [
      { id: 'rp_1', text: 'The one who says "let\'s just go"', emoji: '🚀', weights: w(0.9, 0.2, 0.1, 0.0) },
      { id: 'rp_2', text: 'The one with the shared Google Doc', emoji: '📋', weights: w(0.0, 0.8, 0.2, 0.5) },
      { id: 'rp_3', text: 'The one making sure everyone\'s included', emoji: '🤗', weights: w(0.2, 0.0, 0.9, 0.0) },
      { id: 'rp_4', text: 'The one who found a better option', emoji: '💡', weights: w(0.2, 0.2, 0.0, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // FRIEND GROUP - DRAMA (stem: friend_group)
  // ────────────────────────────────────────
  {
    id: 'pool_role_drama',
    stemId: 'stem_friend_group',
    category: 'friendships',
    label: 'Drama roles',
    options: [
      { id: 'rdr_1', text: 'The one who heard about it first', emoji: '👂', weights: w(0.8, 0.1, 0.3, 0.2) },
      { id: 'rdr_2', text: 'The one who fixes it', emoji: '🔧', weights: w(0.1, 0.8, 0.3, 0.1) },
      { id: 'rdr_3', text: 'The one everyone vents to', emoji: '💬', weights: w(0.1, 0.0, 0.9, 0.1) },
      { id: 'rdr_4', text: 'The one who saw it coming', emoji: '🔮', weights: w(0.0, 0.2, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // GROUP CHAT - BEHAVIOR (stem: group_chat)
  // ────────────────────────────────────────
  {
    id: 'pool_gc_behavior',
    stemId: 'stem_group_chat',
    category: 'tiktok_genz',
    label: 'Group chat behavior',
    options: [
      { id: 'gcb_1', text: 'Sending 47 messages before anyone replies', emoji: '💬', weights: w(0.9, 0.1, 0.2, 0.1) },
      { id: 'gcb_2', text: 'Only reacting with emojis', emoji: '👍', weights: w(0.2, 0.3, 0.3, 0.4) },
      { id: 'gcb_3', text: 'Responding to everything with voice notes', emoji: '🎤', weights: w(0.5, 0.0, 0.7, 0.0) },
      { id: 'gcb_4', text: 'Dropping a link with no context', emoji: '🔗', weights: w(0.1, 0.1, 0.0, 0.9) },
      { id: 'gcb_5', text: 'Creating the itinerary nobody asked for', emoji: '📝', weights: w(0.1, 0.8, 0.2, 0.2) },
    ],
  },

  // ────────────────────────────────────────
  // GROUP CHAT - CONTENT (stem: group_chat)
  // ────────────────────────────────────────
  {
    id: 'pool_gc_content',
    stemId: 'stem_group_chat',
    category: 'tiktok_genz',
    label: 'Group chat content',
    options: [
      { id: 'gcc_1', text: 'Memes and chaos', emoji: '🤪', weights: w(0.8, 0.1, 0.3, 0.2) },
      { id: 'gcc_2', text: 'Workout screenshots', emoji: '💪', weights: w(0.1, 0.9, 0.0, 0.0) },
      { id: 'gcc_3', text: 'Wholesome check-ins', emoji: '💛', weights: w(0.0, 0.0, 0.9, 0.1) },
      { id: 'gcc_4', text: 'Random article about something niche', emoji: '📰', weights: w(0.0, 0.1, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // ICK - DATING (stem: ick)
  // ────────────────────────────────────────
  {
    id: 'pool_ick_dating',
    stemId: 'stem_ick',
    category: 'spicy',
    label: 'Dating icks',
    options: [
      { id: 'id_1', text: 'They have no opinions on anything', emoji: '😐', weights: w(0.3, 0.3, -0.1, -0.4) },
      { id: 'id_2', text: 'They one-up every story', emoji: '📢', weights: w(0.5, 0.4, -0.2, 0.1) },
      { id: 'id_3', text: 'They\'re performatively deep', emoji: '🎭', weights: w(0.0, 0.1, -0.2, 0.5) },
      { id: 'id_4', text: 'They can\'t be spontaneous', emoji: '📅', weights: w(0.6, -0.1, 0.0, -0.2) },
      { id: 'id_5', text: 'They don\'t remember what you\'ve told them', emoji: '🫥', weights: w(0.1, 0.1, -0.5, 0.0) },
    ],
  },

  // ────────────────────────────────────────
  // ICK - SOCIAL (stem: ick)
  // ────────────────────────────────────────
  {
    id: 'pool_ick_social',
    stemId: 'stem_ick',
    category: 'friendships',
    label: 'Social icks',
    options: [
      { id: 'is_1', text: 'People who only hang out to network', emoji: '🤝', weights: w(0.4, 0.5, -0.3, 0.0) },
      { id: 'is_2', text: 'People who never have a plan', emoji: '🤷', weights: w(0.3, -0.3, 0.2, -0.2) },
      { id: 'is_3', text: 'People who make you feel judged', emoji: '👀', weights: w(0.1, 0.2, -0.4, 0.3) },
      { id: 'is_4', text: 'People who never go deep', emoji: '🏊', weights: w(-0.2, 0.1, 0.3, -0.3) },
    ],
  },

  // ────────────────────────────────────────
  // RIZZ - MOVES (stem: rizz)
  // ────────────────────────────────────────
  {
    id: 'pool_rizz_moves',
    stemId: 'stem_rizz',
    category: 'dating_romance',
    label: 'Rizz moves',
    options: [
      { id: 'rm_1', text: 'Making everyone laugh', emoji: '😂', weights: w(0.8, 0.2, 0.3, 0.0) },
      { id: 'rm_2', text: 'Being genuinely impressive at something', emoji: '🏅', weights: w(0.1, 0.9, 0.0, 0.3) },
      { id: 'rm_3', text: 'Remembering tiny details about them', emoji: '🎯', weights: w(0.0, 0.1, 0.9, 0.2) },
      { id: 'rm_4', text: 'Knowing the most interesting thing in any room', emoji: '🗝️', weights: w(0.2, 0.1, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // RIZZ - ENERGY (stem: rizz)
  // ────────────────────────────────────────
  {
    id: 'pool_rizz_energy',
    stemId: 'stem_rizz',
    category: 'dating_romance',
    label: 'Rizz energy',
    options: [
      { id: 're_1', text: 'Confident chaos', emoji: '🌪️', weights: w(0.9, 0.2, 0.0, 0.1) },
      { id: 're_2', text: 'Quiet competence', emoji: '🔇', weights: w(0.0, 0.7, 0.2, 0.6) },
      { id: 're_3', text: 'Warm attention', emoji: '🌞', weights: w(0.2, 0.0, 0.9, 0.1) },
      { id: 're_4', text: 'Mysterious depth', emoji: '🌊', weights: w(0.0, 0.1, 0.2, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // DATE PLANS (stem: date_night)
  // ────────────────────────────────────────
  {
    id: 'pool_date_plans',
    stemId: 'stem_date_night',
    category: 'dating_romance',
    label: 'Date ideas',
    options: [
      { id: 'dp_1', text: 'Bar crawl with no plan', emoji: '🍻', weights: w(0.9, 0.1, 0.2, 0.0) },
      { id: 'dp_2', text: 'Active date (climbing, skating)', emoji: '🧗', weights: w(0.3, 0.9, 0.1, 0.1) },
      { id: 'dp_3', text: 'Cooking together', emoji: '👩‍🍳', weights: w(0.1, 0.1, 0.9, 0.2) },
      { id: 'dp_4', text: 'Exhibition or film screening', emoji: '🎨', weights: w(0.0, 0.1, 0.3, 0.9) },
      { id: 'dp_5', text: 'People-watching at a market', emoji: '🧐', weights: w(0.5, 0.0, 0.5, 0.4) },
    ],
  },

  // ────────────────────────────────────────
  // DATE VIBES (stem: date_night)
  // ────────────────────────────────────────
  {
    id: 'pool_date_vibes',
    stemId: 'stem_date_night',
    category: 'dating_romance',
    label: 'Date energy',
    options: [
      { id: 'dv_1', text: 'Spontaneous and loud', emoji: '🎉', weights: w(0.9, 0.2, 0.1, 0.0) },
      { id: 'dv_2', text: 'Challenging each other', emoji: '⚔️', weights: w(0.2, 0.8, 0.0, 0.4) },
      { id: 'dv_3', text: 'Intimate and real', emoji: '🕯️', weights: w(0.0, 0.0, 0.9, 0.3) },
      { id: 'dv_4', text: 'Discovering something new together', emoji: '🗺️', weights: w(0.3, 0.2, 0.2, 0.8) },
    ],
  },

  // ────────────────────────────────────────
  // GRIND - WORK (stem: grind)
  // ────────────────────────────────────────
  {
    id: 'pool_grind_work',
    stemId: 'stem_grind',
    category: 'work_school',
    label: 'Work style',
    options: [
      { id: 'gw_1', text: 'Wing it and vibes', emoji: '🌊', weights: w(0.8, 0.0, 0.3, 0.1) },
      { id: 'gw_2', text: 'Systems and routines', emoji: '⚙️', weights: w(-0.1, 0.9, 0.1, 0.3) },
      { id: 'gw_3', text: 'Collaborative energy', emoji: '🤝', weights: w(0.3, 0.2, 0.8, 0.0) },
      { id: 'gw_4', text: 'Deep focus, don\'t interrupt', emoji: '🎧', weights: w(-0.1, 0.3, 0.0, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // GRIND - GOALS (stem: grind)
  // ────────────────────────────────────────
  {
    id: 'pool_grind_goals',
    stemId: 'stem_grind',
    category: 'exercise_selfcare',
    label: 'Goal style',
    options: [
      { id: 'gg_1', text: 'Big goals, figure it out later', emoji: '🚀', weights: w(0.7, 0.3, 0.1, 0.0) },
      { id: 'gg_2', text: 'Track everything, optimize constantly', emoji: '📈', weights: w(0.0, 0.9, 0.0, 0.4) },
      { id: 'gg_3', text: 'Goals with people, not just numbers', emoji: '👥', weights: w(0.2, 0.2, 0.8, 0.0) },
      { id: 'gg_4', text: 'Mastery > achievement', emoji: '🎓', weights: w(0.0, 0.3, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // QUEST - LIFE (stem: main_quest)
  // ────────────────────────────────────────
  {
    id: 'pool_quest_life',
    stemId: 'stem_main_quest',
    category: 'worldviews',
    label: 'Life priorities',
    options: [
      { id: 'ql_1', text: 'Building an epic social life', emoji: '🎪', weights: w(0.9, 0.1, 0.3, 0.0) },
      { id: 'ql_2', text: 'Leveling up every day', emoji: '⬆️', weights: w(0.0, 0.9, 0.0, 0.3) },
      { id: 'ql_3', text: 'Finding your people', emoji: '🫂', weights: w(0.2, 0.0, 0.9, 0.1) },
      { id: 'ql_4', text: 'Understanding everything', emoji: '🔬', weights: w(0.0, 0.2, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // QUEST - GOALS (stem: main_quest)
  // ────────────────────────────────────────
  {
    id: 'pool_quest_goals',
    stemId: 'stem_main_quest',
    category: 'work_school',
    label: 'Goals',
    options: [
      { id: 'qg_1', text: 'Experiences > things', emoji: '🌍', weights: w(0.7, 0.1, 0.4, 0.3) },
      { id: 'qg_2', text: 'Results > feelings', emoji: '📊', weights: w(0.1, 0.8, -0.2, 0.4) },
      { id: 'qg_3', text: 'People > projects', emoji: '❤️', weights: w(0.2, -0.1, 0.9, 0.0) },
      { id: 'qg_4', text: 'Knowledge > everything', emoji: '📚', weights: w(0.0, 0.2, 0.0, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // ERA - LIFE (stem: era)
  // ────────────────────────────────────────
  {
    id: 'pool_era_life',
    stemId: 'stem_era',
    category: 'tiktok_genz',
    label: 'Life eras',
    options: [
      { id: 'el_1', text: 'Villain era (doing what I want)', emoji: '😈', weights: w(0.8, 0.3, -0.1, 0.2) },
      { id: 'el_2', text: 'Grind era (head down, working)', emoji: '💼', weights: w(0.0, 0.9, 0.0, 0.2) },
      { id: 'el_3', text: 'Soft era (being gentle with myself)', emoji: '🧸', weights: w(0.0, -0.1, 0.9, 0.2) },
      { id: 'el_4', text: 'Nerd era (going deep on something)', emoji: '🤓', weights: w(0.0, 0.2, 0.1, 0.9) },
      { id: 'el_5', text: 'Main character era', emoji: '👑', weights: w(0.9, 0.3, 0.1, 0.0) },
    ],
  },

  // ────────────────────────────────────────
  // ERA - AESTHETIC (stem: era)
  // ────────────────────────────────────────
  {
    id: 'pool_era_aesthetic',
    stemId: 'stem_era',
    category: 'tiktok_genz',
    label: 'Aesthetic eras',
    options: [
      { id: 'ea_1', text: 'Clean girl aesthetic', emoji: '🧖', weights: w(0.4, 0.6, 0.3, 0.0) },
      { id: 'ea_2', text: 'Dark academia', emoji: '🕯️', weights: w(0.0, 0.1, 0.4, 0.9) },
      { id: 'ea_3', text: 'Cottagecore', emoji: '🌻', weights: w(0.0, 0.0, 0.9, 0.3) },
      { id: 'ea_4', text: 'Streetwear/hypebeast', emoji: '🔥', weights: w(0.7, 0.4, 0.0, 0.2) },
      { id: 'ea_5', text: 'Gorpcore (outdoor everything)', emoji: '🏔️', weights: w(0.2, 0.8, 0.2, 0.2) },
    ],
  },

  // ────────────────────────────────────────
  // ROMANTICIZE - MUNDANE (stem: romanticize)
  // ────────────────────────────────────────
  {
    id: 'pool_romanticize_mundane',
    stemId: 'stem_romanticize',
    category: 'humor',
    label: 'Romanticize mundane things',
    options: [
      { id: 'rom_1', text: 'Your morning commute', emoji: '🚶', weights: w(0.3, 0.2, 0.3, 0.6) },
      { id: 'rom_2', text: 'Getting ready to go out', emoji: '💄', weights: w(0.7, 0.2, 0.4, 0.0) },
      { id: 'rom_3', text: 'A perfectly productive day', emoji: '✅', weights: w(0.0, 0.9, 0.1, 0.2) },
      { id: 'rom_4', text: 'Doing laundry with good music', emoji: '🧺', weights: w(0.1, 0.0, 0.8, 0.3) },
    ],
  },

  // ────────────────────────────────────────
  // ROMANTICIZE - CHAOS (stem: romanticize)
  // ────────────────────────────────────────
  {
    id: 'pool_romanticize_chaos',
    stemId: 'stem_romanticize',
    category: 'humor',
    label: 'Romanticize chaos',
    options: [
      { id: 'roc_1', text: 'Getting lost in a new city', emoji: '🗺️', weights: w(0.8, 0.1, 0.2, 0.4) },
      { id: 'roc_2', text: 'Pulling an all-nighter for something you love', emoji: '🌙', weights: w(0.2, 0.5, 0.0, 0.8) },
      { id: 'roc_3', text: 'A spontaneous road trip', emoji: '🚗', weights: w(0.7, 0.2, 0.4, 0.1) },
      { id: 'roc_4', text: 'Crying at something beautiful', emoji: '🥹', weights: w(0.0, 0.0, 0.9, 0.3) },
    ],
  },

  // ────────────────────────────────────────
  // CORE AESTHETIC (stem: core)
  // ────────────────────────────────────────
  {
    id: 'pool_core_aesthetic',
    stemId: 'stem_core',
    category: 'tiktok_genz',
    label: 'Core aesthetics',
    options: [
      { id: 'ca_1', text: 'Partycore', emoji: '🪩', weights: w(0.9, 0.1, 0.2, 0.0) },
      { id: 'ca_2', text: 'Hustlecore', emoji: '💰', weights: w(0.2, 0.9, 0.0, 0.1) },
      { id: 'ca_3', text: 'Comfycore', emoji: '🧸', weights: w(0.0, -0.1, 0.9, 0.2) },
      { id: 'ca_4', text: 'Brainrot', emoji: '🧠', weights: w(0.2, 0.0, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // CORE LIFESTYLE (stem: core)
  // ────────────────────────────────────────
  {
    id: 'pool_core_lifestyle',
    stemId: 'stem_core',
    category: 'worldviews',
    label: 'Core lifestyle',
    options: [
      { id: 'cl_1', text: 'Social butterfly era', emoji: '🦋', weights: w(0.9, 0.1, 0.3, 0.0) },
      { id: 'cl_2', text: 'Discipline arc', emoji: '⚡', weights: w(0.0, 0.9, 0.0, 0.3) },
      { id: 'cl_3', text: 'Healing journey', emoji: '🌿', weights: w(0.0, 0.0, 0.9, 0.3) },
      { id: 'cl_4', text: 'Knowledge quest', emoji: '📜', weights: w(0.0, 0.2, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // W OR L - TAKES (stem: ratio)
  // ────────────────────────────────────────
  {
    id: 'pool_wl_takes',
    stemId: 'stem_ratio',
    category: 'spicy',
    label: 'Takes: W or L?',
    options: [
      { id: 'wt_1', text: 'Texting back immediately', emoji: '⚡', weights: w(0.6, 0.3, 0.5, 0.0) },
      { id: 'wt_2', text: 'Having a five-year plan', emoji: '📅', weights: w(-0.1, 0.8, 0.1, 0.4) },
      { id: 'wt_3', text: 'Saying "I miss you" first', emoji: '💕', weights: w(0.3, 0.0, 0.8, 0.0) },
      { id: 'wt_4', text: 'Knowing obscure facts about everything', emoji: '🤓', weights: w(0.0, 0.1, 0.1, 0.9) },
    ],
  },

  // ────────────────────────────────────────
  // W OR L - CHOICES (stem: ratio)
  // ────────────────────────────────────────
  {
    id: 'pool_wl_choices',
    stemId: 'stem_ratio',
    category: 'humor',
    label: 'Choices: W or L?',
    options: [
      { id: 'wc_1', text: 'Going out on a Sunday night', emoji: '🌃', weights: w(0.8, 0.1, 0.0, 0.1) },
      { id: 'wc_2', text: 'Meal prepping for the week', emoji: '🍱', weights: w(-0.1, 0.9, 0.2, 0.1) },
      { id: 'wc_3', text: 'Rereading your favourite book', emoji: '📖', weights: w(-0.1, 0.0, 0.7, 0.6) },
      { id: 'wc_4', text: 'Learning a new hobby every month', emoji: '🎨', weights: w(0.4, 0.3, 0.1, 0.7) },
    ],
  },

  // ────────────────────────────────────────
  // W OR L - HABITS (stem: ratio)
  // ────────────────────────────────────────
  {
    id: 'pool_wl_habits',
    stemId: 'stem_ratio',
    category: 'humor',
    label: 'Habits: W or L?',
    options: [
      { id: 'wh_1', text: 'Never saying no to plans', emoji: '🎉', weights: w(0.8, 0.1, 0.3, -0.1) },
      { id: 'wh_2', text: 'Cold showers every morning', emoji: '🥶', weights: w(0.0, 0.9, -0.1, 0.2) },
      { id: 'wh_3', text: 'Having the same best friend since childhood', emoji: '🤞', weights: w(0.1, 0.0, 0.9, 0.1) },
      { id: 'wh_4', text: 'Reading reviews before buying anything', emoji: '📱', weights: w(-0.1, 0.3, 0.1, 0.8) },
    ],
  },

  // ────────────────────────────────────────
  // HOT TAKES - GENERATIONAL (stem: hot_take)
  // ────────────────────────────────────────
  {
    id: 'pool_hottake_gen',
    stemId: 'stem_hot_take',
    category: 'tiktok_genz',
    label: 'Generational hot takes',
    options: [
      { id: 'hg_1', text: 'Phone calls are better than texting', emoji: '🔥', weights: w(0.2, 0.4, 0.6, 0.0) },
      { id: 'hg_2', text: 'Nobody actually reads the books they post', emoji: '🔥', weights: w(0.4, 0.2, -0.1, 0.7) },
      { id: 'hg_3', text: 'Going viral is the new lottery', emoji: '🔥', weights: w(0.8, 0.3, 0.0, 0.1) },
      { id: 'hg_4', text: 'Touch grass is unironically great advice', emoji: '🔥', weights: w(0.0, 0.7, 0.4, 0.2) },
      { id: 'hg_5', text: 'Aesthetic ≠ personality', emoji: '🔥', weights: w(0.1, 0.5, 0.2, 0.6) },
    ],
  },

  // ────────────────────────────────────────
  // HOT TAKES - SELF (stem: hot_take)
  // ────────────────────────────────────────
  {
    id: 'pool_hottake_self',
    stemId: 'stem_hot_take',
    category: 'spicy',
    label: 'Self hot takes',
    options: [
      { id: 'hself_1', text: 'You should date your opposite, not your type', emoji: '🔥', weights: w(0.5, 0.1, 0.2, 0.5) },
      { id: 'hself_2', text: 'Alone time is more productive than any meeting', emoji: '🔥', weights: w(-0.3, 0.3, 0.3, 0.8) },
      { id: 'hself_3', text: 'Your vibe attracts your tribe is literally true', emoji: '🔥', weights: w(0.6, 0.0, 0.6, 0.0) },
      { id: 'hself_4', text: 'Comparison is actually motivating', emoji: '🔥', weights: w(0.2, 0.8, -0.2, 0.3) },
      { id: 'hself_5', text: 'Everyone should go to therapy', emoji: '🔥', weights: w(0.0, 0.2, 0.7, 0.4) },
    ],
  },

  // ────────────────────────────────────────
  // CELEBRITIES (stem: better)
  // ────────────────────────────────────────
  {
    id: 'pool_celebrities',
    stemId: 'stem_better',
    category: 'tiktok_genz',
    label: 'Celebrities',
    options: [
      { id: 'cel_1', text: 'Zendaya', emoji: '✨', weights: w(0.5, 0.3, 0.4, 0.4) },
      { id: 'cel_2', text: 'Pedro Pascal', emoji: '🥰', weights: w(0.3, 0.1, 0.8, 0.3) },
      { id: 'cel_3', text: 'Timothée Chalamet', emoji: '🎬', weights: w(0.2, 0.1, 0.4, 0.8) },
      { id: 'cel_4', text: 'Sydney Sweeney', emoji: '🌟', weights: w(0.6, 0.4, 0.3, 0.0) },
      { id: 'cel_5', text: 'MrBeast', emoji: '📈', weights: w(0.7, 0.7, 0.0, 0.0) },
      { id: 'cel_6', text: 'Jenna Ortega', emoji: '🖤', weights: w(0.3, 0.2, 0.2, 0.7) },
      { id: 'cel_7', text: 'Emma Chamberlain', emoji: '☕', weights: w(0.4, 0.1, 0.7, 0.3) },
      { id: 'cel_8', text: 'The Rock', emoji: '💪', weights: w(0.4, 0.9, 0.2, 0.0) },
    ],
  },

  // ────────────────────────────────────────
  // SUPERPOWERS (stem: rather)
  // ────────────────────────────────────────
  {
    id: 'pool_superpowers',
    stemId: 'stem_rather',
    category: 'humor',
    label: 'Superpowers',
    options: [
      { id: 'sup_1', text: 'Teleportation', emoji: '🌀', weights: w(0.7, 0.3, 0.1, 0.2) },
      { id: 'sup_2', text: 'Time control', emoji: '⏰', weights: w(0.0, 0.8, 0.1, 0.5) },
      { id: 'sup_3', text: 'Mind reading', emoji: '🧠', weights: w(0.3, 0.1, 0.7, 0.4) },
      { id: 'sup_4', text: 'Shapeshifting', emoji: '🦎', weights: w(0.6, 0.1, 0.2, 0.6) },
      { id: 'sup_5', text: 'Invisibility', emoji: '👻', weights: w(0.0, 0.0, 0.4, 0.8) },
      { id: 'sup_6', text: 'Super strength', emoji: '💪', weights: w(0.3, 0.9, 0.1, 0.0) },
      { id: 'sup_7', text: 'Healing others', emoji: '💚', weights: w(0.0, 0.1, 0.9, 0.2) },
      { id: 'sup_8', text: 'Photographic memory', emoji: '📸', weights: w(0.0, 0.4, 0.0, 0.9) },
    ],
  },
];

// ─── Verification helpers ───

/** Count pools per category */
export function getPoolsByCategory(): Record<PoolCategory, string[]> {
  const result = {} as Record<PoolCategory, string[]>;
  for (const pool of ANSWER_POOLS) {
    if (!result[pool.category]) result[pool.category] = [];
    result[pool.category].push(pool.id);
  }
  return result;
}

/** Verify every pool is referenced by exactly one stem */
export function verifyPoolStemMapping(): { orphanPools: string[]; missingPools: string[] } {
  const poolIds = new Set(ANSWER_POOLS.map(p => p.id));
  const referencedPools = new Set(QUESTION_STEMS.flatMap(s => s.pools));

  const orphanPools = ANSWER_POOLS.filter(p => !referencedPools.has(p.id)).map(p => p.id);
  const missingPools = [...referencedPools].filter(id => !poolIds.has(id));

  return { orphanPools, missingPools };
}

/** Count total answer options across all pools */
export function getTotalOptions(): number {
  return ANSWER_POOLS.reduce((sum, pool) => sum + pool.options.length, 0);
}
