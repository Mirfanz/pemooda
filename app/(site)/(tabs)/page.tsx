"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpRightFromSquareIcon,
  BellRingIcon,
  DollarSignIcon,
  InstagramIcon,
  MessageSquareDotIcon,
  TwitterIcon,
  WalletIcon,
} from "lucide-react";

export default function Home() {
  return (
    <main className="">
      <div className="bg-white shadow-xl rounded-b-3xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12 outline-2 outline-offset-2 outline-secondary">
            <AvatarImage src="/avatar.jpg" alt="Avatar" />
            <AvatarFallback>MI</AvatarFallback>
          </Avatar>
          <div className="">
            <p className="text-sm text-muted-foreground">Good Morning</p>
            <h4 className="font-bold">Muhammad Irfan</h4>
          </div>
          <Button
            size={"icon-lg"}
            className="rounded-full ms-auto"
            variant={"ghost"}
          >
            <BellRingIcon className="w-5! h-5!" />
          </Button>
        </div>
        <Card className="bg-linear-to-b from-slate-400 shadow border-0 shadow-slate-500 to-slate-500 p-0 text-white rounded-2xl">
          <CardContent className="p-5">
            <div className="mb-4">
              <Badge
                variant={"secondary"}
                className="uppercase bg-white/20 text-white text-xs"
              >
                Kartu Keanggotaan
              </Badge>
            </div>
            <h3 className="font-bold text-xl mb-2">GARDA TAMA</h3>
            <p className="text-sm text-white/80 mb-3">
              Lorem ipsum dolor sit amet, usdu elit
            </p>
            <div className="flex gap-2">
              <Button
                size={"icon-lg"}
                variant={"ghost"}
                className="outline-2! outline-white!"
              >
                <InstagramIcon className="w-5! h-5!" />
              </Button>
              <Button
                size={"icon-lg"}
                variant={"ghost"}
                className="outline-2! outline-white!"
              >
                <MessageSquareDotIcon className="w-5! h-5!" />
              </Button>
              <Button
                size={"icon-lg"}
                variant={"ghost"}
                className="outline-2! outline-white!"
              >
                <TwitterIcon className="w-5! h-5!" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex-1 flex relative flex-col text-warning rounded-xl shadow bg-white p-4">
            <Button
              size={"icon"}
              variant={"secondary"}
              className="text-warning bg-warning-50 mb-2"
            >
              <DollarSignIcon className="w-5! h-5!" />
            </Button>
            <small className="text-xs mb-0.5 font-medium text-muted-foreground/70">
              Tagihan Anda
            </small>
            <p className="font-bold text-md">Rp 10.000</p>
            <Button
              className="top-2 right-2 absolute"
              variant={"ghost"}
              size={"icon-sm"}
            >
              <ArrowUpRightFromSquareIcon className="w-4! h-4!" />
            </Button>
          </div>
          <div className="flex-1 flex relative flex-col text-primary rounded-xl shadow bg-white p-4">
            <Button
              size={"icon"}
              variant={"secondary"}
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
              variant={"ghost"}
              size={"icon-sm"}
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
}
