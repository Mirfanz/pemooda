"use client";

import { activityTypeEnum } from "@/config/enums";
import type { Activity } from "@/types";
import { Card, CardBody, Chip, Divider, User } from "@heroui/react";
import React from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { displayIntervalDate } from "@/lib/utils";
import {
  CalendarMark,
  ClockCircle,
  MapPointWave,
} from "@solar-icons/react";

type Props = {
  activity: Activity;
};

const ActivityCard = ({ activity }: Props) => {
  const ActivityIcon = activityTypeEnum[activity.type].icon;

  return (
    <Card
      className="shadow-sm hover:shadow-md transition-all"
      isPressable
      fullWidth
      as={Link}
      href={`/activity/${activity.id}`}
    >
      <CardBody className="p-0">
        {/* {activity.image && (
          <div className="w-full h-32 bg-linear-to-br from-primary-100 to-primary-200" />
        )} */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Chip
                  size="sm"
                  color={activity.endDate ? "default" : "warning"}
                  variant="dot"
                  radius="sm"
                >
                  {displayIntervalDate(activity.startDate)}
                </Chip>
                <Chip
                  size="sm"
                  radius="sm"
                  variant="flat"
                  startContent={<ActivityIcon className="size-3 ms-1 me-0.5" />}
                >
                  {activityTypeEnum[activity.type].label}
                </Chip>
                {activity.isPublic && (
                  <Chip
                    size="sm"
                    color="danger"
                    variant="dot"
                    className="ms-auto"
                  >
                    Publik
                  </Chip>
                )}
              </div>
              <h3 className="font-bold text-lg mb-1">{activity.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {activity.description}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarMark weight="Broken" className="size-4 text-primary" />
              <span className="text-muted-foreground">
                {dayjs(activity.startDate).format("DD MMM YYYY")}
              </span>
              <ClockCircle
                weight="Broken"
                className="size-4 text-primary ml-2"
              />
              <span className="text-muted-foreground">
                {dayjs(activity.startDate).format("HH:mm")}
              </span>
              {/* <span className="text-muted-foreground">{"00:00 - Selesai"}</span> */}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPointWave weight="Broken" className="size-4 text-primary" />
              <span className="text-muted-foreground">{activity.location}</span>
            </div>
          </div>
          <Divider className="my-3" />
          <div className="flex items-center justify-between">
            {/* <div className="flex items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                name="User 1"
              />
              <span className="text-sm text-muted-foreground">Alcatraz</span>
            </div> */}
            <User
              avatarProps={{
                src: activity.organization.imageUrl || undefined,
                className: "",
              }}
              name={activity.organization.name}
              description={activity.organization.tagline}
              classNames={{
                description: "line-clamp-1",
                wrapper: "flex-1",
              }}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ActivityCard;
