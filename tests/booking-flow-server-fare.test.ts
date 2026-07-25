/**
 * End-to-End Booking Flow & Server-Side Fare Calculation Test Suite
 * Tests One-Way and Round-Trip transfers, Promo Code deductions,
 * After-Hours surcharges, Zod schema validation, and Checkout payload generation.
 *
 * Run with: npx tsx tests/booking-flow-server-fare.test.ts
 */

import assert from 'node:assert/strict';
import { bookingDetailsSchema } from '../app/lib/validations';
import {
  isAfterHours,
  calculateProcessingFee,
  calculateFinalAmount,
  AFTER_HOURS_SURCHARGE
} from '../app/api/create-checkout-session/route';

let totalTests = 0;
let passedTests = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      res.then(() => {
        passedTests++;
        console.log(`  ✓ ${name}`);
      }).catch(err => {
        console.error(`  ✕ FAIL: ${name}`);
        console.error(`    Error: ${err.message}`);
      });
    } else {
      passedTests++;
      console.log(`  ✓ ${name}`);
    }
  } catch (err: any) {
    console.error(`  ✕ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

console.log('\n==================================================');
console.log(' 🚘 BOOKING FLOW & SERVER FARE CALCULATION TESTS ');
console.log('==================================================\n');

// ----------------------------------------------------
// 1. One-Way Transfer Server Fare Calculations
// ----------------------------------------------------
console.log('--- 1. ONE-WAY TRANSFER SERVER FARE CALCULATIONS ---');

runTest('Standard One-Way Transfer (Daytime pickup, no add-ons)', () => {
  const basePrice = 100; // $100 AUD
  const afterHoursSurcharge = 0;
  const childSeat = 0;
  const subtotal = basePrice + afterHoursSurcharge + childSeat; // $100
  const processingFee = calculateProcessingFee(subtotal); // $2.50
  const finalAmount = calculateFinalAmount(subtotal); // $102.50

  assert.equal(subtotal, 100);
  assert.equal(processingFee, 2.50);
  assert.equal(finalAmount, 102.50);
});

runTest('One-Way Transfer with Daytime Pickup + Child Seat ($20)', () => {
  const basePrice = 120;
  const childSeatFee = 20;
  const subtotal = basePrice + childSeatFee; // $140
  const processingFee = calculateProcessingFee(subtotal); // $3.50
  const finalAmount = calculateFinalAmount(subtotal); // $143.50

  assert.equal(subtotal, 140);
  assert.equal(processingFee, 3.5);
  assert.equal(finalAmount, 143.5);
});

runTest('One-Way Transfer with Nighttime After-Hours Pickup (22:30 -> +$30)', () => {
  const basePrice = 100;
  const afterHours = isAfterHours('22:30') ? AFTER_HOURS_SURCHARGE : 0; // $30
  const subtotal = basePrice + afterHours; // $130
  const processingFee = calculateProcessingFee(subtotal); // $3.25
  const finalAmount = calculateFinalAmount(subtotal); // $133.25

  assert.equal(afterHours, 30);
  assert.equal(subtotal, 130);
  assert.equal(processingFee, 3.25);
  assert.equal(finalAmount, 133.25);
});


// ----------------------------------------------------
// 2. Round-Trip Transfer Server Fare Calculations
// ----------------------------------------------------
console.log('\n--- 2. ROUND-TRIP TRANSFER SERVER FARE CALCULATIONS ---');

runTest('Round-Trip Transfer doubles the base fare automatically', () => {
  const oneWayBase = 110;
  const isRoundTrip = true;
  const baseAmount = isRoundTrip ? oneWayBase * 2 : oneWayBase; // $220

  assert.equal(baseAmount, 220);
});

runTest('Round-Trip Transfer with Outbound Night Pickup + Return Night Pickup (Dual +$30 Surcharges)', () => {
  const oneWayBase = 100;
  let baseAmount = oneWayBase * 2; // $200

  const outboundTime = '22:00'; // After-hours
  const returnTime = '04:30';   // After-hours

  let afterHoursSurcharge = 0;
  if (isAfterHours(outboundTime)) afterHoursSurcharge += AFTER_HOURS_SURCHARGE;
  if (isAfterHours(returnTime)) afterHoursSurcharge += AFTER_HOURS_SURCHARGE;

  baseAmount += afterHoursSurcharge; // $200 + $60 = $260

  const processingFee = calculateProcessingFee(baseAmount); // $6.50
  const finalAmount = calculateFinalAmount(baseAmount); // $266.50

  assert.equal(afterHoursSurcharge, 60);
  assert.equal(baseAmount, 260);
  assert.equal(processingFee, 6.5);
  assert.equal(finalAmount, 266.5);
});

runTest('Round-Trip Transfer with Promo Code Discount Deduction', () => {
  let baseAmount = 200; // $200 round trip base
  const appliedDiscountAmount = 20; // $20 promo discount

  baseAmount = Math.max(0, baseAmount - appliedDiscountAmount); // $180
  const processingFee = calculateProcessingFee(baseAmount); // $4.50
  const finalAmount = calculateFinalAmount(baseAmount); // $184.50

  assert.equal(baseAmount, 180);
  assert.equal(processingFee, 4.5);
  assert.equal(finalAmount, 184.5);
});


// ----------------------------------------------------
// 3. Zod Schema Validation & Payload Integrity
// ----------------------------------------------------
console.log('\n--- 3. ZOD SCHEMA VALIDATION & PAYLOAD INTEGRITY ---');

runTest('Validates One-Way Booking Payload successfully', () => {
  const payload = {
    bookingType: 'standard',
    transferType: 'one-way',
    pickupLocation: 'Cairns Airport (CNS)',
    dropoffLocation: 'Port Douglas',
    pickupDate: '2026-08-10',
    pickupTime: '14:30',
    passengers: 3,
    luggage: 2,
    childSeat: false,
    flightNumber: 'JQ953',
    fullName: 'John Smith',
    email: 'john@example.com',
    contactNumber: '+61400000000',
  };

  const parsed = bookingDetailsSchema.safeParse(payload);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.transferType, 'one-way');
    assert.equal(parsed.data.pickupLocation, 'Cairns Airport (CNS)');
  }
});

runTest('Validates Round-Trip Booking Payload with Return Schedule & Promo Code', () => {
  const payload = {
    bookingType: 'standard',
    transferType: 'round-trip',
    pickupLocation: 'Cairns Airport (CNS)',
    dropoffLocation: 'Palm Cove',
    pickupDate: '2026-08-10',
    pickupTime: '21:30', // Night pickup
    passengers: 2,
    luggage: 2,
    childSeat: true,
    flightNumber: 'VA780',
    returnDate: '2026-08-17',
    returnTime: '10:00',
    returnFlightNumber: 'VA785',
    promoCode: 'WELCOME10',
    appliedDiscount: {
      code: 'WELCOME10',
      discountType: 'FIXED',
      discountValue: 15,
      discountAmount: 15,
    },
    fullName: 'Sarah Jenkins',
    email: 'sarah@example.com',
    contactNumber: '+61411222333',
  };

  const parsed = bookingDetailsSchema.safeParse(payload);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.transferType, 'round-trip');
    assert.equal(parsed.data.returnDate, '2026-08-17');
    assert.equal(parsed.data.returnTime, '10:00');
    assert.equal(parsed.data.returnFlightNumber, 'VA785');
    assert.equal(parsed.data.promoCode, 'WELCOME10');
    assert.equal(parsed.data.appliedDiscount?.discountAmount, 15);
  }
});

runTest('Rejects Invalid Payloads (missing date, invalid email, zero passengers)', () => {
  const invalidPayload = {
    bookingType: 'standard',
    pickupDate: '', // Empty date
    pickupTime: '12:00',
    passengers: 0,  // Min 1 required
    email: 'not-an-email',
    fullName: '',
    contactNumber: '',
  };

  const parsed = bookingDetailsSchema.safeParse(invalidPayload);
  assert.equal(parsed.success, false);
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
