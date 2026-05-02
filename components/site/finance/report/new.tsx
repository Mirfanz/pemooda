"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Form,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardBody,
  Divider,
  Alert,
  addToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";

import { FinanceReportType } from "@/lib/generated/prisma/enums";
import { useCreateReport } from "@/hooks/queries/finance";
import Navbar from "../../navbar";

import { formatErrors } from "@/lib/utils";
import clsx from "clsx";
import axios from "axios";
import {
  Calendar,
  DocumentAdd,
  InfoCircle,
  MoneyBag,
  WalletMoney,
  Widget5,
} from "@solar-icons/react";

const NewFinanceReport = () => {
  const router = useRouter();
  const createReportMutation = useCreateReport();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    type: "" as FinanceReportType,
    reportDate: "",
    activityId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLFormElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        amount: parseFloat(formData.amount),
        type: formData.type,
        reportDate: formData.reportDate
          ? new Date(formData.reportDate).toISOString()
          : "",
        activityId: formData.activityId.trim() || null,
      };

      await createReportMutation.mutateAsync(payload);

      addToast({
        color: "success",
        title: "Laporan keuangan berhasil dibuat!",
      });
      router.replace("/finance/report");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors) setErrors(formatErrors(errorData.errors));
        else setErrors({ general: errorData.message });

        addToast({
          color: "danger",
          title: errorData.message,
        });
      } else {
        const errorMsg = "Terjadi kesalahan. Silakan coba lagi.";
        setErrors({ general: errorMsg });
        addToast({
          color: "danger",
          title: errorMsg,
        });
      }
    }
  };

  return (
    <div className="">
      <Navbar
        title="Buat Laporan Keuangan"
        endContent={
          <Popover placement="bottom">
            <PopoverTrigger>
              <Button
                className="text-primary-foreground"
                size="sm"
                variant="light"
                isIconOnly
              >
                <InfoCircle weight="Broken" className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2">
                <div className="text-small font-bold">Laporan Keuangan</div>
                <div className="text-tiny">
                  Buat laporan keuangan untuk organisasi Anda
                </div>
              </div>
            </PopoverContent>
          </Popover>
        }
      />
      <main className="p-4 pb-6">
        <Alert
          description="Isi detail di bawah untuk membuat laporan keuangan baru. Laporan hanya dapat dihapus dalam 1 jam setelah dibuat."
          className="mb-4"
          color="secondary"
          variant="faded"
          draggable
        />

        <Form
          className="space-y-5"
          ref={formRef}
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          {/* Basic Information */}
          <Card shadow="sm" fullWidth className="">
            <CardBody className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2.5">
                <Widget5 weight="Broken" className="size-5 text-secondary" />
                Informasi Dasar
              </h3>
              <Divider />
              <Input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                label="Judul Laporan"
                placeholder="Masukkan judul laporan"
                labelPlacement="outside"
                variant="flat"
                isInvalid={!!errors.title}
                errorMessage={errors.title}
              />

              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={1000}
                label="Deskripsi (Opsional)"
                placeholder="Jelaskan detail laporan..."
                labelPlacement="outside"
                variant="flat"
                isInvalid={!!errors.description}
                errorMessage={errors.description}
                minRows={3}
              />
            </CardBody>
          </Card>

          {/* Finance Details */}
          <Card shadow="sm" fullWidth className="">
            <CardBody className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2.5">
                <MoneyBag weight="Broken" className="size-5 text-secondary" />
                Detail Keuangan
              </h3>
              <Divider />

              <Select
                items={[
                  {
                    key: FinanceReportType.INCOME,
                    label: "Pemasukan",
                    icon: MoneyBag,
                  },
                  {
                    key: FinanceReportType.EXPENSE,
                    label: "Pengeluaran",
                    icon: WalletMoney,
                  },
                ]}
                variant="flat"
                label="Tipe Laporan"
                labelPlacement="outside-left"
                classNames={{ mainWrapper: "ms-auto min-w-0 w-40" }}
                name="type"
                selectedKeys={[formData.type]}
                isInvalid={!!errors.type}
                onSelectionChange={(key) => {
                  setFormData((prev) => ({
                    ...prev,
                    type: key.currentKey as FinanceReportType,
                  }));
                  if (errors.type) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.type;
                      return newErrors;
                    });
                  }
                }}
                renderValue={(items) =>
                  items.map((item) =>
                    item.data ? (
                      <div
                        key={item.key}
                        className={clsx("flex items-center gap-2")}
                      >
                        <item.data.icon className="size-4 text-current" />
                        <p className="text-sm grow">{item.data?.label}</p>
                      </div>
                    ) : undefined,
                  )
                }
              >
                {(item) => (
                  <SelectItem
                    key={item.key}
                    startContent={<item.icon className="size-4" />}
                    hideSelectedIcon
                  >
                    {item.label}
                  </SelectItem>
                )}
              </Select>

              <Input
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                label="Jumlah (Rp)"
                placeholder="0"
                labelPlacement="outside"
                variant="flat"
                isInvalid={!!errors.amount}
                errorMessage={errors.amount}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">Rp</span>
                  </div>
                }
              />

              {formData.amount && parseFloat(formData.amount) > 0 && (
                <Alert
                  color={
                    formData.type === FinanceReportType.INCOME
                      ? "success"
                      : "warning"
                  }
                  description={`${
                    formData.type === FinanceReportType.INCOME
                      ? "Pemasukan"
                      : "Pengeluaran"
                  }: Rp ${parseFloat(formData.amount).toLocaleString("id-ID")}`}
                />
              )}
            </CardBody>
          </Card>

          {/* Date & Activity */}
          <Card shadow="sm" fullWidth className="">
            <CardBody className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2.5">
                <Calendar weight="Broken" className="size-5 text-secondary" />
                Tanggal & Aktivitas
              </h3>
              <Divider />

              <Input
                name="reportDate"
                type="datetime-local"
                label="Tanggal Laporan"
                labelPlacement="outside-top"
                variant="flat"
                onChange={handleChange}
                value={formData.reportDate}
                isInvalid={!!errors.reportDate}
                errorMessage={errors.reportDate}
              />

              <Input
                name="activityId"
                type="text"
                value={formData.activityId}
                onChange={handleChange}
                label="ID Aktivitas (Opsional)"
                placeholder="Masukkan ID aktivitas terkait"
                labelPlacement="outside"
                variant="flat"
                isInvalid={!!errors.activityId}
                errorMessage={errors.activityId}
                description="Kosongkan jika tidak terkait dengan aktivitas tertentu"
              />
            </CardBody>
          </Card>

          {errors.general && (
            <Alert
              color="danger"
              variant="flat"
              description={errors.general}
              className="mb-6"
            />
          )}
        </Form>
      </main>
      <div className="p-4 bg-white border-t rounded-t-3xl border-gray-200">
        <Button
          fullWidth
          className="font-medium"
          color="primary"
          variant="shadow"
          size="lg"
          isLoading={createReportMutation.isPending}
          onPress={() => formRef.current?.requestSubmit()}
          startContent={<DocumentAdd weight="Broken" className="size-7" />}
        >
          Buat Laporan
        </Button>
      </div>
    </div>
  );
};

export default NewFinanceReport;
