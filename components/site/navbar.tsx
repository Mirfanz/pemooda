"use client";
import React from "react";
import { Button } from "../ui/button";
import { ListMinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {} & React.ComponentProps<"nav">;

const Navbar = ({ className, ...props }: Props) => {
  return (
    <nav className={cn("p-3 bg-white shadow-sm z-50", className)} {...props}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold me-auto  font-sans">Pemooda</h1>
        <Button className="" size={"icon-sm"} variant="outline">
          <ListMinusIcon className="rotate-180" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
