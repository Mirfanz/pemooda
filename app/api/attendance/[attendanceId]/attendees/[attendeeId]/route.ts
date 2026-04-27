import { getCurrentUser, hasRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Role } from "@/lib/generated/prisma/enums";

const updateAttendeeSchema = z.object({
  action: z.enum(["mark_excuse", "update_excuse", "cancel_excuse"]),
  excuseDescription: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .nullable(),
});

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ attendanceId: string; attendeeId: string }>;
  },
) {
  try {
    const currentUser = await getCurrentUser();
    const { attendanceId, attendeeId } = await params;

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

    // Check if user has permission to update attendee (only KETUA and SEKRETARIS)
    if (!hasRole(currentUser.role, [Role.KETUA, Role.SEKRETARIS])) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to update attendee status",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validation = updateAttendeeSchema.safeParse(body);

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

    const { action, excuseDescription } = validation.data;

    // Verify attendance belongs to user's organization
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

    // Find and verify attendee
    const attendee = await prisma.attendee.findFirst({
      where: {
        id: attendeeId,
        attendanceId,
      },
    });

    if (!attendee) {
      return NextResponse.json(
        { success: false, message: "Attendee not found" },
        { status: 404 },
      );
    }

    const oldStatus = attendee.status;
    let newStatus = oldStatus;

    // Handle different actions
    if (action === "mark_excuse") {
      // Only allow marking PENDING or ABSENT as EXCUSE
      if (oldStatus !== "PENDING" && oldStatus !== "ABSENT") {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot mark ${oldStatus} as excuse. Only PENDING or ABSENT can be marked as excuse.`,
          },
          { status: 400 },
        );
      }
      newStatus = "EXCUSE";
    } else if (action === "update_excuse") {
      // Only allow updating if already EXCUSE
      if (oldStatus !== "EXCUSE") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Can only update excuse description for attendees marked as excuse",
          },
          { status: 400 },
        );
      }
      newStatus = "EXCUSE";
    } else if (action === "cancel_excuse") {
      // Only allow canceling EXCUSE
      if (oldStatus !== "EXCUSE") {
        return NextResponse.json(
          {
            success: false,
            message: "Can only cancel excuse for attendees marked as excuse",
          },
          { status: 400 },
        );
      }
      // If attendance is ended, set to ABSENT, otherwise PENDING
      newStatus =
        attendance.endDate && new Date(attendance.endDate) < new Date()
          ? "ABSENT"
          : "PENDING";
    }

    // Update attendee and attendance counts
    const updatedAttendee = await prisma.attendee.update({
      where: { id: attendeeId },
      data: {
        status: newStatus,
        excuseDescription:
          newStatus === "EXCUSE" ? excuseDescription || null : null,
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

    // Update attendance counts based on status change (only if status actually changed)
    if (oldStatus !== newStatus) {
      const countUpdates: Record<string, number> = {
        totalPresent: 0,
        totalAbsent: 0,
        totalExcuse: 0,
        totalPending: 0,
      };

      if (oldStatus === "PRESENT") countUpdates.totalPresent--;
      else if (oldStatus === "ABSENT") countUpdates.totalAbsent--;
      else if (oldStatus === "EXCUSE") countUpdates.totalExcuse--;
      else if (oldStatus === "PENDING") countUpdates.totalPending--;

      if (newStatus === "PRESENT") countUpdates.totalPresent++;
      else if (newStatus === "ABSENT") countUpdates.totalAbsent++;
      else if (newStatus === "EXCUSE") countUpdates.totalExcuse++;
      else if (newStatus === "PENDING") countUpdates.totalPending++;

      await prisma.attendance.update({
        where: { id: attendanceId },
        data: {
          totalPresent: { increment: countUpdates.totalPresent },
          totalAbsent: { increment: countUpdates.totalAbsent },
          totalExcuse: { increment: countUpdates.totalExcuse },
          totalPending: { increment: countUpdates.totalPending },
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Attendee status updated successfully",
        data: {
          id: updatedAttendee.id,
          userId: updatedAttendee.userId,
          attendanceId: updatedAttendee.attendanceId,
          status: updatedAttendee.status,
          name: updatedAttendee.name,
          email: updatedAttendee.email,
          attendedAt: updatedAttendee.attendedAt,
          excuseDescription: updatedAttendee.excuseDescription,
          createdAt: updatedAttendee.createdAt,
          updatedAt: updatedAttendee.updatedAt,
          user: updatedAttendee.user,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating attendee:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
