import type { Pillar, Meal } from '../types';

export interface CommentTemplate {
  id: string;
  text: string;
  pillar: Pillar;
  meal?: Meal;
  dish?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  language: 'English' | 'Hinglish';
}

export const COMMENT_TEMPLATES: CommentTemplate[] = [
  // --- TASTE & TEMPERATURE (TUESDAY DINNER EMPHASIS) ---
  {
    id: 't-tue-1',
    text: 'Dal was too watery and chapati was cold and hard after 8:30.',
    pillar: 'taste',
    meal: 'Dinner',
    dish: 'Dal Tadka & Chapati',
    rating: 2,
    language: 'English'
  },
  {
    id: 't-tue-2',
    text: 'Rotis are like cardboard after 8:45, and dal has zero thickness.',
    pillar: 'taste',
    meal: 'Dinner',
    dish: 'Dal & Roti',
    rating: 2,
    language: 'English'
  },
  {
    id: 't-tue-3',
    text: 'Watery dal again. Bain-marie heater was turned off early.',
    pillar: 'taste',
    meal: 'Dinner',
    dish: 'Dal Tadka',
    rating: 2,
    language: 'English'
  },
  {
    id: 't-tue-4',
    text: 'Dal paani jaisi thi, chapati thandi ho chuki thi dinner me.',
    pillar: 'taste',
    meal: 'Dinner',
    dish: 'Dal & Chapati',
    rating: 2,
    language: 'Hinglish'
  },
  {
    id: 't-tue-5',
    text: 'Chapatis cold as ice after 8:30 pm, very difficult to chew.',
    pillar: 'taste',
    meal: 'Dinner',
    dish: 'Chapati',
    rating: 2,
    language: 'English'
  },
  {
    id: 't-tue-6',
    text: 'Roti hard ho gayi thi and dal me tadka nahi tha.',
    pillar: 'taste',
    meal: 'Dinner',
    dish: 'Dal & Roti',
    rating: 2,
    language: 'Hinglish'
  },
  {
    id: 't-tue-7',
    text: 'Dal was diluted with warm water, completely lost flavor.',
    pillar: 'taste',
    meal: 'Dinner',
    dish: 'Dal Tadka',
    rating: 1,
    language: 'English'
  },
  {
    id: 't-tue-8',
    text: 'Chapati was stiff and brittle, not kept in warmers.',
    pillar: 'taste',
    meal: 'Dinner',
    dish: 'Chapati',
    rating: 2,
    language: 'English'
  },

  // --- STOCKOUT & UNDER-SALT (WEDNESDAY LUNCH EMPHASIS) ---
  {
    id: 't-wed-1',
    text: 'Chole me namak bilkul nahi tha aur chawal khatam ho gaye the 1:15 pm pe.',
    pillar: 'stockout',
    meal: 'Lunch',
    dish: 'Chole & Steamed Rice',
    rating: 1,
    language: 'Hinglish'
  },
  {
    id: 't-wed-2',
    text: 'Rice completely finished by 1:20 PM! Had to wait 20 minutes for batch refill.',
    pillar: 'stockout',
    meal: 'Lunch',
    dish: 'Steamed Rice',
    rating: 1,
    language: 'English'
  },
  {
    id: 't-wed-3',
    text: 'Chole gravy had no salt at all, totally bland. Refill took forever.',
    pillar: 'taste',
    meal: 'Lunch',
    dish: 'Chole',
    rating: 1,
    language: 'English'
  },
  {
    id: 't-wed-4',
    text: '1:15 pm pe chawal khatam ho gaye, counter staff asked to wait.',
    pillar: 'stockout',
    meal: 'Lunch',
    dish: 'Rice',
    rating: 1,
    language: 'Hinglish'
  },
  {
    id: 't-wed-5',
    text: 'Chole me namak bilkul kam tha, had to eat bland curry.',
    pillar: 'taste',
    meal: 'Lunch',
    dish: 'Chole',
    rating: 2,
    language: 'Hinglish'
  },
  {
    id: 't-wed-6',
    text: 'Stockout during peak lunch hour 1:15 pm. Rice container empty.',
    pillar: 'stockout',
    meal: 'Lunch',
    dish: 'Steamed Rice',
    rating: 1,
    language: 'English'
  },
  {
    id: 't-wed-7',
    text: 'Chole was totally unsalted and batch was empty by 1:25.',
    pillar: 'stockout',
    meal: 'Lunch',
    dish: 'Chole & Rice',
    rating: 1,
    language: 'English'
  },
  {
    id: 't-wed-8',
    text: 'Buffer rice supply failed at 1:15 pm today.',
    pillar: 'stockout',
    meal: 'Lunch',
    dish: 'Rice',
    rating: 1,
    language: 'English'
  },

  // --- SUNDAY SPECIAL BREAKFAST (PEAK PRAISE 4.8) ---
  {
    id: 't-sun-1',
    text: 'Sunday Dosa is phenomenal! Crispy and hot sambar.',
    pillar: 'positive',
    meal: 'Breakfast',
    dish: 'Masala Dosa & Sambar',
    rating: 5,
    language: 'English'
  },
  {
    id: 't-sun-2',
    text: 'Loved the filter coffee and coconut chutney today! Fantastic breakfast.',
    pillar: 'positive',
    meal: 'Breakfast',
    dish: 'Filter Coffee',
    rating: 5,
    language: 'English'
  },
  {
    id: 't-sun-3',
    text: 'Masala dosa hot and crispy, best meal of the week.',
    pillar: 'positive',
    meal: 'Breakfast',
    dish: 'Masala Dosa',
    rating: 5,
    language: 'English'
  },
  {
    id: 't-sun-4',
    text: 'Aaj ka breakfast lajawab tha, dosa and sambar top quality.',
    pillar: 'positive',
    meal: 'Breakfast',
    dish: 'Dosa & Sambar',
    rating: 5,
    language: 'Hinglish'
  },
  {
    id: 't-sun-5',
    text: 'Filter coffee taste was authentic South Indian, loved it.',
    pillar: 'positive',
    meal: 'Breakfast',
    dish: 'Filter Coffee',
    rating: 5,
    language: 'English'
  },

  // --- QUEUE DELAY & SERVICE ---
  {
    id: 't-q-1',
    text: 'Waited in queue for 15 minutes just to collect plates at Gate 1.',
    pillar: 'delay',
    meal: 'Lunch',
    rating: 2,
    language: 'English'
  },
  {
    id: 't-q-2',
    text: 'Bheed bahut jyada thi at counter 2, slow plate distribution.',
    pillar: 'delay',
    meal: 'Lunch',
    rating: 2,
    language: 'Hinglish'
  },
  {
    id: 't-q-3',
    text: 'Snacks distribution was backed up for 12 minutes.',
    pillar: 'delay',
    meal: 'Snacks',
    rating: 2,
    language: 'English'
  },

  // --- HYGIENE & CLEANLINESS ---
  {
    id: 't-h-1',
    text: 'Found a water tumbler that was oily and had lipstick mark.',
    pillar: 'hygiene',
    meal: 'Lunch',
    rating: 1,
    language: 'English'
  },
  {
    id: 't-h-2',
    text: 'Plates at South counter had water spots and felt greasy.',
    pillar: 'hygiene',
    meal: 'Dinner',
    rating: 2,
    language: 'English'
  },
  {
    id: 't-h-3',
    text: 'Spoons rack had leftover food residue, please sanitize.',
    pillar: 'hygiene',
    meal: 'Breakfast',
    rating: 1,
    language: 'English'
  },

  // --- PORTIONS ---
  {
    id: 't-p-1',
    text: 'Paneer curry only had 2 small cubes, portion size too small.',
    pillar: 'portion',
    meal: 'Dinner',
    dish: 'Paneer Butter Masala',
    rating: 2,
    language: 'English'
  },
  {
    id: 't-p-2',
    text: 'Sweet portion is tiny, khana kam mila.',
    pillar: 'portion',
    meal: 'Dinner',
    rating: 2,
    language: 'Hinglish'
  }
];
