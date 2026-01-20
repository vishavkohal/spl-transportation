import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const blogs = await prisma.blogPost.findMany({
            orderBy: {
                publishedAt: "desc",
            },
            include: {
                featuredImage: {
                    select: {
                        id: true,
                        altText: true,
                        mimeType: true,
                    },
                },
            },
        });

        return NextResponse.json(blogs);
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const json = await request.json();
        const {
            title,
            slug,
            excerpt,
            content,
            readMinutes,
            tags,
            imageId,
            publishedAt,
        } = json;

        if (!title || !slug || !content || !imageId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const blog = await prisma.blogPost.create({
            data: {
                title,
                slug,
                excerpt,
                content,
                readMinutes: readMinutes || 5,
                tags: tags || [],
                publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
                imageId,
            },
        });

        return NextResponse.json(blog);
    } catch (error) {
        console.error("Error creating blog:", error);
        if ((error as any).code === "P2002") {
            return NextResponse.json(
                { error: "Slug must be unique" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
