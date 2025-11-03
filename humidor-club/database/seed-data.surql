-- Seed Data for Humidor Club
-- Based on real cigars from Neptune Cigars and other retailers

-- =============================================================================
-- BRANDS
-- =============================================================================

-- Premium Dominican Brands
LET $fuente = CREATE brand SET
  name = "Arturo Fuente",
  slug = ""arturo-fuente",
  country = "Dominican Republic",
  slug = "1912,
  description = "One of the most prestigious cigar manufacturers, known for premium quality and the legendary Opus X line.",
  website = "https://www.arturofuente.com",
  logo_url = null;

LET $ashton = CREATE brand SET
  name = "Ashton",
  slug = ""ashton",
  country = "Dominican Republic", 
  slug = "1985,
  description = "Premium cigar brand known for consistent quality and the highly-rated VSG and ESG lines.",
  website = "https://www.ashtoncigars.com",
  logo_url = null;

LET $davidoff = CREATE brand SET
  name = "Davidoff",
  country = "Dominican Republic",
  slug = "1911,
  description = "Luxury Swiss cigar brand known for exceptional quality and elegant blends.",
  website = "https://www.davidoff.com",
  logo_url = null,
  logo_url = null;

-- Nicaraguan Powerhouses
LET $padron = CREATE brand SET
  name = "Padron",
  country = "Nicaragua",
  slug = "1964,
  description = "Family-owned manufacturer producing some of the highest-rated cigars in the world.",
  website = "https://www.padron.com",
  logo_url = null,
  logo_url = null;

LET $drew_estate = CREATE brand SET
  name = "Drew Estate",
  country = "Nicaragua",
  slug = "1996,
  description = "Innovative manufacturer known for Liga Privada, Undercrown, and infused Acid cigars.",
  website = "https://drewestate.com",
  logo_url = null,
  logo_url = null;

LET $aj_fernandez = CREATE brand SET
  name = "AJ Fernandez",
  country = "Nicaragua",
  slug = "2007,
  description = "Master blender creating bold, flavorful Nicaraguan cigars at accessible prices.",
  website = "https://ajfcigars.com",
  logo_url = null,
  logo_url = null;

LET $oliva = CREATE brand SET
  name = "Oliva",
  country = "Nicaragua",
  slug = "1995,
  description = "Premium Nicaraguan cigars known for Serie V and Serie O lines.",
  website = "https://olivacigar.com",
  logo_url = null,
  logo_url = null;

-- Boutique Brands
LET $alec_bradley = CREATE brand SET
  name = "Alec Bradley",
  country = "Honduras",
  slug = "1996,
  description = "Boutique brand creating award-winning blends like Prensado and Black Market.",
  website = "https://alecbradley.com",
  logo_url = null,
  logo_url = null;

LET $aging_room = CREATE brand SET
  name = "Aging Room",
  country = "Dominican Republic",
  slug = "2009,
  description = "Boutique brand by Rafael Nodal, known for meticulously aged tobaccos.",
  website = null,
  logo_url = null,
  logo_url = null;

LET $romeo = CREATE brand SET
  name = "Romeo y Julieta",
  country = "Dominican Republic",
  slug = "1875,
  description = "Historic Cuban brand now producing premium cigars in Dominican Republic.",
  website = "https://www.romeoyjulieta.com",
  logo_url = null,
  logo_url = null;

-- =============================================================================
-- CIGAR LINES
-- =============================================================================

-- Arturo Fuente Lines
LET $fuente_hemingway = (CREATE line SET
  name = "Hemingway",
  shortName = "Hemingway",
  description = "Perfecto-shaped cigars with a sweet Cameroon wrapper, named after Ernest Hemingway.",
  strength = "medium",
  wrapper = "Cameroon")[0];
CREATE produces SET in = $fuente, out = $fuente_hemingway;

LET $fuente_opusx = (CREATE line SET
  name = "Opus X",
  shortName = "Opus X",
  description = "Ultra-premium line with rare Dominican wrapper, considered one of the world's finest cigars.",
  strength = "full",
  wrapper = "Dominican")[0];
