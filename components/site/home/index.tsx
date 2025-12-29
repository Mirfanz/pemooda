"use client";

import React from "react";
import { Button } from "@heroui/react";
import {
  ArrowUpRightFromSquareIcon,
  BellRingIcon,
  DollarSignIcon,
  InstagramIcon,
  ListIcon,
  MessageSquareDotIcon,
  TwitterIcon,
  WalletIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const Home = () => {
  const auth = useAuth();
  return (
    <main className="">
      <div className="bg-white shadow-xl rounded-b-3xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold outline-2 outline-offset-2 outline-secondary">
            MI
          </div>
          <div className="">
            <p className="text-sm text-muted-foreground">Good Morning</p>
            <h4 className="font-bold">Muhammad Irfan</h4>
          </div>
          <Button isIconOnly className="rounded-full ms-auto" variant="light">
            <BellRingIcon className="w-5! h-5!" />
          </Button>
        </div>
        <div className="relative bg-linear-to-br from-[#5046E5] to-[#6C2ADA] shadow text-white rounded-2xl p-4">
          <div className="w-32 h-32 translate-x-10 -translate-y-10 opacity-10 bg-white rounded-full absolute top-0 right-0"></div>
          <div className="relative">
            <div className="mb-4">
              <span className="uppercase bg-white/20 rounded-sm text-white text-xs px-2 py-1 inline-block">
                Kartu Anggota
              </span>
            </div>
            <h3 className="font-bold text-xl mb-1 font-poppins text-center">
              GARDA TAMA
            </h3>
            <p className="text-sm text-white/80 mb-3 text-center">
              Memayu hayuning bawana
            </p>
            <div className="flex gap-2">
              <Button isIconOnly variant="light" className="">
                <InstagramIcon className="w-5! h-5!" />
              </Button>
              <Button isIconOnly variant="light" className="">
                <MessageSquareDotIcon className="w-5! h-5!" />
              </Button>
              <Button isIconOnly variant="light" className="">
                <TwitterIcon className="w-5! h-5!" />
              </Button>
              <Button isIconOnly variant="light" className="ms-auto">
                <ListIcon className="w-5! h-5!" />
              </Button>
            </div>
          </div>
        </div>
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
      <section className="mx-4">
        <p className="text-justify">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex eius
          blanditiis dolor soluta amet quibusdam incidunt officia. Ducimus quae
          assumenda sapiente cumque aliquid fugit reprehenderit quis aperiam
          maiores consequuntur illum quidem, cum, autem modi odio officia saepe
          nobis nesciunt temporibus voluptatem qui! Delectus alias consequuntur
          corrupti animi harum ab consectetur, illum ipsa dolorem recusandae
          rerum officia inventore minus iusto similique voluptate eum eveniet
          voluptatibus illo a, cumque soluta aliquam temporibus repellendus!
          Voluptatum quis nisi eligendi, aliquid a ducimus earum natus est
          molestiae commodi consequatur. Odit, autem eaque quidem veritatis vel
          voluptatibus consectetur natus aliquam quaerat harum perspiciatis unde
          recusandae. Harum odit placeat voluptatum laudantium inventore aut
          rerum nesciunt id hic necessitatibus nam iure animi ducimus eos velit
          dolores sint asperiores corporis assumenda recusandae voluptatibus,
          voluptas quidem. Laudantium repellendus harum, exercitationem ducimus
          incidunt eos veritatis explicabo porro nam. Quam, ullam adipisci quia
          odit labore nobis dicta nisi quos quaerat quibusdam reprehenderit?
        </p>
      </section>
    </main>
  );
};

export default Home;
