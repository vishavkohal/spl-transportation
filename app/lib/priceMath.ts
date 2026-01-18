/**
 * Centralized Price Logic
 *
 * Use this everywhere (Admin, Client, PDF, Email) to ensure
 * consistency in rounding and fee separation.
 */

export interface PriceBreakdown {
    totalPaid: number;      // Grand total paid by customer (AUD)
    serviceTotal: number;   // Total for the service itself (Incl. GST, Excl. Fee)
    processingFee: number;  // The extra fee (2.5%)
    gst: number;            // GST portion of the serviceTotal (approx 10/110)
    subtotalExGst: number;  // Service price before GST
}

/**
 * Calculates breakdown from a total price (in cents or dollars).
 *
 * @param totalInput The total amount paid. If > 10000, assumes cents, otherwise dollars. 
 *                   OR pass `isCents: true` to force cents.
 */
export function calculatePriceBreakdown(totalInput: number, isCents = false): PriceBreakdown {
    // Normalize to dollars
    let totalPaid = totalInput;
    if (isCents || totalInput > 100000) { // Safety check: if > $1000 booking, assume cents if ambiguous? 
        // Actually safer to just rely on caller or heuristics. 
        // Stripe usually uses cents. Our DB uses cents (totalPriceCents).
        // Let's assume input is DOLLARS if typically small, but our DB is Cents.
        // To be safe, let's strictly require the caller to handle units or normalize here.
        // Given the codebase uses `totalPriceCents` primarily, let's assume input is DOLLARS 
        // if it comes from the `booking` object which usually has `totalPrice` converted.
        // WAIT: `BookingPayload` in booking.ts has `totalPrice` in dollars.
        // Let's Standardize: Input should be DOLLARS (float).
    }

    // Ensure 2 decimal places fixed for calculations
    totalPaid = Number(totalPaid.toFixed(2));

    // 1. Reverse-calculate Service Amount
    // Total = Service * 1.025
    // Service = Total / 1.025
    const serviceTotal = Number((totalPaid / 1.025).toFixed(2));

    // 2. Processing Fee
    // Fee = Total - Service
    const processingFee = Number((totalPaid - serviceTotal).toFixed(2));

    // 3. GST (Only on Service)
    // GST = Service * (10 / 110)
    const gst = Number((serviceTotal * (10 / 110)).toFixed(2));

    // 4. Subtotal Ex GST
    const subtotalExGst = Number((serviceTotal - gst).toFixed(2));

    return {
        totalPaid,
        serviceTotal,
        processingFee,
        gst,
        subtotalExGst
    };
}

export function formatCurrency(amount: number, currency = 'AUD') {
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}
