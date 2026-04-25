import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = requireAuth(req);
    const { id: postId } = await params;

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.postLike.create({ data: { postId, userId } });
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });
      return NextResponse.json({ liked: true });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
