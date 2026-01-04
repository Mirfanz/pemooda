"use client";

import React, { useState } from "react";
import { Button, Card, CardBody, Tabs, Tab, Input } from "@heroui/react";
import { CalendarIcon, PlusIcon, FilterIcon, GlobeIcon } from "lucide-react";
import EventCard from "./activity-card";
import { Activity, ActivityStatus } from "@/types";
import { SearchIcon } from "@/components/icons";

const mockEvents: Activity[] = [
  {
    id: "1",
    title: "Bakti Sosial Ramadan",
    description: "Kegiatan berbagi takjil dan sembako untuk masyarakat",
    startDate: "15 Jan 2026",
    endDate: "15 Jan 2026",
    location: "Masjid Al-Ikhlas",
    isPublic: false,
    createdAt: "15 Jan 2026",
    updatedAt: "15 Jan 2026",
    type: "OTHER",
    mapsUrl: null,
    status: "upcoming",
    notes: [],
    organization: {
      id: "dsds",
      imageUrl: null,
      name: "sdds",
      tagline: "dsdskjds",
    },
  },
];

const ActivityMain = () => {
  const [selectedStatus, setSelectedStatus] = useState<ActivityStatus | "all">(
    "all"
  );
  const [isPublic, setIsPublic] = useState(false);

  const filteredEvents =
    selectedStatus === "all"
      ? mockEvents
      : mockEvents.filter((e) => e.status === selectedStatus);

  const upcomingCount = mockEvents.filter(
    (e) => e.status === "upcoming"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-linear-to-br from-primary to-primary-600 p-4 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl text-white font-bold mb-1">
              Event & Kegiatan
            </h1>
            <p className="text-sm text-white/80">
              {upcomingCount} event mendatang
            </p>
          </div>
          <Button
            isIconOnly
            variant="flat"
            className="bg-white/20 text-white"
            size="lg"
          >
            <FilterIcon className="size-5" />
          </Button>
        </div>
        <Input
          type="search"
          startContent={<SearchIcon className="size-4 me-1" />}
          placeholder="Cari sesuatu disini"
          fullWidth
        />
        {/* <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUpIcon className="size-4" />
              <p className="text-xs text-white/70">Akan Datang</p>
            </div>
            <p className="text-2xl font-bold">{upcomingCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2Icon className="size-4" />
              <p className="text-xs text-white/70">Berlangsung</p>
            </div>
            <p className="text-2xl font-bold">{ongoingCount}</p>
          </div>
        </div> */}
      </div>

      <div className="px-4 py-2 flex items-center sticky top-0 z-50 bg-background w-full">
        <Button
          isIconOnly
          onPress={() => setIsPublic((prev) => !prev)}
          size="sm"
          radius="md"
          variant={isPublic ? "solid" : "flat"}
          color={isPublic ? "primary" : "default"}
        >
          <GlobeIcon className="size-4.5" />
        </Button>
        <div className="overflow-x-auto scrollbar-hide">
          <Tabs
            selectedKey={selectedStatus}
            onSelectionChange={(key) =>
              setSelectedStatus(key as ActivityStatus | "all")
            }
            variant="underlined"
            color="primary"
            classNames={{
              tab: "px-2.5",
              tabList: "gap-0",
            }}
          >
            <Tab key="all" title="Semua" />
            <Tab key="ongoing" title="Berlangsung" />
            <Tab key="upcoming" title="Mendatang" />
            <Tab key="ended" title="Selesai" />
          </Tabs>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {filteredEvents.length === 0 ? (
          <Card className="shadow-sm">
            <CardBody className="text-center py-12">
              <CalendarIcon className="size-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Tidak ada event</p>
            </CardBody>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>

      <div className="fixed bottom-20 right-4">
        <Button
          isIconOnly
          color="primary"
          size="lg"
          className="shadow-lg rounded-full w-14 h-14"
        >
          <PlusIcon className="size-6" />
        </Button>
      </div>
    </main>
  );
};

export default ActivityMain;
