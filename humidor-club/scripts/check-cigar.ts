import { prisma } from '@/lib/prisma';

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: pnpm exec tsx scripts/check-cigar.ts <cigarId>');
    process.exit(1);
  }

  const cigar = await prisma.cigar.findUnique({
    where: { id },
    select: {
      id: true,
      vitola: true,
      line: {
        select: {
          name: true,
          brand: { select: { name: true } },
        },
      },
    },
  });

  console.log('Result:', cigar);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Error running check-cigar:', error);
  prisma.$disconnect();
  process.exit(1);
});
