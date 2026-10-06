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
 * PIN rather than email + password on purpose: this is a shared tablet at a
 * pass, operated with wet hands mid-service. Every real restaurant system
 * lands on a short code for the same reason.
 *
 * These are demo values for the design build only. Replace them — and move
 * verification server-side — before this touches a real till.
 */
export function seedStaff() {
  return [
    { id: 'u_owner', name: 'Bobby', role: 'owner', pin: '1111', active: true },
    { id: 'u_mgr', name: 'Dimple', role: 'manager', pin: '2222', active: true },
    { id: 'u_waiter1', name: 'Rishi', role: 'waiter', pin: '3333', active: true },
    { id: 'u_waiter2', name: 'Priya', role: 'waiter', pin: '5555', active: true },
    { id: 'u_kitchen', name: 'Kitchen', role: 'kitchen', pin: '4444', active: true },
  ]
}
