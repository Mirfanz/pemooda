"use client";

import React from "react";
import { Avatar, Button, Card, CardBody } from "@heroui/react";
import {
  ArrowUpRightFromSquareIcon,
  BellRingIcon,
  DollarSignIcon,
  WalletIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  InstagramIcon,
  WhatsappIcon,
  TwitterXIcon,
} from "@/components/icons";

const Home = () => {
  const auth = useAuth();
  return (
    <main className="">
      <div className="bg-white shadow-xl rounded-b-3xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar src={auth.user?.avatarUrl || undefined} isBordered />
          <div className="">
            <p className="text-sm text-muted-foreground">Good Morning</p>
            <h4 className="font-bold">{auth.user?.name}</h4>
          </div>
          <Button isIconOnly className="rounded-full ms-auto" variant="light">
            <BellRingIcon className="w-5! h-5!" />
          </Button>
        </div>

        <Card className="bg-linear-to-br relative from-[#5046E5] to-[#6C2ADA] text-white">
          <CardBody className="overflow-hidden">
            <div className="w-32 h-32 translate-x-10 -translate-y-10 opacity-10 bg-white rounded-full absolute top-0 right-0"></div>
            <div className="relative">
              <div className="mb-4">
                <span className="uppercase bg-white/20 rounded-sm text-white text-xs px-2 py-1 inline-block">
                  Kartu Anggota
                </span>
              </div>
              <h3 className="font-bold text-xl mb-1 font-poppins text-center">
                {auth.user?.organization?.name}
              </h3>
              <p className="text-sm text-white/80 mb-3 text-center">
                {auth.user?.organization?.tagline}
              </p>
              <div className="flex gap-6 justify-center">
                <Button
                  size="sm"
                  variant="bordered"
                  color="default"
                  isIconOnly
                  className="text-primary-foreground"
                >
                  <InstagramIcon className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="bordered"
                  color="default"
                  isIconOnly
                  className="text-primary-foreground"
                >
                  <TwitterXIcon className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="bordered"
                  color="default"
                  isIconOnly
                  className="text-primary-foreground"
                >
                  <WhatsappIcon className="size-4" />
                </Button>
                {/* <Button isIconOnly variant="light" className="ms-auto">
                  <SettingIcon className="w-5! h-5!" />
                </Button> */}
              </div>
            </div>
          </CardBody>
        </Card>
        {/* <Input
          type="search"
          startContent={<SearchIcon className="size-4 me-1" />}
          placeholder="Cari sesuatu disini"
        /> */}
      </div>
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex-1 flex relative flex-col text-warning rounded-xl shadow bg-white p-4">
            <Button
              isIconOnly
              variant="flat"
              className="text-warning bg-warning-50 mb-2"
              onPress={() => auth.logout()}
            >
              <DollarSignIcon className="w-5! h-5!" />
            </Button>
            <small className="text-xs mb-0.5 font-medium text-muted-foreground/70">
              Tagihan Anda
            </small>
            <p className="font-bold text-md">Rp 10.000</p>
            <Button
              className="top-2 right-2 absolute"
              variant="light"
              isIconOnly
              size="sm"
            >
              <ArrowUpRightFromSquareIcon className="w-4! h-4!" />
            </Button>
          </div>
          <div className="flex-1 flex relative flex-col text-primary rounded-xl shadow bg-white p-4">
            <Button
              isIconOnly
              variant="flat"
              className="text-inherit bg-primary-50 mb-2"
            >
              <WalletIcon className="w-5! h-5!" />
            </Button>
            <small className="text-xs mb-0.5 font-medium text-muted-foreground/70">
              Sisa Saldo
            </small>
            <p className="font-bold text-md font-poppins!">Rp 19.000.000</p>
            <Button
              className="top-2 right-2 absolute"
              variant="light"
              isIconOnly
              size="sm"
            >
              <ArrowUpRightFromSquareIcon className="w-4! h-4!" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
