import { getCurrentUser, hasRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Attendance, AttendanceSummary } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/lib/generated/prisma/enums";

export async function GET(
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

    const attendanceFromDB = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        activity: {
          organizationId: currentUser.organization.id,
        },
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!attendanceFromDB) {
      return NextResponse.json(
        { success: false, message: "Attendance not found" },
        { status: 404 },
      );
    }

    const attendance: Attendance = {
      id: attendanceFromDB.id,
      activityId: attendanceFromDB.activityId,
      name: attendanceFromDB.name,
      description: attendanceFromDB.description,
      startDate: attendanceFromDB.startDate,
      endDate: attendanceFromDB.endDate,
      allowExternalUsers: attendanceFromDB.allowExternalUsers,
      totalPresent: attendanceFromDB.totalPresent,
      totalAbsent: attendanceFromDB.totalAbsent,
      totalExcuse: attendanceFromDB.totalExcuse,
      totalPending: attendanceFromDB.totalPending,
      createdAt: attendanceFromDB.createdAt,
      updatedAt: attendanceFromDB.updatedAt,
      activity: attendanceFromDB.activity,
      attendees: attendanceFromDB.attendees.map((attendee) => ({
        id: attendee.id,
        userId: attendee.userId,
        attendanceId: attendee.attendanceId,
        status: attendee.status,
        attendedAt: attendee.attendedAt,
        excuseDescription: attendee.excuseDescription,
        createdAt: attendee.createdAt,
        updatedAt: attendee.updatedAt,
        user: attendee.user,
      })),
    };

    // Calculate summary
    const summary: AttendanceSummary = {
      total: attendanceFromDB.attendees.length,
      present: attendanceFromDB.totalPresent,
      absent: attendanceFromDB.totalAbsent,
      excuse: attendanceFromDB.totalExcuse,
      pending: attendanceFromDB.totalPending,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Success get attendance detail",
        data: { attendance, summary },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error getting attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    // Check if user has permission to delete (only KETUA and SEKRETARIS)
    if (!hasRole(currentUser.role, [Role.KETUA, Role.SEKRETARIS])) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to delete attendance",
        },
        { status: 403 },
      );
    }

    const attendanceFromDB = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        activity: {
          organizationId: currentUser.organization.id,
        },
      },
      include: {
        activity: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!attendanceFromDB) {
      return NextResponse.json(
        { success: false, message: "Attendance not found" },
        { status: 404 },
      );
    }

    // Delete all related attendees first
    await prisma.attendee.deleteMany({
      where: {
        attendanceId,
      },
    });

    // Delete the attendance
    await prisma.attendance.delete({
      where: {
        id: attendanceId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Attendance deleted successfully",
        data: { attendanceId },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
