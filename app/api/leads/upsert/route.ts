import { NextResponse } from 'next/server';
import { upsertBookingLead } from '../../../lib/bookingLead';
import { leadUpsertSchema } from '@/app/lib/validations';

// In-memory rate limiter (resets on server restart)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute max

export async function POST(req: Request) {
  try {
    // 1. Basic Rate Limiting by IP
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (record) {
      if (now - record.lastReset > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(ip, { count: 1, lastReset: now });
      } else {
        record.count++;
        if (record.count > MAX_REQUESTS_PER_WINDOW) {
          return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }
      }
    } else {
      rateLimitMap.set(ip, { count: 1, lastReset: now });
    }

    // Clean up old entries periodically to prevent memory leaks
    if (rateLimitMap.size > 1000) {
      rateLimitMap.clear();
    }

    // 2. Body parsing and payload validation
    const body = await req.json();

    const parseResult = leadUpsertSchema.safeParse(body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? `${issue.path.join('.')}: ${issue.message}` : 'Invalid lead payload' },
        { status: 400 }
      );
    }

    const lead = await upsertBookingLead(parseResult.data as any);

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
