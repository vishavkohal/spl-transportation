import { prisma } from '../lib/prisma';

async function test() {
  const res = await fetch('http://localhost:3000/api/admin/promos');
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
}

test();
