import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (handle if tables don't exist)
  try {
    await prisma.release.deleteMany();
  } catch (e) {}
  try {
    await prisma.cigar.deleteMany();
  } catch (e) {}
  try {
    await prisma.line.deleteMany();
  } catch (e) {}
  try {
    await prisma.brand.deleteMany();
  } catch (e) {}

  // Create Brands
  const fuente = await prisma.brand.create({
    data: {
      name: 'Arturo Fuente',
      slug: 'arturo-fuente',
      country: 'Dominican Republic',
      founded: 1912,
      description: 'One of the most prestigious cigar manufacturers, known for premium quality and the legendary Opus X line.',
      website: 'https://www.arturofuente.com',
    },
  });

  const padron = await prisma.brand.create({
    data: {
      name: 'Padron',
      slug: 'padron',
      country: 'Nicaragua',
      founded: 1964,
      description: 'Family-owned manufacturer producing some of the highest-rated cigars in the world.',
      website: 'https://www.padron.com',
    },
  });

  const drewEstate = await prisma.brand.create({
    data: {
      name: 'Drew Estate',
      slug: 'drew-estate',
      country: 'Nicaragua',
      founded: 1996,
      description: 'Innovative manufacturer known for Liga Privada, Undercrown, and infused Acid cigars.',
      website: 'https://drewestate.com',
    },
  });

  const ashton = await prisma.brand.create({
    data: {
      name: 'Ashton',
      slug: 'ashton',
      country: 'Dominican Republic',
      founded: 1985,
      description: 'Premium cigar brand known for consistent quality and the highly-rated VSG and ESG lines.',
      website: 'https://www.ashtoncigars.com',
    },
  });

  const oliva = await prisma.brand.create({
    data: {
      name: 'Oliva',
      slug: 'oliva',
      country: 'Nicaragua',
      founded: 1995,
      description: 'Premium Nicaraguan cigars known for Serie V and Serie O lines.',
      website: 'https://olivacigar.com',
    },
  });

  const alecBradley = await prisma.brand.create({
    data: {
      name: 'Alec Bradley',
      slug: 'alec-bradley',
      country: 'Honduras',
      founded: 1996,
      description: 'Boutique brand creating award-winning blends like Prensado and Black Market.',
      website: 'https://alecbradley.com',
    },
  });

  const romeo = await prisma.brand.create({
    data: {
      name: 'Romeo y Julieta',
      slug: 'romeo-y-julieta',
      country: 'Dominican Republic',
      founded: 1875,
      description: 'Historic Cuban brand now producing premium cigars in Dominican Republic.',
      website: 'https://www.romeoyjulieta.com',
    },
  });

  // Create Lines
  const fuenteHemingway = await prisma.line.create({
    data: {
      name: 'Hemingway',
      slug: 'hemingway',
      brand_id: fuente.id,
      description: 'Perfecto-shaped cigars with a sweet Cameroon wrapper, named after Ernest Hemingway.',
    },
  });

  const fuenteOpusX = await prisma.line.create({
    data: {
      name: 'Opus X',
      slug: 'opus-x',
      brand_id: fuente.id,
      description: 'Ultra-premium line with rare Dominican wrapper, considered one of the world\'s finest cigars.',
    },
  });

  const ligaPrivada = await prisma.line.create({
    data: {
      name: 'Liga Privada',
      slug: 'liga-privada',
      brand_id: drewEstate.id,
      description: 'Ultra-premium line originally made for Drew Estate\'s personal use.',
    },
  });

  const undercrown = await prisma.line.create({
    data: {
      name: 'Undercrown',
      slug: 'undercrown',
      brand_id: drewEstate.id,
      description: 'Created by factory rollers as an alternative to Liga Privada.',
    },
  });

  const padron1964 = await prisma.line.create({
    data: {
      name: '1964 Anniversary Series',
      slug: '1964',
      brand_id: padron.id,
      description: 'Premium line celebrating the founding year, box-pressed with 4 years aging.',
    },
  });

  const ashtonVSG = await prisma.line.create({
    data: {
      name: 'Virgin Sun Grown (VSG)',
      slug: 'vsg',
      brand_id: ashton.id,
      description: 'Full-bodied line with Ecuadorian sun-grown wrapper, highly rated.',
    },
  });

  const olivaV = await prisma.line.create({
    data: {
      name: 'Serie V',
      slug: 'serie-v',
      brand_id: oliva.id,
      description: 'Full-bodied flagship line, highly rated and award-winning.',
    },
  });

  const prensado = await prisma.line.create({
    data: {
      name: 'Prensado',
      slug: 'prensado',
      brand_id: alecBradley.id,
      description: 'Box-pressed cigars with Honduran Corojo wrapper, Cigar of the Year 2011.',
    },
  });

  const reservaReal = await prisma.line.create({
    data: {
      name: 'Reserva Real',
      slug: 'reserva-real',
      brand_id: romeo.id,
      description: 'Smooth, medium-bodied cigars with Ecuadorian Connecticut wrapper.',
    },
  });

  console.log('✅ Created', await prisma.brand.count(), 'brands and', await prisma.line.count(), 'lines');

  // Create a sample cigar
  const sampleCigar = await prisma.cigar.create({
    data: {
      line_id: fuenteHemingway.id,
      vitola: 'Short Story',
      ring_gauge: 49,
      length_inches: 4.0,
      length_mm: 102,
      wrapper: 'African Cameroon',
      binder: 'Dominican',
      filler: 'Dominican',
      filler_tobaccos: JSON.stringify(['Dominican']),
      strength: 'Medium',
      body: 'Medium',
      msrp_cents: 779,
      typical_street_cents: 779,
      country: 'Dominican Republic',
    },
  });

  console.log('✅ Created sample cigar:', sampleCigar.vitola);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
