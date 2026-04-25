import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  try {
    const { userId } = verifyToken(token);
    const user = await prisma.user.findFirst({
      where: { id: userId, verifyToken: token },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null },
    });

    return NextResponse.redirect(new URL("/login?verified=true", req.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=expired_token", req.url));
  }
}
