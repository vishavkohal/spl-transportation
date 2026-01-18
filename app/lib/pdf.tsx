import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '../components/pdf/InvoicePDF';
import type { BookingPayload } from './booking';

/**
 * Generate PDF Invoice Buffer
 * Designed for server-side usage (e.g. sending emails)
 */
export async function generateInvoicePdf(booking: BookingPayload): Promise<Buffer> {
  // renderToBuffer returns a Promise<Buffer>
  return await renderToBuffer(<InvoicePDF booking={ booking } />);
}
