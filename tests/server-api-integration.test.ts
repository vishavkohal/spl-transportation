/**
 * Server-Side API Handlers & Database Integration Test Suite
 * Directly invokes API Route Handlers:
 * 1. POST /api/promos/validate (Promo code engine)
 * 2. GET/POST/PATCH /api/admin/promos (Admin Promo Manager CRUD)
 * 3. POST /api/create-checkout-session (Stripe session & Pending DB record creation)
 * 4. GET/PATCH /api/bookings/manage (Customer booking lookup & modification)
 *
 * Run with: npx tsx --env-file=.env tests/server-api-integration.test.ts
 */

import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST as validatePromo } from '../app/api/promos/validate/route';
import { GET as getAdminPromos, POST as createAdminPromo } from '../app/api/admin/promos/route';
import { POST as createCheckoutSession } from '../app/api/create-checkout-session/route';
import { GET as getManageBooking, PATCH as updateManageBooking } from '../app/api/bookings/manage/route';
import { prisma } from '../lib/prisma';

let totalTests = 0;
let passedTests = 0;

async function runAsyncTest(name: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    console.error(`  ✕ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

console.log('\n==================================================');
console.log(' 🖥️ SERVER-SIDE API HANDLERS & DB INTEGRATION ');
console.log('==================================================\n');

async function main() {
  // ----------------------------------------------------
  // 1. Promo Code Engine Server Endpoints
  // ----------------------------------------------------
  console.log('--- 1. PROMO CODE ENGINE API ENDPOINTS ---');

  // Seed a test promo code in DB
  const testPromoCode = 'TESTROUNDTRIP20';
  await prisma.promoCode.upsert({
    where: { code: testPromoCode },
    update: {
      discountType: 'PERCENTAGE',
      discountValue: 20,
      targetType: 'ALL',
      minSpend: 50,
      isActive: true,
    },
    create: {
      code: testPromoCode,
      discountType: 'PERCENTAGE',
      discountValue: 20,
      targetType: 'ALL',
      minSpend: 50,
      isActive: true,
    },
  });

  await runAsyncTest('POST /api/promos/validate - Validates active promo code and returns discount', async () => {
    const req = new NextRequest('http://localhost:3000/api/promos/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: testPromoCode,
        amount: 200,
        transferType: 'round-trip',
      }),
    });

    const res = await validatePromo(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.promo.code, testPromoCode);
    assert.equal(data.promo.discountAmount, 40); // 20% of $200 = $40
  });

  await runAsyncTest('POST /api/promos/validate - Rejects promo when minimum spend is not met', async () => {
    const req = new NextRequest('http://localhost:3000/api/promos/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: testPromoCode,
        amount: 30, // Less than minSpend of 50
        transferType: 'one-way',
      }),
    });

    const res = await validatePromo(req);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.error.includes('Minimum spend'), true);
  });


  // ----------------------------------------------------
  // 2. Admin Promo Code Management API
  // ----------------------------------------------------
  console.log('\n--- 2. ADMIN PROMO CODE MANAGEMENT API ---');

  await runAsyncTest('GET /api/admin/promos - Fetches list of promo codes from DB', async () => {
    const res = await getAdminPromos();
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(Array.isArray(data.promos), true);
    assert.equal(data.promos.some((p: any) => p.code === testPromoCode), true);
  });

  await runAsyncTest('POST /api/admin/promos - Creates new promo code in DB', async () => {
    const newCode = `SUMMERTEST${Date.now()}`;
    const req = new NextRequest('http://localhost:3000/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: newCode,
        discountType: 'FIXED',
        discountValue: 15,
        targetType: 'ROUND_TRIP',
        minSpend: 100,
        isActive: true,
      }),
    });

    const res = await createAdminPromo(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.promo.code, newCode);
    assert.equal(data.promo.discountValue, 15);

    // Clean up
    await prisma.promoCode.delete({ where: { code: newCode } }).catch(() => {});
  });


  // ----------------------------------------------------
  // 3. Checkout Session Creation & DB Persistence
  // ----------------------------------------------------
  console.log('\n--- 3. CHECKOUT SESSION CREATION & DB PERSISTENCE ---');

  let createdBookingId = '';
  const testEmail = `test.passenger.${Date.now()}@example.com`;

  await runAsyncTest('POST /api/create-checkout-session - Generates Stripe Checkout URL & saves pending booking in DB', async () => {
    const req = new NextRequest('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking: {
          bookingType: 'standard',
          transferType: 'round-trip',
          pickupLocation: 'Cairns Airport',
          dropoffLocation: 'Port Douglas',
          pickupDate: '2026-09-01',
          pickupTime: '10:00',
          passengers: 2,
          luggage: 2,
          childSeat: false,
          flightNumber: 'JQ950',
          returnDate: '2026-09-08',
          returnTime: '14:00',
          returnFlightNumber: 'JQ955',
          promoCode: testPromoCode,
          appliedDiscount: {
            code: testPromoCode,
            discountType: 'PERCENTAGE',
            discountValue: 20,
            discountAmount: 44,
          },
          fullName: 'Alexander Wright',
          email: testEmail,
          contactNumber: '+61400111222',
        },
      }),
    });

    const res = await createCheckoutSession(req);
    const data = await res.json();
    if (res.status !== 200) {
      console.error('Checkout creation error:', data);
    }
    assert.equal(res.status, 200);
    assert.equal(typeof data.url, 'string');
    assert.equal(data.url.includes('stripe.com') || data.url.includes('cs_test') || data.url.includes('checkout'), true);

    // Verify record in PostgreSQL database
    const dbRecord = await prisma.booking.findFirst({
      where: { email: testEmail },
      orderBy: { createdAt: 'desc' },
    });

    assert.equal(dbRecord !== null, true);
    if (dbRecord) {
      createdBookingId = dbRecord.id;
      assert.equal(dbRecord.transferType, 'round-trip');
      assert.equal(dbRecord.returnDate, '2026-09-08');
      assert.equal(dbRecord.returnTime, '14:00');
      assert.equal(dbRecord.returnFlightNumber, 'JQ955');
      assert.equal(dbRecord.promoCode, testPromoCode);
    }
  });


  // ----------------------------------------------------
  // 4. Customer Manage Booking API Endpoints
  // ----------------------------------------------------
  console.log('\n--- 4. CUSTOMER MANAGE BOOKING API ENDPOINTS ---');

  await runAsyncTest('GET /api/bookings/manage - Looks up booking by ID and Email', async () => {
    assert.equal(Boolean(createdBookingId), true);
    const url = `http://localhost:3000/api/bookings/manage?bookingId=${createdBookingId}&email=${encodeURIComponent(testEmail)}`;
    const req = new NextRequest(url, { method: 'GET' });

    const res = await getManageBooking(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.booking.id, createdBookingId);
    assert.equal(data.booking.email, testEmail);
    assert.equal(data.booking.transferType, 'round-trip');
  });

  await runAsyncTest('PATCH /api/bookings/manage - Updates booking details in DB and sends notification email', async () => {
    assert.equal(Boolean(createdBookingId), true);
    const req = new NextRequest('http://localhost:3000/api/bookings/manage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: createdBookingId,
        email: testEmail,
        pickupDate: '2026-09-02', // Updated date
        pickupTime: '11:30',       // Updated time
        flightNumber: 'JQ952',    // Updated flight number
        returnDate: '2026-09-09',
        returnTime: '15:00',
        returnFlightNumber: 'JQ958',
        fullName: 'Alexander Wright Updated',
        contactNumber: '+61400999888',
      }),
    });

    const res = await updateManageBooking(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.booking.pickupDate, '2026-09-02');
    assert.equal(data.booking.pickupTime, '11:30');
    assert.equal(data.booking.flightNumber, 'JQ952');

    // Clean up created test booking from DB
    await prisma.booking.delete({ where: { id: createdBookingId } }).catch(() => {});
    await prisma.promoCode.delete({ where: { code: testPromoCode } }).catch(() => {});
  });


  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log(` TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log('==================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test script crashed:', err);
  process.exit(1);
});
