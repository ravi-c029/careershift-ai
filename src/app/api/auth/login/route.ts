import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const res = NextResponse.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        currentJobTitle: user.currentJobTitle,
      },
    });

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("[LOGIN]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
