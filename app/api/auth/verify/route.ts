import prisma from "@/lib/prisma";
import { getCurrentUser, createToken, setAuthCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token tidak ditemukan",
        },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
        },
        { status: 400 }
      );
    }
    if (currentUser.isVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Account sudah diverifikasi",
        },
        { status: 200 }
      );
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token, user: { id: currentUser.id } },
      select: {
        id: true,
        isUsed: true,
        expiresAt: true,
        userId: true,
        type: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
                tagline: true,
              },
            },
          },
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Token tidak valid",
        },
        { status: 404 }
      );
    }

    if (verificationToken.isUsed) {
      return NextResponse.json(
        {
          success: false,
          message: "Token sudah digunakan",
        },
        { status: 400 }
      );
    }

    if (new Date() > verificationToken.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Token sudah kadaluarsa",
          expired: true,
        },
        { status: 400 }
      );
    }

    // Update user dan token dalam transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: verificationToken.userId },
        data: { isVerified: true },
      });

      await tx.verificationToken.update({
        where: { id: verificationToken.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });
    });

    // Update JWT
    const updatedUserPayload = {
      id: verificationToken.user.id,
      name: verificationToken.user.name,
      avatarUrl: verificationToken.user.avatarUrl,
      isVerified: true,
      role: verificationToken.user.role,
      organization: verificationToken.user.organization,
    };

    const newToken = await createToken(updatedUserPayload);
    await setAuthCookie(newToken);

    return NextResponse.json(
      {
        success: true,
        message: "Email berhasil diverifikasi",
        data: {
          name: verificationToken.user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saat verifikasi:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat verifikasi",
      },
      { status: 500 }
    );
  }
}
