import { db } from "@/db";
import { cities, edges, journeys, translations } from "@/db/schema";

import "dotenv/config";

// Journey definitions
const JOURNEYS_DATA = [
  {
    slug: "road-to-rome",
    name: "Road to Rome",
    description: "Travel from Venice to Rome by translating Italian words!",
    language: "italian",
    startCityName: "venice",
    targetCityName: "rome",
    emoji: "🇮🇹",
    winMessage: "You Made It to Rome!",
  },
  {
    slug: "camino-de-santiago",
    name: "Camino de Santiago",
    description: "Walk the ancient pilgrim path from Barcelona to Santiago de Compostela!",
    language: "spanish",
    startCityName: "barcelona",
    targetCityName: "santiago",
    emoji: "🐚",
    winMessage: "You Made It to Santiago!",
  },
  {
    slug: "from-the-sea-to-the-sky",
    name: "From the Sea to the Sky",
    description: "Journey from Calais to the French Alps in Bourg-Saint-Maurice!",
    language: "french",
    startCityName: "calais",
    targetCityName: "bourg-saint-maurice",
    emoji: "⛷️",
    winMessage: "You Made It to the Alps!",
  },
];

// Italian translations (50 words)
const ITALIAN_TRANSLATIONS = [
  // Greetings & Basics
  { source: "ciao", target: "hello" },
  { source: "grazie", target: "thank you" },
  { source: "prego", target: "you're welcome" },
  { source: "scusa", target: "sorry" },
  { source: "buongiorno", target: "good morning" },
  { source: "buonasera", target: "good evening" },
  { source: "arrivederci", target: "goodbye" },
  { source: "per favore", target: "please" },
  // Food & Drink
  { source: "acqua", target: "water" },
  { source: "pane", target: "bread" },
  { source: "vino", target: "wine" },
  { source: "formaggio", target: "cheese" },
  { source: "pizza", target: "pizza" },
  { source: "pasta", target: "pasta" },
  { source: "caffe", target: "coffee" },
  { source: "latte", target: "milk" },
  { source: "frutta", target: "fruit" },
  { source: "carne", target: "meat" },
  { source: "pesce", target: "fish" },
  { source: "gelato", target: "ice cream" },
  // Places
  { source: "casa", target: "house" },
  { source: "strada", target: "street" },
  { source: "chiesa", target: "church" },
  { source: "piazza", target: "square" },
  { source: "ponte", target: "bridge" },
  { source: "museo", target: "museum" },
  { source: "ristorante", target: "restaurant" },
  { source: "stazione", target: "station" },
  // Nature
  { source: "sole", target: "sun" },
  { source: "luna", target: "moon" },
  { source: "mare", target: "sea" },
  { source: "montagna", target: "mountain" },
  { source: "fiume", target: "river" },
  { source: "fiore", target: "flower" },
  { source: "albero", target: "tree" },
  { source: "cielo", target: "sky" },
  // People & Family
  { source: "amico", target: "friend" },
  { source: "famiglia", target: "family" },
  { source: "madre", target: "mother" },
  { source: "padre", target: "father" },
  { source: "bambino", target: "child" },
  // Common Words
  { source: "tempo", target: "time" },
  { source: "giorno", target: "day" },
  { source: "notte", target: "night" },
  { source: "anno", target: "year" },
  { source: "amore", target: "love" },
  { source: "vita", target: "life" },
  { source: "libro", target: "book" },
  { source: "lavoro", target: "work" },
  { source: "viaggio", target: "journey" },
];

// Spanish translations (50 words)
const SPANISH_TRANSLATIONS = [
  // Greetings & Basics
  { source: "hola", target: "hello" },
  { source: "gracias", target: "thank you" },
  { source: "de nada", target: "you're welcome" },
  { source: "perdón", target: "sorry" },
  { source: "buenos días", target: "good morning" },
  { source: "buenas noches", target: "good evening" },
  { source: "adiós", target: "goodbye" },
  { source: "por favor", target: "please" },
  // Food & Drink
  { source: "agua", target: "water" },
  { source: "pan", target: "bread" },
  { source: "vino", target: "wine" },
  { source: "queso", target: "cheese" },
  { source: "carne", target: "meat" },
  { source: "pescado", target: "fish" },
  { source: "café", target: "coffee" },
  { source: "leche", target: "milk" },
  { source: "fruta", target: "fruit" },
  { source: "cerveza", target: "beer" },
  { source: "pollo", target: "chicken" },
  { source: "arroz", target: "rice" },
  // Pilgrimage & Places
  { source: "camino", target: "path" },
  { source: "peregrino", target: "pilgrim" },
  { source: "iglesia", target: "church" },
  { source: "catedral", target: "cathedral" },
  { source: "albergue", target: "hostel" },
  { source: "pueblo", target: "village" },
  { source: "ciudad", target: "city" },
  { source: "plaza", target: "square" },
  // Nature
  { source: "sol", target: "sun" },
  { source: "luna", target: "moon" },
  { source: "mar", target: "sea" },
  { source: "montaña", target: "mountain" },
  { source: "río", target: "river" },
  { source: "flor", target: "flower" },
  { source: "árbol", target: "tree" },
  { source: "cielo", target: "sky" },
  // People & Family
  { source: "amigo", target: "friend" },
  { source: "familia", target: "family" },
  { source: "madre", target: "mother" },
  { source: "padre", target: "father" },
  { source: "niño", target: "child" },
  // Common Words
  { source: "tiempo", target: "time" },
  { source: "día", target: "day" },
  { source: "noche", target: "night" },
  { source: "año", target: "year" },
  { source: "amor", target: "love" },
  { source: "vida", target: "life" },
  { source: "libro", target: "book" },
  { source: "trabajo", target: "work" },
  { source: "viaje", target: "journey" },
];

