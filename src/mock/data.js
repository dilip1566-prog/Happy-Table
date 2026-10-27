/**
 * Bobby's — full menu, generated from Bobbys_Menu_Numbered.xlsx.
 *
 * 171 items across 19 sections, numbered exactly as the printed menu book so
 * staff and guests can refer to the same number.
 *
 * The kitchen is fully vegetarian, so `diet` distinguishes vegan from
 * vegetarian rather than veg from non-veg, and `nuts` is tracked separately —
 * an allergen is a different question from a dietary preference and the two
 * must not share one symbol.
 *
 * Prices are GBP. No photography supplied, so cards render text-forward and
 * fall back to a monogram wherever an image_url is later added but fails.
 */

export const RESTAURANT = {
  name: "Bobby's",
  tagline: 'Vegetarian Indian kitchen',
  cover: '',
}

export const CATEGORIES = [
  { id: "bobby-s-deli", label: "Bobby's Deli" },
  { id: "indo-chinese", label: "Indo Chinese" },
  { id: "sides", label: "Sides" },
  { id: "maharajah-s-feast", label: "Maharajah's Feast" },
  { id: "dimple-s-dosa", label: "Dimple's Dosa" },
  { id: "rice-breads", label: "Rice & Breads" },
  { id: "rishi-s-rekdi", label: "Rishi's Rekdi" },
  { id: "soft-drinks", label: "Soft Drinks" },
  { id: "juice-drinks", label: "Juice Drinks" },
  { id: "milkshakes", label: "Milkshakes" },
  { id: "bubble-tea", label: "Bubble Tea" },
  { id: "mocktails", label: "Mocktails" },
  { id: "fresh-lassi", label: "Fresh Lassi" },
  { id: "hot-beverages", label: "Hot Beverages" },
  { id: "wine", label: "Wine" },
  { id: "beers", label: "Beers" },
  { id: "thali", label: "Thali" },
  { id: "desserts", label: "Desserts" },
  { id: "afternoon-tea", label: "Afternoon Tea" },
]

