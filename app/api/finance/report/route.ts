import { getCurrentUser, hasRole } from "@/lib/auth";
import { FinanceReportType, Role } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { FinanceReport } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const createFinanceReportSchema = z.object({
  title: z
    .string()
    .min(1, "Finance report title is required")
    .min(3, "Finance report title must be at least 3 characters")
    .max(200, "Finance report title must not exceed 200 characters"),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),
  amount: z
    .number("Amount must be a number")
    .positive("Amount must be a positive number"),
  type: z.enum(FinanceReportType, {
    error: "Type must be either INCOME or EXPENSE",
  }),
  reportDate: z.iso
    .datetime("Invalid report date format")
    .refine((val) => new Date(val) <= new Date(), {
      message: "Report date cannot be in the future",
    })
    .refine(
      (val) =>
        new Date(val).getTime() - new Date().getTime() <=
        3 * 24 * 60 * 60 * 1000,
      { message: "Cannot be more than 3 days in the past" },
    ),
  activityId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const limit = 20;
  const page = req.nextUrl.searchParams.get("page");
  const search = req.nextUrl.searchParams.get("search");
  const type = req.nextUrl.searchParams.get("type");

  let typeFilter: FinanceReportType | undefined;
  if (type) {
    if (type.toLocaleLowerCase() === "income")
      typeFilter = FinanceReportType.INCOME;
    else if (type.toLocaleLowerCase() === "expense")
      typeFilter = FinanceReportType.EXPENSE;
  }

  if (!currentUser)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );

  if (!currentUser.organization)
    return NextResponse.json(
      { success: false, message: "Not join organization yet" },
      { status: 401 },
    );

  const financeReports: FinanceReport[] = await prisma.financeReport.findMany({
    where: {
      organizationId: currentUser.organization.id,
      title: search?.length
        ? { contains: search, mode: "insensitive" }
        : undefined,
      type: typeFilter,
    },
    take: limit,
    skip: page ? (parseInt(page) - 1) * limit : 0,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      amount: true,
      type: true,
      reportDate: true,
      createdAt: true,
      updatedAt: true,
      organization: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          tagline: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      activity: {
        select: {
          id: true,
          title: true,
          isPublic: true,
          description: true,
          type: true,
          startDate: true,
          endDate: true,
          location: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      message: "Success get activities",
      data: financeReports,
      meta: {
        page: page ? parseInt(page) : 1,
        limit,
        total: financeReports.length,
        isLastPage: financeReports.length < limit ? true : false,
        search,
        type: typeFilter,
      },
    },
    { status: 200 },
  );
}

// Create finance report
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    if (!currentUser.organization)
      return NextResponse.json(
        { success: false, message: "Not joined organization yet" },
        { status: 403 },
      );

    if (!hasRole(currentUser.role, Role.BENDAHARA))
      return NextResponse.json(
        {
          success: false,
          message: "Only leader or bendahara can create activity",
        },
        { status: 403 },
      );

    const body = await req.json();
    const validation = createFinanceReportSchema.safeParse(body);

    if (!validation.success)
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: z.flattenError(validation.error).fieldErrors,
        },
        { status: 400 },
      );

    const { title, description, reportDate, amount, type, activityId } =
      validation.data;

    // Create activity
    const financeReport: FinanceReport = await prisma.$transaction(async () => {
      if (!currentUser.organization)
        throw new Error("User does not belong to any organization");

      const createdFinanceReport: FinanceReport =
        await prisma.financeReport.create({
          data: {
            title,
            description,
            amount,
            type,
            reportDate,
            organizationId: currentUser.organization.id,
            createdBy: currentUser.id,
            activityId,
          },
          select: {
            id: true,
            title: true,
            description: true,
            amount: true,
            type: true,
            reportDate: true,
            activityId: true,
            createdAt: true,
            updatedAt: true,
            organization: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                tagline: true,
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            activity: {
              select: {
                id: true,
                title: true,
                isPublic: true,
                description: true,
                type: true,
                startDate: true,
                endDate: true,
                location: true,
              },
            },
          },
        });

      // Update organization summary
      await prisma.organizationSummary.update({
        where: { organizationId: currentUser.organization.id },
        data: {
          totalFinanceReport: { increment: 1 },
          totalExpenses: type === "EXPENSE" ? { increment: amount } : undefined,
          totalIncomes: type === "INCOME" ? { increment: amount } : undefined,
        },
      });

      return createdFinanceReport;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Finance report created successfully",
        data: financeReport,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating finance report:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