// French translations (50 words)
const FRENCH_TRANSLATIONS = [
  // Greetings & Basics
  { source: "bonjour", target: "hello" },
  { source: "merci", target: "thank you" },
  { source: "de rien", target: "you're welcome" },
  { source: "pardon", target: "sorry" },
  { source: "bonsoir", target: "good evening" },
  { source: "au revoir", target: "goodbye" },
  { source: "s'il vous plaît", target: "please" },
  { source: "salut", target: "hi" },
  // Food & Drink
  { source: "eau", target: "water" },
  { source: "pain", target: "bread" },
  { source: "vin", target: "wine" },
  { source: "fromage", target: "cheese" },
  { source: "viande", target: "meat" },
  { source: "poisson", target: "fish" },
  { source: "café", target: "coffee" },
  { source: "lait", target: "milk" },
  { source: "fruit", target: "fruit" },
  { source: "bière", target: "beer" },
  { source: "poulet", target: "chicken" },
  { source: "croissant", target: "croissant" },
  // Skiing & Mountain
  { source: "neige", target: "snow" },
  { source: "ski", target: "ski" },
  { source: "piste", target: "slope" },
  { source: "montagne", target: "mountain" },
  { source: "sommet", target: "summit" },
  { source: "télésiège", target: "chairlift" },
  { source: "chalet", target: "chalet" },
  { source: "vallée", target: "valley" },
  // Nature
  { source: "soleil", target: "sun" },
  { source: "lune", target: "moon" },
  { source: "mer", target: "sea" },
  { source: "rivière", target: "river" },
  { source: "fleur", target: "flower" },
  { source: "arbre", target: "tree" },
  { source: "ciel", target: "sky" },
  { source: "forêt", target: "forest" },
  // People & Family
  { source: "ami", target: "friend" },
  { source: "famille", target: "family" },
  { source: "mère", target: "mother" },
  { source: "père", target: "father" },
  { source: "enfant", target: "child" },
  // Common Words
  { source: "temps", target: "time" },
  { source: "jour", target: "day" },
  { source: "nuit", target: "night" },
  { source: "année", target: "year" },
  { source: "amour", target: "love" },
  { source: "vie", target: "life" },
  { source: "livre", target: "book" },
  { source: "travail", target: "work" },
  { source: "voyage", target: "journey" },
];

// Italian cities (Venice to Rome)
const ITALIAN_CITIES = [
  { name: "venice", displayName: "Venice", position: 0 },
  { name: "padua", displayName: "Padua", position: 1 },
  { name: "ferrara", displayName: "Ferrara", position: 1 },
  { name: "bologna", displayName: "Bologna", position: 2 },
  { name: "modena", displayName: "Modena", position: 2 },
  { name: "florence", displayName: "Florence", position: 3 },
  { name: "siena", displayName: "Siena", position: 3 },
  { name: "perugia", displayName: "Perugia", position: 4 },
  { name: "orvieto", displayName: "Orvieto", position: 4 },
  { name: "rome", displayName: "Rome", position: 5 },
];

// Spanish cities (Barcelona to Santiago de Compostela)
const SPANISH_CITIES = [
  { name: "barcelona", displayName: "Barcelona", position: 0 },
  { name: "zaragoza", displayName: "Zaragoza", position: 1 },
  { name: "lleida", displayName: "Lleida", position: 1 },
  { name: "pamplona", displayName: "Pamplona", position: 2 },
  { name: "logrono", displayName: "Logroño", position: 2 },
  { name: "burgos", displayName: "Burgos", position: 3 },
  { name: "leon", displayName: "León", position: 3 },
  { name: "astorga", displayName: "Astorga", position: 4 },
  { name: "ponferrada", displayName: "Ponferrada", position: 4 },
  { name: "santiago", displayName: "Santiago de Compostela", position: 5 },
];

