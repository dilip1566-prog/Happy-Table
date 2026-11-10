/**
 * A menu to start from.
 *
 * Offered when a restaurant is created without one, because an empty menu
 * makes the whole app untestable: there is nothing for a guest to browse, so
 * nothing to order, so no ticket, so no bill. Fifteen plausible dishes mean
 * the owner can walk every screen on day one and then replace them.
 *
 * Deliberately generic and deliberately short. It is scaffolding to be
 * thrown away, not a menu anybody should serve, and the categories are the
 * four every restaurant has rather than anybody's house style.
 */

export const STARTER_CATEGORIES = [
  { id: 'starters', label: 'Starters' },
  { id: 'mains', label: 'Mains' },
  { id: 'sides', label: 'Sides' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'drinks', label: 'Drinks' },
]

export const STARTER_MENU = [
  { name: 'Soup of the day', description: 'Ask your server what is on today.', price: 4.5, category: 'starters', diet: 'veg', nuts: false },
  { name: 'Garlic bread', description: 'Warm, with herb butter.', price: 3.5, category: 'starters', diet: 'veg', nuts: false },
  { name: 'Mixed salad', description: 'Leaves, tomato, cucumber and a house dressing.', price: 4.0, category: 'starters', diet: 'vegan', nuts: false },
  { name: 'House platter', description: 'A little of everything from the starter list.', price: 8.5, category: 'starters', diet: 'veg', nuts: false },
  { name: 'House curry', description: 'Our everyday curry, served with rice.', price: 9.5, category: 'mains', diet: 'veg', nuts: false },
  { name: 'Grilled vegetables', description: 'Seasonal vegetables from the grill.', price: 9.0, category: 'mains', diet: 'vegan', nuts: false },
  { name: 'Pasta of the day', description: 'Ask your server what the kitchen is making.', price: 10.0, category: 'mains', diet: 'veg', nuts: false },
  { name: 'Chef’s special', description: 'Changes daily. Ask at the table.', price: 12.5, category: 'mains', diet: 'veg', nuts: false },
  { name: 'Rice', description: 'Steamed basmati.', price: 3.0, category: 'sides', diet: 'vegan', nuts: false },
  { name: 'Chips', description: 'Thick cut, twice fried.', price: 3.5, category: 'sides', diet: 'vegan', nuts: false },
  { name: 'Flatbread', description: 'Baked to order.', price: 2.5, category: 'sides', diet: 'veg', nuts: false },
  { name: 'Ice cream', description: 'Two scoops. Ask for today’s flavours.', price: 4.0, category: 'desserts', diet: 'veg', nuts: false },
  { name: 'Cake of the day', description: 'Whatever came out of the oven this morning.', price: 4.5, category: 'desserts', diet: 'veg', nuts: false },
  { name: 'Soft drink', description: 'Ask your server for the full list.', price: 2.5, category: 'drinks', diet: 'vegan', nuts: false },
  { name: 'Tea or coffee', description: 'Served with milk on the side.', price: 2.5, category: 'drinks', diet: 'veg', nuts: false },
]