export const MENU = [
  { id: "m001", no: 1, name: "Samosas (3)", description: "Crispy filo pastry snack with spicy diced potato, carrots & peas.", price: 4.5, category: "bobby-s-deli", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m002", no: 2, name: "Spring rolls (3)", description: "A fusion of deliciously spiced shredded cabbage, carrots, sweetcorn, kidney beans and coconut, wrapped in a delicate pastry.", price: 4.5, category: "bobby-s-deli", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m003", no: 3, name: "Paneer Spring rolls (3)", description: "A fusion of deliciously spiced grated paneer & sweetcorn wrapped in a delicate pastry.", price: 5.25, category: "bobby-s-deli", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m004", no: 4, name: "Punjabi Samosas (2)", description: "An authentic mix of potatoes, peas, cumin seeds & cashew nuts in a thick homemade pastry.", price: 4.25, category: "bobby-s-deli", diet: "vegan", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m005", no: 5, name: "Onion Bhajia (3)", description: "A tasty combination of onions & spices fused in our special batter.", price: 4.75, category: "bobby-s-deli", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m006", no: 6, name: "Khichi", description: "Rice flour dumplings drizzled with oil & chilli powder sprinkle.", price: 5.0, category: "bobby-s-deli", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m007", no: 7, name: "Ambli Mogo", description: "Chunky cassava chips coated with tamarind sauce, salt & chilli powder.", price: 5.5, category: "bobby-s-deli", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m008", no: 8, name: "Chilli & Lemon Mogo", description: "Cassava chips sprinkled with chilli powder, salt & lemon juice.", price: 6.0, category: "bobby-s-deli", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m009", no: 9, name: "Jeera Mogo", description: "Sautéed cassava chunks in a tangy blend of rich cumin & mixed spices.", price: 6.5, category: "bobby-s-deli", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m010", no: 10, name: "Crispy Bhajia", description: "Golden-fried potato bhajia served with a delicious tangy dip.", price: 6.5, category: "bobby-s-deli", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m011", no: 11, name: "Paneer Pakoda (4)", description: "Delicately spiced coated paneer cubes served with a tangy dipping sauce.", price: 6.5, category: "bobby-s-deli", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m012", no: 12, name: "Dhokla", description: "Fluffy savoury sponge cake, lightly tempered with spiced sesame and mustard seeds.", price: 5.0, category: "bobby-s-deli", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m013", no: 13, name: "Dal Kachoris (5)", description: "Spicy lentil balls wrapped in pastry.", price: 5.0, category: "bobby-s-deli", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m014", no: 14, name: "Mattar Kachori (5)", description: "Spicy green peas balls with coconut, wrapped in pastry.", price: 5.5, category: "bobby-s-deli", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m015", no: 15, name: "Bateta Wada (5)", description: "Spicy mashed potato balls, covered in a mild batter.", price: 5.0, category: "bobby-s-deli", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m016", no: 16, name: "Stuffed Chilli Peppers", description: "Hot peppers stuffed with ground peanuts & dry masala, coated in a soft mild batter.", price: 5.0, category: "bobby-s-deli", diet: "vegan", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m017", no: 17, name: "Ondhwo", description: "An oven-baked savoury sponge made from fermented lentil batter and vegetables, topped with sesame seeds.", price: 4.5, category: "bobby-s-deli", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m018", no: 18, name: "Patra", description: "Steamed colocasia leaves rolls, delicately topped with spiced sesame and mustard seeds tempering.", price: 5.0, category: "bobby-s-deli", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m019", no: 19, name: "Sharing Bhajia Platter", description: "Includes Dhokla, Samosa, Batetawada, Dal Kachori, Stuffed chilli pepper & Methi Bhajia.", price: 10.0, category: "bobby-s-deli", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m020", no: 20, name: "Chilli Paneer", description: "Paneer cubes stir-fried with green chillies, soy sauce, onions & capsicums.", price: 10.0, category: "indo-chinese", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m021", no: 21, name: "Chilli Mogo", description: "Cassava pieces stir-fried with green chillies, soy sauce, onions & capsicums.", price: 9.0, category: "indo-chinese", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m022", no: 22, name: "Chilli Idli", description: "Stir-fried Idli with green chillies, soy sauce, onions and capsicums.", price: 8.5, category: "indo-chinese", diet: "vegan", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m023", no: 23, name: "Chilli Momos (Vegetarian / Paneer)", description: "Steamed momos tossed with green chillies, soy sauce, onions & capsicums.", price: 9.0, category: "indo-chinese", diet: "vegan", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m024", no: 24, name: "Chinese Bhel", description: "Crispy fried noodles with onions, tomatoes, cucumber & capsicums in a spicy tangy sauce.", price: 7.0, category: "indo-chinese", diet: "vegan", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m025", no: 25, name: "Aubergine Stir Fry", description: "Sliced crispy aubergines wok-tossed with onions & capsicums in a delicious savoury sauce.", price: 10.0, category: "indo-chinese", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m026", no: 26, name: "Vegetable Hakka Noodles", description: "Oriental noodles stir-fried with capsicums, onions, cabbage & carrot.", price: 8.5, category: "indo-chinese", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m027", no: 27, name: "Vegetable Manchurian", description: "Crispy vegetable balls tossed in a spicy tangy sauce. (Dry/Saucy)", price: 9.0, category: "indo-chinese", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m028", no: 28, name: "Vegetable Fried Rice", description: "Cooked rice wok-tossed with fresh vegetables & flavorful spices.", price: 8.0, category: "indo-chinese", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m029", no: 29, name: "Firecracker Cauliflower", description: "Crispy cauliflower coated in a spicy, sweet & tangy sauce.", price: 9.0, category: "indo-chinese", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m030", no: 30, name: "Chilli Paneer & Noodles Combo", description: "", price: 14.0, category: "indo-chinese", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m031", no: 31, name: "Veg Manchurian & Fried Rice Combo", description: "", price: 14.0, category: "indo-chinese", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m032", no: 32, name: "Chilli Chips", description: "Chips cooked in our homemade hot chilli sauce.", price: 5.0, category: "sides", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m033", no: 33, name: "Plain Chips", description: "", price: 3.5, category: "sides", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m034", no: 34, name: "Loaded Bollywood Chips", description: "Chips tossed with cabbage, carrots, onions, cheese and our homemade chilli sauce.", price: 7.0, category: "sides", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m035", no: 35, name: "Salt & Pepper Chips", description: "Crispy Chips tossed with stir-fried onions, capsicum, salt & black pepper.", price: 7.0, category: "sides", diet: "vegan", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m036", no: 36, name: "Momos (Vegetarian / Paneer)", description: "Steamed or fried dumplings filled with vegetables or paneer, served with fiery sauce.", price: 7.0, category: "sides", diet: "vegan", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m037", no: 37, name: "Crispy Corn", description: "Golden crispy sweetcorn tossed in a flavourful spice blend.", price: 5.5, category: "sides", diet: "vegan", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m038", no: 38, name: "Mumbai Chip Butty", description: "Bun filled with chilli chips, onions, cheese & our homemade chilli sauce.", price: 6.0, category: "sides", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m039", no: 39, name: "Toasted Mumbai Sandwich", description: "Sandwich layered with boiled potatoes, cucumber, onions, tomatoes & cheese, seasoned with dry spices & spread with tangy green chutney, toasted until golden & crisp.", price: 6.5, category: "sides", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m040", no: 40, name: "Toasted Cheese Sandwich", description: "A simple cheese toasted sandwich served with chips.", price: 4.5, category: "sides", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m041", no: 41, name: "Chilli Paneer Wrap", description: "Chilli paneer in a tortilla wrap served with plain chips.", price: 8.0, category: "sides", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m042", no: 42, name: "Chana Bhatura", description: "Spicy chickpea curry served with 2 puffed breads.", price: 9.0, category: "sides", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m043", no: 43, name: "Puri Bhaji", description: "Dry potato curry with 5 masala puris.", price: 9.0, category: "sides", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m044", no: 44, name: "Papad (2)", description: "Also known as a papadum or poppadom, is a thin, crispy, disc-shaped Indian snack or flatbread. Can order as Roasted or Fried.", price: 2.0, category: "sides", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m045", no: 45, name: "Masala Papad", description: "Fried papad topped with spicy onions, tomatoes, garnished with coriander.", price: 4.0, category: "sides", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m046", no: 46, name: "Spicy Kachumber", description: "Spicy chopped mix salad.", price: 3.5, category: "sides", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m047", no: 47, name: "Sambharo", description: "Our famous cabbage, carrots & fresh green chillies mix.", price: 2.5, category: "sides", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m048", no: 48, name: "Mango Cucumber Salad", description: "Juicy, refreshing & fiery salad that combines sweet mango, crisp cucumber & a zesty spicy dressing.", price: 6.5, category: "sides", diet: "vegan", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m049", no: 49, name: "Cucumber Raita", description: "Finely grated cucumber in lightly spiced yoghurt.", price: 3.0, category: "sides", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m050", no: 50, name: "Ras with Puri", description: "Chilled, sweet mango pulp served with 4 hot, deep-fried puffed flatbreads (Puri).", price: 7.5, category: "sides", diet: "veg", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m051", no: 51, name: "Plain Yoghurt", description: "", price: 2.0, category: "sides", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m052", no: 52, name: "Mint Yoghurt", description: "", price: 2.5, category: "sides", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m053", no: 53, name: "Fresh Green Salad", description: "", price: 4.0, category: "sides", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m054", no: 54, name: "Bobby's Special Shashlik", description: "Chunks of cassava, paneer, potato, capsicums & onions marinated in our special sauce. Served with mint yoghurt.", price: 12.5, category: "maharajah-s-feast", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m055", no: 55, name: "Tandoori Paneer Tikka", description: "Smoky paneer chunks with onions and capsicums, served with a refreshing mint dip.", price: 12.5, category: "maharajah-s-feast", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m056", no: 56, name: "Soya Paneer Kebab", description: "Lightly pan-fried soya paneer skewers, mixed with Indian spices & served with mint sauce.", price: 10.0, category: "maharajah-s-feast", diet: "veg", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m057", no: 57, name: "Vegetable Karahi", description: "A medley of vegetables, capsicums & onions cooked in specially ground spices with green chillies.", price: 9.5, category: "maharajah-s-feast", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m058", no: 58, name: "Baingan Bharta", description: "Smoked and mashed aubergine, pan fried with a variety of spices.", price: 9.5, category: "maharajah-s-feast", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m059", no: 59, name: "Bombay Aloo", description: "Potatoes cooked in a dry sauce with a medley of spices.", price: 9.0, category: "maharajah-s-feast", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m060", no: 60, name: "Aloo Gobi", description: "Potato & cauliflower sautéed with green chilli, cumin & spices.", price: 9.5, category: "maharajah-s-feast", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m061", no: 61, name: "Pakoda Kadhi", description: "Gram flour fritters simmered in a tangy, spiced yoghurt based curry.", price: 9.5, category: "maharajah-s-feast", diet: "veg", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m062", no: 62, name: "Bhindi Masala", description: "Pan fried okra with tomato, onion & spices, finished with a dash of lemon.", price: 9.5, category: "maharajah-s-feast", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m063", no: 63, name: "Chana Masala", description: "Chickpeas cooked in a hot & spicy tomato based sauce.", price: 9.5, category: "maharajah-s-feast", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m064", no: 64, name: "Soya Bhurji", description: "A protein-packed soy-based scramble cooked with green peas and Indian spices.", price: 9.5, category: "maharajah-s-feast", diet: "vegan", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m065", no: 65, name: "Mattar Mushroom", description: "Mushrooms & green peas in a spiced onions and tomato gravy.", price: 9.5, category: "maharajah-s-feast", diet: "vegan", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m066", no: 66, name: "Dal Makhni", description: "A black lentil curry cooked with a rich blend of spices & cream.", price: 9.5, category: "maharajah-s-feast", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m067", no: 67, name: "Tarka Dal", description: "Mixed yellow lentils, garlic, ginger & coriander slow cooked to perfection.", price: 9.5, category: "maharajah-s-feast", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m068", no: 68, name: "Paneer Karahi", description: "Paneer, capsicums & onions cooked in specially ground spices with green chillies.", price: 9.25, category: "maharajah-s-feast", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m069", no: 69, name: "Mattar Paneer", description: "Paneer richly spiced with petit pois, onions, tomatoes, cardamom & cream.", price: 9.5, category: "maharajah-s-feast", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m070", no: 70, name: "Palak Paneer", description: "Diced paneer in a smooth, creamy and delicious spinach gravy.", price: 9.5, category: "maharajah-s-feast", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m071", no: 71, name: "Paneer Tikka Masala", description: "Paneer cooked in a tangy, mildly sweet creamy sauce.", price: 9.75, category: "maharajah-s-feast", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m072", no: 72, name: "Paneer Butter Masala", description: "Paneer cooked in a spiced butter masala sauce.", price: 9.75, category: "maharajah-s-feast", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m073", no: 73, name: "Plain Dosa", description: "A crispy rice flour based crepe.", price: 6.5, category: "dimple-s-dosa", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m074", no: 74, name: "Masala Dosa", description: "Plain dosa, filled with potato & onion masala.", price: 8.0, category: "dimple-s-dosa", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m075", no: 75, name: "Dimple's Special Dosa", description: "Plain dosa, filled with spicy masala, capsicums, tomato and cheese.", price: 8.5, category: "dimple-s-dosa", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m076", no: 76, name: "Mysore Masala Dosa", description: "Plain dosa, spread with flavourful spicy masala paste and chopped capsicums.", price: 8.0, category: "dimple-s-dosa", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m077", no: 77, name: "Chilli Paneer Dosa", description: "Plain dosa, filled with chilli paneer.", price: 10.0, category: "dimple-s-dosa", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m078", no: 78, name: "Idli Sambhar", description: "Fluffy steamed savoury rice cake.", price: 6.5, category: "dimple-s-dosa", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m079", no: 79, name: "Chapatti (2)", description: "", price: 1.5, category: "rice-breads", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m080", no: 80, name: "Puri (2)", description: "", price: 1.5, category: "rice-breads", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m081", no: 81, name: "Bhatura (2)", description: "", price: 3.0, category: "rice-breads", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m082", no: 82, name: "Thepla (2)", description: "A slightly spiced Gujarati flatbread.", price: 3.5, category: "rice-breads", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m083", no: 83, name: "Plain Paratha", description: "", price: 3.0, category: "rice-breads", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m084", no: 84, name: "Stuffed Paratha", description: "Pan-cooked Indian flatbread filled with spicy mashed potatoes, served with plain yoghurt.", price: 3.5, category: "rice-breads", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m085", no: 85, name: "Tandoori Roti", description: "", price: 3.0, category: "rice-breads", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m086", no: 86, name: "Naan", description: "", price: 3.0, category: "rice-breads", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m087", no: 87, name: "Garlic Naan", description: "", price: 3.5, category: "rice-breads", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m088", no: 88, name: "Cheese & Chilli Naan", description: "", price: 4.0, category: "rice-breads", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m089", no: 89, name: "Rotla", description: "Traditional Gujarati bread made with millet flour, brushed lightly with butter.", price: 3.0, category: "rice-breads", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m090", no: 90, name: "Puran Puri", description: "A sweet stuffed bread filled with lentil, scented with cardamom, lightly brushed with ghee.", price: 3.5, category: "rice-breads", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m091", no: 91, name: "Steamed Rice", description: "", price: 3.5, category: "rice-breads", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m092", no: 92, name: "Pilau / Jeera Rice", description: "", price: 4.0, category: "rice-breads", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m093", no: 93, name: "Khichdi", description: "Moong beans cooked with long-grained rice.", price: 4.5, category: "rice-breads", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m094", no: 94, name: "Masala Khichdi", description: "Plain Khichdi finished with a fragrant ghee, tempering of spices, garlic and chillies.", price: 6.0, category: "rice-breads", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m095", no: 95, name: "Rajma Chawal", description: "Red kidney beans curry with steamed basmati rice.", price: 10.0, category: "rice-breads", diet: "vegan", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m096", no: 96, name: "Bobby's Vegetable Biryani", description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices, served with raita.", price: 10.0, category: "rice-breads", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m097", no: 97, name: "Chaat Sampler", description: "Sample small portions of Dahi-vada, Bhel Puri & Papdi Chaat.", price: 9.0, category: "rishi-s-rekdi", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m098", no: 98, name: "Bobby's Special Chaat", description: "A fusion of crushed samosa, savouries & Dahi-vada with diced potato & black chickpea mix, smothered with seasoned yoghurt, topped with onions, tomatoes, chutneys, coriander and seasonal garnish.", price: 7.5, category: "rishi-s-rekdi", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m099", no: 99, name: "Rajbhog Kachori Chaat", description: "Crispy deep-fried pastry shell topped with diced potatoes & black chickpea mix, lavishly coated with seasoned yoghurt & tangy chutneys, finished with crunchy sev, diced tomato, onions, coriander & seasonal garnish.", price: 7.0, category: "rishi-s-rekdi", diet: "veg", nuts: true, isNew: true, weekend: false, image_url: '' },
  { id: "m100", no: 100, name: "Papdi Chaat", description: "A street stall favourite - crispy & crunchy infusion of Papdi snacks & savouries with diced potato & black chickpea mix, lavishly coated with seasoned yoghurt & colourful mix of chutneys, garnished with diced onion, tomato, coriander & seasonal garnish.", price: 6.75, category: "rishi-s-rekdi", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m101", no: 101, name: "Aloo Tikki Chaat", description: "Fried mashed potato petties lavishly coated with seasoned yoghurt, onions, tomatoes, sev, chutney, coriander and seasonal garnish.", price: 7.0, category: "rishi-s-rekdi", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m102", no: 102, name: "Samosa Chole Chaat", description: "A lip-smacking chaat made with slightly smashed punjabi samosa covered with chole (chickpea) curry, seasoned yoghurt, onions, tomatoes crispy array of toppings, coriander & seasonal garnish.", price: 8.0, category: "rishi-s-rekdi", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m103", no: 103, name: "Bhel Puri", description: "Crispy & crunchy savouries mixed with puffed rice tossed with diced potato & black chickpea mix, chopped onions, tomatoes, infused generously with chutneys, topped with seasonal garnish.", price: 6.0, category: "rishi-s-rekdi", diet: "vegan", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m104", no: 104, name: "Pani Puri/Gol Gappa", description: "Crispy hollowed wheat mini-baskets, served with diced potato & black chickpea mix, with fresh mint & tamarind water.", price: 6.5, category: "rishi-s-rekdi", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m105", no: 105, name: "Dahi-Puri", description: "Crispy wheat mini-baskets, filled with savoury potato filling, lavishly coated with seasoned yoghurt & colourful mix of chutneys, garnished with chopped onion, tomato, coriander & seasonal garnish.", price: 6.75, category: "rishi-s-rekdi", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m106", no: 106, name: "Dahi-Vada", description: "Fried lentil balls, soaked & strained, dunked in seasoned yoghurt, topped with tamarind sauce, sprinkle sev, chilli powder & coriander.", price: 6.0, category: "rishi-s-rekdi", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m107", no: 107, name: "Pau Bhaji", description: "Buttery, thick mashed vegetable curry served with toasted bread rolls, topped with chopped onions & lemon wedges.", price: 9.0, category: "rishi-s-rekdi", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m108", no: 108, name: "Vada Pau", description: "Deep fried spicy potato dumpling placed inside a soft bread bun with chopped onions & spicy chutney, served with fried green chillies.", price: 3.5, category: "rishi-s-rekdi", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m109", no: 109, name: "Dabeli", description: "Spicy-sweet mashed potato filling mixed with onions, peanuts, pomegranate, sev, and chutneys, stuffed inside a soft bun.", price: 3.5, category: "rishi-s-rekdi", diet: "vegan", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m110", no: 110, name: "Bhindi Fries", description: "Sliced okra marinated with tangy spices & fried to crispy finish, sprinkled with special tangy masala.", price: 8.5, category: "rishi-s-rekdi", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m111", no: 111, name: "Coke", description: "", price: 3.25, category: "soft-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m112", no: 112, name: "Coke Zero", description: "", price: 3.25, category: "soft-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m113", no: 113, name: "Fanta", description: "", price: 3.25, category: "soft-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m114", no: 114, name: "Sprite / 7 Up", description: "", price: 3.25, category: "soft-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m115", no: 115, name: "Ginger Ale / Spicy Ginger Beer", description: "", price: 3.25, category: "soft-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m116", no: 116, name: "Rubicon Passion / Mango", description: "", price: 3.25, category: "soft-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m117", no: 117, name: "Mineral Water", description: "", price: 2.0, category: "soft-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m118", no: 118, name: "Sparkling Mineral Water", description: "", price: 2.5, category: "soft-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m119", no: 119, name: "Soft Drinks Jug", description: "", price: 12.0, category: "soft-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m120", no: 120, name: "Fresh Passion Fruit", description: "", price: 4.5, category: "juice-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m121", no: 121, name: "Fresh Nimbu Paani", description: "", price: 4.0, category: "juice-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m122", no: 122, name: "J20", description: "", price: 3.5, category: "juice-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m123", no: 123, name: "Mango / Orange / Apple", description: "", price: 3.5, category: "juice-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m124", no: 124, name: "Guava / Watermelon", description: "", price: 3.75, category: "juice-drinks", diet: "veg", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m125", no: 125, name: "Coconut Water", description: "", price: 3.75, category: "juice-drinks", diet: "veg", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m126", no: 126, name: "Juice Jug", description: "", price: 15.0, category: "juice-drinks", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m127", no: 127, name: "Faluda", description: "(Rose/Mango/Pistachio)", price: 6.0, category: "milkshakes", diet: "veg", nuts: true, isNew: true, weekend: false, image_url: '' },
  { id: "m128", no: 128, name: "Cold Coffee", description: "", price: 5.5, category: "milkshakes", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m129", no: 129, name: "Mango / Rose / Vanilla / Chocolate", description: "", price: 5.0, category: "milkshakes", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m130", no: 130, name: "Oreo / Ferrero Rocher", description: "", price: 5.0, category: "milkshakes", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m131", no: 131, name: "Masala Bubble Tea", description: "", price: 6.0, category: "bubble-tea", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m132", no: 132, name: "Popping Boba Lychee Tea", description: "", price: 6.0, category: "bubble-tea", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m133", no: 133, name: "Popping Boba Cherry Tea", description: "", price: 6.0, category: "bubble-tea", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m134", no: 134, name: "Mojito", description: "", price: 5.0, category: "mocktails", diet: "veg", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m135", no: 135, name: "Ginger Mule", description: "", price: 5.0, category: "mocktails", diet: "veg", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m136", no: 136, name: "Mango", description: "", price: 4.5, category: "fresh-lassi", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m137", no: 137, name: "Coconut with Dates", description: "", price: 5.0, category: "fresh-lassi", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m138", no: 138, name: "Sweet", description: "", price: 4.5, category: "fresh-lassi", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m139", no: 139, name: "Salty", description: "", price: 4.5, category: "fresh-lassi", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m140", no: 140, name: "Spicy Masala Chaas", description: "", price: 5.0, category: "fresh-lassi", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m141", no: 141, name: "Fresh Lassi Jug", description: "", price: 14.0, category: "fresh-lassi", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m142", no: 142, name: "Masala Tea", description: "", price: 2.75, category: "hot-beverages", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m143", no: 143, name: "Masala Coffee", description: "", price: 3.0, category: "hot-beverages", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m144", no: 144, name: "Kadak Chai", description: "", price: 2.75, category: "hot-beverages", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m145", no: 145, name: "Kashmiri Pink Chai", description: "", price: 3.5, category: "hot-beverages", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m146", no: 146, name: "Oat Milk Tea", description: "", price: 3.5, category: "hot-beverages", diet: "vegan", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m147", no: 147, name: "Matcha Tea / Green Tea", description: "", price: 3.5, category: "hot-beverages", diet: "vegan", nuts: false, isNew: true, weekend: false, image_url: '' },
  { id: "m148", no: 148, name: "Peppermint Tea", description: "", price: 3.0, category: "hot-beverages", diet: "vegan", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m149", no: 149, name: "House Wine Glass (Red / White)", description: "", price: 5.5, category: "wine", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m150", no: 150, name: "House Wine Bottle", description: "", price: 16.5, category: "wine", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m151", no: 151, name: "Budweiser / Cobra / Kingfisher", description: "", price: 4.5, category: "beers", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m152", no: 152, name: "Holsten Pills", description: "", price: 4.5, category: "beers", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m153", no: 153, name: "Alcohol-free", description: "", price: 3.5, category: "beers", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m154", no: 154, name: "Gujarati Thali", description: "Two traditional Gujarati curries, dal, kadhi, 3 chapattis, rice, papad, pickle sambharo, one farsan, one sweet and a choice of lassi.", price: 12.5, category: "thali", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m155", no: 155, name: "Punjabi Thali", description: "Two Punjabi style curries, tarka dal, 2 bhaturas, rice, papad, salad, one punjabi samosa, one sweet and a choice of lassi.", price: 15.0, category: "thali", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m156", no: 156, name: "Gujarati Dal", description: "Slightly spicy & mildly sweet soup made from lentils. Contains peanuts.", price: 5.0, category: "thali", diet: "vegan", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m157", no: 157, name: "Gujarati Kadhi", description: "Tangy and sweet yoghurt based soup, made with chickpea flour & spices.", price: 5.0, category: "thali", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m158", no: 158, name: "Lilva Papdi", description: "Popular Gujarati dish made from tender green bean seeds with aubergines.", price: 9.5, category: "thali", diet: "vegan", nuts: false, isNew: false, weekend: true, image_url: '' },
  { id: "m159", no: 159, name: "Makai Patra", description: "Traditional Gujarati style curry made using sweet corn & colocasia pinwheels.", price: 9.5, category: "thali", diet: "vegan", nuts: false, isNew: false, weekend: true, image_url: '' },
  { id: "m160", no: 160, name: "Karela Kaju Curry", description: "This curry is a mildly sweet and bitter, stir-fried with bitter gourd and cashew nuts, cooked in rich spices & jaggery for a balanced flavour.", price: 9.75, category: "thali", diet: "vegan", nuts: true, isNew: false, weekend: true, image_url: '' },
  { id: "m161", no: 161, name: "Gajjar Halwo", description: "Indian carrot cake, served with or without ice cream.", price: 5.5, category: "desserts", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m162", no: 162, name: "Rassomalai", description: "Softly pressed milk cakes in cardamom flavoured milk laced with saffron & pistachio nuts.", price: 5.5, category: "desserts", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m163", no: 163, name: "Kulfi", description: "Indian ice cream available in malai, mango & pistachio flavours.", price: 3.5, category: "desserts", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m164", no: 164, name: "Gulab Jambu", description: "Sweet sponge cake balls flavoured with cardamom in sweet syrup. Served with or without ice cream.", price: 5.5, category: "desserts", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m165", no: 165, name: "Shrikhand", description: "Sweet soft curd cheese laced with saffron, cardamom & topped with chopped nuts.", price: 5.5, category: "desserts", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m166", no: 166, name: "Mango Shrikhand", description: "Mango flavoured, sweet soft curd cheese laced with saffron, cardamom, topped with chopped nuts.", price: 6.0, category: "desserts", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m167", no: 167, name: "Mixed Mithai Platter", description: "An assortment choice of delicious sweets from our deli counter.", price: 8.0, category: "desserts", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m168", no: 168, name: "Ice Cream", description: "Choose from vanilla / strawberry / chocolate.", price: 3.5, category: "desserts", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: "m169", no: 169, name: "Hot Monthal", description: "A warm gram flour fudge tasting sweet with cardamom and nuts.", price: 5.5, category: "desserts", diet: "veg", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m170", no: 170, name: "Jalebi", description: "Deep fried orange swirly sweets, dipped in sugar syrup, sprinkled with chopped nuts.", price: 5.5, category: "desserts", diet: "vegan", nuts: true, isNew: false, weekend: false, image_url: '' },
  { id: "m171", no: 171, name: "Afternoon Tea Indian", description: "Tea, treats and a touch of royalty. PRE-BOOK.", price: 30.0, category: "afternoon-tea", diet: "veg", nuts: false, isNew: false, weekend: false, image_url: '' },
]

export const TABLE_COUNT = 20

/**
 * Twenty tables, every one free.
 *
 * Service starts clean: no sessions, no tickets, nothing on the bill. A table
 * becomes busy only when a guest scans its code, or a host seats it.
 *
 * Seat counts follow a normal room — a row of deuces along the window, fours
 * through the middle, and a few big tops at the back for parties.
 */
const SEATS_BY_TABLE = (n) => {
  if (n <= 8) return 2
  if (n <= 14) return 4
  if (n <= 18) return 6
  return 8
}

export function seedTables() {
  const tables = []
  for (let n = 1; n <= TABLE_COUNT; n += 1) {
    tables.push({
      id: String(n),
      table_number: n,
      status: 'available',
      session_id: null,
      seats: SEATS_BY_TABLE(n),
    })
  }
  return tables
}

export function seedSessions() {
  return []
}

export function seedOrders() {
  return []
}

export const SEED_SOLD_OUT = ['m011', 'm127']

/**
 * Demo staff.
 *
 * Email and password, so a leaver is revoked by switching one account off
 * rather than by changing a code every colleague has memorised.
 *
 * These are demo values for the design build only. Replace them — and move
 * verification server-side — before this touches a real till.
 */
export function seedStaff() {
  return [
    { id: 'u_owner', name: 'Bobby', role: 'owner', email: 'bobby@bobbys.co.uk', password: 'demo1234', active: true },
    { id: 'u_mgr', name: 'Dimple', role: 'manager', email: 'dimple@bobbys.co.uk', password: 'demo1234', active: true },
    { id: 'u_waiter1', name: 'Rishi', role: 'waiter', email: 'rishi@bobbys.co.uk', password: 'demo1234', active: true },
    { id: 'u_waiter2', name: 'Priya', role: 'waiter', email: 'priya@bobbys.co.uk', password: 'demo1234', active: true },
    { id: 'u_kitchen', name: 'Kitchen', role: 'kitchen', email: 'kitchen@bobbys.co.uk', password: 'demo1234', active: true },
  ]
}

// ---------------------------------------------------------------------------
// Second tenant - Star Vashnu Dhaba
//
// 163 dishes across 15 sections, generated from Star_Vashnu_Dhaba_Menu.xlsx.
// 94 Narborough Road, Leicester LE3 0BS. Numbering restarts at 1 because
// dish numbers are per restaurant, and these match the restaurant's own
// printed list so a guest and a waiter can say the same number.
//
// The kitchen is 100% pure vegetarian. The source sheet carries NO allergen
// column, so `diet` is 'veg' and `nuts` is false throughout as a placeholder
// - neither was supplied and neither is inferred. The owner must confirm
// which dishes are vegan and which contain nuts before this menu faces a
// guest.
//
// Items with more than one price carry a `sizes` array; `price` is the
// smallest size so every existing surface keeps working unchanged. The dish
// card does not offer the larger sizes yet.
// ---------------------------------------------------------------------------

export const STAR_CATEGORIES = [
  { id: 'italian', label: 'Italian' },
  { id: 'italian-pizzas', label: 'Italian Pizzas' },
  { id: 'family-pizza-deal', label: 'Family Pizza Deal' },
  { id: 'indo-chinese', label: 'Indo-Chinese' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'south-indian', label: 'South Indian' },
  { id: 'indian-starters', label: 'Indian Starters' },
  { id: 'indian-parotha', label: 'Indian Parotha' },
  { id: 'side-orders', label: 'Side Orders' },
  { id: 'salad', label: 'Salad' },
  { id: 'indian-mains', label: 'Indian Mains' },
  { id: 'thali', label: 'Thali' },
  { id: 'sweets-desserts', label: 'Sweets / Desserts' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'snacks', label: 'Snacks' },
]

export const STAR_MENU = [
  { id: 's001', no: 1, name: 'Garlic Mushrooms (8 pcs)', description: 'Garlic breaded mushrooms.', price: 3.5, category: 'italian', section: 'Starters', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's002', no: 2, name: 'Garlic Bread (4 pcs)', description: 'Toasted bread with garlic butter and herbs.', price: 2.5, category: 'italian', section: 'Starters', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/002.jpg' },
  { id: 's003', no: 3, name: 'Garlic Bread with Cheese (4 pcs)', description: 'Garlic bread topped with melted cheese.', price: 3.5, category: 'italian', section: 'Starters', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's004', no: 4, name: 'Garlic Bread Special (4 pcs)', description: 'Garlic bread with sauce, cheese & chillies.', price: 4.0, category: 'italian', section: 'Starters', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's005', no: 5, name: 'Vegetable Lasagne', description: 'Layers of vegetables and pasta topped with cheese, served with garlic bread.', price: 6.0, category: 'italian', section: 'Main', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's006', no: 6, name: 'Kheema Lasagne', description: 'Layers of mixed soya vegetables and pasta with cheese topping, served with garlic bread.', price: 6.5, category: 'italian', section: 'Main', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's007', no: 7, name: 'Pasta Formo', description: 'Baked pasta in a rich tomato sauce with vegetables and cheese.', price: 5.0, category: 'italian', section: 'Main', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's008', no: 8, name: 'Margherita', description: 'Cheese & tomato.', price: 4.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 4.0 }, { label: '12"', price: 10.0 }, { label: '16"', price: 13.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's009', no: 9, name: 'Vegetarian', description: 'Cheese, tomato, mixed peppers, mushrooms, sweetcorn, onions & tomato slices.', price: 4.5, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 4.5 }, { label: '12"', price: 12.0 }, { label: '16"', price: 14.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's010', no: 10, name: 'Vegetarian Supreme', description: 'Cheese, tomato, sweetcorn, green chillies, onion, mixed pepper, mushrooms, jalapeno & tomato slices.', price: 5.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 5.0 }, { label: '12"', price: 12.5 }, { label: '16"', price: 15.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's011', no: 11, name: 'Paneer Special', description: 'Cheese, tomato, sweetcorn, mixed peppers, onions & slices of paneer.', price: 6.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 6.0 }, { label: '12"', price: 13.0 }, { label: '16"', price: 17.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's012', no: 12, name: 'Paneer Keema', description: 'Cheese, tomato, dried paneer, onions, peppers & tomato slices.', price: 6.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 6.0 }, { label: '12"', price: 13.0 }, { label: '16"', price: 17.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's013', no: 13, name: 'Star Special (Hot & Spicy)', description: 'Cheese, tomato, mixed peppers, onions, green chillies and special sauce.', price: 5.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 5.0 }, { label: '12"', price: 12.5 }, { label: '16"', price: 15.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's014', no: 14, name: 'Star Delux', description: 'Cheese, tomato, Indian spicy mixed vegetables, peppers & tomato slices.', price: 5.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 5.0 }, { label: '12"', price: 12.5 }, { label: '16"', price: 15.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's015', no: 15, name: 'Italian Special', description: 'Cheese, tomato, mixed peppers, sweetcorn, pineapple, mushroom, olives & tomato slices.', price: 5.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 5.0 }, { label: '12"', price: 12.5 }, { label: '16"', price: 16.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's016', no: 16, name: 'Spinach', description: 'Cheese, tomato, spinach, red onion, green peppers & tomato slices.', price: 5.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 5.0 }, { label: '12"', price: 12.5 }, { label: '16"', price: 15.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's017', no: 17, name: 'Mexican', description: 'Cheese, tomato, Mexican beans, jalapeno, green peppers and tomato slices.', price: 5.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 5.0 }, { label: '12"', price: 12.5 }, { label: '16"', price: 15.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's018', no: 18, name: 'Pasta Pizza', description: 'Cheese, tomato, spicy pasta, mixed pepper and tomato slices.', price: 5.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 5.0 }, { label: '12"', price: 12.5 }, { label: '16"', price: 15.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's019', no: 19, name: 'Pizza Mushroom', description: 'Cheese, tomato, mushroom, olives & jalapeno.', price: 5.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 5.0 }, { label: '12"', price: 12.5 }, { label: '16"', price: 15.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's020', no: 20, name: 'Veggie Sausage Pizza', description: 'Cheese, tomato, sweetcorn, mixed pepper, onion, mushroom, topped with vegetarian sausage, jalapeno & tomato slices.', price: 5.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 5.0 }, { label: '12"', price: 13.0 }, { label: '16"', price: 17.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's021', no: 21, name: 'Indian Style Mix Veg. Pizza', description: 'Cheese, tomato & choice of any one spicy veg (Bengan Da Bhartha / Saag / Mix Veg / Tarka Palak) with coriander.', price: 5.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 5.0 }, { label: '12"', price: 12.5 }, { label: '16"', price: 16.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's022', no: 22, name: 'Pizza Style Garlic Bread (1 pc)', description: 'Medium base pizza with tomato sauce & garlic.', price: 3.0, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 3.0 }, { label: '12"', price: 4.5 }, { label: '16"', price: 6.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's023', no: 23, name: 'Extra Topping (each)', description: 'Choice of cheese, mixed peppers, onion, red onions, mushrooms, sweetcorn, olives, pineapple, tomatoes & jalapeno.', price: 0.25, category: 'italian-pizzas', section: 'Pizza (Thin Crust or Deep-pan)', sizes: [{ label: '9"', price: 0.25 }, { label: '12"', price: 0.4 }, { label: '16"', price: 0.6 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's024', no: 24, name: 'Family Deal 1', description: 'Any 3 large 16" pizzas, 2 large chips, 6 pcs garlic bread with cheese, 1 large drink (1.5 ltr).', price: 29.99, category: 'family-pizza-deal', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's025', no: 25, name: 'Family Deal 2', description: 'Any 4 large 16" pizzas, 3 large chips, 9 pcs garlic bread with cheese, 1 large drink (1.5 ltr).', price: 39.99, category: 'family-pizza-deal', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's026', no: 26, name: 'Family Deal 3', description: 'Any 3 medium 12" pizzas, 1 large chips, 4 pcs garlic bread with cheese, 1 large drink (1.5 ltr).', price: 21.0, category: 'family-pizza-deal', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's027', no: 27, name: 'Chilli Paneer', description: 'Indian cheese cooked with soya sauce, chillies, green peppers, onion and spices.', price: 6.0, category: 'indo-chinese', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/027.jpg' },
  { id: 's028', no: 28, name: 'Vegetable Hakka Noodles', description: 'Noodles with soya sauce, mixed vegetables and spices.', price: 5.0, category: 'indo-chinese', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's029', no: 29, name: 'Vegetable Fried Rice', description: 'Vegetables and rice cooked in soya sauce and spices.', price: 4.5, category: 'indo-chinese', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's030', no: 30, name: 'Chilli Mushrooms', description: 'Mushrooms cooked with soya sauce, chillies, peppers, onions and spices.', price: 5.0, category: 'indo-chinese', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/030.jpg' },
  { id: 's031', no: 31, name: 'Chilli Mogo', description: 'Cassava cooked with green peppers, onions, soya sauce and spices.', price: 6.0, category: 'indo-chinese', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's032', no: 32, name: 'Chilli Pasta', description: 'Pasta tossed Indo-Chinese style with chillies, peppers, onions and soya sauce.', price: 5.0, category: 'indo-chinese', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's033', no: 33, name: 'Lassi (Sweet, Salted, Mango or Plain)', description: 'Traditional chilled yoghurt drink - sweet, salted, mango or plain.', price: 1.5, category: 'drinks', section: '', sizes: [{ label: 'Regular', price: 1.5 }, { label: 'Large', price: 2.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's034', no: 34, name: 'Milkshake (Mango / Chocolate / Banana)', description: 'Thick creamy milkshake in mango, chocolate or banana.', price: 1.5, category: 'drinks', section: '', sizes: [{ label: 'Regular', price: 1.5 }, { label: 'Large', price: 2.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's035', no: 35, name: 'Milkshake (Vanilla / Strawberry)', description: 'Thick creamy milkshake in vanilla or strawberry.', price: 1.5, category: 'drinks', section: '', sizes: [{ label: 'Regular', price: 1.5 }, { label: 'Large', price: 2.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's036', no: 36, name: 'Rubicon Cans', description: 'Rubicon exotic fruit drink, chilled can.', price: 0.99, category: 'drinks', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's037', no: 37, name: 'Cans', description: 'Chilled soft drink can.', price: 0.99, category: 'drinks', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's038', no: 38, name: 'Fresh Carrot Juice', description: 'Freshly pressed carrot juice.', price: 2.5, category: 'drinks', section: '', sizes: [{ label: 'Regular', price: 2.5 }, { label: 'Large', price: 3.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's039', no: 39, name: 'Mix Juice', description: 'Freshly made mixed fruit juice.', price: 2.5, category: 'drinks', section: '', sizes: [{ label: 'Regular', price: 2.5 }, { label: 'Large', price: 3.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/039.jpg' },
  { id: 's040', no: 40, name: 'Apple Juice', description: 'Chilled apple juice.', price: 2.5, category: 'drinks', section: '', sizes: [{ label: 'Regular', price: 2.5 }, { label: 'Large', price: 3.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's041', no: 41, name: 'Orange Juice', description: 'Chilled orange juice.', price: 2.5, category: 'drinks', section: '', sizes: [{ label: 'Regular', price: 2.5 }, { label: 'Large', price: 3.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/041.jpg' },
  { id: 's042', no: 42, name: 'Faluda', description: 'Rose milk with vermicelli, basil seeds and ice cream.', price: 3.0, category: 'drinks', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's043', no: 43, name: 'Panjabi Tea', description: 'Punjabi-style masala chai brewed with milk and spices.', price: 1.5, category: 'drinks', section: '', sizes: [{ label: 'Regular', price: 1.5 }, { label: 'Large', price: 2.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's044', no: 44, name: 'Coffee', description: 'Hot freshly made coffee.', price: 1.5, category: 'drinks', section: '', sizes: [{ label: 'Regular', price: 1.5 }, { label: 'Large', price: 2.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's045', no: 45, name: 'Milk Coffee', description: 'Hot coffee made with milk.', price: 2.0, category: 'drinks', section: '', sizes: [{ label: 'Regular', price: 2.0 }, { label: 'Large', price: 2.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/045.jpg' },
  { id: 's046', no: 46, name: 'Sada Dosa', description: 'Plain crispy rice & lentil crepe served with sambar and chutney.', price: 2.5, category: 'south-indian', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's047', no: 47, name: 'Masala Dosa', description: 'Crispy dosa filled with spiced potato masala, served with sambar and chutney.', price: 4.0, category: 'south-indian', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/047.jpg' },
  { id: 's048', no: 48, name: 'Paneer Dosa', description: 'Crispy dosa filled with spiced paneer, served with sambar and chutney.', price: 4.5, category: 'south-indian', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's049', no: 49, name: 'Chilli Paneer Dosa', description: 'Crispy dosa filled with Indo-Chinese chilli paneer, served with sambar and chutney.', price: 5.0, category: 'south-indian', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's050', no: 50, name: 'Samosa (1 pc)', description: 'Crisp pastry filled with spiced potatoes and peas.', price: 0.5, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/050.jpg' },
  { id: 's051', no: 51, name: 'Paneer Samosa (3 pcs)', description: 'Crisp pastry filled with spiced paneer.', price: 2.5, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's052', no: 52, name: 'Samosa Chaat', description: 'Crushed samosa topped with chickpeas, yoghurt, chutneys and spices.', price: 3.0, category: 'indian-starters', section: '', sizes: [{ label: 'Regular', price: 3.0 }, { label: 'Large', price: 3.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's053', no: 53, name: 'Alloo Tikki (1 pc)', description: 'Spiced potato patty, shallow fried.', price: 0.75, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/053.jpg' },
  { id: 's054', no: 54, name: 'Alloo Tikki Chaat', description: 'Potato tikki topped with chickpeas, yoghurt, chutneys and spices.', price: 3.0, category: 'indian-starters', section: '', sizes: [{ label: 'Regular', price: 3.0 }, { label: 'Large', price: 3.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's055', no: 55, name: 'Mix Chaat', description: 'Mixed street-food chaat with yoghurt, tamarind and mint chutneys.', price: 3.5, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's056', no: 56, name: 'Paneer Spring Rolls (3 pcs)', description: 'Crispy rolls filled with spiced paneer.', price: 2.0, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's057', no: 57, name: 'Papadoms (2 pcs)', description: 'Crispy lentil wafers.', price: 1.5, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's058', no: 58, name: 'Spicy Papadoms (2 pcs)', description: 'Crispy lentil wafers with spicy seasoning.', price: 2.5, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's059', no: 59, name: 'Bhajia', description: 'Vegetable slices dipped in spiced gram-flour batter and deep fried.', price: 4.5, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/059.jpg' },
  { id: 's060', no: 60, name: 'Lentil Kachori (3 pcs)', description: 'Flaky fried pastry balls stuffed with spiced lentils.', price: 3.0, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's061', no: 61, name: 'Veg. Spring Rolls (3 pcs)', description: 'Crispy rolls filled with mixed vegetables.', price: 1.8, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/061.jpg' },
  { id: 's062', no: 62, name: 'Paneer Pakora (1 portion)', description: 'Paneer pieces in spiced gram-flour batter, deep fried.', price: 4.0, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's063', no: 63, name: 'Pakora (Onion Bhaji)', description: 'Crispy onion fritters in spiced gram-flour batter. Regular 4 pcs / Large 8 pcs.', price: 2.0, category: 'indian-starters', section: '', sizes: [{ label: 'Regular', price: 2.0 }, { label: 'Large', price: 3.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/063.jpg' },
  { id: 's064', no: 64, name: 'Gobhi Pakora (8 pcs)', description: 'Cauliflower florets in spiced gram-flour batter, deep fried.', price: 4.0, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's065', no: 65, name: 'Bread Pakora (2 pcs)', description: 'Bread stuffed with spiced potato, dipped in batter and fried.', price: 2.0, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's066', no: 66, name: 'Bhel', description: 'Puffed rice tossed with onion, potato, sev and tangy chutneys.', price: 3.5, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's067', no: 67, name: 'Pani Puri (6 pcs)', description: 'Crisp hollow puris with spiced potato and tangy mint water.', price: 2.5, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's068', no: 68, name: 'Sev Puri (6 pcs)', description: 'Flat puris topped with potato, onion, chutneys and sev.', price: 3.5, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's069', no: 69, name: 'Dahi Puri (6 pcs)', description: 'Crisp puris filled with potato, yoghurt and sweet & tangy chutneys.', price: 3.5, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's070', no: 70, name: 'Dahi Bhalla', description: 'Soft lentil dumplings soaked in yoghurt, topped with chutneys and spices.', price: 3.5, category: 'indian-starters', section: '', sizes: [{ label: 'Regular', price: 3.5 }, { label: 'Large', price: 4.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/070.jpg' },
  { id: 's071', no: 71, name: 'Jeera Mogo', description: 'Cassava chunks tossed with cumin and spices.', price: 5.0, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's072', no: 72, name: 'Paneer Kebab', description: 'Spiced paneer kebab served with naan bread, salad & dip.', price: 6.0, category: 'indian-starters', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's073', no: 73, name: 'Alloo Parotha', description: 'Pan-cooked chapatti stuffed with mashed potato.', price: 1.5, category: 'indian-parotha', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/073.jpg' },
  { id: 's074', no: 74, name: 'Mooli Parotha', description: 'Pan-cooked chapatti stuffed with grated radish & herbs.', price: 1.75, category: 'indian-parotha', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's075', no: 75, name: 'Methi Parotha', description: 'Sweet green herbs combined with pan-cooked chapatti.', price: 1.5, category: 'indian-parotha', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/075.jpg' },
  { id: 's076', no: 76, name: 'Sweet Parotha', description: 'Pan-cooked chapatti combined with sugar.', price: 1.5, category: 'indian-parotha', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's077', no: 77, name: 'Plain Parotha', description: 'Plain pan-cooked chapatti.', price: 1.0, category: 'indian-parotha', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/077.jpg' },
  { id: 's078', no: 78, name: 'Gobi Parotha', description: 'Pan-cooked chapatti stuffed with grated cauliflower & herbs.', price: 2.0, category: 'indian-parotha', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's079', no: 79, name: 'Paneer Parotha', description: 'Pan-cooked chapatti stuffed with grated paneer & herbs.', price: 2.0, category: 'indian-parotha', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's080', no: 80, name: 'Mix Parotha', description: 'Pan-cooked chapatti stuffed with mixed ingredients & herbs.', price: 2.0, category: 'indian-parotha', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's081', no: 81, name: 'Cheese Parotha', description: 'Pan-cooked chapatti stuffed with cheese, mixed ingredients & herbs.', price: 2.5, category: 'indian-parotha', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's082', no: 82, name: 'Dehi', description: 'Yoghurt.', price: 0.75, category: 'indian-parotha', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's083', no: 83, name: 'Raita', description: 'Yoghurt with grated cucumber and spices.', price: 1.5, category: 'indian-parotha', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's084', no: 84, name: 'Butter', description: 'Slice of butter.', price: 0.5, category: 'indian-parotha', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's085', no: 85, name: 'Pickle', description: 'Mixed pickle.', price: 0.5, category: 'indian-parotha', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's086', no: 86, name: 'Methi Makki Di Roti', description: 'Corn chapatti combined with herbs.', price: 1.75, category: 'side-orders', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's087', no: 87, name: 'Makki Di Roti', description: 'Corn bread.', price: 1.25, category: 'side-orders', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/087.jpg' },
  { id: 's088', no: 88, name: 'Roti', description: 'Chapatti.', price: 0.5, category: 'side-orders', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's089', no: 89, name: 'Bhatura', description: 'Fried bread.', price: 0.6, category: 'side-orders', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's090', no: 90, name: 'Plain Naan', description: 'Leavened bread served with or without butter.', price: 1.5, category: 'side-orders', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's091', no: 91, name: 'Garlic Naan', description: 'Leavened bread topped with garlic and coriander.', price: 1.75, category: 'side-orders', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's092', no: 92, name: 'Chilly Naan', description: 'Leavened bread topped with green chilli and coriander.', price: 1.75, category: 'side-orders', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's093', no: 93, name: 'Masala Naan', description: 'Leavened bread stuffed with spiced masala.', price: 1.75, category: 'side-orders', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's094', no: 94, name: 'Veg. Fried Rice', description: 'Fried rice mixed with pieces of carrot, peas, sweetcorn and green beans.', price: 3.5, category: 'side-orders', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's095', no: 95, name: 'Rice Biryani', description: 'Rice with mixed vegetables.', price: 2.5, category: 'side-orders', section: '', sizes: [{ label: 'Regular', price: 2.5 }, { label: 'Large', price: 3.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/095.jpg' },
  { id: 's096', no: 96, name: 'Plain Boiled Rice', description: 'Steamed basmati rice.', price: 1.5, category: 'side-orders', section: '', sizes: [{ label: 'Regular', price: 1.5 }, { label: 'Large', price: 2.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's097', no: 97, name: 'Onions / Green Chilli', description: 'Fresh sliced onions and green chillies.', price: 0.5, category: 'side-orders', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's098', no: 98, name: 'Mix Salad', description: 'Lettuce, cucumber, tomato, onion, sweetcorn & chilli.', price: 2.5, category: 'salad', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/098.jpg' },
  { id: 's099', no: 99, name: 'Tomato Salad', description: 'Chopped tomatoes with onion.', price: 2.5, category: 'salad', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's100', no: 100, name: 'Cholay', description: 'Chickpeas blended in spicy sauce. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's101', no: 101, name: 'Mahan Di Daal', description: 'Black mixed lentil curry garnished with spices & herbs. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 4.5, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's102', no: 102, name: 'Moong Di Daal', description: 'Green lentil curry garnished with spices & herbs. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 4.5, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's103', no: 103, name: 'Alloo Matar', description: 'Chunks of potatoes mixed with peas in curry sauce and herbs. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's104', no: 104, name: 'Rajmaah', description: 'Kidney beans and potato chunks smoked in spicy sauce. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's105', no: 105, name: 'Masar Di Daal (Tarka Daal)', description: 'Yellow mixed lentil curry garnished with spices & herbs. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 4.5, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's106', no: 106, name: 'Kari', description: 'Vegetable fritters (pakora) cooked in yellow curry. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's107', no: 107, name: 'Mixed Veg Sabji', description: 'Sweetcorn, green beans, peas and potatoes flavoured in spices. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/107.jpg' },
  { id: 's108', no: 108, name: 'Alloo Palak', description: 'Spinach & potato cooked with spices and herbs. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's109', no: 109, name: 'Alloo Gobi', description: 'Cauliflower and potato cooked in flavoured spices and herbs. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's110', no: 110, name: 'Alloo Baingan', description: 'Aubergine and potato cooked in flavoured spices and herbs. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's111', no: 111, name: 'Palak Paneer', description: 'Spinach & paneer flavoured in green herbs. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.5, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/111.jpg' },
  { id: 's112', no: 112, name: 'Matar Paneer', description: 'Paneer and peas cooked in brown spicy sauce. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.5, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/112.jpg' },
  { id: 's113', no: 113, name: 'Kashmiri Paneer', description: 'Chunks of green pepper, onions and slices of paneer, cooked in flavoured spices & herbs. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.5, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's114', no: 114, name: 'Paneer Bhurji', description: 'Dried paneer cooked in tasty cream sauce & spices. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.5, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's115', no: 115, name: 'Tikka Paneer', description: 'Chunks of paneer specially prepared with masala combined with spices. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.5, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's116', no: 116, name: 'Kofta', description: 'Herbs, onions & spices in gram flour, cooked with sliced potato, surrounded by a pool of curry sauce made with spices and peas. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's117', no: 117, name: 'Saag', description: 'Chopped spinach cooked with herbs. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's118', no: 118, name: 'Baingan Da Burtha', description: 'Mashed aubergine cooked with spices & herbs. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 6.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's119', no: 119, name: 'Karalee', description: 'Bitter gourd stuffed with spices and onions. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 6.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's120', no: 120, name: 'Tinda Sabji', description: 'Green vegetable cooked in spices & garnished with herbs. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 6.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's121', no: 121, name: 'Bindi Tori', description: 'Chopped okra cooked in several spices and herbs. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 6.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's122', no: 122, name: 'Cheese Chilli', description: 'Paneer with special masala combined with spices, mingled with chunks of paneer. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.5, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's123', no: 123, name: 'Veggi Mince', description: 'Soya mince cooked in specially prepared masala & peas. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.5, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's124', no: 124, name: 'Sond Di Daal', description: 'Dry ginger cooked with onion, tomato & spices sauce. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 5.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's125', no: 125, name: 'Vegetable Biryani', description: 'Fragrant basmati rice layered with spiced mixed vegetables. Served with 2 bhaturas, 2 rotis or rice (not with delivery).', price: 6.0, category: 'indian-mains', section: 'Curries', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's126', no: 126, name: 'Tandoori Paneer', description: 'Marinated paneer, peppers and onions served sizzling on a hot plate.', price: 7.0, category: 'indian-mains', section: 'Sizzlers', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/126.jpg' },
  { id: 's127', no: 127, name: 'Tandoori Mogo', description: 'Tandoori-spiced cassava with peppers and onions on a sizzling plate.', price: 7.0, category: 'indian-mains', section: 'Sizzlers', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's128', no: 128, name: 'Alloo Shaslik', description: 'Spiced potato skewers with peppers and onions on a sizzling plate.', price: 6.0, category: 'indian-mains', section: 'Sizzlers', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's129', no: 129, name: 'Star Special Sizzler', description: 'House special mixed sizzler of paneer, vegetables and spices.', price: 7.5, category: 'indian-mains', section: 'Sizzlers', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's130', no: 130, name: 'Regular Thali', description: 'Any two main dishes, rice or biryani rice, dehi or raita, 2 rotis or 2 bhaturas, kheer, regular lassi or soft drink.', price: 7.5, category: 'thali', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/130.jpg' },
  { id: 's131', no: 131, name: 'Student Deal - One Time Per Day', description: 'Any one curry served with 3 roti or rice, once per day for a month.', price: 75.0, category: 'thali', section: 'Student Deal Monthly (Eat In or Take Away)', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's132', no: 132, name: 'Student Deal - Two Times Per Day', description: 'Any one large curry served with 6 roti or rice, twice per day for a month.', price: 130.0, category: 'thali', section: 'Student Deal Monthly (Eat In or Take Away)', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's133', no: 133, name: 'Kheer', description: 'Creamy Indian rice pudding with cardamom.', price: 2.0, category: 'sweets-desserts', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's134', no: 134, name: 'Gulab Jamun', description: 'Soft milk dumplings soaked in rose-cardamom syrup.', price: 2.0, category: 'sweets-desserts', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/134.jpg' },
  { id: 's135', no: 135, name: 'Gulab Jamun with Ice Cream', description: 'Warm gulab jamun served with any ice cream.', price: 2.0, category: 'sweets-desserts', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's136', no: 136, name: 'Ice Cream', description: 'Choice of vanilla, strawberry or chocolate.', price: 2.0, category: 'sweets-desserts', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's137', no: 137, name: 'Mozzarella Sticks (4 pcs)', description: 'Breaded mozzarella sticks deep fried and served with salsa sauce.', price: 3.5, category: 'mexican', section: 'Starters', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's138', no: 138, name: 'Jalapeno Poppers (4 pcs)', description: 'Jalapeno halves brimming with smooth rich cream, covered with a light crunchy coating.', price: 3.5, category: 'mexican', section: 'Starters', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/138.jpg' },
  { id: 's139', no: 139, name: 'Nachos', description: 'Crispy tortilla chips covered with a blend of grated cheese, hot jalapeno slices and salsa sauce.', price: 4.0, category: 'mexican', section: 'Starters', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's140', no: 140, name: 'Nachos Special', description: 'Crispy fried wheat-flour chips topped with refried beans, melted cheese, guacamole & salsa sauce.', price: 4.5, category: 'mexican', section: 'Starters', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's141', no: 141, name: 'Onion Rings', description: 'Crispy battered onion rings.', price: 3.5, category: 'mexican', section: 'Starters', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's142', no: 142, name: 'Mexican Chilli with Cheese Wrap', description: 'Soft tortilla wrap with spicy Mexican chilli filling, cheese and salad.', price: 6.5, category: 'mexican', section: 'Wraps', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's143', no: 143, name: 'Potato, Paneer and Sweetcorn Wrap', description: 'Soft tortilla wrap with spiced potato, paneer, sweetcorn and salad.', price: 6.5, category: 'mexican', section: 'Wraps', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/143.jpg' },
  { id: 's144', no: 144, name: 'Chilli Paneer Wrap', description: 'Soft tortilla wrap filled with chilli paneer and salad.', price: 7.5, category: 'mexican', section: 'Wraps', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's145', no: 145, name: 'Mexican Rice', description: 'Rice cooked with tomato, peppers and Mexican spices.', price: 3.0, category: 'mexican', section: 'Wraps', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's146', no: 146, name: 'Plain Chips', description: 'Golden fried potato chips.', price: 1.5, category: 'snacks', section: '', sizes: [{ label: 'Regular', price: 1.5 }, { label: 'Large', price: 2.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's147', no: 147, name: 'Ambli Chips', description: 'Chips tossed in tangy tamarind (ambli) sauce.', price: 2.0, category: 'snacks', section: '', sizes: [{ label: 'Regular', price: 2.0 }, { label: 'Large', price: 3.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's148', no: 148, name: 'Chilli Chips', description: 'Chips tossed with chilli, peppers and onions.', price: 2.0, category: 'snacks', section: '', sizes: [{ label: 'Regular', price: 2.0 }, { label: 'Large', price: 3.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's149', no: 149, name: 'Masala Chips', description: 'Chips coated in spicy masala sauce.', price: 2.0, category: 'snacks', section: '', sizes: [{ label: 'Regular', price: 2.0 }, { label: 'Large', price: 3.0 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's150', no: 150, name: 'Plain Mogo Chips', description: 'Crispy fried cassava chips.', price: 2.5, category: 'snacks', section: '', sizes: [{ label: 'Regular', price: 2.5 }, { label: 'Large', price: 3.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's151', no: 151, name: 'Spicy Mogo Chips', description: 'Cassava chips tossed in spicy masala.', price: 3.5, category: 'snacks', section: '', sizes: [{ label: 'Regular', price: 3.5 }, { label: 'Large', price: 4.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's152', no: 152, name: 'Potato Wedges with Dip', description: 'Seasoned potato wedges served with a dip.', price: 2.5, category: 'snacks', section: '', sizes: [{ label: 'Regular', price: 2.5 }, { label: 'Large', price: 3.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's153', no: 153, name: 'Chip Butty', description: 'Hot chips in a buttered bread roll.', price: 2.5, category: 'snacks', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's154', no: 154, name: 'Special Chip Butty', description: 'Chip butty with special toppings and sauce.', price: 3.5, category: 'snacks', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's155', no: 155, name: 'Beans Topping', description: 'Baked beans topping.', price: 0.5, category: 'snacks', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's156', no: 156, name: 'Cheese Topping', description: 'Grated cheese topping.', price: 0.6, category: 'snacks', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's157', no: 157, name: 'Star Jacket Potato', description: 'Oven-baked jacket potato with butter.', price: 2.5, category: 'snacks', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/157.jpg' },
  { id: 's158', no: 158, name: 'Jacket Potato Topping (choose one)', description: 'Choose one: cheese, beans, sweetcorn, paneer, coleslaw or onion.', price: 0.5, category: 'snacks', section: '', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's159', no: 159, name: 'Veg. Mixed Burger', description: 'Mixed vegetable patty burger with salad. £3.50 with chips.', price: 2.5, category: 'snacks', section: '', sizes: [{ label: 'Regular', price: 2.5 }, { label: 'Large', price: 3.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/159.jpg' },
  { id: 's160', no: 160, name: 'Soya Burger', description: 'Soya patty burger with salad. £3.50 with chips.', price: 2.5, category: 'snacks', section: '', sizes: [{ label: 'Regular', price: 2.5 }, { label: 'Large', price: 3.5 }], diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's161', no: 161, name: 'Kids Veg. Burger Meal', description: 'Veg burger with chips and a small drink.', price: 4.0, category: 'snacks', section: 'Kids Meals (includes small drink)', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
  { id: 's162', no: 162, name: 'Kids Veg. Finger Meal', description: 'Veg fingers with chips and a small drink.', price: 4.0, category: 'snacks', section: 'Kids Meals (includes small drink)', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '/menu/starvashnu/162.jpg' },
  { id: 's163', no: 163, name: 'Kids 9" Pizza Meal', description: '9" cheese & tomato pizza with chips and a small drink.', price: 5.5, category: 'snacks', section: 'Kids Meals (includes small drink)', sizes: null, diet: 'veg', nuts: false, isNew: false, weekend: false, image_url: '' },
]

/** Twelve tables, all free - a brand-new client starts with an empty room. */
export function seedStarTables() {
  const tables = []
  for (let n = 1; n <= 12; n += 1) {
    tables.push({
      id: String(n),
      table_number: n,
      status: 'available',
      session_id: null,
      seats: n <= 6 ? 2 : n <= 10 ? 4 : 6,
    })
  }
  return tables
}

/**
 * PLACEHOLDER STAFF - invented names, to be replaced with the real team at
 * onboarding. Every demo account shares one password; addresses are scoped
 * to the restaurant's own domain, which is what keeps two tenants' staff
 * lists apart.
 */
export function seedStarStaff() {
  return [
    { id: 'u_star_owner', name: 'Meena', role: 'owner', email: 'meena@starvashnu.co.uk', password: 'demo1234', active: true },
    { id: 'u_star_mgr', name: 'Arjun', role: 'manager', email: 'arjun@starvashnu.co.uk', password: 'demo1234', active: true },
    { id: 'u_star_waiter1', name: 'Simran', role: 'waiter', email: 'simran@starvashnu.co.uk', password: 'demo1234', active: true },
    { id: 'u_star_waiter2', name: 'Ravi', role: 'waiter', email: 'ravi@starvashnu.co.uk', password: 'demo1234', active: true },
    { id: 'u_star_kitchen', name: 'Kitchen', role: 'kitchen', email: 'kitchen@starvashnu.co.uk', password: 'demo1234', active: true },
  ]
}

/**
 * Every tenant the mock knows. Firestore replaces this with the
 * `restaurants` collection; the shape is deliberately the same.
 */
export const TENANTS = {
  bobbys: {
    name: RESTAURANT.name,
    tagline: RESTAURANT.tagline,
    status: 'active',
    categories: CATEGORIES,
    menu: MENU,
    tables: seedTables,
    staff: seedStaff,
    soldOut: SEED_SOLD_OUT,
  },
  starvashnu: {
    name: 'Star Vashnu Dhaba',
    tagline: '100% pure vegetarian kitchen',
    status: 'active',
    categories: STAR_CATEGORIES,
    menu: STAR_MENU,
    tables: seedStarTables,
    staff: seedStarStaff,
    soldOut: [],
  },
}
