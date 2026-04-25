import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  generateVerifyToken,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = signupSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, provider: "local" },
    });

    const verifyToken = generateVerifyToken(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { verifyToken },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, name, verifyToken).catch(console.error);

    const accessToken = generateAccessToken({ userId: user.id, email });
    const refreshToken = generateRefreshToken({ userId: user.id, email });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const res = NextResponse.json({
      message: "Account created. Please verify your email.",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
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
    console.error("[SIGNUP]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
