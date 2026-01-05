"use client";

import { cn } from "@/lib/utils";
import type { ActivityStatus, Activity } from "@/types";
import { Button, Card, CardBody, Chip, User } from "@heroui/react";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
} from "lucide-react";
import React from "react";

type Props = {
  event: Activity;
};

const ActivityCard = ({ event }: Props) => {
  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case "upcoming":
        return "primary";
      case "ongoing":
        return "success";
      case "ended":
        return "default";
    }
  };

  const getStatusLabel = (status: ActivityStatus) => {
    switch (status) {
      case "upcoming":
        return "Akan Datang";
      case "ongoing":
        return "Berlangsung";
      case "ended":
        return "Selesai";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Sosial: "bg-pink-50 text-pink-600",
      Pelatihan: "bg-purple-50 text-purple-600",
      Rapat: "bg-blue-50 text-blue-600",
      Olahraga: "bg-green-50 text-green-600",
      Seminar: "bg-orange-50 text-orange-600",
    };
    return colors[category] || "bg-gray-50 text-gray-600";
  };
  return (
    <Card
      className="shadow-sm hover:shadow-md transition-shadow"
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
                <Chip size="sm" className={cn(getCategoryColor(event.type))}>
                  {event.type}
                </Chip>
                <Chip
                  size="sm"
                  color={getStatusColor(event.status)}
                  variant="flat"
                >
                  {getStatusLabel(event.status)}
                </Chip>{" "}
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

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="size-4 text-primary" />
              <span className="text-muted-foreground">{"01 Jan 2026"}</span>
              <ClockIcon className="size-4 text-primary ml-2" />
              <span className="text-muted-foreground">{"00:00 - Selesai"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPinIcon className="size-4 text-primary" />
              <span className="text-muted-foreground">{event.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
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

            {event.status === "upcoming" && (
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