CREATE produces SET in = $fuente, out = $fuente_opusx;

LET $fuente_classic = (CREATE line SET
  name = "Classic",
  shortName = "Classic",
  description = "The original Arturo Fuente line, offering excellent quality at accessible prices.",
  strength = "mild-medium",
  wrapper = "Ecuadorian Connecticut")[0];
CREATE produces SET in = $fuente, out = $fuente_classic;

LET $fuente_don_carlos = (CREATE line SET
  name = "Don Carlos",
  shortName = "Don Carlos",
  description = "Premium line named after family patriarch, featuring aged tobaccos.",
  strength = "medium-full",
  wrapper = "Cameroon")[0];
CREATE produces SET in = $fuente, out = $fuente_don_carlos;

-- Drew Estate Lines
LET $liga_privada = (CREATE line SET
  name = "Liga Privada",
  shortName = "Liga Privada",
  description = "Ultra-premium line originally made for Drew Estate's personal use.",
  strength = "full",
  wrapper = "Connecticut Broadleaf")[0];
CREATE produces SET in = $drew_estate, out = $liga_privada;

LET $undercrown = (CREATE line SET
  name = "Undercrown",
  shortName = "Undercrown",
  description = "Created by factory rollers as an alternative to Liga Privada.",
  strength = "medium-full",
  wrapper = "Brazilian Mata Fina")[0];
CREATE produces SET in = $drew_estate, out = $undercrown;

-- Padron Lines
LET $padron_1964 = (CREATE line SET
  name = "1964 Anniversary Series",
  shortName = "1964",
  description = "Premium line celebrating the founding year, box-pressed with 4 years aging.",
  strength = "full",
  wrapper = "Nicaraguan")[0];
CREATE produces SET in = $padron, out = $padron_1964;

LET $padron_1926 = (CREATE line SET
  name = "1926 Serie",
  shortName = "1926",
  description = "Super-premium line honoring patriarch's birth year, 5+ years aging.",
  strength = "full",
  wrapper = "Nicaraguan")[0];
CREATE produces SET in = $padron, out = $padron_1926;

-- Ashton Lines
LET $ashton_vsg = (CREATE line SET
  name = "Virgin Sun Grown (VSG)",
  shortName = "VSG",
  description = "Full-bodied line with Ecuadorian sun-grown wrapper, highly rated.",
  strength = "full",
  wrapper = "Ecuadorian Sun Grown")[0];
CREATE produces SET in = $ashton, out = $ashton_vsg;

LET $ashton_esg = (CREATE line SET
  name = "Estate Sun Grown (ESG)",
  shortName = "ESG",
  description = "Premium line featuring estate-grown Chateau de la Fuente wrapper.",
  strength = "medium-full",
  wrapper = "Dominican")[0];
CREATE produces SET in = $ashton, out = $ashton_esg;

-- Oliva Lines
LET $oliva_v = (CREATE line SET
  name = "Serie V",
  shortName = "Serie V",
  description = "Full-bodied flagship line, highly rated and award-winning.",
  strength = "full",
  wrapper = "Habano Sun Grown")[0];
CREATE produces SET in = $oliva, out = $oliva_v;

-- Alec Bradley Lines
LET $prensado = (CREATE line SET
  name = "Prensado",
  shortName = "Prensado",
  description = "Box-pressed cigars with Honduran Corojo wrapper, Cigar of the Year 2011.",
  strength = "medium-full",
  wrapper = "Honduran Corojo")[0];
CREATE produces SET in = $alec_bradley, out = $prensado;

-- Aging Room Lines
LET $quattro = (CREATE line SET
  name = "Quattro",
  shortName = "Quattro",
  description = "Four different wrapper blends aged minimum 4 years.",
  strength = "medium-full",
  wrapper = "Various")[0];
CREATE produces SET in = $aging_room, out = $quattro;

