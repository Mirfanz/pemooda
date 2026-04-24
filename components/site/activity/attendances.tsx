"use client";

import { Attendance } from "@/types";
import { Card, CardBody, Chip, Button } from "@heroui/react";
import {
  UsersGroupRounded,
  AddSquare,
  ClockCircle,
  UserCheck,
  UserCross,
  UserMinus,
} from "@solar-icons/react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Role } from "@/lib/generated/prisma/enums";
import { displayIntervalDate, getTimeStatus } from "@/lib/utils";
import { timeStatusEnum } from "@/config/enums";

type Props = {
  activityId: string;
  attendances: Attendance[];
};

const Attendances = ({ activityId, attendances }: Props) => {
  const auth = useAuth();

  const getAttendanceStatus = (attendance: Attendance) => {
    if (!attendance.startDate) return "not-started";
    if (attendance.endDate) return "ended";
    return "ongoing";
  };

  return (
    <Card className="p-4 gap-3 shadow-md" fullWidth>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <UsersGroupRounded weight="Bold" className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Absensi</h2>
          <span className="text-muted">({attendances.length})</span>
        </div>
        {auth.hasRole([Role.KETUA, Role.SEKRETARIS]) && (
          <Link href={`/activity/${activityId}/attendance/new`}>
            <Button size="sm" variant="flat" color="primary">
              <AddSquare weight="Broken" className="size-3" />
              Buat
            </Button>
          </Link>
        )}
      </div>

      {attendances.length === 0 ? (
        <p className="text-center text-muted text-sm p-2">
          ~ Belum ada absensi ~
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {attendances.map((attendance) => {
            const status = getTimeStatus(
              attendance.startDate,
              attendance.endDate,
            );

            return (
              <Link
                key={attendance.id}
                href={`/activity/${activityId}/attendance/${attendance.id}`}
              >
                <Card
                  isPressable
                  fullWidth
                  shadow="none"
                  className="border border-default-200 hover:border-primary"
                >
                  <CardBody className="p-3">
                    <div className="mb-2">
                      <h3 className="font-medium text-sm">{attendance.name}</h3>
                      {attendance.description && (
                        <p className="text-xs text-default-500 mt-1">
                          {attendance.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-between">
                      {status === "upcoming" && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color={timeStatusEnum[status].color}
                          radius="sm"
                        >
                          {/* {timeStatusEnum[status].label} */}
                          {attendance.startDate
                            ? displayIntervalDate(attendance.startDate)
                            : "Belum Mulai"}
                        </Chip>
                      )}
                      {status === "ongoing" && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color={timeStatusEnum[status].color}
                          radius="sm"
                        >
                          {timeStatusEnum[status].label}
                        </Chip>
                      )}
                      {status === "ended" && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color={timeStatusEnum[status].color}
                          radius="sm"
                        >
                          {timeStatusEnum[status].label}
                        </Chip>
                      )}
                      <div className="flex items-center gap-1">
                        <Chip
                          variant="flat"
                          size="sm"
                          radius="sm"
                          className={""}
                          // className="flex items-center gap-1 ms-auto"
                          startContent={
                            <UserCheck
                              weight="Broken"
                              className="size-3.5 text-success"
                            />
                          }
                        >
                          <span className="text-xs text-default-600">
                            {attendance.totalPresent}
                          </span>
                        </Chip>
                        <Chip
                          variant="flat"
                          size="sm"
                          radius="sm"
                          className={""}
                          // className="flex items-center gap-1"
                          startContent={
                            <UserCross
                              weight="Broken"
                              className="size-3.5 text-danger"
                            />
                          }
                        >
                          <span className="text-xs text-default-600">
                            {attendance.totalAbsent}
                          </span>
                        </Chip>
                        <Chip
                          variant="flat"
                          size="sm"
                          radius="sm"
                          className={""}
                          // className="flex items-center gap-1"
                          startContent={
                            <UserMinus
                              weight="Broken"
                              className="size-3.5 text-warning"
                            />
                          }
                        >
                          <span className="text-xs text-default-600">
                            {attendance.totalExcuse}
                          </span>
                        </Chip>
                        <Chip
                          variant="flat"
                          size="sm"
                          radius="sm"
                          className={""}
                          // className="flex items-center gap-1"
                          startContent={
                            <ClockCircle
                              weight="Broken"
                              className="size-3.5 text-default-400"
                            />
                          }
                        >
                          <span className="text-xs text-default-600">
                            {attendance.totalPending}
                          </span>
                        </Chip>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default Attendances;
