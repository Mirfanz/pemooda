"use client";

import {
  CalendarIcon,
  MapPoinWaveIcon,
} from "@/components/icons";
import { activityStatusEnum, activityTypeEnum } from "@/config/enums";
import type { Activity } from "@/types";
import { Button, Card, CardBody, Chip, Divider, User } from "@heroui/react";
import {
  CheckCircle2Icon,
  ClockIcon,
  PlusIcon,
} from "lucide-react";
import React from "react";
import dayjs from "dayjs";

type Props = {
  event: Activity;
};

const ActivityCard = ({ event }: Props) => {
  return (
    <Card
      className="shadow-sm hover:shadow-md transition-all"
      isPressable
      fullWidth
      //   onPress={() => router.push(`/event/${event.id}`)}
    >
      <CardBody className="p-0">
        {/* {event.image && (
          <div className="w-full h-32 bg-linear-to-br from-primary-100 to-primary-200" />
        )} */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Chip
                  size="sm"
                  color={activityStatusEnum[event.status].color}
                  variant="flat"
                >
                  {activityStatusEnum[event.status].label}
                </Chip>
                <Chip size="sm" variant="flat">
                  {activityTypeEnum[event.type].label}
                </Chip>
                {event.isPublic && (
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
              <h3 className="font-bold text-lg mb-1">{event.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="size-4 text-primary" />
              <span className="text-muted-foreground">
                {dayjs(event.startDate).format("DD MMM YYYY")}
              </span>
              <ClockIcon className="size-4 text-primary ml-2" />
              <span className="text-muted-foreground">
                {dayjs(event.startDate).format("HH:mm")}
              </span>
              {/* <span className="text-muted-foreground">{"00:00 - Selesai"}</span> */}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPoinWaveIcon className="size-4 text-primary" />
              <span className="text-muted-foreground">{event.location}</span>
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
                src: event.organization.imageUrl || undefined,
                className: "",
              }}
              name={event.organization.name}
              description={event.organization.tagline}
              classNames={{
                description: "line-clamp-1",
                wrapper: "flex-1",
              }}
            />

            {event.status === "UPCOMING" && (
              <Button
                size="sm"
                className="hidden"
                color={event.isPublic ? "default" : "primary"}
                variant={event.isPublic ? "flat" : "solid"}
                startContent={
                  event.isPublic ? (
                    <CheckCircle2Icon className="size-4" />
                  ) : (
                    <PlusIcon className="size-4" />
                  )
                }
              >
                {event.isPublic ? "Terdaftar" : "Daftar"}
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ActivityCard;
