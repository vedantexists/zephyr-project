import { DISH_LEXICON } from './lexicon';

export interface ExtractedEntities {
  language: 'English' | 'Hinglish' | 'Hindi';
  dishes: string[];
  times: string[];
  tags: string[];
  severity: 'low' | 'medium' | 'high';
}

const TIME_REGEX = /\b(\d{1,2}:\d{2}\s*(?:am|pm)?|after\s*\d{1,2}(?::\d{2})?|\d{1,2}\s*(?:am|pm))\b/gi;

// Distinctive Hindi/Hinglish grammatical markers (not culinary nouns like dal/chapati)
const HINGLISH_GRAMMAR_MARKERS = new Set([
  'me', 'tha', 'thi', 'nahi', 'khatam', 'gaye', 'gaya', 'pe', 'bilkul', 
  'ka', 'ki', 'ke', 'aur', 'bahut', 'jyada', 'kam', 'karo', 'karein', 
  'aaj', 'jaisi', 'wala', 'wali', 'kuch', 'hoga', 'raha', 'rahi', 'dekh'
]);

/**
 * Extracts entities, dishes, times, tags, and language from a comment.
 */
export function extractEntities(text?: string, quickTags: string[] = []): ExtractedEntities {
  if (!text || text.trim().length === 0) {
    return {
      language: 'English',
      dishes: [],
      times: [],
      tags: quickTags,
      severity: quickTags.some(t => t.includes('Stockout') || t.includes('Unclean')) ? 'high' : 'medium'
    };
  }

  const lower = text.toLowerCase();

  // 1. Language detection: count distinct grammatical Hindi markers
  const words = lower.replace(/[^\w\s]/g, '').split(/\s+/);
  let hinglishCount = 0;
  for (const w of words) {
    if (HINGLISH_GRAMMAR_MARKERS.has(w)) {
      hinglishCount++;
    }
  }
  const language: 'English' | 'Hinglish' | 'Hindi' = hinglishCount >= 2 ? 'Hinglish' : 'English';

  // 2. Times extraction
  const timeMatches = text.match(TIME_REGEX) || [];
  const times = Array.from(new Set(timeMatches.map(t => t.trim())));

  // 3. Dish extraction
  const dishes: string[] = [];
  if (lower.includes('chawal') || lower.includes('rice')) dishes.push('Rice');
  if (lower.includes('chole') || lower.includes('chhole')) dishes.push('Chole');
  if (lower.includes('dal') || lower.includes('daal')) dishes.push('Dal');
  if (lower.includes('chapati') || lower.includes('roti')) dishes.push('Chapati');
  if (lower.includes('dosa')) dishes.push('Dosa');
  if (lower.includes('sambar') || lower.includes('sambhar')) dishes.push('Sambar');
  if (lower.includes('paneer')) dishes.push('Paneer Butter Masala');
  if (lower.includes('coffee')) dishes.push('Filter Coffee');

  // Also check standard dish lexicon
  for (const dish of DISH_LEXICON) {
    if (lower.includes(dish.toLowerCase()) && !dishes.includes(dish)) {
      dishes.push(dish);
    }
  }

  // 4. Tag mapping
  const tags = new Set<string>(quickTags);

  // Taste tags
  if (lower.includes('watery') || lower.includes('paani') || lower.includes('pani') || lower.includes('thin')) {
    tags.add('Taste: Poor');
    tags.add('Consistency: Watery');
  }
  if (lower.includes('cold') || lower.includes('thandi') || lower.includes('thanda') || lower.includes('hard') || lower.includes('cardboard')) {
    tags.add('Temp: Cold');
  }
  if ((lower.includes('namak') && (lower.includes('nahi') || lower.includes('kam') || lower.includes('bilkul'))) || lower.includes('no salt') || lower.includes('bland')) {
    tags.add('Taste: Under-salted');
  }
  if (lower.includes('too salty') || lower.includes('namak jyada')) {
    tags.add('Taste: Over-salted');
  }

  // Stockout tags
  if (lower.includes('khatam') || lower.includes('ran out') || lower.includes('stockout') || lower.includes('finished')) {
    const timeStr = times[0] ? ` at ${times[0]}` : '';
    tags.add(`Quantity: Stockout${timeStr}`);
    tags.add('Stockout');
    tags.add('Refill Delay');
  }

  // Queue / Hygiene
  if (lower.includes('queue') || lower.includes('line') || lower.includes('wait') || lower.includes('bheed')) {
    tags.add('Delay: Queue');
  }
  if (lower.includes('unclean') || lower.includes('dirty') || lower.includes('hair') || lower.includes('ganda')) {
    tags.add('Hygiene: Issue');
  }
  if (lower.includes('delicious') || lower.includes('lajawab') || lower.includes('loved') || lower.includes('crispy') || lower.includes('amazing')) {
    tags.add('Positive: Loved');
  }

  // 5. Severity determination
  let severity: 'low' | 'medium' | 'high' = 'medium';
  if (tags.has('Stockout') || Array.from(tags).some(t => t.includes('Stockout')) || tags.has('Hygiene: Issue')) {
    severity = 'high';
  } else if (tags.has('Positive: Loved')) {
    severity = 'low';
  } else if (tags.has('Temp: Cold') || tags.has('Taste: Poor') || tags.has('Taste: Under-salted')) {
    severity = 'high';
  }

  return {
    language,
    dishes,
    times,
    tags: Array.from(tags),
    severity
  };
}