-- Romeo y Julieta Lines
LET $reserva_real = (CREATE line SET
  name = "Reserva Real",
  shortName = "Reserva Real",
  description = "Smooth, medium-bodied cigars with Ecuadorian Connecticut wrapper.",
  strength = "medium",
  wrapper = "Ecuadorian Connecticut")[0];
CREATE produces SET in = $romeo, out = $reserva_real;

-- =============================================================================
-- CIGARS (Vitolas)
-- =============================================================================

-- Arturo Fuente Hemingway
LET $hemingway_short_story = (CREATE cigar SET
  name = "Short Story",
  vitola = "Perfecto",
  length = 4.0,
  ringGauge = 49,
  description = "Classic perfecto shape, perfect for a quick smoke with full Hemingway character.",
  wrapperLeaf = "Cameroon",
  binderLeaf = "Dominican",
  fillerLeaves = ["Dominican"],
  strength = "medium",
  bodyProfile = "medium")[0];
CREATE contains SET in = $fuente_hemingway, out = $hemingway_short_story;

LET $hemingway_classic = (CREATE cigar SET
  name = "Classic",
  vitola = "Perfecto",
  length = 7.0,
  ringGauge = 48,
  description = "Signature Hemingway vitola, elegant perfecto shape.",
  wrapperLeaf = "Cameroon",
  binderLeaf = "Dominican",
  fillerLeaves = ["Dominican"],
  strength = "medium",
  bodyProfile = "medium")[0];
CREATE contains SET in = $fuente_hemingway, out = $hemingway_classic;

-- Arturo Fuente Opus X
LET $opusx_perfecxion = (CREATE cigar SET
  name = "PerfecXion X",
  vitola = "Toro",
  length = 6.25,
  ringGauge = 48,
  description = "Premium toro featuring rare Dominican wrapper, Angels Share release.",
  wrapperLeaf = "Dominican",
  binderLeaf = "Dominican",
  fillerLeaves = ["Dominican"],
  strength = "full",
  bodyProfile = "full")[0];
CREATE contains SET in = $fuente_opusx, out = $opusx_perfecxion;

-- Arturo Fuente Classic
LET $fuente_exquisitos = (CREATE cigar SET
  name = "Exquisitos",
  vitola = "Small Panatela",
  length = 4.5,
  ringGauge = 33,
  description = "Small, elegant panatela perfect for a quick quality smoke.",
  wrapperLeaf = "Ecuadorian Connecticut",
  binderLeaf = "Dominican",
  fillerLeaves = ["Dominican"],
  strength = "mild-medium",
  bodyProfile = "mild-medium")[0];
CREATE contains SET in = $fuente_classic, out = $fuente_exquisitos;

-- Drew Estate Liga Privada
LET $liga_no9 = (CREATE cigar SET
  name = "No. 9",
  vitola = "Toro",
  length = 6.0,
  ringGauge = 52,
  description = "Legendary full-bodied blend with Connecticut Broadleaf wrapper.",
  wrapperLeaf = "Connecticut Broadleaf",
  binderLeaf = "Brazilian Mata Fina",
  fillerLeaves = ["Nicaraguan", "Honduran"],
  strength = "full",
  bodyProfile = "full")[0];
CREATE contains SET in = $liga_privada, out = $liga_no9;

LET $liga_t52 = (CREATE cigar SET
  name = "T52",
  vitola = "Robusto",
  length = 5.0,
  ringGauge = 52,
  description = "Unique stalk-cut Habano wrapper creates a spicy, complex smoke.",
  wrapperLeaf = "Connecticut Habano",
  binderLeaf = "Brazilian Mata Fina",
  fillerLeaves = ["Nicaraguan", "Honduran"],
  strength = "full",
  bodyProfile = "full")[0];
CREATE contains SET in = $liga_privada, out = $liga_t52;

-- Drew Estate Undercrown
LET $undercrown_maduro_flying_pig = (CREATE cigar SET
  name = "Flying Pig",
  vitola = "Perfecto",
  length = 4.0,
  ringGauge = 60,
  description = "Short, stout perfecto with rich maduro wrapper.",
  wrapperLeaf = "Brazilian Mata Fina",
  binderLeaf = "Connecticut Habano",
  fillerLeaves = ["Nicaraguan"],
  strength = "full",
  bodyProfile = "full")[0];
