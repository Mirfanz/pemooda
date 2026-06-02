"use client";
import { Button, Card, Skeleton } from "@heroui/react";
import { useOrganizationDetail } from "@/hooks/queries/organization";
import { useRouter } from "next/navigation";
import React from "react";

const Finance = () => {
  const router = useRouter();
  const { data: organization, isLoading, isError } = useOrganizationDetail();

  const totalIncome = organization?.summary?.totalIncomes || 0;
  const totalExpense = organization?.summary?.totalExpenses || 0;
  const balance = totalIncome - totalExpense;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isError) {
    return (
      <main className="p-4">
        <div className="text-red-500">Error loading finance data</div>
      </main>
    );
  }

  return (
    <main className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Keuangan</h1>
        <Button color="primary" onPress={() => router.push("/finance/report")}>
          Lihat Laporan
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Total Income Card */}
        <Card className="p-6">
          <Skeleton isLoaded={!isLoading} className="rounded-lg">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Pemasukan
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </Skeleton>
        </Card>

        {/* Total Expense Card */}
        <Card className="p-6">
          <Skeleton isLoaded={!isLoading} className="rounded-lg">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Pengeluaran
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </Skeleton>
        </Card>

        {/* Balance Card */}
        <Card className="p-6">
          <Skeleton isLoaded={!isLoading} className="rounded-lg">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Saldo</p>
              <p
                className={`text-2xl font-bold ${
                  balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(balance)}
              </p>
            </div>
          </Skeleton>
        </Card>
      </div>
    </main>
  );
};

export default Finance;
