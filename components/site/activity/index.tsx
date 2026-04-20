"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Input,
} from "@heroui/react";
import { Activity } from "@/types";
import { useActivities } from "@/hooks/queries/activity";
import Link from "next/link";
import ActivityCard from "./activity-card";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  CalendarAdd,
  CalendarSearch,
  Magnifier,
  Tuning2,
} from "@solar-icons/react";

const ActivityMain = () => {
  const [isPublic, setIsPublic] = useState(false);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const isMobile = useIsMobile();

  const {
    data: activitiesData,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useActivities({
    public: isPublic,
    search: search || undefined,
  });

  const activities: Activity[] =
    activitiesData?.pages?.flatMap((page) => page.data) || [];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className=" bg-primary p-4 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-white font-bold mb-1">
              Event & Kegiatan
            </h1>
            <p className="text-sm text-white/80">[0] event mendatang</p>
          </div>
          <Button
            isIconOnly
            variant="flat"
            className="bg-white/20 text-white"
            size="lg"
            as={Link}
            href="/activity/new"
          >
            <CalendarAdd weight="Broken" className="size-6" />
          </Button>
        </div>
      </div>
      {/* Search Bar */}
      <div className="flex p-4 rounded-b-3xl sticky top-0 z-50 gap-2 bg-primary">
        <Input
          type="search"
          startContent={<Magnifier weight="Broken" className="size-5 me-1" />}
          placeholder="Cari sesuatu disini"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <Button
          className="bg-white"
          isIconOnly
          onPress={() => setFilterOpen((prev) => !prev)}
        >
          <Tuning2 weight="Broken" className="size-5" />
        </Button>
      </div>
      {/* Body */}
      <div className="px-4 space-y-3 my-4">
        {isLoading ? (
          <Card className="shadow-sm">
            <CardBody className="text-center py-12">
              <p className="text-muted-foreground">Loading activities...</p>
            </CardBody>
          </Card>
        ) : activities.length === 0 ? (
          <Card className="shadow-sm">
            <CardBody className="text-center py-12">
              <CalendarSearch
                weight="Broken"
                className="size-12 mx-auto mb-3 text-muted-foreground opacity-50"
              />
              <p className="text-muted-foreground">Tidak ada aktivitas</p>
            </CardBody>
          </Card>
        ) : (
          activities.map((activity: Activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        )}
        {hasNextPage && (
          <Button onPress={() => fetchNextPage()} fullWidth variant="flat">
            Load More
          </Button>
        )}
      </div>
      <div className="fixed bottom-16 right-4">
        <Button
          isIconOnly
          as={Link}
          href="/activity/new"
          size="lg"
          variant="shadow"
          color="secondary"
          radius="lg"
          // className="animate-bounce"
        >
          <CalendarAdd weight="Broken" className="size-6" />
        </Button>
      </div>
      <Drawer
        isOpen={filterOpen}
        size="xs"
        placement={isMobile ? "bottom" : "right"}
        onClose={() => setFilterOpen(false)}
      >
        <DrawerContent>
          <DrawerHeader>Filter Pencarian</DrawerHeader>
          <DrawerBody>
            <p className="text-muted text-sm">
              Disini adalah filter pencarian tapi belum diisi karena masih
              bingung mau digimanain &gt;_&lt; <br />
              Sabar yaa teman-teman sekalian, aplikasi masih dikembangkan.
            </p>
          </DrawerBody>
          <DrawerFooter>
            <Button color="danger" variant="flat">
              Reset
            </Button>
            <Button color="primary">Terapkan</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </main>
  );
};

export default ActivityMain;