CREATE contains SET in = $undercrown, out = $undercrown_maduro_flying_pig;

-- Padron 1964 Anniversary
LET $padron_1964_principe = (CREATE cigar SET
  name = "Principe",
  vitola = "Robusto",
  length = 4.5,
  ringGauge = 46,
  description = "Box-pressed robusto with 4 years aging, rich and complex.",
  wrapperLeaf = "Nicaraguan",
  binderLeaf = "Nicaraguan",
  fillerLeaves = ["Nicaraguan"],
  strength = "full",
  bodyProfile = "full")[0];
CREATE contains SET in = $padron_1964, out = $padron_1964_principe;

-- Ashton VSG
LET $vsg_robusto = (CREATE cigar SET
  name = "Robusto",
  vitola = "Robusto",
  length = 5.0,
  ringGauge = 50,
  description = "Full-bodied robusto with Ecuadorian sun-grown wrapper, consistently highly rated.",
  wrapperLeaf = "Ecuadorian Sun Grown",
  binderLeaf = "Dominican",
  fillerLeaves = ["Dominican", "Nicaraguan"],
  strength = "full",
  bodyProfile = "full")[0];
CREATE contains SET in = $ashton_vsg, out = $vsg_robusto;

-- Oliva Serie V
LET $oliva_v_melanio = (CREATE cigar SET
  name = "Melanio",
  vitola = "Figurado",
  length = 6.5,
  ringGauge = 52,
  description = "Box-pressed figurado, Cigar of the Year 2014.",
  wrapperLeaf = "Ecuadorian Sumatra",
  binderLeaf = "Nicaraguan",
  fillerLeaves = ["Nicaraguan"],
  strength = "full",
  bodyProfile = "full")[0];
CREATE contains SET in = $oliva_v, out = $oliva_v_melanio;

-- Alec Bradley Prensado
LET $prensado_churchill = (CREATE cigar SET
  name = "Churchill",
  vitola = "Churchill",
  length = 7.0,
  ringGauge = 50,
  description = "Box-pressed Churchill, Cigar of the Year 2011.",
  wrapperLeaf = "Honduran Corojo",
  binderLeaf = "Nicaraguan",
  fillerLeaves = ["Honduran", "Nicaraguan"],
  strength = "medium-full",
  bodyProfile = "medium-full")[0];
CREATE contains SET in = $prensado, out = $prensado_churchill;

-- Aging Room Quattro
LET $quattro_concerto = (CREATE cigar SET
  name = "Concerto",
  vitola = "Churchill",
  length = 7.0,
  ringGauge = 50,
  description = "Churchill vitola with 4+ years aging, smooth and complex.",
  wrapperLeaf = "Honduran Habano",
  binderLeaf = "Dominican",
  fillerLeaves = ["Dominican", "Nicaraguan"],
  strength = "medium-full",
  bodyProfile = "medium-full")[0];
CREATE contains SET in = $quattro, out = $quattro_concerto;

-- Romeo y Julieta Reserva Real
LET $reserva_robusto = (CREATE cigar SET
  name = "Robusto",
  vitola = "Robusto",
  length = 5.0,
  ringGauge = 52,
  description = "Smooth, medium-bodied robusto with Ecuadorian Connecticut wrapper.",
  wrapperLeaf = "Ecuadorian Connecticut",
  binderLeaf = "Nicaraguan",
  fillerLeaves = ["Dominican", "Nicaraguan"],
  strength = "medium",
  bodyProfile = "medium")[0];
CREATE contains SET in = $reserva_real, out = $reserva_robusto;

