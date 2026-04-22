import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            organizationId: true,
          },
        },
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { success: false, message: "Attendance not found" },
        { status: 404 },
      );
    }

    // Check if user is in the same organization
    const isInOrganization =
      currentUser.organization?.id === attendance.activity.organizationId;

    if (!isInOrganization && !attendance.allowExternalUsers) {
      return NextResponse.json(
        {
          success: false,
          message: "This attendance is only for organization members",
        },
        { status: 403 },
      );
    }

    // Check if user already attended
    const existingAttendee = await prisma.attendee.findFirst({
      where: {
        attendanceId,
        userId: currentUser.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Success get attendance info",
        data: {
          id: attendance.id,
          name: attendance.name,
          description: attendance.description,
          startDate: attendance.startDate,
          endDate: attendance.endDate,
          allowExternalUsers: attendance.allowExternalUsers,
          activity: attendance.activity,
          hasAttended: existingAttendee?.status === "PRESENT",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error getting attendance info:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
