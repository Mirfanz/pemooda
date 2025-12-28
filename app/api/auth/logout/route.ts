import { removeAuthCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await removeAuthCookie();

    return NextResponse.json(
      {
        success: true,
        message: "Logout berhasil",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saat logout:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat logout",
      },
      { status: 500 }
    );
  }
}
