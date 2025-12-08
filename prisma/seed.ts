// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.route.deleteMany({}); // clear existing
  await prisma.routePricing.deleteMany({}); // not strictly needed because cascade, but ok

  await prisma.route.create({
    data: {
      from: 'Port Douglas',
      to: 'Cairns Airport',
      distance: '67 km',
      duration: '55 min',
      pricing: {
        create: [
          { passengers: '1-2', price: 160 },
          { passengers: '3-4', price: 200 },
          { passengers: '5+', price: 250 },
        ],
      },
    },
  });

  await prisma.route.create({
    data: {
      from: 'Cairns Airport',
      to: 'Port Douglas',
      distance: '67 km',
      duration: '55 min',
      pricing: {
        create: [
          { passengers: '1-2', price: 160 },
          { passengers: '3-4', price: 200 },
          { passengers: '5+', price: 250 },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
