// Default center: New Delhi, India
export const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };
export const DEFAULT_ZOOM = 12;
export const CO2_PER_ITEM = 2.5;
export const CURRENCY_SYMBOL = '₹';

export const CATEGORIES = [
  { value: 'all', label: 'All', emoji: '🍽️' },
  { value: 'veg', label: 'Veg', emoji: '🥬' },
  { value: 'non-veg', label: 'Non-Veg', emoji: '🍗' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'dessert', label: 'Dessert', emoji: '🍮' },
  { value: 'beverage', label: 'Beverage', emoji: '☕' },
  { value: 'snack', label: 'Snack', emoji: '🥟' }
];

export const SORT_OPTIONS = [
  { value: 'ending_soon', label: 'Ending Soon' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' }
];

export const LEVEL_TITLES = {
  NOVICE: 'Novice Rescuer',
  ECO_WARRIOR: 'Eco Warrior',
  FOOD_SAVIOR: 'Food Savior',
  PLANET_GUARDIAN: 'Planet Guardian',
  LEGEND: 'ResQ Legend'
};

export const getLevelTitle = (itemsRescued) => {
  if (itemsRescued < 3) return LEVEL_TITLES.NOVICE;
  if (itemsRescued < 10) return LEVEL_TITLES.ECO_WARRIOR;
  if (itemsRescued < 25) return LEVEL_TITLES.FOOD_SAVIOR;
  if (itemsRescued < 50) return LEVEL_TITLES.PLANET_GUARDIAN;
  return LEVEL_TITLES.LEGEND;
};

export const getLevelEmoji = (itemsRescued) => {
  if (itemsRescued < 3) return '🌱';
  if (itemsRescued < 10) return '⚡';
  if (itemsRescued < 25) return '🦸';
  if (itemsRescued < 50) return '🌍';
  return '👑';
};

export const INDIAN_PARTNERS = [
  'Zomato', 'Swiggy', 'IRCTC', 'Akshaya Patra', 'Robin Hood Army',
  'Feeding India', 'No Food Waste', 'Goonj', 'Smile Foundation', 'CRY India'
];

export const TESTIMONIALS = [
  {
    name: 'Arjun Mehta',
    role: 'Student, IIT Delhi',
    text: 'ResQ-Bite has been a game changer for me. I save ₹2000+ every month on meals while helping reduce food waste. The paneer butter masala from Sharma Ji was amazing at half price!',
    rating: 5
  },
  {
    name: 'Sunita Krishnan',
    role: 'Director, Annapurna NGO',
    text: 'We\'ve distributed over 5000 meals through ResQ-Bite\'s donation system. The platform makes it incredibly easy to collect surplus food from restaurants across Delhi.',
    rating: 5
  },
  {
    name: 'Vikram Singh',
    role: 'Owner, Mumbai Tiffins',
    text: 'Instead of throwing away perfectly good vada pav and pav bhaji at the end of the day, we now sell them at a discount. We\'ve recovered ₹50,000+ in revenue that would have been waste.',
    rating: 5
  },
  {
    name: 'Neha Gupta',
    role: 'Student, JNU',
    text: 'As a student on a tight budget, ResQ-Bite is a lifesaver. I get restaurant-quality food at canteen prices. The golgappe from Chai & Chaat Corner are my favorite!',
    rating: 5
  }
];
