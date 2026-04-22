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
          message: "Only leader or secretary can end attendance",
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

    if (!attendance.startDate) {
      return NextResponse.json(
        { success: false, message: "Attendance has not started yet" },
        { status: 400 },
      );
    }

    if (attendance.endDate) {
      return NextResponse.json(
        { success: false, message: "Attendance already ended" },
        { status: 400 },
      );
    }

    // Update attendance end date
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        endDate: new Date(),
      },
    });

    // Count pending attendees
    const pendingCount = await prisma.attendee.count({
      where: {
        attendanceId,
        status: "PENDING",
      },
    });

    // Update all pending attendees to absent
    await prisma.attendee.updateMany({
      where: {
        attendanceId,
        status: "PENDING",
      },
      data: {
        status: "ABSENT",
      },
    });

    // Update attendance summary
    await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        totalAbsent: {
          increment: pendingCount,
        },
        totalPending: 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Attendance ended successfully",
        data: updatedAttendance,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error ending attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
