import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/app/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const blog = await prisma.blogPost.findUnique({
            where: { id },
            include: {
                featuredImage: true,
            },
        });

        if (!blog) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 });
        }

        return NextResponse.json(blog);
    } catch (error) {
        console.error("Error fetching blog:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!isAdmin(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
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

        const blog = await prisma.blogPost.update({
            where: { id },
            data: {
                title,
                slug,
                excerpt,
                content,
                readMinutes,
                tags,
                publishedAt: publishedAt ? new Date(publishedAt) : undefined,
                imageId,
            },
        });

        // Bust caches so blog pages reflect the update
        revalidateTag('blogs', { expire: 0 });
        revalidatePath('/blog', 'layout');

        return NextResponse.json(blog);
    } catch (error) {
        console.error("Error updating blog:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!isAdmin(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    try {
        // Optional: Delete image if it's not trying to be reused, but for now just delete blog
        await prisma.blogPost.delete({
            where: { id },
        });

        // Bust caches so blog pages reflect the deletion
        revalidateTag('blogs', { expire: 0 });
        revalidatePath('/blog', 'layout');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting blog:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

