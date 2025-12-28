import prisma from "@/lib/prisma";
import { sendEmailVerification } from "@/lib/mailer.verification";
import { createToken, setAuthCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";

const registerSchema = z.object({
  name: z
    .string()
    .regex(/^[A-Za-z\s]+$/, "Nama hanya boleh berisi huruf saja")
    .min(3, "Nama minimal 3 karakter")
    .max(50, "Nama maksimal 50 karakter"),
  email: z.email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain uppercase, lowercase, and number"
    ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi input
    const validation = registerSchema.safeParse(body);
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

    const { name, email, password } = validation.data;

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah terdaftar",
          errors: { email: ["Email sudah terdaftar"] },
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    // Buat user dan token dalam transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          hashedPassword,
          name,
          isVerified: false,
          role: null,
          details: { create: {} },
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          isVerified: true,
          role: true,
          createdAt: true,
        },
      });

      await tx.verificationToken.create({
        data: {
          token: verificationToken,
          type: "EMAIL_VERIFICATION",
          userId: newUser.id,
          expiresAt: tokenExpiresAt,
        },
      });

      return newUser;
    });

    // Kirim email verifikasi
    try {
      await sendEmailVerification(user.email, verificationToken);
    } catch (emailError) {
      console.error("Gagal mengirim email verifikasi:", emailError);
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      role: user.role,
      organization: null,
    };

    const jwtToken = await createToken(userPayload);
    await setAuthCookie(jwtToken);

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil. Silakan cek email untuk verifikasi.",
        data: {
          user: userPayload,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saat registrasi:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat registrasi",
      },
      { status: 500 }
    );
  }
}
