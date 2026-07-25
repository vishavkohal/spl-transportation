import { prisma } from '../lib/prisma';

async function test() {
  const routes = await prisma.route.findMany({ select: { from: true, to: true } });
  console.log('Routes in DB:', routes);
}

test();
