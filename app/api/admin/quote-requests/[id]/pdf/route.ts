import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/app/lib/auth';
import { QuotePDF } from '@/app/components/pdf/QuotePDF';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const quoteId = resolvedParams.id;

    if (!quoteId) {
      return NextResponse.json({ error: 'Missing quote ID' }, { status: 400 });
    }

    const quote = await prisma.quoteRequest.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote request not found' }, { status: 404 });
    }

    // Render PDF buffer using @react-pdf/renderer
    const pdfElement = React.createElement(QuotePDF, {
      quote: {
        ...quote,
        createdAt: quote.createdAt.toISOString(),
      },
    });

    const pdfBuffer = await renderToBuffer(pdfElement as any);

    const filename = `Quote-QTE-${quote.id.slice(-8).toUpperCase()}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating Quote PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate quote PDF' },
      { status: 500 }
    );
  }
}
