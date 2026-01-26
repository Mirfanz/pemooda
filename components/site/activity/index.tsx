"use client";

import { useState } from "react";
import { Button, Card, CardBody, Tabs, Tab, Input } from "@heroui/react";
import { CalendarIcon, PlusIcon, FilterIcon } from "lucide-react";
import EventCard from "./activity-card";
import { Activity, ActivityStatus } from "@/types";
import { SearchIcon } from "@/components/icons";
import { useActivities } from "@/hooks/queries/activity";
import Link from "next/link";

const ActivityMain = () => {
  const [selectedStatus, setSelectedStatus] = useState<ActivityStatus | "all">(
    "all",
  );
  const [isPublic, setIsPublic] = useState(false);
  const [search, setSearch] = useState("");

  const { data: activitiesData, isLoading } = useActivities({
    public: isPublic,
    search: search || undefined,
  });

  const activities: Activity[] = activitiesData?.data || [];

  const filteredEvents =
    selectedStatus === "all"
      ? activities
      : activities.filter((e: Activity) => e.status === selectedStatus);

  const upcomingCount = activities.filter(
    (e: Activity) => e.status === "UPCOMING",
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-linear-to-br from-primary to-primary-600 p-4 rounded-b-3xl">
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </div>

      <div className="py-2 px-4 bg-background sticky top-0 z-50">
        <div className="overflow-x-auto scrollbar-hide">
          <Tabs
            selectedKey={selectedStatus}
            onSelectionChange={(key) =>
              setSelectedStatus(key as ActivityStatus | "all")
            }
            variant="underlined"
            color="primary"
            classNames={{
              tab: "px-0",
              tabList: "gap-4",
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
        {isLoading ? (
          <Card className="shadow-sm">
            <CardBody className="text-center py-12">
              <p className="text-muted-foreground">Loading activities...</p>
            </CardBody>
          </Card>
        ) : filteredEvents.length === 0 ? (
          <Card className="shadow-sm">
            <CardBody className="text-center py-12">
              <CalendarIcon className="size-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Tidak ada event</p>
            </CardBody>
          </Card>
        ) : (
          filteredEvents.map((event: Activity) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>
      <div className="fixed bottom-16 right-4">
        <Button
          isIconOnly
          as={Link}
          href="/activity/new"
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
