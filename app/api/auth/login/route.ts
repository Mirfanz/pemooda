import prisma from "@/lib/prisma";
import { createToken, setAuthCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: z.flattenError(validation.error).fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },

      select: {
        id: true,
        name: true,
        avatarUrl: true,
        isVerified: true,
        role: true,
        hashedPassword: true,
        organization: {
          select: {
            id: true,
            name: true,
            tagline: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah",
          errors: { email: ["Email belum teraftar"] },
        },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isPasswordValid = await compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah",
          errors: { password: ["Password salah"] },
        },
        { status: 401 }
      );
    }

    // Buat JWT token
    const userPayload = {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      role: user.role,
      organization: user.organization,
    };

    const token = await createToken(userPayload);

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        data: {
          user: userPayload,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saat login:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat login",
      },
      { status: 500 }
    );
  }
}
