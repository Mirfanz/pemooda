"use client";

import { CalendarIcon, MapPoinWaveIcon } from "@/components/icons";
import { activityStatusEnum, activityTypeEnum } from "@/config/enums";
import type { Activity } from "@/types";
import { Button, Card, CardBody, Chip, Divider, User } from "@heroui/react";
import { CheckCircle2Icon, ClockIcon, PlusIcon } from "lucide-react";
import React from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { displayIntervalDate } from "@/lib/utils";

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
                  color={activityStatusEnum[activity.status].color}
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
              <CalendarIcon className="size-4 text-primary" />
              <span className="text-muted-foreground">
                {dayjs(activity.startDate).format("DD MMM YYYY")}
              </span>
              <ClockIcon className="size-4 text-primary ml-2" />
              <span className="text-muted-foreground">
                {dayjs(activity.startDate).format("HH:mm")}
              </span>
              {/* <span className="text-muted-foreground">{"00:00 - Selesai"}</span> */}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPoinWaveIcon className="size-4 text-primary" />
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

            {activity.status === "UPCOMING" && (
              <Button
                size="sm"
                className="hidden"
                color={activity.isPublic ? "default" : "primary"}
                variant={activity.isPublic ? "flat" : "solid"}
                startContent={
                  activity.isPublic ? (
                    <CheckCircle2Icon className="size-4" />
                  ) : (
                    <PlusIcon className="size-4" />
                  )
                }
              >
                {activity.isPublic ? "Terdaftar" : "Daftar"}
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ActivityCard;
