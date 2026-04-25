import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export interface JWTPayload {
  userId: string;
  email: string;
}

// ── Token Generation ────────────────────────────────────────────────
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function generateVerifyToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" });
}

export function generateResetToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
}

// ── Token Verification ──────────────────────────────────────────────
export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}

// ── Password Hashing ────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Request Auth Extraction ─────────────────────────────────────────
export function getAuthUser(req: NextRequest): JWTPayload | null {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): JWTPayload {
  const user = getAuthUser(req);
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
