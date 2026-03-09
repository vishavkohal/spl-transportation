import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/route-content — list all route page content entries
export async function GET() {
    try {
        const entries = await prisma.routePageContent.findMany({
            include: {
                route: {
                    select: { id: true, from: true, to: true },
                },
                image: {
                    select: { id: true, altText: true },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        return NextResponse.json(entries);
    } catch (error) {
        console.error("Error fetching route content:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// POST /api/route-content — create a new entry
export async function POST(request: NextRequest) {
    try {
        const { routeId, content, imageId } = await request.json();

        if (!routeId || !content) {
            return NextResponse.json(
                { error: "routeId and content are required" },
                { status: 400 }
            );
        }

        const entry = await prisma.routePageContent.create({
            data: {
                routeId,
                content,
                ...(imageId && { imageId }),
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

        return NextResponse.json(entry, { status: 201 });
    } catch (error: any) {
        console.error("Error creating route content:", error);
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Content already exists for this route" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
