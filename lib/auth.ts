import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { User, JWTPayload } from "@/types";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const COOKIE_NAME = "auth_token";
const TOKEN_EXPIRY = 7 * 24 * 60 * 60;

export async function createToken(user: User): Promise<string> {
  const token = await new SignJWT({
    sub: user.id,
    user: user,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY}s`)
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_EXPIRY,
    path: "/",
  });
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getAuthCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return payload.user;
}
