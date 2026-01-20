import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const image = await prisma.image.create({
            data: {
                data: buffer,
                mimeType: file.type,
                altText: (formData.get("altText") as string) || file.name,
            },
        });

        return NextResponse.json(image);
    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
