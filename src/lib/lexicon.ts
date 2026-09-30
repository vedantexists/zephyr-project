import type { Pillar } from '../types';

export const HINGLISH_GLOSSARY: Record<string, string> = {
  namak: 'salt',
  khatam: 'finished stockout',
  thanda: 'cold',
  thandi: 'cold',
  chawal: 'rice',
  chole: 'chickpea curry',
  chhole: 'chickpea curry',
  dal: 'lentil soup',
  daal: 'lentil soup',
  paani: 'watery',
  pani: 'watery',
  ganda: 'dirty unclean',
  gandi: 'dirty unclean',
  kam: 'less deficient',
  bilkul: 'completely zero',
  nahi: 'not no',
  rotis: 'chapatis flatbread',
  roti: 'chapati flatbread',
  chapati: 'flatbread',
  chapatis: 'flatbreads',
  bheed: 'crowd long queue',
  rush: 'crowd rush delay',
  der: 'late delay',
  kida: 'insect hygiene',
  baal: 'hair hygiene',
  lajawab: 'delicious tasty excellent',
  badhiya: 'good tasty fresh',
  swad: 'taste flavor',
  khana: 'food meal',
  aaj: 'today'
};

export const DISH_LEXICON = [
  'Dal Tadka',
  'Dal Fry',
  'Dal',
  'Chapati',
  'Roti',
  'Chole',
  'Steamed Rice',
  'Rice',
  'Jeera Rice',
  'Masala Dosa',
  'Dosa',
  'Sambar',
  'Idli',
  'Paneer Butter Masala',
  'Aloo Gobi',
  'Poha',
  'Upma',
  'Filter Coffee'
];

export const PILLAR_PROTOTYPES: Record<Pillar, string[]> = {
  taste: [
    'food was too watery thin dal dilution',
    'chapati was cold and hard thandi roti',
    'food has no salt under-salted bland tasteless namak bilkul nahi tha',
    'food is too salty over-salted excessive spice',
    'burnt food overcooked stale taste',
    'curry was too oily greasy bland flavor'
  ],
  portion: [
    'portion size was too small not enough food',
    'very small serving khana kam mila',
    'need larger portions insufficient food for adult',
    'single scoop portion small serving'
  ],
  hygiene: [
    'unclean dirty trays plates cutlery spoons wash basin',
    'found hair insect fly dirty contamination hygiene problem',
    'plates were greasy smelly unwashed',
    'staff not wearing gloves dirty serving utensils'
  ],
  delay: [
    'long queue line waited over 15 minutes slow counter',
    'bahut lambi line thi delay in food distribution',
    'service is extremely slow peak rush waiting time',
    'dish collection queue backup long wait'
  ],
  stockout: [
    'chawal khatam ho gaye rice ran out finished stockout',
    'food finished early containers empty refill delay',
    'chole ran out before lunch rush finished 1:15 pm stockout',
    'curry ran out had to wait 20 minutes for second batch',
    'stockout protocol failure food shortage'
  ],
  positive: [
    'food was delicious tasty hot and fresh loved the meal',
    'crispy masala dosa hot sambar amazing breakfast lajawab',
    'sunday special breakfast filter coffee was fantastic',
    'great seasoning well cooked tasty dessert',
    'staff was friendly and refills were fast and generous'
  ]
};
