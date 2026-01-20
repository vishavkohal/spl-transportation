import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return new NextResponse("Missing ID", { status: 400 });
    }

    try {
        const image = await prisma.image.findUnique({
            where: { id },
        });

        if (!image) {
            return new NextResponse("Image not found", { status: 404 });
        }

        // Convert Buffer/Bytes to valid response body
        // Prisma returns 'Buffer' for Bytes in Node environment
        const buffer = image.data as unknown as Buffer;

        return new NextResponse(buffer as any, {
            headers: {
                "Content-Type": image.mimeType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error fetching image:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
