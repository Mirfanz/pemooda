import { getCurrentUser, hasRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attendanceId: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    const { attendanceId } = await params;

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!currentUser.organization) {
      return NextResponse.json(
        { success: false, message: "Not joined organization yet" },
        { status: 403 },
      );
    }

    if (!hasRole(currentUser.role, [Role.KETUA, Role.SEKRETARIS])) {
      return NextResponse.json(
        {
          success: false,
          message: "Only leader or secretary can start attendance",
        },
        { status: 403 },
      );
    }

    const attendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        activity: {
          organizationId: currentUser.organization.id,
        },
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { success: false, message: "Attendance not found" },
        { status: 404 },
      );
    }

    if (attendance.startDate) {
      return NextResponse.json(
        { success: false, message: "Attendance already started" },
        { status: 400 },
      );
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        startDate: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Attendance started successfully",
        data: updatedAttendance,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error starting attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