// French cities (Calais to Bourg-Saint-Maurice)
const FRENCH_CITIES = [
  { name: "calais", displayName: "Calais", position: 0 },
  { name: "lille", displayName: "Lille", position: 1 },
  { name: "reims", displayName: "Reims", position: 1 },
  { name: "paris", displayName: "Paris", position: 2 },
  { name: "troyes", displayName: "Troyes", position: 2 },
  { name: "dijon", displayName: "Dijon", position: 3 },
  { name: "besancon", displayName: "Besançon", position: 3 },
  { name: "lyon", displayName: "Lyon", position: 4 },
  { name: "chambery", displayName: "Chambéry", position: 4 },
  { name: "bourg-saint-maurice", displayName: "Bourg-Saint-Maurice", position: 5 },
];

// Standard graph edges pattern for all journeys
// Each city at position N connects to 2 cities at position N+1
function getEdgesForCities(citiesList: typeof ITALIAN_CITIES) {
  const edgesList: Array<{ from: string; to: string }> = [];

  // Group cities by position
  const byPosition = new Map<number, typeof citiesList>();
  for (const city of citiesList) {
    if (!byPosition.has(city.position)) {
      byPosition.set(city.position, []);
    }
    byPosition.get(city.position)!.push(city);
  }

  // For each position, connect cities to next position's cities
  const maxPosition = Math.max(...citiesList.map(c => c.position));
  for (let pos = 0; pos < maxPosition; pos++) {
    const currentCities = byPosition.get(pos) || [];
    const nextCities = byPosition.get(pos + 1) || [];

    for (const fromCity of currentCities) {
      for (const toCity of nextCities) {
        edgesList.push({ from: fromCity.name, to: toCity.name });
      }
    }
  }

  return edgesList;
}

interface JourneyData {
  slug: string;
  name: string;
  description: string;
  language: string;
  startCityName: string;
  targetCityName: string;
  emoji: string;
  winMessage: string;
}

interface TranslationData {
  source: string;
  target: string;
}

interface CityData {
  name: string;
  displayName: string;
  position: number;
}

async function seedJourney(
  journeyData: JourneyData,
  translationsData: TranslationData[],
  citiesData: CityData[]
) {
  console.log(`\nSeeding journey: ${journeyData.name}...`);

  // Insert journey
  const [insertedJourney] = await db
    .insert(journeys)
    .values(journeyData)
    .returning();

  if (!insertedJourney) {
    throw new Error(`Failed to insert journey: ${journeyData.slug}`);
  }

  const journeyId = insertedJourney.id;

  // Insert translations
  console.log(`  Inserting ${translationsData.length} translations...`);
  await db.insert(translations).values(
    translationsData.map((t) => ({
      journeyId,
      sourceWord: t.source,
      targetWord: t.target,
    }))
  );

  // Insert cities
  console.log(`  Inserting ${citiesData.length} cities...`);
  const insertedCities = await db
    .insert(cities)
    .values(
      citiesData.map((c) => ({
        journeyId,
        name: c.name,
        displayName: c.displayName,
        position: c.position,
      }))
    )
    .returning();

  // Create city lookup map
  const cityMap = new Map(insertedCities.map((c) => [c.name, c.id]));

  // Insert edges
  const edgesData = getEdgesForCities(citiesData);
  console.log(`  Inserting ${edgesData.length} edges...`);
  for (const edge of edgesData) {
    const fromCityId = cityMap.get(edge.from);
    const toCityId = cityMap.get(edge.to);

    if (!fromCityId || !toCityId) {
      console.error(`  Missing data for edge: ${edge.from} -> ${edge.to}`);
      continue;
    }

    await db.insert(edges).values({
      fromCityId,
      toCityId,
    });
  }

  console.log(`  Journey "${journeyData.name}" seeded successfully!`);
}

export async function seedGame() {
  console.log("\n=== Seeding game data ===");

  // Check if any journeys already exist
  const existingJourney = await db.query.journeys.findFirst();
  if (existingJourney) {
    console.log("Game data already seeded, skipping...");

    return;
  }

  // Seed each journey
  await seedJourney(JOURNEYS_DATA[0]!, ITALIAN_TRANSLATIONS, ITALIAN_CITIES);
  await seedJourney(JOURNEYS_DATA[1]!, SPANISH_TRANSLATIONS, SPANISH_CITIES);
  await seedJourney(JOURNEYS_DATA[2]!, FRENCH_TRANSLATIONS, FRENCH_CITIES);

  console.log("\nGame data seeding complete!");
  console.log("Created 3 journeys:");
  console.log("  - Road to Rome (Italian)");
  console.log("  - Camino de Santiago (Spanish)");
  console.log("  - From the Sea to the Sky (French)");
}

// Allow running directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedGame()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Game seeding failed:", err);
      process.exit(1);
    });
}
