import { NextResponse } from 'next/server';
import { upsertBookingLead } from '../../../lib/bookingLead';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const lead = await upsertBookingLead(body);

    if (!lead) {
      return NextResponse.json({ skipped: true });
    }

    return NextResponse.json({ leadId: lead.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    );
  }
}
