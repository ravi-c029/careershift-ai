import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { z } from "zod";

const postSchema = z.object({ content: z.string().min(1).max(2000) });

export async function GET(req: NextRequest) {
  const page = Number(req.nextUrl.searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;
  const authUser = getAuthUser(req);

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatar: true, currentJobTitle: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        likes: authUser ? { where: { userId: authUser.userId } } : false,
      },
    }),
    prisma.post.count(),
  ]);

  const postsWithLiked = posts.map((p: typeof posts[number]) => ({
    ...p,
    liked: authUser ? p.likes.length > 0 : false,
    likes: undefined,
  }));

  return NextResponse.json({ posts: postsWithLiked, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const { content } = postSchema.parse(await req.json());
    const post = await prisma.post.create({
      data: { userId, content },
      include: {
        user: { select: { id: true, name: true, avatar: true, currentJobTitle: true } },
        comments: true,
      },
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
