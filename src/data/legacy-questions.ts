import type { BaseQuestion, ComboQuestion, MirrorQuestion } from './types';

// ═══════════════════════════════════════════════════════════════════════════════════
// PHASE 1: BASE QUESTIONS (108)
// 6 pairings × 18 questions each
// ═══════════════════════════════════════════════════════════════════════════════════

export const BASE_QUESTIONS: BaseQuestion[] = [
  // ─── Pulse vs Glow (18) ───
  {
    id: 'pg_1',
    pair: 'pulse_glow',
    text: 'Friday night. Pick one:',
    optionA: { text: '🎉 Party with strangers', emoji: '🎉', archetype: 'pulse' },
    optionB: { text: '🌄 6am trail run tomorrow', emoji: '🌄', archetype: 'glow' }
  },
  {
    id: 'pg_2',
    pair: 'pulse_glow',
    text: 'Your life motto:',
    optionA: { text: '💀 "Sleep when you\'re dead"', emoji: '💀', archetype: 'pulse' },
    optionB: { text: '⚙️ "Discipline is freedom"', emoji: '⚙️', archetype: 'glow' }
  },
  {
    id: 'pg_3',
    pair: 'pulse_glow',
    text: 'Better weekend morning:',
    optionA: { text: '🛏️ Wake up somewhere unexpected', emoji: '🛏️', archetype: 'pulse' },
    optionB: { text: '💪 Workout before sunrise', emoji: '💪', archetype: 'glow' }
  },
  {
    id: 'pg_4',
    pair: 'pulse_glow',
    text: 'Day off. First instinct:',
    optionA: { text: '📱 Text the group chat', emoji: '📱', archetype: 'pulse' },
    optionB: { text: '✅ Check off your to-do list', emoji: '✅', archetype: 'glow' }
  },
  {
    id: 'pg_5',
    pair: 'pulse_glow',
    text: 'Which artist?',
    optionA: { text: '💃 Charli xcx', emoji: '💃', archetype: 'pulse' },
    optionB: { text: '🎤 Kendrick Lamar', emoji: '🎤', archetype: 'glow' }
  },
  {
    id: 'pg_6',
    pair: 'pulse_glow',
    text: 'Notification you\'d prefer:',
    optionA: { text: '📍 "Everyone\'s going, come NOW"', emoji: '📍', archetype: 'pulse' },
    optionB: { text: '🏆 "New personal record"', emoji: '🏆', archetype: 'glow' }
  },
  {
    id: 'pg_7',
    pair: 'pulse_glow',
    text: 'Phone dies at 2pm:',
    optionA: { text: '😰 Panicked - how will they find me?', emoji: '😰', archetype: 'pulse' },
    optionB: { text: '😌 Honestly? Relieved.', emoji: '😌', archetype: 'glow' }
  },
  {
    id: 'pg_8',
    pair: 'pulse_glow',
    text: 'Better compliment:',
    optionA: { text: '🎉 "You\'re the life of the party"', emoji: '🎉', archetype: 'pulse' },
    optionB: { text: '💪 "You never give up"', emoji: '💪', archetype: 'glow' }
  },
  {
    id: 'pg_9',
    pair: 'pulse_glow',
    text: 'More afraid of:',
    optionA: { text: '😱 Missing something legendary', emoji: '😱', archetype: 'pulse' },
    optionB: { text: '😤 Wasting a day you could improve', emoji: '😤', archetype: 'glow' }
  },
  {
    id: 'pg_10',
    pair: 'pulse_glow',
    text: 'Trip choice:',
    optionA: { text: '✈️ Ibiza with new friends', emoji: '✈️', archetype: 'pulse' },
    optionB: { text: '🥾 Solo hike the Camino', emoji: '🥾', archetype: 'glow' }
  },
  {
    id: 'pg_11',
    pair: 'pulse_glow',
    text: 'Plans cancel. You:',
    optionA: { text: '📞 Find a replacement immediately', emoji: '📞', archetype: 'pulse' },
    optionB: { text: '💻 Work on your side project', emoji: '💻', archetype: 'glow' }
  },
  {
    id: 'pg_12',
    pair: 'pulse_glow',
    text: 'Stresses you more:',
    optionA: { text: '😬 Quiet Saturday with no plans', emoji: '😬', archetype: 'pulse' },
    optionB: { text: '📉 Being behind on goals', emoji: '📉', archetype: 'glow' }
  },
  {
    id: 'pg_13',
    pair: 'pulse_glow',
    text: 'Better flex:',
    optionA: { text: '🎉 300 people know your name', emoji: '🎉', archetype: 'pulse' },
    optionB: { text: '💪 100 pushups straight', emoji: '💪', archetype: 'glow' }
  },
  {
    id: 'pg_14',
    pair: 'pulse_glow',
    text: 'Your TikTok FYP:',
    optionA: { text: '🕺 Going-out fits and party clips', emoji: '🕺', archetype: 'pulse' },
    optionB: { text: '🏋️ 5am routines and meal prep', emoji: '🏋️', archetype: 'glow' }
  },
  {
    id: 'pg_15',
    pair: 'pulse_glow',
    text: 'Your Roman Empire:',
    optionA: { text: '🌙 That one legendary night', emoji: '🌙', archetype: 'pulse' },
    optionB: { text: '📈 Your five-year plan', emoji: '📈', archetype: 'glow' }
  },
  {
    id: 'pg_16',
    pair: 'pulse_glow',
    text: 'Group chat location drops:',
    optionA: { text: '🚗 Already getting ready', emoji: '🚗', archetype: 'pulse' },
    optionB: { text: '⏰ Check if it conflicts with your plans', emoji: '⏰', archetype: 'glow' }
  },
  {
    id: 'pg_17',
    pair: 'pulse_glow',
    text: 'Your personal brand:',
    optionA: { text: '✨ Main character energy', emoji: '✨', archetype: 'pulse' },
    optionB: { text: '🎯 Results speak for themselves', emoji: '🎯', archetype: 'glow' }
  },
  {
    id: 'pg_18',
    pair: 'pulse_glow',
    text: 'Podcast you\'d finish:',
    optionA: { text: '🎤 Unhinged celebrity interview', emoji: '🎤', archetype: 'pulse' },
    optionB: { text: '📊 Building an empire from zero', emoji: '📊', archetype: 'glow' }
  },

  // ─── Pulse vs Cozy (18) ───
  {
    id: 'pc_1',
    pair: 'pulse_cozy',
    text: 'Better night:',
    optionA: { text: '🌃 Rooftop bar, DJ, strangers', emoji: '🌃', archetype: 'pulse' },
    optionB: { text: '🕯️ Couch, candle, quiet movie', emoji: '🕯️', archetype: 'cozy' }
  },
  {
    id: 'pc_2',
    pair: 'pulse_cozy',
    text: 'Happy place:',
    optionA: { text: '🌅 Crowded festival at golden hour', emoji: '🌅', archetype: 'pulse' },
    optionB: { text: '🌧️ Rainy window, tea, book', emoji: '🌧️', archetype: 'cozy' }
  },
  {
    id: 'pc_3',
    pair: 'pulse_cozy',
    text: 'Sounds worse:',
    optionA: { text: '😩 "Let\'s just stay in"', emoji: '😩', archetype: 'pulse' },
    optionB: { text: '😖 "There\'s a huge crowd"', emoji: '😖', archetype: 'cozy' }
  },
  {
    id: 'pc_4',
    pair: 'pulse_cozy',
    text: 'Comfort item:',
    optionA: { text: '🎵 Your going-out playlist', emoji: '🎵', archetype: 'pulse' },
    optionB: { text: '👕 Your favorite hoodie', emoji: '👕', archetype: 'cozy' }
  },
  {
    id: 'pc_5',
    pair: 'pulse_cozy',
    text: 'How many close friends?',
    optionA: { text: '👥 More the better', emoji: '👥', archetype: 'pulse' },
    optionB: { text: '✋ Can count on one hand', emoji: '✋', archetype: 'cozy' }
  },
  {
    id: 'pc_6',
    pair: 'pulse_cozy',
    text: 'Want to be known as:',
    optionA: { text: '🙌 The one who\'s always down', emoji: '🙌', archetype: 'pulse' },
    optionB: { text: '💛 The one you talk to when you need to', emoji: '💛', archetype: 'cozy' }
  },
  {
    id: 'pc_7',
    pair: 'pulse_cozy',
    text: 'Better first date:',
    optionA: { text: '🎶 Concert you both like', emoji: '🎶', archetype: 'pulse' },
    optionB: { text: '🍳 Cook dinner together', emoji: '🍳', archetype: 'cozy' }
  },
  {
    id: 'pc_8',
    pair: 'pulse_cozy',
    text: 'Pick a vibe:',
    optionA: { text: '🌙 "See where the night takes us"', emoji: '🌙', archetype: 'pulse' },
    optionB: { text: '📋 "I made a reservation"', emoji: '📋', archetype: 'cozy' }
  },
  {
    id: 'pc_9',
    pair: 'pulse_cozy',
    text: 'Your camera roll:',
    optionA: { text: '📸 Nights out, group shots, random', emoji: '📸', archetype: 'pulse' },
    optionB: { text: '🐕 Food, pets, sunsets, feelings', emoji: '🐕', archetype: 'cozy' }
  },
  {
    id: 'pc_10',
    pair: 'pulse_cozy',
    text: 'Bigger red flag:',
    optionA: { text: '🚩 They never want to go out', emoji: '🚩', archetype: 'pulse' },
    optionB: { text: '🚩 They can\'t sit still 10 minutes', emoji: '🚩', archetype: 'cozy' }
  },
  {
    id: 'pc_11',
    pair: 'pulse_cozy',
    text: 'Which musician:',
    optionA: { text: '💃 Doja Cat', emoji: '💃', archetype: 'pulse' },
    optionB: { text: '🎸 Phoebe Bridgers', emoji: '🎸', archetype: 'cozy' }
  },
  {
    id: 'pc_12',
    pair: 'pulse_cozy',
    text: 'Memory you\'d relive:',
    optionA: { text: '✨ A night that became a story', emoji: '✨', archetype: 'pulse' },
    optionB: { text: '💕 Quiet moment with someone who gets you', emoji: '💕', archetype: 'cozy' }
  },
  {
    id: 'pc_13',
    pair: 'pulse_cozy',
    text: 'Comfort content:',
    optionA: { text: '📱 Live reality show with voting', emoji: '📱', archetype: 'pulse' },
    optionB: { text: '🛋️ 90s sitcom you\'ve seen 4 times', emoji: '🛋️', archetype: 'cozy' }
  },
  {
    id: 'pc_14',
    pair: 'pulse_cozy',
    text: 'Friday 11pm, honestly:',
    optionA: { text: '⚡ Just getting started', emoji: '⚡', archetype: 'pulse' },
    optionB: { text: '😴 Already in bed, zero regrets', emoji: '😴', archetype: 'cozy' }
  },
  {
    id: 'pc_15',
    pair: 'pulse_cozy',
    text: 'Weekend plan:',
    optionA: { text: '🎪 A pop-up you saw on Instagram', emoji: '🎪', archetype: 'pulse' },
    optionB: { text: '🧶 That craft project you\'ll never finish', emoji: '🧶', archetype: 'cozy' }
  },
  {
    id: 'pc_16',
    pair: 'pulse_cozy',
    text: 'Dating app photo that\'s you:',
    optionA: { text: '🥂 You at an event, belonging', emoji: '🥂', archetype: 'pulse' },
    optionB: { text: '🐱 You with a pet, cozy', emoji: '🐱', archetype: 'cozy' }
  },
  {
    id: 'pc_17',
    pair: 'pulse_cozy',
    text: 'Compliment to make your week:',
    optionA: { text: '🌟 "You\'re the main character"', emoji: '🌟', archetype: 'pulse' },
    optionB: { text: '🫂 "Talking to you feels like a warm hug"', emoji: '🫂', archetype: 'cozy' }
  },
  {
    id: 'pc_18',
    pair: 'pulse_cozy',
    text: 'Choose one:',
    optionA: { text: '🍸 Cocktail at the new spot', emoji: '🍸', archetype: 'pulse' },
    optionB: { text: '🕯️ Actual candle, at home, now', emoji: '🕯️', archetype: 'cozy' }
  },

  // ─── Pulse vs Lore (18) ───
  {
    id: 'pl_1',
    pair: 'pulse_lore',
    text: 'At a party, you\'re most likely:',
    optionA: { text: '🤝 Introducing people to each other', emoji: '🤝', archetype: 'pulse' },
    optionB: { text: '🗣️ In the corner, deep niche talk', emoji: '🗣️', archetype: 'lore' }
  },
  {
    id: 'pl_2',
    pair: 'pulse_lore',
    text: 'Superpower:',
    optionA: { text: '⚡ Teleportation - be anywhere instantly', emoji: '⚡', archetype: 'pulse' },
    optionB: { text: '🧠 Photographic memory - never forget', emoji: '🧠', archetype: 'lore' }
  },
  {
    id: 'pl_3',
    pair: 'pulse_lore',
    text: 'Better rabbit hole:',
    optionA: { text: '🗺️ New city, no itinerary', emoji: '🗺️', archetype: 'pulse' },
    optionB: { text: '📺 45-part video essay on something', emoji: '📺', archetype: 'lore' }
  },
  {
    id: 'pl_4',
    pair: 'pulse_lore',
    text: 'Better flex:',
    optionA: { text: '👋 Knowing everyone in the room', emoji: '👋', archetype: 'pulse' },
    optionB: { text: '📚 Knowing everything about one thing', emoji: '📚', archetype: 'lore' }
  },
  {
    id: 'pl_5',
    pair: 'pulse_lore',
    text: 'Better compliment:',
    optionA: { text: '🌐 "You know everyone"', emoji: '🌐', archetype: 'pulse' },
    optionB: { text: '🧠 "You know everything"', emoji: '🧠', archetype: 'lore' }
  },
  {
    id: 'pl_6',
    pair: 'pulse_lore',
    text: 'You\'d rather watch:',
    optionA: { text: '🏟️ Live event - concert, game, fight', emoji: '🏟️', archetype: 'pulse' },
    optionB: { text: '📺 Niche limited series', emoji: '📺', archetype: 'lore' }
  },
  {
    id: 'pl_7',
    pair: 'pulse_lore',
    text: 'Your Wikipedia history:',
    optionA: { text: '👤 People you just met or heard of', emoji: '👤', archetype: 'pulse' },
    optionB: { text: '🔍 Obscure topics at 2am', emoji: '🔍', archetype: 'lore' }
  },
  {
    id: 'pl_8',
    pair: 'pulse_lore',
    text: 'When someone recommends something:',
    optionA: { text: '👍 Check it out if people co-sign', emoji: '👍', archetype: 'pulse' },
    optionB: { text: '🤔 Want to know WHY it\'s good', emoji: '🤔', archetype: 'lore' }
  },
  {
    id: 'pl_9',
    pair: 'pulse_lore',
    text: 'Lose track of time with:',
    optionA: { text: '💬 Great conversation with new people', emoji: '💬', archetype: 'pulse' },
    optionB: { text: '🔬 Going deep on your obsession', emoji: '🔬', archetype: 'lore' }
  },
  {
    id: 'pl_10',
    pair: 'pulse_lore',
    text: 'Show format:',
    optionA: { text: '📺 Reality TV - chaos and drama', emoji: '📺', archetype: 'pulse' },
    optionB: { text: '🎬 Documentary that changes your view', emoji: '🎬', archetype: 'lore' }
  },
  {
    id: 'pl_11',
    pair: 'pulse_lore',
    text: 'Group chat energy:',
    optionA: { text: '😂 Memes and making plans', emoji: '😂', archetype: 'pulse' },
    optionB: { text: '🔗 Sending links "you NEED this"', emoji: '🔗', archetype: 'lore' }
  },
  {
    id: 'pl_12',
    pair: 'pulse_lore',
    text: 'Time-travel to:',
    optionA: { text: '🎺 Roaring \'20s - jazz, parties', emoji: '🎺', archetype: 'pulse' },
    optionB: { text: '📜 Ancient Alexandria - library, scholars', emoji: '📜', archetype: 'lore' }
  },
  {
    id: 'pl_13',
    pair: 'pulse_lore',
    text: 'Browser tabs right now:',
    optionA: { text: '💬 17 group chat and event links', emoji: '💬', archetype: 'pulse' },
    optionB: { text: '📑 47 research tabs on one thing', emoji: '📑', archetype: 'lore' }
  },
  {
    id: 'pl_14',
    pair: 'pulse_lore',
    text: 'Trivia night, you bring:',
    optionA: { text: '🤝 Vibes and team spirit', emoji: '🤝', archetype: 'pulse' },
    optionB: { text: '🧠 The actual answers', emoji: '🧠', archetype: 'lore' }
  },
  {
    id: 'pl_15',
    pair: 'pulse_lore',
    text: 'Someone says "fun fact":',
    optionA: { text: '😅 Panic and talk about yourself', emoji: '😅', archetype: 'pulse' },
    optionB: { text: '🤓 Already have 12 queued', emoji: '🤓', archetype: 'lore' }
  },
  {
    id: 'pl_16',
    pair: 'pulse_lore',
    text: 'Your villain origin story:',
    optionA: { text: '😤 Not being invited', emoji: '😤', archetype: 'pulse' },
    optionB: { text: '😠 Someone getting facts wrong', emoji: '😠', archetype: 'lore' }
  },
  {
    id: 'pl_17',
    pair: 'pulse_lore',
    text: 'Date activity:',
    optionA: { text: '🎳 Active thing where you can talk', emoji: '🎳', archetype: 'pulse' },
    optionB: { text: '🎮 Co-op gaming or museum walk', emoji: '🎮', archetype: 'lore' }
  },
  {
    id: 'pl_18',
    pair: 'pulse_lore',
    text: 'Your notifications:',
    optionA: { text: '📲 Group chat explosion every 5 min', emoji: '📲', archetype: 'pulse' },
    optionB: { text: '🔕 Muted - you\'ll check eventually', emoji: '🔕', archetype: 'lore' }
  },

  // ─── Glow vs Cozy (18) ───
  {
    id: 'gc_1',
    pair: 'glow_cozy',
    text: 'Better Sunday:',
    optionA: { text: '📋 Meal prep, gym, plan week', emoji: '📋', archetype: 'glow' },
    optionB: { text: '😴 Sleep in, slow breakfast, no plans', emoji: '😴', archetype: 'cozy' }
  },
  {
    id: 'gc_2',
    pair: 'glow_cozy',
    text: 'Which resonates more:',
    optionA: { text: '📈 "I can always do better"', emoji: '📈', archetype: 'glow' },
    optionB: { text: '🧘 "I\'m learning to be okay with me"', emoji: '🧘', archetype: 'cozy' }
  },
  {
    id: 'gc_3',
    pair: 'glow_cozy',
    text: 'Which drink:',
    optionA: { text: '🥤 Protein shake at 6:30am', emoji: '🥤', archetype: 'glow' },
    optionB: { text: '☕ Hot chocolate at 10pm', emoji: '☕', archetype: 'cozy' }
  },
  {
    id: 'gc_4',
    pair: 'glow_cozy',
    text: 'Value more in a friend:',
    optionA: { text: '🔥 They push you to be better', emoji: '🔥', archetype: 'glow' },
    optionB: { text: '🤗 They accept you as you are', emoji: '🤗', archetype: 'cozy' }
  },
  {
    id: 'gc_5',
    pair: 'glow_cozy',
    text: 'Rather someone say:',
    optionA: { text: '💫 "You inspire me"', emoji: '💫', archetype: 'glow' },
    optionB: { text: '🛡️ "You make me feel safe"', emoji: '🛡️', archetype: 'cozy' }
  },
  {
    id: 'gc_6',
    pair: 'glow_cozy',
    text: 'Early alarm goes off. First thought:',
    optionA: { text: '⏰ Good - I\'m ahead of everyone', emoji: '⏰', archetype: 'glow' },
    optionB: { text: '😴 *hits snooze with zero guilt*', emoji: '😴', archetype: 'cozy' }
  },
  {
    id: 'gc_7',
    pair: 'glow_cozy',
    text: 'Bigger dealbreaker in a partner:',
    optionA: { text: '🚩 No ambition', emoji: '🚩', archetype: 'glow' },
    optionB: { text: '🚩 No emotional availability', emoji: '🚩', archetype: 'cozy' }
  },
  {
    id: 'gc_8',
    pair: 'glow_cozy',
    text: 'Vacation style:',
    optionA: { text: '⛰️ Active - hiking, training, sports', emoji: '⛰️', archetype: 'glow' },
    optionB: { text: '🏠 Cabin - fireplace, games, slow mornings', emoji: '🏠', archetype: 'cozy' }
  },
  {
    id: 'gc_9',
    pair: 'glow_cozy',
    text: 'Instagram aesthetic:',
    optionA: { text: '💪 Gym selfies, sunrise runs, progress', emoji: '💪', archetype: 'glow' },
    optionB: { text: '☕ Coffee shots, golden hour, "life lately"', emoji: '☕', archetype: 'cozy' }
  },
  {
    id: 'gc_10',
    pair: 'glow_cozy',
    text: 'Quote that fits:',
    optionA: { text: '💬 "Hard work beats talent when talent doesn\'t work"', emoji: '💬', archetype: 'glow' },
    optionB: { text: '💬 "Rest is not the opposite of productivity"', emoji: '💬', archetype: 'cozy' }
  },
  {
    id: 'gc_11',
    pair: 'glow_cozy',
    text: 'Bond with people over:',
    optionA: { text: '🎯 Shared goals and accountability', emoji: '🎯', archetype: 'glow' },
    optionB: { text: '💗 Shared feelings and comfortable silence', emoji: '💗', archetype: 'cozy' }
  },
  {
    id: 'gc_12',
    pair: 'glow_cozy',
    text: 'Worst thing someone could say:',
    optionA: { text: '😨 "They peaked"', emoji: '😨', archetype: 'glow' },
    optionB: { text: '😨 "They\'re cold"', emoji: '😨', archetype: 'cozy' }
  },
  {
    id: 'gc_13',
    pair: 'glow_cozy',
    text: 'Your alarm label:',
    optionA: { text: '🌅 RISE AND GRIND', emoji: '🌅', archetype: 'glow' },
    optionB: { text: '🥐 "not yet bestie"', emoji: '🥐', archetype: 'cozy' }
  },
  {
    id: 'gc_14',
    pair: 'glow_cozy',
    text: 'Valid reason to cancel plans:',
    optionA: { text: '🏃 Training for something', emoji: '🏃', archetype: 'glow' },
    optionB: { text: '🫖 Mental health night', emoji: '🫖', archetype: 'cozy' }
  },
  {
    id: 'gc_15',
    pair: 'glow_cozy',
    text: 'Gift you\'d actually want:',
    optionA: { text: '🎧 Nice headphones or fitness tracker', emoji: '🎧', archetype: 'glow' },
    optionB: { text: '🧸 Handmade scrapbook or blanket', emoji: '🧸', archetype: 'cozy' }
  },
  {
    id: 'gc_16',
    pair: 'glow_cozy',
    text: 'Your notes app:',
    optionA: { text: '✅ Goals, PRs, motivational quotes', emoji: '✅', archetype: 'glow' },
    optionB: { text: '📝 Song lyrics, recipes, random feelings', emoji: '📝', archetype: 'cozy' }
  },
  {
    id: 'gc_17',
    pair: 'glow_cozy',
    text: 'Hot take:',
    optionA: { text: '🔥 Rest days feel like wasted days', emoji: '🔥', archetype: 'glow' },
    optionB: { text: '🧊 Ambition culture is exhausting', emoji: '🧊', archetype: 'cozy' }
  },
  {
    id: 'gc_18',
    pair: 'glow_cozy',
    text: 'Pick an aesthetic:',
    optionA: { text: '🖤 Clean girl / "that girl" energy', emoji: '🖤', archetype: 'glow' },
    optionB: { text: '🤎 Cottagecore or dark academia', emoji: '🤎', archetype: 'cozy' }
  },

  // ─── Glow vs Lore (18) ───
  {
    id: 'gl_1',
    pair: 'glow_lore',
    text: 'Better flex:',
    optionA: { text: '🏃 Run a marathon', emoji: '🏃', archetype: 'glow' },
    optionB: { text: '🎮 Beat a game on hardest difficulty', emoji: '🎮', archetype: 'lore' }
  },
  {
    id: 'gl_2',
    pair: 'glow_lore',
    text: 'Motivates you more:',
    optionA: { text: '📊 A leaderboard', emoji: '📊', archetype: 'glow' },
    optionB: { text: '🔮 A mystery', emoji: '🔮', archetype: 'lore' }
  },
  {
    id: 'gl_3',
    pair: 'glow_lore',
    text: 'Heist movie role:',
    optionA: { text: '🏋️ Trained for months to pull it off', emoji: '🏋️', archetype: 'glow' },
    optionB: { text: '🖥️ Planned every detail from a dark room', emoji: '🖥️', archetype: 'lore' }
  },
  {
    id: 'gl_4',
    pair: 'glow_lore',
    text: 'Which bookshelf:',
    optionA: { text: '📖 Self-improvement, biographies, how-to', emoji: '📖', archetype: 'glow' },
    optionB: { text: '📚 Fantasy, sci-fi, manga, deep non-fiction', emoji: '📚', archetype: 'lore' }
  },
  {
    id: 'gl_5',
    pair: 'glow_lore',
    text: 'Admire someone because:',
    optionA: { text: '💪 They put in work and it shows', emoji: '💪', archetype: 'glow' },
    optionB: { text: '🧠 They know things most people don\'t', emoji: '🧠', archetype: 'lore' }
  },
  {
    id: 'gl_6',
    pair: 'glow_lore',
    text: 'Skill you\'d rather master:',
    optionA: { text: '⚽ Sport or physical discipline', emoji: '⚽', archetype: 'glow' },
    optionB: { text: '🎹 Language or instrument', emoji: '🎹', archetype: 'lore' }
  },
  {
    id: 'gl_7',
    pair: 'glow_lore',
    text: 'Better compliment:',
    optionA: { text: '🤖 "You\'re a machine"', emoji: '🤖', archetype: 'glow' },
    optionB: { text: '🧠 "You\'re a genius"', emoji: '🧠', archetype: 'lore' }
  },
  {
    id: 'gl_8',
    pair: 'glow_lore',
    text: 'Learn new things by:',
    optionA: { text: '🔨 Doing - trial, error, repetition', emoji: '🔨', archetype: 'glow' },
    optionB: { text: '📖 Researching - reading, watching', emoji: '📖', archetype: 'lore' }
  },
  {
    id: 'gl_9',
    pair: 'glow_lore',
    text: 'Your comfort zone is:',
    optionA: { text: '🚀 Something you\'re actively leaving', emoji: '🚀', archetype: 'glow' },
    optionB: { text: '🎮 Something you\'ve perfected', emoji: '🎮', archetype: 'lore' }
  },
  {
    id: 'gl_10',
    pair: 'glow_lore',
    text: 'Which duo:',
    optionA: { text: '🥊 Rocky and Apollo Creed', emoji: '🥊', archetype: 'glow' },
    optionB: { text: '🧙 Frodo and Samwise', emoji: '🧙', archetype: 'lore' }
  },
  {
    id: 'gl_11',
    pair: 'glow_lore',
    text: 'Something goes wrong. Instinct:',
    optionA: { text: '🔧 Work harder until you fix it', emoji: '🔧', archetype: 'glow' },
    optionB: { text: '🔍 Figure out exactly what happened', emoji: '🔍', archetype: 'lore' }
  },
  {
    id: 'gl_12',
    pair: 'glow_lore',
    text: 'Dream collab partner:',
    optionA: { text: '🏋️ Coach who brings out your best', emoji: '🏋️', archetype: 'glow' },
    optionB: { text: '🎨 Creator whose work you worship', emoji: '🎨', archetype: 'lore' }
  },
  {
    id: 'gl_13',
    pair: 'glow_lore',
    text: 'Your screen time:',
    optionA: { text: '📱 Fitness apps and productivity tools', emoji: '📱', archetype: 'glow' },
    optionB: { text: '🌐 YouTube, Reddit, wiki rabbit holes', emoji: '🌐', archetype: 'lore' }
  },
  {
    id: 'gl_14',
    pair: 'glow_lore',
    text: 'Still up at 1am because:',
    optionA: { text: '🏃 Couldn\'t sleep, might as well work', emoji: '🏃', archetype: 'glow' },
    optionB: { text: '🌀 Fell into a rabbit hole, no going back', emoji: '🌀', archetype: 'lore' }
  },
  {
    id: 'gl_15',
    pair: 'glow_lore',
    text: 'Childhood flex:',
    optionA: { text: '🏆 Won a sports trophy', emoji: '🏆', archetype: 'glow' },
    optionB: { text: '🎮 100%\'d a video game', emoji: '🎮', archetype: 'lore' }
  },
  {
    id: 'gl_16',
    pair: 'glow_lore',
    text: 'Your hero:',
    optionA: { text: '🏔️ Climbed from nothing through grind', emoji: '🏔️', archetype: 'glow' },
    optionB: { text: '🔬 Discovered something that changed the world', emoji: '🔬', archetype: 'lore' }
  },
  {
    id: 'gl_17',
    pair: 'glow_lore',
    text: 'Internet-famous for:',
    optionA: { text: '🏅 An achievement everyone respects', emoji: '🏅', archetype: 'glow' },
    optionB: { text: '📖 Creating for a niche that worships you', emoji: '📖', archetype: 'lore' }
  },
  {
    id: 'gl_18',
    pair: 'glow_lore',
    text: 'First app you check:',
    optionA: { text: '📊 Habit tracker or workout log', emoji: '📊', archetype: 'glow' },
    optionB: { text: '🗂️ Discord, Reddit, fandom forum', emoji: '🗂️', archetype: 'lore' }
  },

  // ─── Cozy vs Lore (18) ───
  {
    id: 'cl_1',
    pair: 'cozy_lore',
    text: 'Better rainy day:',
    optionA: { text: '🍰 Bake something from scratch', emoji: '🍰', archetype: 'cozy' },
    optionB: { text: '🎮 Start a new game or rewatch', emoji: '🎮', archetype: 'lore' }
  },
  {
    id: 'cl_2',
    pair: 'cozy_lore',
    text: 'Conversation topic with someone new:',
    optionA: { text: '😊 "What made you really happy lately?"', emoji: '😊', archetype: 'cozy' },
    optionB: { text: '🤔 "What could you talk about forever?"', emoji: '🤔', archetype: 'lore' }
  },
  {
    id: 'cl_3',
    pair: 'cozy_lore',
    text: 'The thing you collect:',
    optionA: { text: '📝 Recipes, playlists, moments', emoji: '📝', archetype: 'cozy' },
    optionB: { text: '📊 Facts, references, rankings', emoji: '📊', archetype: 'lore' }
  },
  {
    id: 'cl_4',
    pair: 'cozy_lore',
    text: 'Your love language is closer to:',
    optionA: { text: '🎁 Acts of service - I made this for you', emoji: '🎁', archetype: 'cozy' },
    optionB: { text: '🕐 Quality time - let\'s do our favorite thing', emoji: '🕐', archetype: 'lore' }
  },
  {
    id: 'cl_5',
    pair: 'cozy_lore',
    text: 'YouTube video type:',
    optionA: { text: '🍳 Calm cooking or pottery channel', emoji: '🍳', archetype: 'cozy' },
    optionB: { text: '🎬 3-hour analysis of why a movie works', emoji: '🎬', archetype: 'lore' }
  },
  {
    id: 'cl_6',
    pair: 'cozy_lore',
    text: 'Notice first about someone\'s space:',
    optionA: { text: '🏡 Whether it feels warm and lived-in', emoji: '🏡', archetype: 'cozy' },
    optionB: { text: '📚 What\'s on their shelves and walls', emoji: '📚', archetype: 'lore' }
  },
  {
    id: 'cl_7',
    pair: 'cozy_lore',
    text: 'Form of escapism:',
    optionA: { text: '📺 Comfort rewatches and familiar rituals', emoji: '📺', archetype: 'cozy' },
    optionB: { text: '🌍 New world to learn everything about', emoji: '🌍', archetype: 'lore' }
  },
  {
    id: 'cl_8',
    pair: 'cozy_lore',
    text: 'Way to your heart:',
    optionA: { text: '💝 Remember the small things I mentioned', emoji: '💝', archetype: 'cozy' },
    optionB: { text: '🤩 Get genuinely excited about my interests', emoji: '🤩', archetype: 'lore' }
  },
  {
    id: 'cl_9',
    pair: 'cozy_lore',
    text: 'Holiday gift:',
    optionA: { text: '🎁 Something handmade or deeply personal', emoji: '🎁', archetype: 'cozy' },
    optionB: { text: '💎 Something rare from a niche you love', emoji: '💎', archetype: 'lore' }
  },
  {
    id: 'cl_10',
    pair: 'cozy_lore',
    text: 'When you really like something:',
    optionA: { text: '🍷 Savour it slowly', emoji: '🍷', archetype: 'cozy' },
    optionB: { text: '🏃 Consume everything related immediately', emoji: '🏃', archetype: 'lore' }
  },
  {
    id: 'cl_11',
    pair: 'cozy_lore',
    text: 'Better co-op activity:',
    optionA: { text: '🧩 Jigsaw puzzle or board game by fire', emoji: '🧩', archetype: 'cozy' },
    optionB: { text: '🏗️ Minecraft building or TTRPG campaign', emoji: '🏗️', archetype: 'lore' }
  },
  {
    id: 'cl_12',
    pair: 'cozy_lore',
    text: 'Trait you find more attractive:',
    optionA: { text: '💛 Emotional intelligence', emoji: '💛', archetype: 'cozy' },
    optionB: { text: '🔥 Passionate expertise', emoji: '🔥', archetype: 'lore' }
  },
  {
    id: 'cl_13',
    pair: 'cozy_lore',
    text: 'Road trip vibe:',
    optionA: { text: '🎵 Curated playlist and midnight snacks', emoji: '🎵', archetype: 'cozy' },
    optionB: { text: '🎧 Podcast deep-dive and gas station drinks', emoji: '🎧', archetype: 'lore' }
  },
  {
    id: 'cl_14',
    pair: 'cozy_lore',
    text: 'Your bookmarks folder:',
    optionA: { text: '📌 Recipes, cafes, gift ideas', emoji: '📌', archetype: 'cozy' },
    optionB: { text: '🔖 Lore explainers, tier lists, build guides', emoji: '🔖', archetype: 'lore' }
  },
  {
    id: 'cl_15',
    pair: 'cozy_lore',
    text: 'Way you show love:',
    optionA: { text: '🍪 "I baked this for you at 11pm"', emoji: '🍪', archetype: 'cozy' },
    optionB: { text: '📎 "I found this article and thought of you"', emoji: '📎', archetype: 'lore' }
  },
  {
    id: 'cl_16',
    pair: 'cozy_lore',
    text: 'What keeps you up at 2am:',
    optionA: { text: '💭 Overthinking a conversation from years ago', emoji: '💭', archetype: 'cozy' },
    optionB: { text: '📺 One more episode / one more chapter', emoji: '📺', archetype: 'lore' }
  },
  {
    id: 'cl_17',
    pair: 'cozy_lore',
    text: 'Comfort food order:',
    optionA: { text: '🍲 Whatever reminds you of home', emoji: '🍲', archetype: 'cozy' },
    optionB: { text: '🍕 The exact same order, no changes, ever', emoji: '🍕', archetype: 'lore' }
  },
  {
    id: 'cl_18',
    pair: 'cozy_lore',
    text: 'Creative outlet:',
    optionA: { text: '✍️ Journaling or making playlists', emoji: '✍️', archetype: 'cozy' },
    optionB: { text: '🎨 Building worlds or making tier lists', emoji: '🎨', archetype: 'lore' }
  }
];

