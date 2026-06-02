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
  Select,
  SelectItem,
} from "@heroui/react";
import { FinanceReport } from "@/types";
import { useReports } from "@/hooks/queries/finance";
import Link from "next/link";
import FinanceReportCard from "./finance-report-card";
import FinanceReportDetailModal from "./finance-report-detail-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DocumentAdd,
  Magnifier,
  MoneyBag,
  Tuning2,
  WalletMoney,
} from "@solar-icons/react";

const FinanceReportMain = () => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"income" | "expense" | undefined>();
  const [filterOpen, setFilterOpen] = useState(false);
  const isMobile = useIsMobile();
  const [shownReport, setShownReport] = useState<FinanceReport | null>(null);

  const {
    data: reportsData,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useReports({
    search: search || undefined,
    type,
  });

  const showReportDetail = (report: FinanceReport) => {
    setShownReport(report);
  };

  const reports: FinanceReport[] =
    reportsData?.pages?.flatMap((page) => page.data) || [];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-primary p-4 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-white font-bold mb-1">
              Laporan Keuangan
            </h1>
            <p className="text-sm text-white/80">
              {reports.length} laporan tersedia
            </p>
          </div>
          <Button
            isIconOnly
            variant="flat"
            className="bg-white/20 text-white"
            size="lg"
            as={Link}
            href="/finance/report/new"
          >
            <DocumentAdd weight="Broken" className="size-6" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex p-4 rounded-b-3xl sticky top-0 z-50 gap-2 bg-primary">
        <Input
          type="search"
          startContent={<Magnifier weight="Broken" className="size-5 me-1" />}
          placeholder="Cari laporan keuangan..."
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
      <div className="p-4 flex flex-col gap-3">
        {isLoading ? (
          <Card className="shadow-sm">
            <CardBody className="text-center py-12">
              <p className="text-muted-foreground">Loading reports...</p>
            </CardBody>
          </Card>
        ) : reports.length === 0 ? (
          <Card className="shadow-sm">
            <CardBody className="text-center py-12">
              <WalletMoney
                weight="Broken"
                className="size-12 mx-auto mb-3 text-muted-foreground opacity-50"
              />
              <p className="text-muted-foreground">
                Tidak ada laporan keuangan
              </p>
            </CardBody>
          </Card>
        ) : (
          reports.map((report: FinanceReport) => (
            <FinanceReportCard
              key={report.id}
              report={report}
              showDetail={showReportDetail}
            />
          ))
        )}
        {hasNextPage && (
          <Button
            isLoading={isFetchingNextPage}
            onPress={() => fetchNextPage()}
            fullWidth
            variant="flat"
          >
            Load More
          </Button>
        )}
      </div>

      <div className="fixed bottom-16 right-4">
        <Button
          isIconOnly
          as={Link}
          href="/finance/report/new"
          size="lg"
          variant="shadow"
          color="secondary"
          radius="lg"
        >
          <DocumentAdd weight="Broken" className="size-6" />
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
            <Select
              label="Tipe Laporan"
              placeholder="Pilih tipe"
              selectedKeys={type ? [type] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as
                  | "income"
                  | "expense"
                  | undefined;
                setType(selected);
              }}
            >
              <SelectItem
                key="income"
                startContent={<MoneyBag className="size-4" />}
              >
                Pemasukan
              </SelectItem>
              <SelectItem
                key="expense"
                startContent={<WalletMoney className="size-4" />}
              >
                Pengeluaran
              </SelectItem>
            </Select>
          </DrawerBody>
          <DrawerFooter>
            <Button
              color="danger"
              variant="flat"
              onPress={() => {
                setType(undefined);
                setFilterOpen(false);
              }}
            >
              Reset
            </Button>
            <Button color="primary" onPress={() => setFilterOpen(false)}>
              Terapkan
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <FinanceReportDetailModal
        report={shownReport}
        isOpen={!!shownReport}
        onClose={() => setShownReport(null)}
      />
    </main>
  );
};

export default FinanceReportMain;
