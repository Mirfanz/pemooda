"use client";

import { Attendance } from "@/types";
import { Card, CardBody, Chip, Button } from "@heroui/react";
import {
  UsersGroupRounded,
  AddSquare,
  CheckCircle,
  CloseCircle,
  ClockCircle,
  MinusCircle,
} from "@solar-icons/react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Role } from "@/lib/generated/prisma/enums";

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
        <div className="space-y-2">
          {attendances.map((attendance) => {
            const status = getAttendanceStatus(attendance);

            return (
              <Link
                key={attendance.id}
                href={`/activity/${activityId}/attendance/${attendance.id}`}
              >
                <Card
                  isPressable
                  className="border border-default-200 hover:border-primary transition-colors"
                >
                  <CardBody className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">
                            {attendance.name}
                          </h3>
                          {status === "not-started" && (
                            <Chip
                              size="sm"
                              variant="flat"
                              color="default"
                              radius="sm"
                            >
                              Belum Dibuka
                            </Chip>
                          )}
                          {status === "ongoing" && (
                            <Chip
                              size="sm"
                              variant="flat"
                              color="success"
                              radius="sm"
                            >
                              Berlangsung
                            </Chip>
                          )}
                          {status === "ended" && (
                            <Chip
                              size="sm"
                              variant="flat"
                              color="default"
                              radius="sm"
                            >
                              Selesai
                            </Chip>
                          )}
                        </div>
                        {attendance.description && (
                          <p className="text-xs text-default-500 mb-2">
                            {attendance.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1">
                            <CheckCircle
                              weight="Bold"
                              className="size-3.5 text-success"
                            />
                            <span className="text-xs text-default-600">
                              {attendance.totalPresent}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CloseCircle
                              weight="Bold"
                              className="size-3.5 text-danger"
                            />
                            <span className="text-xs text-default-600">
                              {attendance.totalAbsent}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MinusCircle
                              weight="Bold"
                              className="size-3.5 text-warning"
                            />
                            <span className="text-xs text-default-600">
                              {attendance.totalExcuse}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockCircle
                              weight="Bold"
                              className="size-3.5 text-default-400"
                            />
                            <span className="text-xs text-default-600">
                              {attendance.totalPending}
                            </span>
                          </div>
                        </div>
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