// ═══════════════════════════════════════════════════════════════════════════════════
// PHASE 2: COMBO QUESTIONS (60)
// Testing secondary archetype selection within established primary combinations
// ═══════════════════════════════════════════════════════════════════════════════════

export const COMBO_QUESTIONS: ComboQuestion[] = [
  // ─── Pulse Primary (20) ───

  // Pulse/Glow vs Pulse/Cozy
  {
    id: 'cpgpc_1',
    matchup: 'pulse_glow_vs_pulse_cozy',
    primary: 'pulse',
    text: 'When you throw a party:',
    optionA: { text: '🏆 Make it the most memorable night', emoji: '🏆', archetype: 'glow' },
    optionB: { text: '💕 Create a space where everyone\'s included', emoji: '💕', archetype: 'cozy' }
  },
  {
    id: 'cpgpc_2',
    matchup: 'pulse_glow_vs_pulse_cozy',
    primary: 'pulse',
    text: 'Friend group grows because:',
    optionA: { text: '📈 You\'re naturally the hub everyone orbits', emoji: '📈', archetype: 'glow' },
    optionB: { text: '🌙 You deepen bonds with whoever shows', emoji: '🌙', archetype: 'cozy' }
  },
  {
    id: 'cpgpc_3',
    matchup: 'pulse_glow_vs_pulse_cozy',
    primary: 'pulse',
    text: 'Plans fall through. You:',
    optionA: { text: '🔥 Rally for something bigger and better', emoji: '🔥', archetype: 'glow' },
    optionB: { text: '🛋️ Pivot to cozy hangout with whoever\'s free', emoji: '🛋️', archetype: 'cozy' }
  },
  {
    id: 'cpgpc_4',
    matchup: 'pulse_glow_vs_pulse_cozy',
    primary: 'pulse',
    text: 'In group chats, you\'re usually:',
    optionA: { text: '💬 Starting competitions or challenges', emoji: '💬', archetype: 'glow' },
    optionB: { text: '✨ Keeping vibes warm and checking on people', emoji: '✨', archetype: 'cozy' }
  },
  {
    id: 'cpgpc_5',
    matchup: 'pulse_glow_vs_pulse_cozy',
    primary: 'pulse',
    text: 'Social event went well when:',
    optionA: { text: '🎯 People leave saying "that was insane"', emoji: '🎯', archetype: 'glow' },
    optionB: { text: '🤝 People leave feeling closer to each other', emoji: '🤝', archetype: 'cozy' }
  },

  // Pulse/Glow vs Pulse/Lore
  {
    id: 'cpgpl_1',
    matchup: 'pulse_glow_vs_pulse_lore',
    primary: 'pulse',
    text: 'You find something cool. Next:',
    optionA: { text: '🏅 Master it faster than your friends', emoji: '🏅', archetype: 'glow' },
    optionB: { text: '🎤 Spend hours hyping everyone about it', emoji: '🎤', archetype: 'lore' }
  },
  {
    id: 'cpgpl_2',
    matchup: 'pulse_glow_vs_pulse_lore',
    primary: 'pulse',
    text: 'In a scene, what matters most:',
    optionA: { text: '🥇 Being known as one of the best', emoji: '🥇', archetype: 'glow' },
    optionB: { text: '🎭 Getting more people into it', emoji: '🎭', archetype: 'lore' }
  },
  {
    id: 'cpgpl_3',
    matchup: 'pulse_glow_vs_pulse_lore',
    primary: 'pulse',
    text: 'Someone disagrees with your take:',
    optionA: { text: '⚡ Debate until you win', emoji: '⚡', archetype: 'glow' },
    optionB: { text: '💫 Passionately explain why you love it', emoji: '💫', archetype: 'lore' }
  },
  {
    id: 'cpgpl_4',
    matchup: 'pulse_glow_vs_pulse_lore',
    primary: 'pulse',
    text: 'Your social currency is:',
    optionA: { text: '🚀 Being first and being the best', emoji: '🚀', archetype: 'glow' },
    optionB: { text: '🔔 Having the best recommendations', emoji: '🔔', archetype: 'lore' }
  },
  {
    id: 'cpgpl_5',
    matchup: 'pulse_glow_vs_pulse_lore',
    primary: 'pulse',
    text: 'Better flex:',
    optionA: { text: '🎖️ Being recognized as elite at something', emoji: '🎖️', archetype: 'glow' },
    optionB: { text: '🎪 Converting someone into a lifelong fan', emoji: '🎪', archetype: 'lore' }
  },

  // Pulse/Cozy vs Pulse/Lore
  {
    id: 'cppcpl_1',
    matchup: 'pulse_cozy_vs_pulse_lore',
    primary: 'pulse',
    text: 'When introducing friends:',
    optionA: { text: '🤗 Make sure they feel comfortable first', emoji: '🤗', archetype: 'cozy' },
    optionB: { text: '🎬 Connect them over a shared obsession', emoji: '🎬', archetype: 'lore' }
  },
  {
    id: 'cppcpl_2',
    matchup: 'pulse_cozy_vs_pulse_lore',
    primary: 'pulse',
    text: 'At a social event, you\'re known for:',
    optionA: { text: '💚 Pulling in the person on the edges', emoji: '💚', archetype: 'cozy' },
    optionB: { text: '🌟 Getting everyone excited about your interests', emoji: '🌟', archetype: 'lore' }
  },
  {
    id: 'cppcpl_3',
    matchup: 'pulse_cozy_vs_pulse_lore',
    primary: 'pulse',
    text: 'Someone\'s having a rough week:',
    optionA: { text: '🩹 Create a safe space and listen', emoji: '🩹', archetype: 'cozy' },
    optionB: { text: '📖 Share something that helped you through it', emoji: '📖', archetype: 'lore' }
  },
  {
    id: 'cppcpl_4',
    matchup: 'pulse_cozy_vs_pulse_lore',
    primary: 'pulse',
    text: 'Building a friend group, you prioritize:',
    optionA: { text: '🔥 Everyone feeling like they belong', emoji: '🔥', archetype: 'cozy' },
    optionB: { text: '💭 Everyone getting each other\'s references', emoji: '💭', archetype: 'lore' }
  },
  {
    id: 'cppcpl_5',
    matchup: 'pulse_cozy_vs_pulse_lore',
    primary: 'pulse',
    text: 'Your group chat energy:',
    optionA: { text: '🫂 Supportive - you remember everyone\'s stuff', emoji: '🫂', archetype: 'cozy' },
    optionB: { text: '📢 Evangelical - always sharing finds', emoji: '📢', archetype: 'lore' }
  },

  // ─── Glow Primary (20) ───

  // Glow/Pulse vs Glow/Cozy
  {
    id: 'cggpgc_1',
    matchup: 'glow_pulse_vs_glow_cozy',
    primary: 'glow',
    text: 'Self-improvement happens:',
    optionA: { text: '👥 With a team pushing each other', emoji: '👥', archetype: 'pulse' },
    optionB: { text: '🌱 At your own pace, consistently', emoji: '🌱', archetype: 'cozy' }
  },
  {
    id: 'cggpgc_2',
    matchup: 'glow_pulse_vs_glow_cozy',
    primary: 'glow',
    text: 'Progress looks like:',
    optionA: { text: '📊 Everyone leveling up under your lead', emoji: '📊', archetype: 'pulse' },
    optionB: { text: '📈 Quiet, steady growth you track privately', emoji: '📈', archetype: 'cozy' }
  },
  {
    id: 'cggpgc_3',
    matchup: 'glow_pulse_vs_glow_cozy',
    primary: 'glow',
    text: 'Goal gets tough. You:',
    optionA: { text: '🎯 Rally your crew to push through', emoji: '🎯', archetype: 'pulse' },
    optionB: { text: '🧘 Trust the process and stay the course', emoji: '🧘', archetype: 'cozy' }
  },
  {
    id: 'cggpgc_4',
    matchup: 'glow_pulse_vs_glow_cozy',
    primary: 'glow',
    text: 'When a friend struggles:',
    optionA: { text: '🤝 Jump in to motivate and coordinate', emoji: '🤝', archetype: 'pulse' },
    optionB: { text: '💭 Share what worked, give them space', emoji: '💭', archetype: 'cozy' }
  },
  {
    id: 'cggpgc_5',
    matchup: 'glow_pulse_vs_glow_cozy',
    primary: 'glow',
    text: 'Celebrating wins looks like:',
    optionA: { text: '🏆 Making sure the team knows what they achieved', emoji: '🏆', archetype: 'pulse' },
    optionB: { text: '🌿 Feeling grateful for the growth itself', emoji: '🌿', archetype: 'cozy' }
  },

  // Glow/Pulse vs Glow/Lore
  {
    id: 'cggpgl_1',
    matchup: 'glow_pulse_vs_glow_lore',
    primary: 'glow',
    text: 'Learning something new, you:',
    optionA: { text: '👨‍🏫 Get others to learn with you', emoji: '👨‍🏫', archetype: 'pulse' },
    optionB: { text: '📚 Deep dive alone until mastered', emoji: '📚', archetype: 'lore' }
  },
  {
    id: 'cggpgl_2',
    matchup: 'glow_pulse_vs_glow_lore',
    primary: 'glow',
    text: 'Skill-building motivates you because:',
    optionA: { text: '🎖️ Want to lead and inspire others', emoji: '🎖️', archetype: 'pulse' },
    optionB: { text: '🔬 Understanding the mechanics is the reward', emoji: '🔬', archetype: 'lore' }
  },
  {
    id: 'cggpgl_3',
    matchup: 'glow_pulse_vs_glow_lore',
    primary: 'glow',
    text: 'Ideal project involves:',
    optionA: { text: '🏗️ Delegating and coordinating a team', emoji: '🏗️', archetype: 'pulse' },
    optionB: { text: '🎯 Perfecting every detail yourself', emoji: '🎯', archetype: 'lore' }
  },
  {
    id: 'cggpgl_4',
    matchup: 'glow_pulse_vs_glow_lore',
    primary: 'glow',
    text: 'When you get really into something:',
    optionA: { text: '📣 You become the expert people consult', emoji: '📣', archetype: 'pulse' },
    optionB: { text: '📖 Study it obsessively - meta and all', emoji: '📖', archetype: 'lore' }
  },
  {
    id: 'cggpgl_5',
    matchup: 'glow_pulse_vs_glow_lore',
    primary: 'glow',
    text: 'Success feels most like:',
    optionA: { text: '👑 Others rallying around your vision', emoji: '👑', archetype: 'pulse' },
    optionB: { text: '🏅 Knowing you\'re genuinely the best', emoji: '🏅', archetype: 'lore' }
  },

  // Glow/Cozy vs Glow/Lore
  {
    id: 'cggcgl_1',
    matchup: 'glow_cozy_vs_glow_lore',
    primary: 'glow',
    text: 'Your learning style:',
    optionA: { text: '🧩 Build habits that feel sustainable', emoji: '🧩', archetype: 'cozy' },
    optionB: { text: '🔍 Analyze every system and framework', emoji: '🔍', archetype: 'lore' }
  },
  {
    id: 'cggcgl_2',
    matchup: 'glow_cozy_vs_glow_lore',
    primary: 'glow',
    text: 'When you hit a plateau:',
    optionA: { text: '🌊 Adjust and find new joy', emoji: '🌊', archetype: 'cozy' },
    optionB: { text: '🧬 Study the meta to optimize', emoji: '🧬', archetype: 'lore' }
  },
  {
    id: 'cggcgl_3',
    matchup: 'glow_cozy_vs_glow_lore',
    primary: 'glow',
    text: 'Work ethic is known for:',
    optionA: { text: '🌱 Consistency and care in what you touch', emoji: '🌱', archetype: 'cozy' },
    optionB: { text: '⚙️ Technical excellence and precision', emoji: '⚙️', archetype: 'lore' }
  },
  {
    id: 'cggcgl_4',
    matchup: 'glow_cozy_vs_glow_lore',
    primary: 'glow',
    text: 'Mastery means:',
    optionA: { text: '💚 Growing aligned with your values', emoji: '💚', archetype: 'cozy' },
    optionB: { text: '🏆 Complete understanding of the system', emoji: '🏆', archetype: 'lore' }
  },
  {
    id: 'cggcgl_5',
    matchup: 'glow_cozy_vs_glow_lore',
    primary: 'glow',
    text: 'Self-improvement notes are mostly:',
    optionA: { text: '📝 Reflections, gratitude, intentions', emoji: '📝', archetype: 'cozy' },
    optionB: { text: '📊 Data, benchmarks, optimization', emoji: '📊', archetype: 'lore' }
  },

  // ─── Cozy Primary (20) ───

  // Cozy/Pulse vs Cozy/Glow
  {
    id: 'cccpcg_1',
    matchup: 'cozy_pulse_vs_cozy_glow',
    primary: 'cozy',
    text: 'Ideal gathering has:',
    optionA: { text: '🎉 Energy, laughter, spontaneity', emoji: '🎉', archetype: 'pulse' },
    optionB: { text: '🕯️ Intention, depth, real conversation', emoji: '🕯️', archetype: 'glow' }
  },
  {
    id: 'cccpcg_2',
    matchup: 'cozy_pulse_vs_cozy_glow',
    primary: 'cozy',
    text: 'Comfort means:',
    optionA: { text: '👫 Surrounded by energizing people', emoji: '👫', archetype: 'pulse' },
    optionB: { text: '🛁 Rituals that nourish you daily', emoji: '🛁', archetype: 'glow' }
  },
  {
    id: 'cccpcg_3',
    matchup: 'cozy_pulse_vs_cozy_glow',
    primary: 'cozy',
    text: 'When you host, the goal:',
    optionA: { text: '✨ People leave energized and connected', emoji: '✨', archetype: 'pulse' },
    optionB: { text: '🏡 Everyone feels truly seen and safe', emoji: '🏡', archetype: 'glow' }
  },
  {
    id: 'cccpcg_4',
    matchup: 'cozy_pulse_vs_cozy_glow',
    primary: 'cozy',
    text: 'Building closeness, you:',
    optionA: { text: '🔗 Get people talking and laughing', emoji: '🔗', archetype: 'pulse' },
    optionB: { text: '💌 Create quiet moments for vulnerability', emoji: '💌', archetype: 'glow' }
  },
  {
    id: 'cccpcg_5',
    matchup: 'cozy_pulse_vs_cozy_glow',
    primary: 'cozy',
    text: 'Perfect evening involves:',
    optionA: { text: '🌙 Spontaneous adventures with close friends', emoji: '🌙', archetype: 'pulse' },
    optionB: { text: '📖 Deep one-on-one and intentional time', emoji: '📖', archetype: 'glow' }
  },

  // Cozy/Pulse vs Cozy/Lore
  {
    id: 'cccpcl_1',
    matchup: 'cozy_pulse_vs_cozy_lore',
    primary: 'cozy',
    text: 'When you recommend something:',
    optionA: { text: '🎪 Get excited and want everyone to try', emoji: '🎪', archetype: 'pulse' },
    optionB: { text: '🎨 Thoughtfully match it to the person', emoji: '🎨', archetype: 'lore' }
  },
  {
    id: 'cccpcl_2',
    matchup: 'cozy_pulse_vs_cozy_lore',
    primary: 'cozy',
    text: 'Your taste is defined by:',
    optionA: { text: '👥 Loving things that bring people together', emoji: '👥', archetype: 'pulse' },
    optionB: { text: '📐 Having refined, discerning preferences', emoji: '📐', archetype: 'lore' }
  },
  {
    id: 'cccpcl_3',
    matchup: 'cozy_pulse_vs_cozy_lore',
    primary: 'cozy',
    text: 'Cozy night in looks like:',
    optionA: { text: '🥳 Group hangout with snacks and vibes', emoji: '🥳', archetype: 'pulse' },
    optionB: { text: '🎬 Curated solo experience - perfect movie', emoji: '🎬', archetype: 'lore' }
  },
  {
    id: 'cccpcl_4',
    matchup: 'cozy_pulse_vs_cozy_lore',
    primary: 'cozy',
    text: 'When sharing something you love:',
    optionA: { text: '🎤 Tell the story with infectious energy', emoji: '🎤', archetype: 'pulse' },
    optionB: { text: '📚 Explain exactly why it\'s brilliant', emoji: '📚', archetype: 'lore' }
  },
  {
    id: 'cccpcl_5',
    matchup: 'cozy_pulse_vs_cozy_lore',
    primary: 'cozy',
    text: 'Bond with people over:',
    optionA: { text: '🤗 Shared warmth and making memories', emoji: '🤗', archetype: 'pulse' },
    optionB: { text: '🖼️ Shared taste and discovering hidden gems', emoji: '🖼️', archetype: 'lore' }
  },

  // Cozy/Glow vs Cozy/Lore
  {
    id: 'cccgcl_1',
    matchup: 'cozy_glow_vs_cozy_lore',
    primary: 'cozy',
    text: 'Your growth journey is:',
    optionA: { text: '🌿 Holistic - body, mind, relationships', emoji: '🌿', archetype: 'glow' },
    optionB: { text: '📖 Intellectual - subjects that fascinate you', emoji: '📖', archetype: 'lore' }
  },
  {
    id: 'cccgcl_2',
    matchup: 'cozy_glow_vs_cozy_lore',
    primary: 'cozy',
    text: 'Comfort comes from:',
    optionA: { text: '🧘 Aligned living and mindful practices', emoji: '🧘', archetype: 'glow' },
    optionB: { text: '🎭 Appreciating beautiful, meaningful things', emoji: '🎭', archetype: 'lore' }
  },
  {
    id: 'cccgcl_3',
    matchup: 'cozy_glow_vs_cozy_lore',
    primary: 'cozy',
    text: 'Discover something new:',
    optionA: { text: '💚 See how it fits into your values', emoji: '💚', archetype: 'glow' },
    optionB: { text: '👁️ Analyze and appreciate its artistry', emoji: '👁️', archetype: 'lore' }
  },
  {
    id: 'cccgcl_4',
    matchup: 'cozy_glow_vs_cozy_lore',
    primary: 'cozy',
    text: 'Depth means:',
    optionA: { text: '🌱 Understanding yourself more fully', emoji: '🌱', archetype: 'glow' },
    optionB: { text: '🔬 Understanding how things really work', emoji: '🔬', archetype: 'lore' }
  },
  {
    id: 'cccgcl_5',
    matchup: 'cozy_glow_vs_cozy_lore',
    primary: 'cozy',
    text: 'Building long-term:',
    optionA: { text: '🏛️ A life that feels intentional and grounded', emoji: '🏛️', archetype: 'glow' },
    optionB: { text: '🗂️ A refined collection and worldview', emoji: '🗂️', archetype: 'lore' }
  },

  // ─── Lore Primary (20) ───

  // Lore/Pulse vs Lore/Glow
  {
    id: 'cllplg_1',
    matchup: 'lore_pulse_vs_lore_glow',
    primary: 'lore',
    text: 'Deep in your thing:',
    optionA: { text: '🎬 Community and shared experience matter most', emoji: '🎬', archetype: 'pulse' },
    optionB: { text: '📋 Getting every detail perfect matters most', emoji: '📋', archetype: 'glow' }
  },
  {
    id: 'cllplg_2',
    matchup: 'lore_pulse_vs_lore_glow',
    primary: 'lore',
    text: 'Obsessions fueled by:',
    optionA: { text: '🎪 Energy of doing it together', emoji: '🎪', archetype: 'pulse' },
    optionB: { text: '🏆 Drive to master and complete it', emoji: '🏆', archetype: 'glow' }
  },
  {
    id: 'cllplg_3',
    matchup: 'lore_pulse_vs_lore_glow',
    primary: 'lore',
    text: 'In your niche, known as:',
    optionA: { text: '🎤 The hype person who runs events', emoji: '🎤', archetype: 'pulse' },
    optionB: { text: '🧠 The one who knows EVERYTHING', emoji: '🧠', archetype: 'glow' }
  },
  {
    id: 'cllplg_4',
    matchup: 'lore_pulse_vs_lore_glow',
    primary: 'lore',
    text: 'New series drops. You:',
    optionA: { text: '👥 Start a watch party immediately', emoji: '👥', archetype: 'pulse' },
    optionB: { text: '📊 Create a comprehensive guide and tier', emoji: '📊', archetype: 'glow' }
  },
  {
    id: 'cllplg_5',
    matchup: 'lore_pulse_vs_lore_glow',
    primary: 'lore',
    text: 'Ultimate flex:',
    optionA: { text: '🌟 Getting people obsessed through your energy', emoji: '🌟', archetype: 'pulse' },
    optionB: { text: '💯 Having 100%\'d it harder than anyone', emoji: '💯', archetype: 'glow' }
  },

  // Lore/Pulse vs Lore/Cozy
  {
    id: 'cllplc_1',
    matchup: 'lore_pulse_vs_lore_cozy',
    primary: 'lore',
    text: 'Favorite fandom moment:',
    optionA: { text: '🎉 Live event where everyone loses it', emoji: '🎉', archetype: 'pulse' },
    optionB: { text: '💫 Scene that made you feel deeply understood', emoji: '💫', archetype: 'cozy' }
  },
  {
    id: 'cllplc_2',
    matchup: 'lore_pulse_vs_lore_cozy',
    primary: 'lore',
    text: 'When sharing lore, you:',
    optionA: { text: '🎤 Tell the story with maximum hype', emoji: '🎤', archetype: 'pulse' },
    optionB: { text: '📖 Explore what it means on deeper level', emoji: '📖', archetype: 'cozy' }
  },
  {
    id: 'cllplc_3',
    matchup: 'lore_pulse_vs_lore_cozy',
    primary: 'lore',
    text: 'Community means:',
    optionA: { text: '🔥 People bonding over shared energy and activity', emoji: '🔥', archetype: 'pulse' },
    optionB: { text: '💚 People finding comfort in shared understanding', emoji: '💚', archetype: 'cozy' }
  },
  {
    id: 'cllplc_4',
    matchup: 'lore_pulse_vs_lore_cozy',
    primary: 'lore',
    text: 'Niche obsession gives you:',
    optionA: { text: '⚡ Connection and belonging through events', emoji: '⚡', archetype: 'pulse' },
    optionB: { text: '🏡 Solace and a place to feel at home', emoji: '🏡', archetype: 'cozy' }
  },
  {
    id: 'cllplc_5',
    matchup: 'lore_pulse_vs_lore_cozy',
    primary: 'lore',
    text: 'When a friend needs help:',
    optionA: { text: '🎬 Offer escapism through group activity', emoji: '🎬', archetype: 'pulse' },
    optionB: { text: '💌 Share the story or media that helped', emoji: '💌', archetype: 'cozy' }
  },

  // Lore/Glow vs Lore/Cozy
  {
    id: 'cllglc_1',
    matchup: 'lore_glow_vs_lore_cozy',
    primary: 'lore',
    text: 'Fandom engagement is:',
    optionA: { text: '🏆 Competitive - who knows it best?', emoji: '🏆', archetype: 'glow' },
    optionB: { text: '🌿 Reflective - what does it teach you?', emoji: '🌿', archetype: 'cozy' }
  },
  {
    id: 'cllglc_2',
    matchup: 'lore_glow_vs_lore_cozy',
    primary: 'lore',
    text: 'Your collections are:',
    optionA: { text: '📊 Meticulously organized and optimized', emoji: '📊', archetype: 'glow' },
    optionB: { text: '💭 Chosen for their emotional resonance', emoji: '💭', archetype: 'cozy' }
  },
  {
    id: 'cllglc_3',
    matchup: 'lore_glow_vs_lore_cozy',
    primary: 'lore',
    text: 'Plot twist hits. You:',
    optionA: { text: '🔎 Immediately theorize and analyze', emoji: '🔎', archetype: 'glow' },
    optionB: { text: '✨ Sit with how it makes you feel', emoji: '✨', archetype: 'cozy' }
  },
  {
    id: 'cllglc_4',
    matchup: 'lore_glow_vs_lore_cozy',
    primary: 'lore',
    text: 'Expertise comes from:',
    optionA: { text: '📚 Studying guides, meta, obscure trivia', emoji: '📚', archetype: 'glow' },
    optionB: { text: '🎬 Rewatching, rereading, connecting deeply', emoji: '🎬', archetype: 'cozy' }
  },
  {
    id: 'cllglc_5',
    matchup: 'lore_glow_vs_lore_cozy',
    primary: 'lore',
    text: 'What draws you to your obsession:',
    optionA: { text: '🎯 Satisfaction of mastery and completion', emoji: '🎯', archetype: 'glow' },
    optionB: { text: '💫 Emotional wisdom it offers', emoji: '💫', archetype: 'cozy' }
  }
];

