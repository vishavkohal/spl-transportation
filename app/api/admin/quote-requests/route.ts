import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quotes = await prisma.quoteRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quote requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, amount, status, adminNotes } = body as {
      id?: string;
      amount?: number | null;
      status?: string;
      adminNotes?: string | null;
    };

    if (!id) {
      return NextResponse.json(
        { error: 'Quote Request ID is required' },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};

    if (status !== undefined) {
      dataToUpdate.status = status;
    }

    if (adminNotes !== undefined) {
      dataToUpdate.adminNotes = adminNotes;
    }

    if (amount !== undefined) {
      if (amount === null || isNaN(Number(amount))) {
        dataToUpdate.amount = null;
        dataToUpdate.processingFee = null;
        dataToUpdate.totalAmount = null;
      } else {
        const baseAmount = Number(amount);
        // Automatic 2.5% processing fee calculation
        const fee = Number((baseAmount * 0.025).toFixed(2));
        const total = Number((baseAmount + fee).toFixed(2));

        dataToUpdate.amount = baseAmount;
        dataToUpdate.processingFee = fee;
        dataToUpdate.totalAmount = total;

        // Auto transition status to QUOTED if currently PENDING
        if (!status) {
          dataToUpdate.status = 'QUOTED';
        }
      }
    }

    const updatedQuote = await prisma.quoteRequest.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error('Error updating quote request:', error);
    return NextResponse.json(
      { error: 'Failed to update quote request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = (await request.json()) as { id?: string };

    if (!id) {
      return NextResponse.json(
        { error: 'Quote Request ID is required' },
        { status: 400 }
      );
    }

    await prisma.quoteRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quote request:', error);
    return NextResponse.json(
      { error: 'Failed to delete quote request' },
      { status: 500 }
    );
  }
}
