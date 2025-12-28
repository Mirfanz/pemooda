import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak terautentikasi",
        },
        { status: 401 }
      );
    }

    // Get email dari database
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true },
    });

    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { email: userData.email },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saat get email:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan",
      },
      { status: 500 }
    );
  }
}
