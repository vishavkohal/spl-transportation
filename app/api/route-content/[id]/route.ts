import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/route-content/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const entry = await prisma.routePageContent.findUnique({
            where: { id },
            include: {
                route: {
                    select: { id: true, from: true, to: true },
                },
                image: {
                    select: { id: true, altText: true },
                },
            },
        });

        if (!entry) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(entry);
    } catch (error) {
        console.error("Error fetching route content:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// PUT /api/route-content/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { routeId, content, imageId } = await request.json();

        const entry = await prisma.routePageContent.update({
            where: { id },
            data: {
                ...(routeId !== undefined && { routeId }),
                ...(content !== undefined && { content }),
                ...(imageId !== undefined && { imageId }),
            },
            include: {
                route: {
                    select: { id: true, from: true, to: true },
                },
                image: {
                    select: { id: true, altText: true },
                },
            },
        });

        return NextResponse.json(entry);
    } catch (error: any) {
        console.error("Error updating route content:", error);
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// DELETE /api/route-content/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.routePageContent.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting route content:", error);
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
