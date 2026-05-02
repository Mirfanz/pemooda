import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Attendee } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const scanAttendanceSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.email("Invalid email").optional(),
});

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

    const body = await req.json();
    const validation = scanAttendanceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: z.flattenError(validation.error).fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, email } = validation.data;

    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        activity: {
          select: {
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

    // Check if attendance has started
    if (!attendance.startDate) {
      return NextResponse.json(
        { success: false, message: "Attendance has not started yet" },
        { status: 400 },
      );
    }

    // Check if attendance has ended
    if (attendance.endDate) {
      return NextResponse.json(
        { success: false, message: "Attendance has already ended" },
        { status: 400 },
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

    const now = new Date();

    // Check if user already attended
    const existingAttendee = await prisma.attendee.findFirst({
      where: {
        attendanceId,
        userId: currentUser.id,
      },
    });

    if (existingAttendee) {
      if (existingAttendee.status === "PRESENT") {
        return NextResponse.json(
          { success: false, message: "You have already attended" },
          { status: 400 },
        );
      }

      // Calculate count updates based on old status
      const countUpdates: Record<string, number> = {
        totalPresent: 1,
        totalPending: 0,
        totalAbsent: 0,
        totalExcuse: 0,
      };

      // Decrease old status count
      if (existingAttendee.status === "PENDING") countUpdates.totalPending = -1;
      else if (existingAttendee.status === "ABSENT")
        countUpdates.totalAbsent = -1;
      else if (existingAttendee.status === "EXCUSE")
        countUpdates.totalExcuse = -1;

      // Update existing attendee to present
      const updatedAttendee = await prisma.attendee.update({
        where: { id: existingAttendee.id },
        data: {
          status: "PRESENT",
          attendedAt: now,
          excuseDescription: null, // Clear excuse description when marking present
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Update attendance summary
      await prisma.attendance.update({
        where: { id: attendanceId },
        data: {
          totalPresent: { increment: countUpdates.totalPresent },
          totalPending: { increment: countUpdates.totalPending },
          totalAbsent: { increment: countUpdates.totalAbsent },
          totalExcuse: { increment: countUpdates.totalExcuse },
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Attendance recorded successfully",
          data: updatedAttendee,
        },
        { status: 200 },
      );
    }

    // Create new attendee
    const newAttendee: Attendee = await prisma.$transaction(async (prisma) => {
      const createdAttendee = await prisma.attendee.create({
        data: {
          userId: currentUser.id,
          attendanceId,
          status: "PRESENT",
          attendedAt: now,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Update attendance summary
      await prisma.attendance.update({
        where: { id: attendanceId },
        data: {
          totalPresent: { increment: 1 },
        },
      });

      return createdAttendee;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Attendance recorded successfully",
        data: newAttendee,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error scanning attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
