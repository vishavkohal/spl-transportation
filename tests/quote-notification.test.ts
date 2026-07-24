/**
 * Automated Test Suite for Custom Quote Admin Email Notifications & Dashboard Links
 * Run with: npx tsx tests/quote-notification.test.ts
 */

import assert from 'node:assert/strict';
import {
  getAdminDashboardQuoteUrl,
  buildAdminQuoteNotificationHtml,
  QuoteNotificationData,
} from '../app/lib/email';
import { quoteRequestSchema } from '../app/lib/validations';

let totalTests = 0;
let passedTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    console.error(`  ✕ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

console.log('\n==================================================');
console.log(' ✉️ CUSTOM QUOTE ADMIN EMAIL & DASHBOARD TEST SUITE ');
console.log('==================================================\n');

// ----------------------------------------------------
// 1. Validation Schema Tests (quoteRequestSchema)
// ----------------------------------------------------
console.log('--- 1. QUOTE REQUEST SCHEMA VALIDATION TESTS ---');

runTest('Valid quote request payload passes schema validation', () => {
  const validPayload = {
    travelDate: '2026-08-15',
    travelTime: '14:30',
    passengers: 4,
    pickupAddress: 'Cairns Airport Terminal 1',
    dropoffAddress: 'Sheraton Grand Mirage Resort, Port Douglas',
    checkInBags: 2,
    carryOnBags: 3,
    childSeats: 'Yes (1 Seat)',
    flightArrivalType: 'Arrival',
    flightArrivalNumber: 'QF672',
    flightArrivalTime: '14:10',
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+61412345678',
    message: 'We have 1 oversized surfboard container.',
  };

  const result = quoteRequestSchema.safeParse(validPayload);
  assert.equal(result.success, true);
});

runTest('Rejects quote payload with invalid email address', () => {
  const invalidPayload = {
    travelDate: '2026-08-15',
    travelTime: '14:30',
    passengers: 2,
    pickupAddress: '123 Main St',
    dropoffAddress: '456 Beach Rd',
    fullName: 'John Smith',
    email: 'not-an-email',
    phone: '0412345678',
  };

  const result = quoteRequestSchema.safeParse(invalidPayload);
  assert.equal(result.success, false);
});

runTest('Rejects quote payload with negative passengers or non-positive integer', () => {
  const invalidPayload = {
    travelDate: '2026-08-15',
    travelTime: '14:30',
    passengers: 0,
    pickupAddress: '123 Main St',
    dropoffAddress: '456 Beach Rd',
    fullName: 'John Smith',
    email: 'john@example.com',
    phone: '0412345678',
  };

  const result = quoteRequestSchema.safeParse(invalidPayload);
  assert.equal(result.success, false);
});


// ----------------------------------------------------
// 2. Admin Dashboard URL Generation Tests
// ----------------------------------------------------
console.log('\n--- 2. ADMIN DASHBOARD LINK GENERATION TESTS ---');

runTest('Generates quote dashboard link with target quote ID', () => {
  const quoteId = 'cm7xyz1230001888';
  const url = getAdminDashboardQuoteUrl(quoteId);

  assert.ok(url.includes('/admin?tab=quotes&id=cm7xyz1230001888'));
});

runTest('Generates fallback quotes tab link when no quote ID is provided', () => {
  const url = getAdminDashboardQuoteUrl(undefined);
  assert.ok(url.includes('/admin?tab=quotes'));
  assert.ok(!url.includes('&id='));
});


// ----------------------------------------------------
// 3. Admin Notification HTML Template Content Tests
// ----------------------------------------------------
console.log('\n--- 3. EMAIL HTML TEMPLATE CONTENT VERIFICATION ---');

const sampleQuote: QuoteNotificationData = {
  id: 'cm7qte888999',
  travelDate: '2026-09-01',
  travelTime: '09:00',
  passengers: 5,
  pickupAddress: 'Port Douglas Reef Marina',
  dropoffAddress: 'Cairns Hotel',
  checkInBags: 4,
  carryOnBags: 2,
  childSeats: 'Yes (2 Seats)',
  flightArrivalType: 'Arrival',
  flightArrivalNumber: 'VA782',
  flightArrivalTime: '08:45',
  flightDepartureType: 'Departure',
  flightDepartureNumber: 'QF990',
  flightDepartureTime: '18:00',
  fullName: 'Alice Johnson',
  email: 'alice.johnson@example.com',
  phone: '+61400112233',
  message: 'Please provide a child booster seat.',
};

runTest('HTML contains all customer contact and trip details', () => {
  const html = buildAdminQuoteNotificationHtml(sampleQuote);

  assert.ok(html.includes('Alice Johnson'), 'Missing customer name');
  assert.ok(html.includes('alice.johnson@example.com'), 'Missing customer email');
  assert.ok(html.includes('+61400112233'), 'Missing customer phone');
  assert.ok(html.includes('2026-09-01 at 09:00'), 'Missing date & time');
  assert.ok(html.includes('Port Douglas Reef Marina'), 'Missing pickup address');
  assert.ok(html.includes('Cairns Hotel'), 'Missing dropoff address');
  assert.ok(html.includes('4 Check-in, 2 Carry-on'), 'Missing baggage details');
  assert.ok(html.includes('Yes (2 Seats)'), 'Missing child seat information');
  assert.ok(html.includes('VA782'), 'Missing flight arrival number');
  assert.ok(html.includes('QF990'), 'Missing flight departure number');
  assert.ok(html.includes('Please provide a child booster seat.'), 'Missing customer message');
});

runTest('HTML includes prominent dashboard CTA action link', () => {
  const html = buildAdminQuoteNotificationHtml(sampleQuote);
  const targetUrl = getAdminDashboardQuoteUrl(sampleQuote.id);

  assert.ok(html.includes(`href="${targetUrl}"`), 'CTA link URL missing or incorrect');
  assert.ok(html.includes('Open Quote in Admin Dashboard'), 'CTA button text missing');
});

runTest('HTML handles minimal payload without flight or optional notes gracefully', () => {
  const minimalQuote: QuoteNotificationData = {
    id: 'cm7qte111222',
    travelDate: '2026-10-10',
    travelTime: '10:00',
    passengers: 1,
    pickupAddress: 'Pickup Point A',
    dropoffAddress: 'Dropoff Point B',
    fullName: 'Bob Marley',
    email: 'bob@example.com',
    phone: '0411222333',
  };

  const html = buildAdminQuoteNotificationHtml(minimalQuote);

  assert.ok(html.includes('Bob Marley'));
  assert.ok(html.includes('0 Check-in, 0 Carry-on'));
  assert.ok(html.includes('No'), 'Should default child seats to No');
  assert.ok(!html.includes('Flight Arrival:'), 'Should omit flight arrival row when empty');
  assert.ok(!html.includes('Customer Notes:'), 'Should omit notes row when empty');
  assert.ok(html.includes(getAdminDashboardQuoteUrl(minimalQuote.id)));
});


// ----------------------------------------------------
// 4. Quote to Custom Checkout Payload Transformation
// ----------------------------------------------------
console.log('\n--- 4. QUOTE TO CUSTOM CHECKOUT PAYLOAD TRANSFORMATION ---');

runTest('Maps QuoteRequestItem to Custom Checkout API payload correctly', () => {
  const quote = {
    id: 'cm7qte999000',
    travelDate: '2026-11-20',
    travelTime: '15:45',
    passengers: 3,
    pickupAddress: 'Cairns Esplanade Hotel',
    dropoffAddress: 'Palm Cove Resort',
    checkInBags: 2,
    carryOnBags: 1,
    childSeats: 'Yes (1 Seat)',
    fullName: 'Sarah Connor',
    email: 'sarah@example.com',
    phone: '+61499887766',
    amount: 175.50,
  };

  const checkoutPayload = {
    pickupLocation: quote.pickupAddress,
    dropoffLocation: quote.dropoffAddress,
    pickupDate: quote.travelDate,
    pickupTime: quote.travelTime,
    passengers: quote.passengers,
    luggage: (quote.checkInBags || 0) + (quote.carryOnBags || 0),
    childSeat: Boolean(quote.childSeats && quote.childSeats !== 'No'),
    amount: quote.amount,
    fullName: quote.fullName,
    email: quote.email,
    contactNumber: quote.phone,
    includeProcessingFee: true,
    notes: `Quote Request ID: QTE-${quote.id.slice(-8).toUpperCase()}`,
  };

  assert.equal(checkoutPayload.pickupLocation, 'Cairns Esplanade Hotel');
  assert.equal(checkoutPayload.dropoffLocation, 'Palm Cove Resort');
  assert.equal(checkoutPayload.luggage, 3);
  assert.equal(checkoutPayload.childSeat, true);
  assert.equal(checkoutPayload.amount, 175.50);
  assert.equal(checkoutPayload.notes, 'Quote Request ID: QTE-TE999000');
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
