import { getCurrentUser, hasRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Attendance } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Role } from "@/lib/generated/prisma/enums";

const createAttendanceSchema = z
  .object({
    activityId: z.string().min(1, "Activity ID is required"),
    name: z
      .string()
      .min(1, "Attendance name is required")
      .min(3, "Attendance name must be at least 3 characters")
      .max(200, "Attendance name must not exceed 200 characters"),
    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .optional(),
    allowExternalUsers: z.boolean().default(false),
    startDate: z
      .string()
      .datetime("Invalid start date format")
      .optional()
      .nullable(),
    userIds: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      if (data.startDate) {
        return new Date(data.startDate) >= new Date();
      }
      return true;
    },
    {
      message: "Start date cannot be in the past",
      path: ["startDate"],
    },
  );

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const activityId = req.nextUrl.searchParams.get("activityId");

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

    if (!activityId) {
      return NextResponse.json(
        { success: false, message: "Activity ID is required" },
        { status: 400 },
      );
    }

    // Verify activity belongs to user's organization
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        organizationId: currentUser.organization.id,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { success: false, message: "Activity not found" },
        { status: 404 },
      );
    }

    const attendancesFromDB = await prisma.attendance.findMany({
      where: {
        activityId,
      },
      orderBy: { createdAt: "desc" },
    });

    const attendances: Attendance[] = attendancesFromDB.map((attendance) => ({
      id: attendance.id,
      activityId: attendance.activityId,
      name: attendance.name,
      description: attendance.description,
      startDate: attendance.startDate,
      endDate: attendance.endDate,
      allowExternalUsers: attendance.allowExternalUsers,
      totalPresent: attendance.totalPresent,
      totalAbsent: attendance.totalAbsent,
      totalExcuse: attendance.totalExcuse,
      totalPending: attendance.totalPending,
      createdAt: attendance.createdAt,
      updatedAt: attendance.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Success get attendances",
        data: attendances,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error getting attendances:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

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
          message: "Only leader or secretary can create attendance",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validation = createAttendanceSchema.safeParse(body);

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

    const {
      activityId,
      name,
      description,
      allowExternalUsers,
      startDate,
      userIds,
    } = validation.data;

    // Verify activity exists and belongs to user's organization
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        organizationId: currentUser.organization.id,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { success: false, message: "Activity not found" },
        { status: 404 },
      );
    }

    // Create attendance
    const attendance = await prisma.attendance.create({
      data: {
        activityId,
        name,
        description,
        allowExternalUsers,
        startDate: startDate ? new Date(startDate) : null,
        totalPending: userIds.length,
      },
    });

    // Create attendees for selected users
    if (userIds.length > 0) {
      await prisma.attendee.createMany({
        data: userIds.map((userId) => ({
          userId,
          attendanceId: attendance.id,
          status: "PENDING",
        })),
      });
    }

    const attendanceResponse: Attendance = {
      id: attendance.id,
      activityId: attendance.activityId,
      name: attendance.name,
      description: attendance.description,
      startDate: attendance.startDate,
      endDate: attendance.endDate,
      allowExternalUsers: attendance.allowExternalUsers,
      totalPresent: attendance.totalPresent,
      totalAbsent: attendance.totalAbsent,
      totalExcuse: attendance.totalExcuse,
      totalPending: attendance.totalPending,
      createdAt: attendance.createdAt,
      updatedAt: attendance.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Attendance created successfully",
        data: attendanceResponse,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