LET $reserva_churchill = (CREATE cigar SET
  name = "Churchill",
  vitola = "Churchill",
  length = 7.0,
  ringGauge = 50,
  description = "Classic Churchill size with smooth, creamy profile.",
  wrapperLeaf = "Ecuadorian Connecticut",
  binderLeaf = "Nicaraguan",
  fillerLeaves = ["Dominican", "Nicaraguan"],
  strength = "medium",
  bodyProfile = "medium")[0];
CREATE contains SET in = $reserva_real, out = $reserva_churchill;

-- Davidoff Cigars
LET $davidoff_classic = (CREATE cigar SET
  name = "Mini Cigarillos Gold",
  vitola = "Cigarillo",
  length = 3.5,
  ringGauge = 20,
  description = "Premium small cigars, smooth with easy draw.",
  wrapperLeaf = "Dominican",
  binderLeaf = "Dominican",
  fillerLeaves = ["Dominican"],
  strength = "medium",
  bodyProfile = "medium")[0];
CREATE contains SET in = (SELECT VALUE id FROM line WHERE name = "Davidoff Classic" LIMIT 1)[0], out = $davidoff_classic;

-- =============================================================================
-- RELEASES (Current Production with Pricing from Neptune Cigars)
-- =============================================================================

CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 7.79,
  averagePrice = 7.79,
  available = true,
  notes = "Current production, widely available",
  cigar = $hemingway_short_story;

CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 38.34,
  averagePrice = 38.34,
  available = true,
  notes = "Angels Share release, limited availability - 5 singles max per customer",
  cigar = $opusx_perfecxion;

CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 3.18,
  averagePrice = 2.77,
  available = true,
  notes = "Box of 50 available",
  cigar = $fuente_exquisitos;

CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 14.40,
  averagePrice = 13.08,
  available = true,
  notes = "Box of 12 available",
  cigar = $undercrown_maduro_flying_pig;

CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 11.40,
  averagePrice = 10.50,
  available = true,
  notes = "Current production",
  cigar = $quattro_concerto;

CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 9.45,
  averagePrice = 9.16,
  available = true,
  notes = "Box of 25 available",
  cigar = $reserva_robusto;

CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 9.85,
  averagePrice = 9.56,
  available = true,
  notes = "Box of 25 available",
  cigar = $reserva_churchill;

CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 1.04,
  averagePrice = 0.80,
  available = true,
  notes = "Tin of 20, Box of 50, or Box of 100",
  cigar = $davidoff_classic;

-- Liga Privada releases
CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 14.95,
  averagePrice = 13.45,
  available = true,
  notes = "Highly sought after, may have limited availability",
  cigar = $liga_no9;

CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 13.95,
  averagePrice = 12.55,
  available = true,
  notes = "Regular production",
  cigar = $liga_t52;

-- Padron 1964
CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 13.50,
  averagePrice = 12.15,
  available = true,
  notes = "Box-pressed with 4 years aging",
  cigar = $padron_1964_principe;

-- Ashton VSG
CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 10.95,
  averagePrice = 9.85,
  available = true,
  notes = "Consistently high ratings",
  cigar = $vsg_robusto;

-- Oliva Serie V
CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 11.95,
  averagePrice = 10.75,
  available = true,
  notes = "Cigar of the Year 2014",
  cigar = $oliva_v_melanio;

-- Alec Bradley Prensado
CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 9.95,
  averagePrice = 8.95,
  available = true,
  notes = "Cigar of the Year 2011",
  cigar = $prensado_churchill;

-- Hemingway Classic
CREATE release SET
  releaseYear = 2024,
  productionRun = "Regular Production",
  limitedEdition = false,
  msrp = 14.50,
  averagePrice = 13.05,
  available = true,
  notes = "Signature Hemingway perfecto",
  cigar = $hemingway_classic;

RETURN {
  message: "✅ Seed data loaded successfully!",
  summary: {
    brands: (SELECT count() FROM brand GROUP ALL)[0].count,
    lines: (SELECT count() FROM line GROUP ALL)[0].count,
    cigars: (SELECT count() FROM cigar GROUP ALL)[0].count,
    releases: (SELECT count() FROM release GROUP ALL)[0].count
  }
};