// ═══════════════════════════════════════════════════════════════════════════════════
// PHASE 3: MIRROR QUESTIONS (30)
// Testing which direction feels more true when archetypes are flipped
// ═══════════════════════════════════════════════════════════════════════════════════

export const MIRROR_QUESTIONS: MirrorQuestion[] = [
  // ─── Pair 1: Pulse/Glow vs Glow/Pulse ───
  {
    id: 'mirror_pg_1',
    mirrorPair: 'pulse_glow',
    text: 'You throw a party. Energy centers on:',
    optionA: { text: '🎤 Me - everyone wants my attention', emoji: '🎤', direction: 'asIs' },
    optionB: { text: '👥 The team - making sure bonds deepen', emoji: '👥', direction: 'flipped' }
  },
  {
    id: 'mirror_pg_2',
    mirrorPair: 'pulse_glow',
    text: 'Friends rely on you for:',
    optionA: { text: '🌟 The main character energy and hype', emoji: '🌟', direction: 'asIs' },
    optionB: { text: '🏆 Keeping everyone leveled up together', emoji: '🏆', direction: 'flipped' }
  },
  {
    id: 'mirror_pg_3',
    mirrorPair: 'pulse_glow',
    text: 'When you win at something:',
    optionA: { text: '✨ You want everyone to know', emoji: '✨', direction: 'asIs' },
    optionB: { text: '🎯 You want your crew to feel the win', emoji: '🎯', direction: 'flipped' }
  },
  {
    id: 'mirror_pg_4',
    mirrorPair: 'pulse_glow',
    text: 'Group chat when plans are happening:',
    optionA: { text: '🔥 You\'re the one people comment "show off" on', emoji: '🔥', direction: 'asIs' },
    optionB: { text: '🤝 You\'re the one organizing logistics', emoji: '🤝', direction: 'flipped' }
  },
  {
    id: 'mirror_pg_5',
    mirrorPair: 'pulse_glow',
    text: 'What makes a night legendary:',
    optionA: { text: '🎪 I was the reason it was unforgettable', emoji: '🎪', direction: 'asIs' },
    optionB: { text: '👑 We all became better versions that night', emoji: '👑', direction: 'flipped' }
  },

  // ─── Pair 2: Pulse/Cozy vs Cozy/Pulse ───
  {
    id: 'mirror_pc_1',
    mirrorPair: 'pulse_cozy',
    text: 'Your warmth shows up as:',
    optionA: { text: '🌍 Me showing up and instantly warming any room', emoji: '🌍', direction: 'asIs' },
    optionB: { text: '🏡 A home where people want to stay', emoji: '🏡', direction: 'flipped' }
  },
  {
    id: 'mirror_pc_2',
    mirrorPair: 'pulse_cozy',
    text: 'After hanging with you, people feel:',
    optionA: { text: '💫 More energized than before', emoji: '💫', direction: 'asIs' },
    optionB: { text: '🛋️ More at home than before', emoji: '🛋️', direction: 'flipped' }
  },
  {
    id: 'mirror_pc_3',
    mirrorPair: 'pulse_cozy',
    text: 'Hosting vs showing up:',
    optionA: { text: '🚗 I\'d rather roll through and spread vibes', emoji: '🚗', direction: 'asIs' },
    optionB: { text: '🕯️ I\'d rather people come over on purpose', emoji: '🕯️', direction: 'flipped' }
  },
  {
    id: 'mirror_pc_4',
    mirrorPair: 'pulse_cozy',
    text: 'When someone\'s down:',
    optionA: { text: '💗 Drag them out somewhere fun and warm them up', emoji: '💗', direction: 'asIs' },
    optionB: { text: '🍵 Invite them over and make them feel held', emoji: '🍵', direction: 'flipped' }
  },
  {
    id: 'mirror_pc_5',
    mirrorPair: 'pulse_cozy',
    text: 'You\'re known for creating:',
    optionA: { text: '✨ Warmth and fun wherever you go', emoji: '✨', direction: 'asIs' },
    optionB: { text: '🏠 A space that feels like a safe harbor', emoji: '🏠', direction: 'flipped' }
  },

  // ─── Pair 3: Pulse/Lore vs Lore/Pulse ───
  {
    id: 'mirror_pl_1',
    mirrorPair: 'pulse_lore',
    text: 'Good taste comes from:',
    optionA: { text: '🎵 Living out in the world finding things', emoji: '🎵', direction: 'asIs' },
    optionB: { text: '📖 Deep diving and ranking everything', emoji: '📖', direction: 'flipped' }
  },
  {
    id: 'mirror_pl_2',
    mirrorPair: 'pulse_lore',
    text: 'When you find something you love:',
    optionA: { text: '🌟 Casually drop it in convo, people follow', emoji: '🌟', direction: 'asIs' },
    optionB: { text: '🎬 Write a whole thing about why it slaps', emoji: '🎬', direction: 'flipped' }
  },
  {
    id: 'mirror_pl_3',
    mirrorPair: 'pulse_lore',
    text: 'Your recommendations hit because:',
    optionA: { text: '✨ You just seem to naturally know what\'s cool', emoji: '✨', direction: 'asIs' },
    optionB: { text: '🎤 You\'re so passionate about it', emoji: '🎤', direction: 'flipped' }
  },
  {
    id: 'mirror_pl_4',
    mirrorPair: 'pulse_lore',
    text: 'At trivia night, you:',
    optionA: { text: '🏃 Know random stuff from experience', emoji: '🏃', direction: 'asIs' },
    optionB: { text: '📊 Actually studied pop culture meta', emoji: '📊', direction: 'flipped' }
  },
  {
    id: 'mirror_pl_5',
    mirrorPair: 'pulse_lore',
    text: 'When obsessed with something new:',
    optionA: { text: '🚀 Keep finding new things like it', emoji: '🚀', direction: 'asIs' },
    optionB: { text: '🧠 Master every detail and theory', emoji: '🧠', direction: 'flipped' }
  },

  // ─── Pair 4: Glow/Cozy vs Cozy/Glow ───
  {
    id: 'mirror_gc_1',
    mirrorPair: 'glow_cozy',
    text: 'You track progress by:',
    optionA: { text: '💪 Morning run then meal prep', emoji: '💪', direction: 'asIs' },
    optionB: { text: '🧘 Morning run that became friend group', emoji: '🧘', direction: 'flipped' }
  },
  {
    id: 'mirror_gc_2',
    mirrorPair: 'glow_cozy',
    text: 'Growth feels good when:',
    optionA: { text: '📈 You set it as a goal, then do it kindly', emoji: '📈', direction: 'asIs' },
    optionB: { text: '🏡 It happens naturally through living well', emoji: '🏡', direction: 'flipped' }
  },
  {
    id: 'mirror_gc_3',
    mirrorPair: 'glow_cozy',
    text: 'Your accountability system is:',
    optionA: { text: '🎯 "Let\'s both get better" conversations', emoji: '🎯', direction: 'asIs' },
    optionB: { text: '☕ "Want to walk together?" routines', emoji: '☕', direction: 'flipped' }
  },
  {
    id: 'mirror_gc_4',
    mirrorPair: 'glow_cozy',
    text: 'Rest means:',
    optionA: { text: '💚 Earned after work, guilt-free downtime', emoji: '💚', direction: 'asIs' },
    optionB: { text: '🛌 Just part of taking care of yourself', emoji: '🛌', direction: 'flipped' }
  },
  {
    id: 'mirror_gc_5',
    mirrorPair: 'glow_cozy',
    text: 'Your biggest achievement felt like:',
    optionA: { text: '🏆 Reaching a goal I set intentionally', emoji: '🏆', direction: 'asIs' },
    optionB: { text: '🌿 A natural result of living aligned', emoji: '🌿', direction: 'flipped' }
  },

  // ─── Pair 5: Glow/Lore vs Lore/Glow ───
  {
    id: 'mirror_gl_1',
    mirrorPair: 'glow_lore',
    text: 'Learning something new, you:',
    optionA: { text: '🔬 Read reviews, find the best way to start', emoji: '🔬', direction: 'asIs' },
    optionB: { text: '🎮 Jump in and learn every single mechanic', emoji: '🎮', direction: 'flipped' }
  },
  {
    id: 'mirror_gl_2',
    mirrorPair: 'glow_lore',
    text: 'Your YouTube history is:',
    optionA: { text: '📊 "How to get better at X" tutorials', emoji: '📊', direction: 'asIs' },
    optionB: { text: '🏅 "X explained - every detail" 3-hour videos', emoji: '🏅', direction: 'flipped' }
  },
  {
    id: 'mirror_gl_3',
    mirrorPair: 'glow_lore',
    text: 'When you really like something:',
    optionA: { text: '⚙️ Optimize how you do it', emoji: '⚙️', direction: 'asIs' },
    optionB: { text: '📚 100% every aspect of it', emoji: '📚', direction: 'flipped' }
  },
  {
    id: 'mirror_gl_4',
    mirrorPair: 'glow_lore',
    text: 'Knowledge feels useful when:',
    optionA: { text: '🎯 It makes you better at life stuff', emoji: '🎯', direction: 'asIs' },
    optionB: { text: '🧠 Understanding it is the whole point', emoji: '🧠', direction: 'flipped' }
  },
  {
    id: 'mirror_gl_5',
    mirrorPair: 'glow_lore',
    text: 'Video games, you play to:',
    optionA: { text: '🏃 Speed-run efficiently and win', emoji: '🏃', direction: 'asIs' },
    optionB: { text: '👑 Find all secrets and beat all difficulties', emoji: '👑', direction: 'flipped' }
  },

  // ─── Pair 6: Cozy/Lore vs Lore/Cozy ───
  {
    id: 'mirror_cl_1',
    mirrorPair: 'cozy_lore',
    text: 'Your vibe when sharing media:',
    optionA: { text: '🎨 "Check out this aesthetic, the whole world"', emoji: '🎨', direction: 'asIs' },
    optionB: { text: '💭 "This scene changed how I see life"', emoji: '💭', direction: 'flipped' }
  },
  {
    id: 'mirror_cl_2',
    mirrorPair: 'cozy_lore',
    text: 'Your bookshelf is curated for:',
    optionA: { text: '📚 The spines look beautiful together', emoji: '📚', direction: 'asIs' },
    optionB: { text: '🧘 The wisdom inside each one', emoji: '🧘', direction: 'flipped' }
  },
  {
    id: 'mirror_cl_3',
    mirrorPair: 'cozy_lore',
    text: 'Someone asks "who are you":',
    optionA: { text: '✨ "I curate beautiful things I love"', emoji: '✨', direction: 'asIs' },
    optionB: { text: '🌟 "Stories taught me how to feel"', emoji: '🌟', direction: 'flipped' }
  },
  {
    id: 'mirror_cl_4',
    mirrorPair: 'cozy_lore',
    text: 'Anime or shows you love:',
    optionA: { text: '🎬 You make fan edits and aesthetics', emoji: '🎬', direction: 'asIs' },
    optionB: { text: '💡 You rewatch to understand the character depth', emoji: '💡', direction: 'flipped' }
  },
  {
    id: 'mirror_cl_5',
    mirrorPair: 'cozy_lore',
    text: 'When sad, you turn to your thing:',
    optionA: { text: '🕯️ The comfort of the familiar vibe', emoji: '🕯️', direction: 'asIs' },
    optionB: { text: '🌙 The wisdom that made you feel less alone', emoji: '🌙', direction: 'flipped' }
  }
];
