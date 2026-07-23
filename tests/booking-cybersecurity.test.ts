/**
 * Cybersecurity & Business Logic Test Suite for Booking Flow & Checkout API
 * Run with: npx tsx tests/booking-cybersecurity.test.ts
 */

import assert from 'node:assert/strict';
import {
  isAfterHours,
  calculateHourlyBaseAmount,
  priceForPassengers,
  calculateProcessingFee,
  calculateFinalAmount,
  AFTER_HOURS_SURCHARGE
} from '../app/api/create-checkout-session/route';
import { calculatePriceBreakdown } from '../app/lib/priceMath';

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
console.log(' 🔒 CYBERSECURITY & BOOKING FLOW TEST SUITE ');
console.log('==================================================\n');

// ----------------------------------------------------
// 1. After-Hours Surcharge Time Boundary Tests
// ----------------------------------------------------
console.log('--- 1. AFTER-HOURS SURCHARGE BOUNDARY TESTS ---');

runTest('Should NOT apply surcharge before 9 PM (e.g. 20:59)', () => {
  assert.equal(isAfterHours('20:59'), false);
});

runTest('Should apply $30 surcharge EXACTLY at 9 PM (21:00)', () => {
  assert.equal(isAfterHours('21:00'), true);
});

runTest('Should apply surcharge after 9 PM (e.g. 21:01, 22:30, 23:59)', () => {
  assert.equal(isAfterHours('21:01'), true);
  assert.equal(isAfterHours('22:30'), true);
  assert.equal(isAfterHours('23:59'), true);
});

runTest('Should apply surcharge overnight through 5 AM (00:00, 04:59, 05:00)', () => {
  assert.equal(isAfterHours('00:00'), true);
  assert.equal(isAfterHours('04:59'), true);
  assert.equal(isAfterHours('05:00'), true);
});

runTest('Should NOT apply surcharge after 5 AM (e.g. 05:01, 08:30, 12:00)', () => {
  assert.equal(isAfterHours('05:01'), false);
  assert.equal(isAfterHours('08:30'), false);
  assert.equal(isAfterHours('12:00'), false);
});

runTest('Should safely handle undefined / empty / invalid time strings without crashing', () => {
  assert.equal(isAfterHours(undefined), false);
  assert.equal(isAfterHours(''), false);
  assert.equal(isAfterHours('24:00'), false);
  assert.equal(isAfterHours('99:99'), false);
});


// ----------------------------------------------------
// 2. Server Authority & Price Calculation Tests
// ----------------------------------------------------
console.log('\n--- 2. SERVER AUTHORITY & PRICE COMPUTATION ---');

runTest('Price for passengers matches valid tier', () => {
  const tiers = [
    { passengers: '1-3', price: 100 },
    { passengers: '4-6', price: 150 },
  ];
  assert.equal(priceForPassengers(tiers, 2), 100);
  assert.equal(priceForPassengers(tiers, 5), 150);
});

runTest('Throws error if passenger count exceeds configured tiers', () => {
  const tiers = [{ passengers: '1-4', price: 120 }];
  assert.throws(() => priceForPassengers(tiers, 10), /No price available for 10 passengers/);
});

runTest('Hourly rate calculation (minimum 2h, full day 8h+)', () => {
  assert.equal(calculateHourlyBaseAmount({ hourlyVehicleType: 'Sedan', hourlyHours: 1 }), 240); // 2h min * $120
  assert.equal(calculateHourlyBaseAmount({ hourlyVehicleType: 'Sedan', hourlyHours: 2 }), 240);
  assert.equal(calculateHourlyBaseAmount({ hourlyVehicleType: 'Sedan', hourlyHours: 3 }), 360);
  assert.equal(calculateHourlyBaseAmount({ hourlyVehicleType: 'Sedan', hourlyHours: 8 }), 820); // full day flat rate
});

runTest('Rejects invalid hourly parameters (negative hours, invalid vehicle)', () => {
  assert.throws(() => calculateHourlyBaseAmount({ hourlyVehicleType: 'Tank', hourlyHours: 5 }), /Invalid hourly vehicle type/);
  assert.throws(() => calculateHourlyBaseAmount({ hourlyVehicleType: 'Sedan', hourlyHours: -2 }), /Invalid hourly hours/);
  assert.throws(() => calculateHourlyBaseAmount({ hourlyVehicleType: 'Sedan', hourlyHours: 0 }), /Invalid hourly hours/);
});


// ----------------------------------------------------
// 3. Processing Fee & Final Amount Precision
// ----------------------------------------------------
console.log('\n--- 3. PROCESSING FEE & MATHEMATICAL PRECISION ---');

runTest('Calculates exact 2.5% processing fee without floating point drift', () => {
  // $100 base -> $2.50 fee -> $102.50 final
  assert.equal(calculateProcessingFee(100), 2.5);
  assert.equal(calculateFinalAmount(100), 102.5);

  // $130 base ($100 + $30 surcharge) -> $3.25 fee -> $133.25 final
  assert.equal(calculateProcessingFee(130), 3.25);
  assert.equal(calculateFinalAmount(130), 133.25);
});

runTest('Reverse GST & Fee breakdown in priceMath.ts', () => {
  const breakdown = calculatePriceBreakdown(133.25);
  assert.equal(breakdown.totalPaid, 133.25);
  assert.equal(breakdown.serviceTotal, 130);
  assert.equal(breakdown.processingFee, 3.25);
});


// ----------------------------------------------------
// 4. Cybersecurity & Payload Injection Resilience
// ----------------------------------------------------
console.log('\n--- 4. CYBERSECURITY & INJECTION RESILIENCE ---');

runTest('Handles XSS & SQLi payload strings safely without throwing', () => {
  const maliciousInputs = [
    "<script>alert('xss')</script>",
    "' OR '1'='1",
    "'; DROP TABLE Booking; --",
    "${process.env.STRIPE_SECRET_KEY}",
    "..\n..\n/etc/passwd"
  ];

  for (const str of maliciousInputs) {
    // isAfterHours should return false on weird strings
    assert.equal(isAfterHours(str), false);
  }
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
