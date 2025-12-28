import prisma from "@/lib/prisma";
import { sendEmailVerification } from "@/lib/mailer.verification";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST() {
  try {
    // Get current user dari session
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak terautentikasi",
        },
        { status: 401 }
      );
    }

    // Cari user berdasarkan ID
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Cek apakah user sudah verified
    if (user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah diverifikasi",
        },
        { status: 400 }
      );
    }

    // Generate token baru
    const verificationToken = randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    // Hapus token lama yang belum digunakan dan buat token baru
    await prisma.$transaction(async (tx) => {
      // Hapus token lama yang belum digunakan
      await tx.verificationToken.deleteMany({
        where: {
          userId: user.id,
          type: "EMAIL_VERIFICATION",
          isUsed: false,
        },
      });

      // Buat token baru
      await tx.verificationToken.create({
        data: {
          token: verificationToken,
          type: "EMAIL_VERIFICATION",
          userId: user.id,
          expiresAt: tokenExpiresAt,
        },
      });
    });

    // Kirim email verifikasi
    try {
      await sendEmailVerification(user.email, verificationToken);
    } catch (emailError) {
      console.error("Gagal mengirim email verifikasi:", emailError);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengirim email verifikasi",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Email verifikasi berhasil dikirim ulang",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saat resend verifikasi:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengirim ulang verifikasi",
      },
      { status: 500 }
    );
  }
}
